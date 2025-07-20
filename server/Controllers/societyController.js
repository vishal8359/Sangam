// Controllers/societyController.js
import Society from "../Models/Society.js";
import User from "../Models/User.js";
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
        const userId = req.user._id;

        const currentUser = await User.findById(userId)
            .populate('roles.society_id')
            .populate('joined_societies');

        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found." });
        }

        let currentSociety = null;

        if (currentUser.roles && currentUser.roles.length > 0) {
            currentSociety = currentUser.roles[0].society_id;
        } else if (currentUser.joined_societies && currentUser.joined_societies.length > 0) {
            currentSociety = currentUser.joined_societies[0];
        } else if (currentUser.created_society) {
            return res.status(400).json({ message: "User is not associated with any society as a resident/admin or joined society." });
        } else {
            return res.status(400).json({ message: "User is not associated with any society to determine neighbouring societies." });
        }

        if (!currentSociety || !currentSociety.location || currentSociety.location.type !== "Polygon" || !currentSociety.location.coordinates || currentSociety.location.coordinates.length === 0 || currentSociety.location.coordinates[0].length === 0) {
            return res.status(400).json({ message: "Current society's location data is incomplete or not a valid Polygon." });
        }

        const [centerLongitude, centerLatitude] = currentSociety.location.coordinates[0][0];

        const maxDistanceMeters = 5000;

        const neighbouringSocieties = await Society.find({
            _id: { $ne: currentSociety._id },
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [centerLongitude, centerLatitude]
                    },
                    $maxDistance: maxDistanceMeters
                }
            }
        }).select('name location');

        const formattedSocieties = neighbouringSocieties.map(society => {
            let societyDisplayLocation = "Unknown Location";
            if (society.location && society.location.type === "Polygon" && society.location.coordinates[0] && society.location.coordinates[0][0]) {
                 societyDisplayLocation = `${society.location.coordinates[0][0][1]}, ${society.location.coordinates[0][0][0]}`;
            }

            return {
                id: society._id,
                name: society.name,
                location: societyDisplayLocation,
                flats: "Not Available",
                map_url: `http://maps.google.com/maps?q=${society.location.coordinates[0][0][1]},${society.location.coordinates[0][0][0]}`
            };
        });

        res.status(200).json({ societies: formattedSocieties });

    } catch (err) {
        console.error("Error fetching neighbouring societies:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
