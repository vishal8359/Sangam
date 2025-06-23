import Home from "../Models/Home.js";
import User from "../Models/User.js";

// GET /homes/neighbours
export const getNeighbourHomes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Find current user's home
    const userHome = await Home.findOne({ residents: userId });
    if (!userHome) {
      return res.status(404).json({ message: "Your home is not registered." });
    }

    const { street, houseSortOrder } = userHome;
    const range = 7;

    // Step 2: Find neighbors on the same street and close in sort order
    const neighbours = await Home.find({
      street: street, // ✅ must be on same street
      houseSortOrder: {
        $gte: houseSortOrder - range,
        $lte: houseSortOrder + range
      },
      _id: { $ne: userHome._id } // exclude self
    })
      .populate({ path: "residents", model: "user", select: "name user_id" })
      .sort({ houseSortOrder: 1 })          
      .limit(15);

    res.status(200).json({ neighbours });
  } catch (err) {
    console.error("Error fetching neighbours:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const extractSortOrder = (houseNumber) => {
  const match = houseNumber.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};
