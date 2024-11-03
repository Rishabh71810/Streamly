import { asyncHandler } from "../utils/aysncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body
  console.log(email);
  console.log(password); 

  // if (!username && !email) {
  //     throw new ApiError(400, "username or email is required")
  // }
  
  // Here is an alternative of above code based on logic discussed in video:
  if (!(username || email)) {
      throw new ApiError(400, "username or email is required")
      
  }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  } 

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined//toh delete hojaega user
      }
    },
    {
      new: true
    }
   )
   const options = {
    httpOnly : true,
    secure: true
   }
     
   return res.status(200).clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200, {}, "User Logged Out"))
   // we need the auth middleware in various tasks because we need to verify the user
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken
  || req.body.refreshAccessToken

  if(incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
  }

 try {
   const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
   )
 
  const user = await User.findById(decodedToken?._id)// can go in user model and see while signing we use the id so we can get user by the id of the token
  if(!user){
   throw new ApiError(401,"invalid refresh token")
 }
 
 if(incomingRefreshToken!==user?.refreshToken){
   throw new ApiError(401,"refreshToken is expired or already used")
 }
 
 const options = {
   httpOnly:true,
   secure:true
 }
 
 const {accessToken,newrefreshToken }=await generateAccessAndRefreshTokens(user._id)
 
 return res.status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",newrefreshToken,options)
 .json(
   new ApiResponse(
     200,
     {accessToken,refreshToken:newrefreshToken},
     "Acess token refreshed"
   )
 )
 
 } catch (error) {
    throw new ApiError(401,error?.message || "Inavalid refresh token")
 }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

