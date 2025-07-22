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
      folder: folder,
      resource_type: "auto",
      format: isPDF ? "pdf" : undefined,
    });

    console.log("Cloudinary Raw Response:", res); // ADDED THIS LOG

    if (!res.secure_url) {
      console.error("Cloudinary upload did not return a secure_url:", res);
      throw new Error("Cloudinary upload failed: secure_url not returned.");
    }

    return { secure_url: res.secure_url, public_id: res.public_id };
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err);
    throw new Error("Cloudinary upload failed");
  }
};

export const deleteFileFromCloudinary = async (publicId) => {
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    if (res.result !== "ok") {
      console.warn(`Cloudinary delete warning for ${publicId}:`, res.result);
    }
    return res;
  } catch (err) {
    console.error("❌ Cloudinary Delete Error:", err);
    throw new Error("Cloudinary delete failed");
  }
};
