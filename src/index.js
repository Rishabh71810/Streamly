
import connectDB from "./db/index.js"
//require ('dotenv').config({path :'./env'})
//as early apke saare environment variables load hojanye jab apki app load ho
//improved version
import dotenv from "dotenv"
import {app} from './app.js'

dotenv.config({
    path:'./.env',
})


connectDB().then(()=>{
    app.listen(process.env.PORT || 3001,()=>{
        console.log(`Sever is running on:${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("MongoDb connection failed")
});

// import express from "express"
// const app = express()

// (async () =>{
//     try {
//         mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("error",()=>{//this code is used if error is part on the side of express app (means we have recieved the dta from the database)
//             console.log("ERRR:",error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("ERROR:",error)
//     }
// })()

// THIS THE FIRST APPROACH SECOND APPROACH IS BY WRITING THESE FUNCTIONS IN THE OTHER FOLDERS AND IMPORT THEM IN THE INDEX JS FILE