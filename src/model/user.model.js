import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from 'crypto'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "firstName field is required"],
  },
  lastName: {
    type: String,
    required: [true, "lastName field is required"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: String,
    required: true
  },
  agreedToTerms: {
    type: Boolean,
    default: false
  },
  
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, "Please provide a password"],
    select: false,
  },
  
  confirmedPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords do not match",
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }

});

// Pre-save middleware for hashing passwords
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmedPassword = undefined;
  next();
});

userSchema.pre("save", function(next){
  if(!this.isModified('password')|| this.isNew) return next()
    this.passwordChangedAt = Date.now() -1000

  next()
})
userSchema.pre(/^find/,function(next){
  this.find({active: {$ne:false}})
  next()
})

// Methods
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordNewToken= function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    //this goes to the data base
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // console.log("🔹 Generated reset token:", resetToken);
    // console.log("🔹 Hashed token stored in DB:", this.passwordResetToken);
    
    return resetToken;
};


// Export the User model
const User = mongoose.model("User", userSchema);
export default User;





















