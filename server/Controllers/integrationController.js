import SocietyIntegration from "../Models/Integration.js";
import User from "../Models/User.js";
import { uploadToCloudinary } from "../Utils/cloudinaryUpload.js"; // Changed import to uploadToCloudinary

export const upsertSocietyIntegration = async (req, res) => {
  try {
    if (!req.user || !req.user.roles || req.user.roles.length === 0) {
      return res.status(401).json({ message: "Unauthorized: User role not found." });
    }

    const adminRole = req.user.roles.find(r => r.role === "admin");
    const adminSocietyId = adminRole ? adminRole.society_id : null;

    if (!adminSocietyId) {
      return res.status(403).json({ message: "Access denied: Admin's society ID not found." });
    }

    const { adminDetails, stats } = req.body;
    let mapImage = req.body.mapImage;
    let adminImage = adminDetails?.image || "";

    if (req.files) {
      const adminImageFile = req.files.adminImage ? req.files.adminImage[0] : null;
      const mapImageFile = req.files.mapImage ? req.files.mapImage[0] : null;

      if (adminImageFile) {
        const result = await uploadToCloudinary( // Changed function call
          adminImageFile.buffer,
          "society-integration/admin-images", // Added folder argument
          adminImageFile.mimetype
        );
        adminImage = result.secure_url;
      }

      if (mapImageFile) {
        const result = await uploadToCloudinary( // Changed function call
          mapImageFile.buffer,
          "society-integration/maps", // Added folder argument
          mapImageFile.mimetype
        );
        mapImage = result.secure_url;
      }
    }

    if (!adminDetails || !adminDetails.name || !adminDetails.contact || !adminDetails.address) {
      return res.status(400).json({ message: "Admin details (name, contact, address) are required." });
    }
    if (!stats) {
      return res.status(400).json({ message: "Statistics data is required." });
    }

    const societyId = adminSocietyId;

    const updateFields = {
      society_id: societyId,
      adminDetails: {
        name: adminDetails.name,
        image: adminImage,
        contact: adminDetails.contact,
        address: adminDetails.address,
      },
      stats: {
        users: stats.users || 0,
        streets: stats.streets || 0,
        shops: stats.shops || 0,
        animals: {
          dogs: stats.animals?.dogs || 0,
          cows: stats.animals?.cows || 0,
        },
        dailyActivities: stats.dailyActivities || "",
        populationDensity: stats.populationDensity || 0,
        area: stats.area || 0,
        trees: stats.trees || 0,
        cctvs: stats.cctvs || 0,
        securityGuards: stats.securityGuards || 0,
      },
      mapImage: mapImage,
    };

    const options = {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    };

    const integrationData = await SocietyIntegration.findOneAndUpdate(
      { society_id: societyId },
      { $set: updateFields },
      options
    );

    res.status(200).json({
      message: "Society integration data saved successfully",
      data: integrationData,
    });
  } catch (error) {
    console.error("Error saving society integration data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSocietyIntegration = async (req, res) => {
  try {
    const societyIdFromQuery = req.query.societyId;

    console.log("Backend: getSocietyIntegration - societyId from query:", societyIdFromQuery);
    console.log("Backend: getSocietyIntegration - req.user:", req.user);

    if (!societyIdFromQuery) {
      return res.status(400).json({ message: "Society ID is required as a query parameter." });
    }

    const integrationData = await SocietyIntegration.findOne({ society_id: societyIdFromQuery }).lean();

    if (!integrationData) {
      return res.status(404).json({ message: "Society integration data not found for your society." });
    }

    res.status(200).json({ data: integrationData });
  } catch (error) {
    console.error("Error fetching society integration data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
