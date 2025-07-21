import TopContributor from "../Models/TopContributor.js";

export const markTopContributor = async (req, res) => {
  try {
    if (!req.user || !req.user.roles || req.user.roles.length === 0) {
      return res.status(401).json({ message: "Unauthorized: User role not found." });
    }

    const adminRole = req.user.roles.find(r => r.role === "admin"); // Find the admin role object
    const adminSocietyId = adminRole ? adminRole.society_id : null;

    if (!adminSocietyId) {
        return res.status(400).json({ message: "Unauthorized: Admin's society ID not found within roles." });
    }

    const { name, house, designation, achievements } = req.body;

    if (!name || !house || !designation || !achievements) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newContributor = new TopContributor({
      name,
      house,
      designation,
      achievements,
      society_id: adminSocietyId,
      markedBy: req.user._id,
    });

    await newContributor.save();
    res.status(200).json({ message: "Contributor saved", contributor: newContributor });
  } catch (error) {
    console.error("Save Contributor Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTopContributors = async (req, res) => {
  try {
    const userSocietyId = req.user.societyId;

    if (!userSocietyId) {
      return res.status(400).json({ message: "Could not determine user's society from token." });
    }

    const contributors = await TopContributor.find({ society_id: userSocietyId }).sort({ createdAt: -1 });
    res.status(200).json({ contributors });
  } catch (error) {
    console.error("Fetch Contributors Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};