import AppError from "../util/AppError.js";
import {promisify} from 'util';
import { catchAsync } from "../util/catchAsync.js";
import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

//AUTHENTICATION

export const protect   = catchAsync(async(req,res,next) =>{
    //Getting token and check if it exist
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return next( new AppError('Invalid TOKEN please login to get access',401))
    }
    //verify token
    //2️⃣ What is promisify?
    // promisify is a function from Node.js util module that converts callback-based functions into Promise-based functions.
    // Since jwt.verify expects a callback, we use promisify to turn it into a function that returns a Promise.
    // 3️⃣ What Does promisify(jwt.verify) Do?
    // promisify(jwt.verify) creates a new function that can be used with await.
    // Instead of using a callback, it returns a Promise, which we can await.
     const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    // const decoded =jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
    //     if (err) {
    //         console.error("Token verification failed:", err.message);
    //         return;
    //     }
    //     // console.log("Decoded Token:", decoded);
    // });

    //check if user still exist
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next( new AppError('This User doesnt exist', 401))
    }


    // check if user changed password after the token was issued
   if(currentUser.changedPasswordAfter(decoded.iat)){
        return next( new AppError('please login again ,you just reset your password',401))
   }
   //
   req.user = currentUser;
    next()
})
//note authentication comes before authorization
export const restrictTo = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('you do not have permission tp perform this action',403))
        }
        next()
    }
}
