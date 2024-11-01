import { asyncHandler } from "../utils/aysncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId)=>{
  try {
     const user = await User.findById(userId)
     const accessToken = user.generateAccessToken()
     const refreshToken= user.generateRefreshToken()

     // save the refreshtoken in the database as we need to give it to the user 
     user.refreshToken=refreshToken
    await user.save({validateBeforeSave: false})// means need no validation before save

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500 , "Something went wrong while generating Access and Refresh tokens")
  }
}
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
    //console.log("email :",email)
    //here we extracted the data we wanted 

    if(
      [fullName,email,username,password].some((field)=>
        // u can use single if else statements for every field this is more optimized way o
      field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }//checked if we kisine wmpty string toh nhi pass krdi

   const existedUser = await User.findOne({
      $or:[{username},{email}]// gives one of the two
    })
    // check if user already existed
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
     
    const avatarLocalPath = req.files?.avatar[0]?.path;

   // const coverImagePath = req.files?.coverImage[0]?.path || null;
   // console.log(req.files)
   let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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
  ) // remove password and refreshtoken 
  if(!createdUser){
    throw new ApiError(500,"something went wrong creatin User")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser,"User Created sucessfully")
  )
   
})
const loginUser =asyncHandler(async(res,res)=>{
  // ALGO->
  // req body->data
  //username or email
  //find the user
  //password check
  //give access and refresh token 
  //send cookie 

  const {email ,username, password}=req.body

  if(!username || !email){
    throw new ApiError(400,"userrame or password is required")
  }

  const user = await User.findOne({
    $or :[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User do not exist")
  }
   
  // we user variable not User 
  //bcz user-> is our variable use functions of user model and User->is mongoDb
 const isPasswordValid=  await user.isPasswordCorrect(password)

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

 const loggedInUser = await User.findById(user._id).select("-password -refershToken")

 const options = {
  httpOnly : true,
  secure: true
 }

 return res.status(200)
 .cookie("accessToken",accessToken, options)
 .cookie("refreshToken",refershToken,options)
 .json(
     new ApiResponse{
      200,{
        user: loggedInUser,accessToken,refershToken
      },
      "User Logged In Sucessfully"
     }
 )
})

const logoutUser = asyncHandler(async(req,res)=>{

})
 
export {
    registerUser,
    loginUser
}

