import mongoose, {Schema} from " mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema  = new Schema({
 username :{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
 },
 email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
 },
 fullname:{
    type:String,
    required:true,
    trim:true,
    index:true,
 },
 avatar:{
    type:String,
    required:true,
 },
 coverImage:{
    type:String,
 },
 watchHistory:{
    type:Schema.Type.ObjectId,
    ref:"Video"
 },
 password:{
    type:String,
    required:[true,'Pasword is required']
}})
// pre is also a hook like plugin or app.listen
// it is used as a user save the information it clicks on the save which is pre 
userSchema.pre("save",async function(next){
 if(this.isModified("password"))return next();// this statement is used because everytime user click on save button it will save password againa and again 
this.password = bcrypt.hash(this.password, 10)
next()
})//do not use arrow callback in pre hook because in arrow function there is no reference to the object on  which we want to perform actions
//.methods is used to create ypur own methods 
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
      return jwt.sign({
        _id:this._id
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
      },
    )
}
export const User = mongoose.model("User",userSchema)