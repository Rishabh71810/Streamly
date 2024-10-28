import { asyncHandler } from "../utils/aysncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res)=>{
    // get user details from frontend->go in user model 
    //validation-not empty
    //check if user already exist:both using username and email
    // files like avatar and images checking
    //upload them them to cloudinary
    //crete user object-create entry in db
    //remove password and refresh token field from response 
    // check for user creation
    // return res
    const {fullName,email,username,password}=req.body
    console.log("email :",email)

    if(
      [fullName,email,username,password].some((field)=>
        // u can use single if else statements for every field this is more optimized way o
      field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

   const existedUser = User.findOne({
      $or:[{username},{email}]// gives one of the two
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

   const avatarLocalPath=req.files?.avatar[0].path  //it returns  file path of avatar from the multer 
   const coverImagePath =  req.files?.coverImage[0]?.path

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploaduploadOnCloudinary(coverImagePath)

    if (!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
  const user =   await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

  const createdUser =  await  User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!cretedUser){
    throw new ApiError(500,"something went wrong creatin User")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser,"User Created sucessfully")
  )
   
})

export {
    registerUser,
}

