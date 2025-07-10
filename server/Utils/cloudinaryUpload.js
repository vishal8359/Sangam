// utils/cloudinaryUpload.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer, folder, mimetype) => {
  try {
    const base64 = fileBuffer.toString("base64");
    const dataURI = `data:${mimetype};base64,${base64}`;
    const isPDF = mimetype === "application/pdf";


    const res = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: "auto",
      format: isPDF ? "pdf" : undefined,
    });

    return { url: res.secure_url, public_id: res.public_id };
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err); // Log actual error
    throw new Error("Cloudinary upload failed");
  }
};
