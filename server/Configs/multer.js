import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Use disk storage temporarily (for Cloudinary to pick up)
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (
    [".jpg", ".jpeg", ".png", ".mp3", ".mp4", ".wav", ".mov", ".webm"].includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only media files allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
