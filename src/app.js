import express from "express"
import cors from "cors"
 import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit : "16kb"}))//it is done so that there can be a limit on json in the database
app.use(express.urlencoded({extended:true , limit:"16kb"})) //similarly for the urls
app.use(express.static("public"))//in folders ko aap access krskte hain 
app.use(cookieParser())// it helps in accessing the cookies


//routes import 

import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/users",userRouter)
//->users->userRouter->diff methods like register or login 
//it will loolike http://localhost:3000/users/login
//means all the functionalities of the users goes to userRouter 
export {app}