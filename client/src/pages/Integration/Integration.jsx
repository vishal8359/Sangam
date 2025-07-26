import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Grid,
  useTheme,
  Divider,
  Stack,
  Chip,
  Tooltip,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slide,
  CircularProgress, // Import CircularProgress for loading states
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PetsIcon from "@mui/icons-material/Pets";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import TerrainIcon from "@mui/icons-material/Terrain";
import SecurityIcon from "@mui/icons-material/Security";
import MapIcon from "@mui/icons-material/Map";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh"; // Import RefreshIcon
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const initialSocietyData = {
  adminDetails: {
    name: "",
    image: "",
    contact: "",
    address: "",
  },
  stats: {
    users: 0,
    streets: 0,
    shops: 0,
    animals: { dogs: 0, cows: 0 },
    dailyActivities: "",
    populationDensity: 0,
    area: 0,
    trees: 0,
    cctvs: 0,
    securityGuards: 0,
  },
  mapImage: "",
};

// Helper component for animal stats to keep the main component cleaner
const CardStatAnimals = ({ dogs, cows, isDark, theme }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card
      sx={{
        p: 3,
        bgcolor: isDark ? "#1e1e1e" : "#fff",
        boxShadow: 5,
        borderRadius: 3,
        height: "100%",
        transition: "box-shadow 0.3s ease",
        "&:hover": { boxShadow: 7 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <PetsIcon fontSize="large" color={isDark ? "#fff" : ""} />
        <Typography
          variant="h6"
          fontWeight="bold"
          color={isDark ? "#fff" : ""}
        >
          Animals
        </Typography>
      </Box>
      <Stack direction="row" spacing={2} mt={1}>
        <Chip
          label={`Dogs: ${dogs}`}
          icon={<PetsIcon sx={{ color: theme.palette.info.main }} />}
          sx={{
            bgcolor: isDark ? theme.palette.grey[800] : theme.palette.info.light + '20',
            color: isDark ? "#fff" : theme.palette.info.dark,
            fontWeight: "bold",
          }}
        />
        <Chip
          label={`Cows: ${cows}`}
          icon={<PetsIcon sx={{ color: theme.palette.success.main }} />}
          sx={{
            bgcolor: isDark ? theme.palette.grey[800] : theme.palette.success.light + '20',
            color: isDark ? "#fff" : theme.palette.success.dark,
            fontWeight: "bold",
          }}
        />
      </Stack>
    </Card>
  </Grid>
);

export default function IntegrationPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { userRole, token, axios, user, societyId } = useAppContext(); // Destructure societyId
  const isAdmin = userRole === "admin";

  const [societyData, setSocietyData] = useState(initialSocietyData);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState(initialSocietyData);
  const [adminImageFile, setAdminImageFile] = useState(null);
  const [mapImageFile, setMapImageFile] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state for fetching data
  const [submitting, setSubmitting] = useState(false); // New loading state for form submission

  // Log societyId for debugging
  useEffect(() => {
    console.log("IntegrationPage: Current societyId:", societyId);
    console.log("IntegrationPage: Current user:", user);
    console.log("IntegrationPage: Is Admin:", isAdmin);
  }, [societyId, user, isAdmin]);

  useEffect(() => {
    if (!token || !axios || !societyId) {
      setLoading(false); // Stop loading if prerequisites are not met
      if (!token) toast.error("Authentication token missing.");
      if (!societyId) toast.error("Society ID missing. Please ensure you are part of a society.");
      return;
    }
    fetchSocietyData();
  }, [token, axios, societyId]); // Added societyId to dependencies

  useEffect(() => {
    if (user && isAdmin) {
      setFormData((prev) => ({
        ...prev,
        adminDetails: {
          ...prev.adminDetails,
          name: user.name || "",
          image: user.avatar || "",
          contact: user.phone_no || "",
          address: user.address || "",
        },
      }));
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!formData || !formData.stats) {
      return;
    }

    const users = formData.stats.users || 0;
    const areaSqM = formData.stats.area || 0;

    let calculatedDensity = 0;
    if (areaSqM > 0) {
      const areaSqKm = areaSqM / 1_000_000;
      if (areaSqKm > 0) {
        calculatedDensity = Math.round(users / areaSqKm);
      }
    }

    setFormData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        populationDensity: calculatedDensity,
      },
    }));
  }, [formData.stats.users, formData.stats.area]);

  const fetchSocietyData = async () => {
    setLoading(true); // Start loading
    try {
      // Pass societyId as a query parameter
      const res = await axios.get(`/api/users/society-integration?societyId=${societyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.data) {
        setSocietyData(res.data.data);
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error(
        "Failed to fetch society integration data:",
        err.response?.data || err.message
      );

      // If data is not found and user is admin, pre-fill admin details from user context
      if (err.response?.status === 404 && isAdmin && user) {
        const adminDetailsFromUser = {
          name: user.name || "",
          image: user.avatar || "",
          contact: user.phone_no || "",
          address: user.address || "",
        };
        setSocietyData((prev) => ({
          ...prev,
          adminDetails: adminDetailsFromUser,
        }));
        setFormData((prev) => ({
          ...prev,
          adminDetails: adminDetailsFromUser,
        }));
        toast.info("No society integration data found. You can add it now.");
      } else {
        toast.error(
          err.response?.data?.message || "Failed to fetch society data."
        );
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAdminImageFile(null);
    setMapImageFile(null);
    // Reset form data to current societyData when closing without saving
    setFormData(societyData);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("adminDetails.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        adminDetails: { ...prev.adminDetails, [field]: value },
      }));
    } else if (name.startsWith("stats.animals.")) {
      const field = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          animals: { ...prev.stats.animals, [field]: parseInt(value) || 0 },
        },
      }));
    } else if (name.startsWith("stats.")) {
      const field = name.split(".")[1];
      if (
        [
          "users",
          "streets",
          "shops",
          "area",
          "trees",
          "cctvs",
          "securityGuards",
        ].includes(field)
      ) {
        setFormData((prev) => ({
          ...prev,
          stats: { ...prev.stats, [field]: parseInt(value) || 0 },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image file size exceeds 2MB limit.");
        if (name === "adminImage") {
          setAdminImageFile(null);
        } else if (name === "mapImage") {
          setMapImageFile(null);
        }
        return;
      }

      if (name === "adminImage") {
        setAdminImageFile(file);
      } else if (name === "mapImage") {
        setMapImageFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true); // Start submitting loading
    try {
      const data = new FormData();

      // Append all form fields
      data.append("adminDetails[name]", formData.adminDetails.name);
      data.append("adminDetails[contact]", formData.adminDetails.contact);
      data.append("adminDetails[address]", formData.adminDetails.address);
      // If no new file is selected but there's an existing image, send its URL
      if (!adminImageFile && formData.adminDetails.image) {
        data.append("adminDetails[image]", formData.adminDetails.image);
      }
      if (!mapImageFile && formData.mapImage) {
        data.append("mapImage", formData.mapImage);
      }

      data.append("stats[users]", formData.stats.users);
      data.append("stats[streets]", formData.stats.streets);
      data.append("stats[shops]", formData.stats.shops);
      data.append("stats[animals][dogs]", formData.stats.animals.dogs);
      data.append("stats[animals][cows]", formData.stats.animals.cows);
      data.append("stats[dailyActivities]", formData.stats.dailyActivities);
      data.append("stats[populationDensity]", formData.stats.populationDensity);
      data.append("stats[area]", formData.stats.area);
      data.append("stats[trees]", formData.stats.trees);
      data.append("stats[cctvs]", formData.stats.cctvs);
      data.append("stats[securityGuards]", formData.stats.securityGuards);

      // Append actual file objects if new ones are selected
      if (adminImageFile) {
        data.append("adminImage", adminImageFile);
      }
      if (mapImageFile) {
        data.append("mapImage", mapImageFile);
      }

      // Add societyId to the form data
      data.append("societyId", societyId);

      const res = await axios.post("/api/admin/society-integration", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
      setSocietyData(res.data.data);
      setFormData(res.data.data);
      handleCloseDialog();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save data.");
      console.error("Error saving data:", err.response?.data || err.message);
    } finally {
      setSubmitting(false); // End submitting loading
    }
  };

  const displayedAreaSqKm = (societyData.stats.area / 1_000_000).toFixed(2);

  const populationDensityPercent = Math.min(
    (societyData.stats.populationDensity / 3000) * 100,
    100
  );
  const treeCoveragePercent = Math.min(
    (societyData.stats.trees / 500) * 100,
    100
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" size={60} />
        <Typography variant="h6" ml={2} color="text.secondary">
          Loading society integration data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      p={{ xs: 2, md: 4 }}
      maxWidth="100%"
      mx="auto"
      sx={{
        bgcolor: isDark
          ? theme.palette.background.default
          : "#fff",
        minHeight: "100vh",
        mb: 0,
        transition: "background-color 0.3s ease-in-out",
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={4}
        color={
          isDark ? "#ccc" : theme.palette.primary.main
        }
        textAlign="center"
        sx={{ userSelect: "none", animation: "fadeIn 1s ease-out" }}
      >
        <span role="img" aria-label="houses">
          🏘️
        </span>{" "}
        My Society - Dashboard
      </Typography>

      {isAdmin && (
        <Box textAlign="center" mb={4}>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleOpenDialog}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "50px",
                fontSize: "1rem",
                boxShadow: theme.shadows[3],
                "&:hover": {
                  boxShadow: theme.shadows[6],
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {societyData._id ? "Edit Society Details" : "Add Society Details"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchSocietyData}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "50px",
                fontSize: "1rem",
                boxShadow: theme.shadows[3],
                "&:hover": {
                  boxShadow: theme.shadows[6],
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
                color: isDark ? "#fff" : ""
              }}
            >
              Update Data
            </Button>
          </Stack>
        </Box>
      )}

      <Slide direction="right" in mountOnEnter unmountOnExit timeout={500}>
        <Card
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            p: 3,
            mb: 5,
            bgcolor: isDark
              ? theme.palette.background.paper
              : theme.palette.common.white,
            boxShadow: theme.shadows[4],
            borderRadius: theme.shape.borderRadius * 2,
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
            "&:hover": {
              boxShadow: theme.shadows[8],
              transform: "translateY(-4px)",
            },
          }}
        >
          <Avatar
            src={
              societyData.adminDetails.image ||
              "https://via.placeholder.com/150/FF5733/FFFFFF?text=Admin"
            }
            alt={societyData.adminDetails.name || "Admin"}
            sx={{
              width: 120,
              height: 120,
              mr: { sm: 4 },
              mb: { xs: 2, sm: 0 },
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: theme.shadows[2],
            }}
          />
          <Box flex={1}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color={
                isDark
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark
              }
            >
              Society Admin
            </Typography>
            <Typography
              variant="h6"
              color={theme.palette.text.primary}
              gutterBottom
            >
              {societyData.adminDetails.name || "N/A"}
            </Typography>
            <Typography
              variant="body1"
              color={theme.palette.text.secondary}
              gutterBottom
            >
              {societyData.adminDetails.address || "N/A"}
            </Typography>
            <Typography
              variant="body1"
              color={theme.palette.text.secondary}
              fontWeight="medium"
            >
              📞 Contact: {societyData.adminDetails.contact || "N/A"}
            </Typography>
          </Box>
        </Card>
      </Slide>

      <Slide direction="up" in mountOnEnter unmountOnExit timeout={700}>
        <Card
          sx={{
            mb: 6,
            overflow: "hidden",
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[5],
            bgcolor: isDark
              ? theme.palette.background.paper
              : theme.palette.common.white,
            cursor: "pointer",
            "&:hover img": {
              transform: "scale(1.03)",
            },
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: theme.shadows[9],
            },
          }}
        >
          <Box
            component="img"
            src={
              societyData.mapImage ||
              `https://via.placeholder.com/1200x400/${isDark ? "333333/FFFFFF" : "DDDDDD/000000"}?text=Society+Map+Not+Available`
            }
            alt="Society Map"
            sx={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: theme.shape.borderRadius * 2,
              transition: "transform 0.4s ease",
            }}
          />
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="bold"
              color= {isDark ? "#fff" : ""}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <MapIcon /> Society Map Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A visual representation of the society layout.
            </Typography>
          </CardContent>
        </Card>
      </Slide>

      <Grid container spacing={4}>
        {/* 1. Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PeopleIcon fontSize="large" color= {isDark ? "#fff" : ""} />
              <Typography
                variant="h6"
                fontWeight="bold"
                color={isDark ? "primary.light" : "primary.main"}
                sx={{color: isDark ? "#fff" : "",}}
              >
                Total Users : {societyData.stats.users}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* 2. Number of Streets */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <HomeIcon fontSize="large" color={isDark ? "#fff" : ""} />
              <Typography
                variant="h6"
                fontWeight="bold"
                color={isDark ? "#fff" : ""}
              >
                Number of Streets : {societyData.stats.streets}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* 3. Number of Shops */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <StorefrontIcon fontSize="large" color={isDark ? "#fff" : ""} />
              <Typography
                variant="h6"
                fontWeight="bold"
                color={isDark ? "#fff" : ""}
              >
                Number of Shops : {societyData.stats.shops}
              </Typography>
            </Box>
          </Card>
        </Grid>
        <CardStatAnimals
          dogs={societyData.stats.animals.dogs}
          cows={societyData.stats.animals.cows}
          isDark={isDark}
          theme={theme}
        />

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark
                ? theme.palette.background.paper
                : theme.palette.common.white,
              boxShadow: theme.shadows[5],
              borderRadius: theme.shape.borderRadius * 2,
              height: "100%",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: theme.shadows[7],
                transform: "translateY(-4px)",
              },
            }}
          >
            <Typography
              variant="h6"
              mb={2}
              display="flex"
              alignItems="center"
              gap={1}
              color={
                isDark ? "#fff" : ""
              }
              fontWeight="bold"
            >
              <LocalActivityIcon sx={{ color: isDark ? "#fff" : "" }} />
              Daily Activities
              <Tooltip title="Community events and classes">
                <IconButton
                  size="small"
                  sx={{ ml: 1, color: theme.palette.text.secondary }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography
              variant="body1"
              color={theme.palette.text.secondary}
              sx={{ whiteSpace: "pre-line" }}
            >
              {societyData.stats.dailyActivities || "No activities listed."}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={isDark ? "#fff" : ""}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <DensityMediumIcon color={isDark ? "#fff" : ""} />
                Population Density
                <Tooltip title="People per square kilometer">
                  <InfoOutlinedIcon
                    sx={{ fontSize: 16, ml: 0.5, cursor: "help" }}
                  />
                </Tooltip>
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {societyData.stats.populationDensity} person/km²
              </Typography>
              <LinearProgress
                variant="determinate"
                value={populationDensityPercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: theme.palette.grey[300],
                }}
                color={populationDensityPercent > 70 ? "error" : "primary"}
              />
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}
              >
                Density relative to max 3000 per sq.km
              </Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TerrainIcon fontSize="large" color={isDark ? "#fff" : ""} />
              <Typography
                variant="h6"
                fontWeight="bold"
                color={isDark ? "#fff" : ""}
              >
                Area of Society : {displayedAreaSqKm} sq.km
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark
                ? theme.palette.background.paper
                : theme.palette.common.white,
              boxShadow: theme.shadows[5],
              borderRadius: theme.shape.borderRadius * 2,
              height: "100%",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: theme.shadows[7],
                transform: "translateY(-4px)",
              },
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={theme.palette.success.main}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <TerrainIcon color="success" />
                Number of Trees
                <Tooltip title="Trees and green cover in society">
                  <InfoOutlinedIcon
                    sx={{ fontSize: 16, ml: 0.5, cursor: "help" }}
                  />
                </Tooltip>
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {societyData.stats.trees}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={treeCoveragePercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: theme.palette.grey[300],
                }}
                color="success"
              />
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}
              >
                Coverage relative to goal of 500 trees
              </Typography>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark
                ? theme.palette.background.paper
                : theme.palette.common.white,
              boxShadow: theme.shadows[5],
              borderRadius: theme.shape.borderRadius * 2,
              height: "100%",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
              "&:hover": {
                boxShadow: theme.shadows[7],
                transform: "translateY(-4px)",
              },
            }}
          >
            <Typography
              variant="h6"
              mb={3}
              display="flex"
              alignItems="center"
              gap={1}
              color={
                isDark ? "#fff" : ""
              }
              fontWeight="bold"
            >
              <SecurityIcon sx={{ color: isDark ? "#fff" : ""}} />
              Security & Surveillance
              <Tooltip title="Monitoring and safety">
                <IconButton
                  size="small"
                  sx={{ ml: 1, color: theme.palette.text.secondary }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 6 }}
              justifyContent="space-around"
            >
              <Box textAlign="center">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color={theme.palette.text.primary}
                >
                  CCTV Cameras
                </Typography>
                <Chip
                  label={societyData.stats.cctvs}
                  color="primary"
                  variant="outlined"
                  size="medium"
                  sx={{ mt: 1, px: 2, py: 1, fontSize: "1rem" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color={theme.palette.text.primary}
                >
                  Security Guards
                </Typography>
                <Chip
                  label={societyData.stats.securityGuards}
                  color="primary"
                  variant="outlined"
                  size="medium"
                  sx={{ mt: 1, px: 2, py: 1, fontSize: "1rem" }}
                />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[10],
            bgcolor: isDark
              ? theme.palette.background.default
              : theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderTopLeftRadius: theme.shape.borderRadius * 2,
            borderTopRightRadius: theme.shape.borderRadius * 2,
            py: 2,
            px: 3,
            fontWeight: "bold",
          }}
        >
          {societyData._id ? "Edit Society Details" : "Add Society Details"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            pt: 2,
            bgcolor: isDark
              ? theme.palette.background.paper
              : theme.palette.common.white,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            color={
              isDark ? theme.palette.primary.light : theme.palette.primary.main
            }
          >
            Admin Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Admin Name"
                name="adminDetails.name"
                value={formData.adminDetails.name}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Admin Contact"
                name="adminDetails.contact"
                type="tel" // Changed to tel for phone number input
                value={formData.adminDetails.contact}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Admin Address"
                name="adminDetails.address"
                value={formData.adminDetails.address}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                mt={2}
                color={theme.palette.text.primary}
              >
                Admin Image:
              </Typography>
              <input
                type="file"
                name="adminImage"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: theme.palette.text.secondary,
                }}
              />
              {adminImageFile ? (
                <img
                  src={URL.createObjectURL(adminImageFile)}
                  alt="Admin Preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              ) : formData.adminDetails.image ? (
                <img
                  src={formData.adminDetails.image}
                  alt="Current Admin"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No admin image selected
                </Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

          <Typography
            variant="h6"
            gutterBottom
            color={
              isDark ? theme.palette.primary.light : theme.palette.primary.main
            }
          >
            Society Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Total Users"
                name="stats.users"
                type="number"
                value={formData.stats.users}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Number of Streets"
                name="stats.streets"
                type="number"
                value={formData.stats.streets}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Number of Shops"
                name="stats.shops"
                type="number"
                value={formData.stats.shops}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Dogs"
                name="stats.animals.dogs"
                type="number"
                value={formData.stats.animals.dogs}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Cows"
                name="stats.animals.cows"
                type="number"
                value={formData.stats.animals.cows}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Daily Activities"
                name="stats.dailyActivities"
                value={formData.stats.dailyActivities}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Area (sq. meters)"
                name="stats.area"
                type="number"
                value={formData.stats.area}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Trees"
                name="stats.trees"
                type="number"
                value={formData.stats.trees}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="CCTV Cameras"
                name="stats.cctvs"
                type="number"
                value={formData.stats.cctvs}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Security Guards"
                name="stats.securityGuards"
                type="number"
                value={formData.stats.securityGuards}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Population Density (Auto Calculated)"
                name="stats.populationDensity"
                value={formData.stats.populationDensity}
                fullWidth
                margin="normal"
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                mt={2}
                color={theme.palette.text.primary}
              >
                Society Map Image:
              </Typography>
              <input
                type="file"
                name="mapImage"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: theme.palette.text.secondary,
                }}
              />
              {mapImageFile ? (
                <img
                  src={URL.createObjectURL(mapImageFile)}
                  alt="Map Preview"
                  style={{
                    width: "150px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              ) : formData.mapImage ? (
                <img
                  src={formData.mapImage}
                  alt="Current Map"
                  style={{
                    width: "150px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No map image selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            bgcolor: isDark
              ? theme.palette.background.paper
              : theme.palette.common.white,
            borderBottomLeftRadius: theme.shape.borderRadius * 2,
            borderBottomRightRadius: theme.shape.borderRadius * 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            color="secondary"
            variant="outlined"
            disabled={submitting}
            sx={{ px: 3, py: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ px: 3, py: 1 }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
