import TopContributor from "../Models/TopContributor.js";

export const markTopContributor = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
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
    const contributors = await TopContributor.find().sort({ createdAt: -1 });
    res.status(200).json({ contributors });
  } catch (error) {
    console.error("Fetch Contributors Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
