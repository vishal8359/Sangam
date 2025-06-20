import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder) => {
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    fs.unlinkSync(filePath); // cleanup local file
    return res.secure_url;
  } catch (err) {
    throw new Error("Cloudinary upload failed");
  }
};
