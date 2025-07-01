// Controllers/societyController.js
import Society from "../Models/Society.js";

export const getSocietyById = async (req, res) => {
  try {
    const society = await Society.findById(req.params.id)
      .populate({
        path: "residents",
        select: "name avatar user_id roles email",
      })
      .populate({
        path: "created_by",
        select: "name user_id avatar email",
      });

    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    const societyIdStr = society._id.toString();

    // Add role field manually per resident (scoped to current society)
    const enrichedResidents = society.residents.map((r) => ({
      ...r._doc,
      role:
        r.roles.find((ro) => ro.society_id?.toString() === societyIdStr)
          ?.role || "resident",
    }));

    return res.status(200).json({
      society: {
        _id: society._id,
        name: society.name,
        location: society.location,
        created_by: society.created_by,
        residents: enrichedResidents,
      },
    });
  } catch (err) {
    console.error("❌ Society fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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
