import { asyncHandler } from "../utils/aysncHandler";

export const registerUser = asyncHandler(async (req, res)=>{
    res.status(200).json({
        message:"ok"
    })
})

