import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {//cb = callback and file is present at multer not from our side 
      cb(null, "../../public/temp")
    },
    filename: function (req, file, cb) {
     
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ storage: storage })