import User from '../model/user.model.js'
import AppError from '../util/AppError.js';
import sendEmail from '../util/email.js';
import crypto from 'crypto'
import { catchAsync } from '../util/catchAsync.js';
import jwt from 'jsonwebtoken'

const generateToken = id => {
  return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN})
  
}
  const createSendToken = (user,statuscode,res) => {
    const token = generateToken(user._id)

  const cookieOptions  = {
    
      //convert to milliseconds
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN  * 24 *  60 * 60 * 1000),
      httpOnly:true
    

  }


  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true

    res.cookie('jwt',token,cookieOptions
      
    )
    //remove password from the output
    user.password = undefined

    res.status(statuscode).json({
      status: 'success',
      token,
      data:{
        user

      }

    })
  }
  


export const signup = catchAsync(async(req,res,next)=>{
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword

  })
  createSendToken(user,201,res)
   
  
})
  

export const login = catchAsync(async(req,res,next)=>{
  const email = req.body.email
  const password = req.body.password
  if(!email || ! password){
    return next(new AppError('email and password required',401))
  }
  const user = await User.findOne({email}).select('+password')
  if(!user || !(await user.correctPassword(password, user.password))){
    return next(new AppError('invalid email or password',401))
  }
  createSendToken(user,201,res)
  // res.status(201).json({
  //   status: 'success',
  //   token: generateToken(user._id),
  //   data:{
  //     user

  //   }

  // })

  
})

export const forgotPassword = async (req, res, next) => {
  try {
      // 1) Get user based on POSTed email
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
          return next(new AppError('No user with that email found.', 404));
      }

      // 2) Generate the reset token
      const resetToken = user.createPasswordNewToken();
      await user.save({ validateBeforeSave: false });

      // 3) Construct the reset URL
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
      //http://localhost:4000/api/v1/tours/67ada62c48be4c959e6ac113
      

      const message = `Forgot your password? Click here: ${resetURL}.\nIf you didn't request this, ignore this email.`;

      //console.log("✅ Reset Token Generated:", resetToken);
      //console.log("📩 Sending email to:", user.email);

      // 4) Send Email
      await sendEmail({
          email: user.email,
          subject: 'Your password reset token (valid for 10 min)',
          message
      });

      console.log("✅ Email sent successfully!");

      res.status(200).json({
          status: 'success',
          message: 'Token sent to email!',
      });

  } catch (err) {
      console.error("❌ Forgot Password Error:", err.message);
      return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
};

export const resetPassword =catchAsync(async(req,res,next) => {
  //1 get user based on the token stored in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {$gt: Date.now()}
    })
//2 check if token have expire abd there is a  user
if(!user){
  return next(new AppError('token have expired', 400))
}
user.password = req.body.password;
user.confirmedPassword = req.body.confirmedPassword
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save()

// update the changePasswordAt property of the user


//log the user in and sent jwt
createSendToken(user,201,res)
// res.status(201).json({
//   status: 'success',
//   token: generateToken(user._id),
//   data:{
//     user

//   }

// })


})

export const updatePassword = catchAsync(async(req,res,next) => {
  //get user from collction
  const user = await User.findById(req.user.id).select('+password')

  // check if password is correct
  if(!await user.correctPassword(req.body.currentPassword,user.password)){
    return next (new AppError('your current password is wrong',401))
  }


  //update password
  user.password = req.body.password;
  user.confirmedPassword = req.body.confirmedPassword
  await user.save();

  createSendToken(user,200,res)



})