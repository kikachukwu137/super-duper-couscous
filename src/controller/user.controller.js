import * as userService from '../service/user.service.js'
import { catchAsync } from '../util/catchAsync.js'
import AppError from '../util/AppError.js'


export const getAllUser = catchAsync(async(req,res,next)=>{
   
        const usersData = await userService.getAllUser() 
        res.status(201).json({
            status: "success",
            result: usersData.length,
            data: {usersData}
        })


    } )


export const updateMe  = catchAsync(async(req,res,next)=>{
    if(req.body.password || req.body.confirmedPassword){
        return next (new AppError("This routes is not for password update",400))
    }
    // Filter only allowed fields (name, email)
    const filteredBody = userService.filterUserField(req.body,"firstName","lastName","phoneNumber","email")
    const updateUser = await userService.updateUserService(req.user.id,filteredBody)
    res.status(200).json({
        status: "success",
        data: { user: updateUser },
      });
})

// Soft delete the logged-in user
export const deleteMe = catchAsync(async (req, res, next) => {
    await userService.deleteUserService(req.user.id);
    res.status(204).json({ status: "success", data: null });
  });