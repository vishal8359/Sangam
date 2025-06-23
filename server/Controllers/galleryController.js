import Reel from "../Models/Reel.js";
import GalleryImage from "../Models/GalleryImage.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js";

export const uploadReel = async (req, res) => {
  try {
    const { description, tags } = req.body;
    const video = req.file;

    if (!video) return res.status(400).json({ error: "No video uploaded" });

    const uploaded = await uploadToCloudinary(video.path, "reels");

    const newReel = await Reel.create({
      user: req.user._id,
      videoUrl: uploaded.secure_url,
      description,
      tags: tags ? tags.split(",") : [],
    });

    res.status(201).json(newReel);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to upload reel", details: err.message });
  }
};

export const getAllReels = async (req, res) => {
  const reels = await Reel.find()
    .populate({ path: "user", select: "name avatar", model: "user" })
    .sort({ createdAt: -1 });
  res.json(reels);
};

export const likeReel = async (req, res) => {
  const { reelId } = req.params;

  const reel = await Reel.findById(reelId);
  if (!reel) return res.status(404).json({ error: "Reel not found" });

  if (!reel.likes.includes(req.user._id)) {
    reel.likes.push(req.user._id);
  } else {
    reel.likes.pull(req.user._id);
  }

  await reel.save();
  res.json(reel);
};


export const addComment = async (req, res) => {
  const { reelId } = req.params;
  const { text } = req.body;

  const reel = await Reel.findById(reelId);
  reel.comments.push({ user: req.user._id, text });

  if (!reel) return res.status(404).json({ error: "Reel not found" });

  await reel.save();

  res.status(201).json(reel);
};

export const addReply = async (req, res) => {
  const { reelId, commentIndex } = req.params;
  const { text } = req.body;

  const reel = await Reel.findById(reelId);
  reel.comments[commentIndex].replies.push({ user: req.user._id, text });

  if (!reel) return res.status(404).json({ error: "Reel not found" });

  if (!reel.comments[commentIndex])
    return res.status(400).json({ error: "Comment does not exist" });

  await reel.save();

  res.status(201).json(reel);
};

export const uploadImage = async (req, res) => {
  const file = req.file;
  const { description } = req.body;

  const uploaded = await uploadToCloudinary(file.path, "galleryImages");
  const image = await GalleryImage.create({
    user: req.user._id,
    imageUrl: uploaded.secure_url,
    description,
    society_id: req.user.joined_society,
  });

  res.status(201).json(image);
};

export const getSocietyImages = async (req, res) => {
  const images = await GalleryImage.find({
    society_id: req.user.joined_society,
  })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  res.json(images);
};
