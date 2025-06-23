// Controllers/societyController.js
import Society from "../Models/Society.js";

export const getNeighbouringSocieties = async (req, res) => {
  try {
    const { id } = req.params;

    const society = await Society.findById(id);
    if (!society || !society.location) {
      return res.status(404).json({ message: "Society or location not found" });
    }

    const neighbours = await Society.find({
      _id: { $ne: society._id },
      location: {
        $geoIntersects: {
          $geometry: society.location,
        },
      },
    });

    res.status(200).json({ neighbours });
  } catch (err) {
    console.error("Neighbouring Society Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
