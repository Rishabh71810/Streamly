import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"//used for aggregattion go to docs for more informations
const videoSchema = new Schema(
    {
        videoFile:{
             type:String,//cloudinary url
             required:true
        },
        thumbnail:{
            type:String,//cloudnary url
            required:true
       },
       title:{
        type: String,
        required:true
       },
       description:{
        type: String,
        required:true
       },
       duration:{
        type: Number,
        default:0
       },
       isPublished:{
        type:Boolean,
        default:true
       },
       owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
       }
    }
)
 videoSchema.plugin(mongooseAggregatePaginate)