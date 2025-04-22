import app from "./app.js";
import dotenv from 'dotenv';
dotenv.config()

import connect from "./config/db.js";

const MONGO_URL = process.env.MONGO_URL;
if(!MONGO_URL){
    throw new Error("No MongoDB URL provided")
}
const PORT = process.env.PORT ||3000 
// Handle synchronous errors (e.g., coding errors, undefined variables)
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.name, err.message);
    process.exit(1);
});
connect(MONGO_URL).then(()=> {
   const server = app.listen(PORT,()=>{
        
        console.log('database is connected')
        console.log(`server is running on http://localhost:${PORT}`)


    })
    process.on('unhandledRejection',err =>{
        console.log(err.name,err.message)
        server.close(()=>{
        process.exit(1)


        })
    })
    
})
.catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit if database connection fails
});
 


