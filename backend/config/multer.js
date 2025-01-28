import path from 'path';
import multer from 'multer';



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default upload;

