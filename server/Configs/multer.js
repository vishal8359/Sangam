// configs/multer.js
import multer from "multer";

const storage = multer.memoryStorage(); // Needed for buffer streaming

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png", ".mp3", ".mp4", ".pdf", ".doc", ".docx", ".webm", ".mov"];
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;