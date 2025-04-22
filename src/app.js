import express from 'express';
import AppError from './util/AppError.js';
import { globalErrorHandler } from './middleware/globalErrorHandler.js';
import userRouter from './route/user.route.js';



const app = express();





app.use(express.json())



app.use("/api/v1/users",userRouter)



//throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);

// app.use('*',(req,res,next)=>{
//     // res.status(404).json({
//     //     status: 'fail',
//     //     message: `file does not exist in this ${req.originalUrl}`})
//         // const err = new Error(`cant find ${req.originalUrl} on this server`)
//         // err.statusCode = 404
//         // err.status = 'fail'
//         // next(err)
//     next(new AppError(`cant find ${req.originalUrl} on this server`,404))
// })

//express error handling middleware
app.use(globalErrorHandler)



export default app;
