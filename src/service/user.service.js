
import User from "../model/user.model.js";
import AppError from "../util/AppError.js";



export const getAllUser = async() => {
    try {
        const users = await User.find()
        return {
            status: 'success',
            data : users
        }
        
    } catch (error) {
        throw new AppError(error.message,error.statusCode || 500)
        
    }
}
//this prevent user from reseting password
export const filterUserField = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    // add allowed field to newObj        
    })
    return newObj;
}


export const updateUserService = async(userId,updateData) => {
    return  await User.findByIdAndUpdate(userId,updateData,{new:true,
        runValidators: true
    })
}
// Soft delete (deactivate) a user account
export const deleteUserService = async (userId) => {
    return await User.findByIdAndUpdate(userId, { active: false });
  };
