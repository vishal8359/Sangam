import Group from "../Models/Group.js";

// Create a group
export const createGroup = async (req, res) => {
  try {
    const { name, description, society_id } = req.body;

    if (!name || !society_id) {
      return res.status(400).json({ message: "Name and society_id are required" });
    }

    const group = await Group.create({
      name,
      description,
      society_id,
      created_by: req.user._id // set from logged-in admin
    });

    res.status(201).json({ message: "Group created", group });
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all groups by society
export const getGroupsBySociety = async (req, res) => {
  try {
    const { societyId } = req.params;

    const groups = await Group.find({ society_id: societyId });
    res.status(200).json(groups);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed group info (with posts & user names)
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).populate("posts.user", "name");
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group);
  } catch (err) {
    console.error("Group details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Post in group
export const postInGroup = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const { groupId } = req.params;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Post text cannot be empty." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.posts.push({ user: userId, text: text.trim(), created_at: new Date() });
    await group.save();

    res.status(200).json({ message: "Posted in group", group });
  } catch (err) {
    console.error("Post in group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
