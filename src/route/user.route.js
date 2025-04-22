import {updateMe,deleteMe} from '../controller/user.controller.js'
import { protect, restrictTo} from '../middleware/auth.middleware.js'
import  {signup,login,forgotPassword,resetPassword,updatePassword} from '../controller/auth.controller.js';
import { getAllUser } from '../controller/user.controller.js';
import {Router} from 'express';


const userRouter = Router()

userRouter.post('/signup',signup)
userRouter.post('/login',login)
userRouter.post('/forgotPassword',forgotPassword)
userRouter.patch('/resetPassword/:token',resetPassword)

userRouter.patch('/updateMyPassword',protect,updatePassword)
userRouter.patch('/updateMe',protect,updateMe)
userRouter.delete('/deleteMe',protect,deleteMe)



userRouter.get("/",protect,restrictTo('admin'),getAllUser)



export default userRouter;