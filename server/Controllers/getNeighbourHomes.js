import Home from "../Models/Home.js";
import User from "../Models/User.js";

export const extractSortOrder = (houseNumber) => {
  const match = houseNumber.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export const getNeighbourHomes = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const userHome = await Home.findOne({ residents: userId });
    if (!userHome) {
      return res.status(404).json({ message: "Your home is not registered." });
    }

    const { street, houseSortOrder } = userHome;
    const range = 7;

    const neighbours = await Home.find({
      street: street,
      houseSortOrder: {
        $gte: houseSortOrder - range,
        $lte: houseSortOrder + range,
      },
      _id: { $ne: userHome._id },
    })
      .populate({
        path: "residents",
        model: "User",
        select: "name avatar address user_name",
      })
      .sort({ houseSortOrder: 1 })
      .limit(15);

    const filteredNeighbours = neighbours
      .filter((home) => home.residents && home.residents.length > 0)
      .map((home) => ({
        _id: home._id,
        house_no: home.house_no,
        name: home.residents[0]?.name || "Unknown",
        avatar:
          home.residents[0]?.avatar ||
          (home.residents[0]?.name
            ? `https://placehold.co/150x150/E0E0E0/333333?text=${home.residents[0].name[0].toUpperCase()}`
            : "https://placehold.co/150x150/E0E0E0/333333?text=U"),

        address: home.residents[0]?.address || home.address || "N/A",
        online: Math.random() > 0.5,
      }));

    res.status(200).json({ neighbours: filteredNeighbours });
  } catch (err) {
    console.error("Error fetching neighbours:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /users/help-services
export const getHelpServices = async (req, res) => {
  try {
    const serviceProviders = await User.find({
      servicesOffered: { $exists: true, $ne: [], $not: { $size: 0 } }
    }).select("name email phone_no servicesOffered avatar"); // Changed phoneNumber to phone_no

    if (!serviceProviders || serviceProviders.length === 0) {
      return res.status(200).json({ message: "No help and services providers found.", providers: [] });
    }

    const formattedProviders = serviceProviders.map(provider => ({
      id: provider._id,
      name: provider.name,
      email: provider.email,
      phoneNumber: provider.phone_no, // Mapped phone_no to phoneNumber for frontend consistency
      services: provider.servicesOffered.join(", "),
      avatar: provider.avatar || `https://i.pravatar.cc/150?u=${provider._id}`,
    }));

    res.status(200).json({ providers: formattedProviders });
  } catch (err) {
    console.error("Error fetching help and services providers:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// POST /users/add-service
export const addHelpService = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { services } = req.body; 

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: "Services array is required and must not be empty." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const addedServices = [];
    for (const serviceType of services) {
      if (typeof serviceType !== 'string' || serviceType.trim() === '') {
        console.warn(`Skipping invalid service type: ${serviceType}`);
        continue;
      }
      const trimmedService = serviceType.trim();
      if (!user.servicesOffered.includes(trimmedService)) {
        user.servicesOffered.push(trimmedService);
        addedServices.push(trimmedService);
      }
    }

    await user.save();

    if (addedServices.length > 0) {
      res.status(200).json({ message: "Services added successfully!", addedServices: addedServices, user: user });
    } else {
      res.status(200).json({ message: "No new services were added (they might already exist).", user: user });
    }
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

