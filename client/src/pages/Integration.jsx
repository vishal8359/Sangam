import React from "react";
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

const societyData = {
  admin: {
    name: "Rajesh Sharma",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    contact: "+91 98765 43210",
    address: "Plot No. 12, Greenfield Society, Sector 45, Delhi, India",
  },
  stats: {
    users: 234,
    streets: 12,
    shops: 35,
    animals: { dogs: 18, cows: 5 },
    dailyActivities:
      "Yoga classes, community cleaning, kids play area events, cultural festivals",
    populationDensity: 1500, // per sq.km as number
    area: 2.5, // sq.km as number
    trees: 250,
    cctvs: 40,
    securityGuards: 6,
  },
  mapImage:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
};

export default function IntegrationPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Progress percent for population density & tree coverage etc
  const populationDensityPercent = Math.min(
    (societyData.stats.populationDensity / 3000) * 100,
    100
  );
  const treeCoveragePercent = Math.min(
    (societyData.stats.trees / 500) * 100,
    100
  );

  return (
    <Box
      p={{ xs: 2, md: 4 }}
      maxWidth="1200px"
      mx="auto"
      sx={{
        bgcolor: isDark ? "#121212" : "#fafafa",
        minHeight: "100vh",
        mb: 5,
      }}
    >
      {/* Header */}
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={4}
        color={isDark ? "#f5f5f5" : "primary.main"}
        textAlign="center"
        sx={{ userSelect: "none" }}
      >
        🏘️ My Society - Integration Dashboard
      </Typography>

      {/* Admin Details */}
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          p: 3,
          mb: 5,
          bgcolor: isDark ? "#1e1e1e" : "#fff",
          boxShadow: 4,
          borderRadius: 3,
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <Avatar
          src={societyData.admin.image}
          alt={societyData.admin.name}
          sx={{ width: 120, height: 120, mr: { sm: 4 }, mb: { xs: 2, sm: 0 } }}
        />
        <Box flex={1}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Society Admin
          </Typography>
          <Typography variant="h6" color="text.primary" gutterBottom>
            {societyData.admin.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {societyData.admin.address}
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight="medium">
            📞 Contact: {societyData.admin.contact}
          </Typography>
        </Box>
      </Card>

      {/* Society Map */}
      <Card
        sx={{
          mb: 6,
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: 5,
          bgcolor: isDark ? "#1e1e1e" : "#fff",
          cursor: "pointer",
          "&:hover img": {
            transform: "scale(1.05)",
            transition: "transform 0.4s ease",
          },
        }}
      >
        <Box
          component="img"
          src={societyData.mapImage}
          alt="Society Map"
          sx={{
            width: "100%",
            maxHeight: 400,
            objectFit: "cover",
            borderRadius: 3,
            transition: "transform 0.4s ease",
          }}
        />
      </Card>

      {/* Society Stats */}
      <Grid container spacing={4}>
        {/* Total Users */}
        <StatCard
          title="Total Users"
          value={societyData.stats.users}
          icon={<PeopleIcon fontSize="large" color="primary" />}
          isDark={isDark}
          tooltip="Registered members in the society"
        />

        {/* Number of Streets */}
        <StatCard
          title="Number of Streets"
          value={societyData.stats.streets}
          icon={<HomeIcon fontSize="large" color="primary" />}
          isDark={isDark}
          tooltip="Total streets in society"
        />

        {/* Number of Shops */}
        <StatCard
          title="Number of Shops"
          value={societyData.stats.shops}
          icon={<StorefrontIcon fontSize="large" color="primary" />}
          isDark={isDark}
          tooltip="Shops & marketplaces"
        />

        {/* Animals */}
        <CardStatAnimals
          dogs={societyData.stats.animals.dogs}
          cows={societyData.stats.animals.cows}
          isDark={isDark}
        />

        {/* Daily Activities */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: 7,
              },
            }}
          >
            <Typography
              variant="h6"
              mb={2}
              display="flex"
              alignItems="center"
              gap={1}
              color={isDark ? "primary.light" : "primary.main"}
              fontWeight="bold"
            >
              <LocalActivityIcon sx={{ color: "primary.main" }} />
              Daily Activities
              <Tooltip title="Community events and classes">
                <IconButton size="small" sx={{ ml: 1, color: "text.secondary" }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
              {societyData.stats.dailyActivities}
            </Typography>
          </Card>
        </Grid>

        {/* Population Density with Progress */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight="bold" color="text.primary" display="flex" alignItems="center" gap={1}>
                <DensityMediumIcon color="primary" />
                Population Density
                <Tooltip title="People per square kilometer">
                  <InfoOutlinedIcon sx={{ fontSize: 16, ml: 0.5, cursor: "help" }} />
                </Tooltip>
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {societyData.stats.populationDensity} / sq.km
              </Typography>
              <LinearProgress
                variant="determinate"
                value={populationDensityPercent}
                sx={{ height: 10, borderRadius: 5 }}
                color={populationDensityPercent > 70 ? "error" : "primary"}
              />
              <Typography variant="caption" color="text.secondary">
                Density relative to max 3000 per sq.km
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Area */}
        <StatCard
          title="Area of Society"
          value={`${societyData.stats.area} sq.km`}
          icon={<TerrainIcon fontSize="large" color="primary" />}
          isDark={isDark}
          tooltip="Total area covered by society"
        />

        {/* Trees / Eco-culture with progress */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <TerrainIcon color="success" />
                Number of Trees
                <Tooltip title="Trees and green cover in society">
                  <InfoOutlinedIcon sx={{ fontSize: 16, ml: 0.5, cursor: "help" }} />
                </Tooltip>
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {societyData.stats.trees}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={treeCoveragePercent}
                sx={{ height: 10, borderRadius: 5 }}
                color="success"
              />
              <Typography variant="caption" color="text.secondary">
                Coverage relative to goal of 500 trees
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* CCTVs and Security */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? "#1e1e1e" : "#fff",
              boxShadow: 5,
              borderRadius: 3,
              height: "100%",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: 7,
              },
            }}
          >
            <Typography
              variant="h6"
              mb={3}
              display="flex"
              alignItems="center"
              gap={1}
              color={isDark ? "primary.light" : "primary.main"}
              fontWeight="bold"
            >
              <SecurityIcon sx={{ color: "primary.main" }} />
              Security & Surveillance
              <Tooltip title="Monitoring and safety">
                <IconButton size="small" sx={{ ml: 1, color: "text.secondary" }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 6 }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                  CCTV Cameras
                </Typography>
                <Chip
                  label={societyData.stats.cctvs}
                  color="primary"
                  variant="outlined"
                  size="medium"
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                  Security Guards
                </Typography>
                <Chip
                  label={societyData.stats.securityGuards}
                  color="primary"
                  variant="outlined"
                  size="medium"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function StatCard({ title, value, icon, isDark, tooltip }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Tooltip title={tooltip || ""} arrow>
        <Card
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: isDark ? "#1e1e1e" : "#fff",
            boxShadow: 4,
            borderRadius: 3,
            height: "100%",
            cursor: tooltip ? "help" : "default",
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: 6,
            },
          }}
        >
          {icon}
          <Box>
            <Typography variant="h6" color="text.primary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {value}
            </Typography>
          </Box>
        </Card>
      </Tooltip>
    </Grid>
  );
}

function CardStatAnimals({ dogs, cows, isDark }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card
        sx={{
          p: 3,
          bgcolor: isDark ? "#1e1e1e" : "#fff",
          boxShadow: 4,
          borderRadius: 3,
          height: "100%",
          cursor: "default",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <Typography
          variant="h6"
          mb={2}
          display="flex"
          alignItems="center"
          gap={1}
          color={isDark ? "primary.light" : "primary.main"}
          fontWeight="bold"
        >
          <PetsIcon />
          Animals
        </Typography>
        <Stack direction="row" spacing={3} justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h3" color="primary" fontWeight="bold">
              🐕 {dogs}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Dogs
            </Typography>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 2, borderColor: "divider" }}
          />
          <Box textAlign="center">
            <Typography variant="h3" color="success.main" fontWeight="bold">
              🐄 {cows}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Cows
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Grid>
  );
}
