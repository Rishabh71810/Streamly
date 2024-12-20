import {Router} from "express"
import { logoutUser,loginUser,registerUser,refreshAccessToken } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJWT,logoutUser)
// we will verify the jwt first from that we get req.user then we move on to logout
router.route("/refresh-token").post(refreshAccessToken)
export default router 