import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! 
            DB HOST :${connectionInstance.connection.host}`);
                //host btayega ye kahan connected hain
    }catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1)//node js ki functionality
    }

}

export default connectDB;