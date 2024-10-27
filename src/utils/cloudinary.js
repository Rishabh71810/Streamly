import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});
const uploadOnCloudinary = async (loacalFilePath)=>{
    try {
        if(!loacalFilePath)return null
        //upload file on cloudinary
        cloudinary.uploader.upload(loacalFilePath,{
            resource_type:"auto"
        })
        //file has been sucessfully uploaded
        console.log("file has been uploaded sucessfully",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(loacalFilePath)
        return null;
    }
}

export {uploadOnCloudinary}