import mongoose from "mongoose";
async function connect (MONGO_URL){
    if(MONGO_URL){
        await mongoose.connect(MONGO_URL)

    }
    return null

}


export default  connect;