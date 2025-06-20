import Notice from "../Models/Notice.js";

// Create a new notice
export const createNotice = async (req, res) => {
  try {
    const { title, description, society_id } = req.body;

    if (!title || !description || !society_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const notice = await Notice.create({
      title,
      description,
      society_id,
      posted_by: req.user._id,
      posted_at: new Date(),
    });

    res.status(201).json({ message: "Notice created", notice });
  } catch (err) {
    console.error("Create notice error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all notices for a society
export const getNoticesBySociety = async (req, res) => {
  try {
    const societyId = req.params.societyId || req.user.joined_society;

    const notices = await Notice.find({ society_id: societyId })
      .populate("posted_by", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (err) {
    console.error("Get notices error:", err);
    res.status(500).json({ message: "Server error while fetching notices" });
  }
};

