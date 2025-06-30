import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  useTheme,
  Tooltip,
  Divider,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StarsIcon from "@mui/icons-material/Stars";
import { motion } from "framer-motion";

const contributors = [
  {
    name: "Radha Sharma",
    house: "A-101, Lotus Residency",
    designation: "President",
    achievements: [
      "Organized 15+ events",
      "Maintained 98% resident satisfaction",
      "Green Initiative Leader",
    ],
  },
  {
    name: "Krishna Mehra",
    house: "B-203, Tulip Towers",
    designation: "Community Coordinator",
    achievements: [
      "Led Volunteer Programs",
      "Helped resolve 120+ complaints",
      "Monthly Newsletter Author",
    ],
  },
  {
    name: "Meera Bansal",
    house: "C-307, Orchid Heights",
    designation: "Youth Representative",
    achievements: [
      "Started Skill Development Classes",
      "Organized Youth Fest 2025",
      "Top Voted Member of Month",
    ],
  },
];

const TopContributorsPage = () => {
  const theme = useTheme();

  return (
    <Box
      p={3}
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      {/* Page Title */}
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          p: 2,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
          color: theme.palette.primary.contrastText,
          fontSize: {
            xs: "1.8rem",
            sm: "2.2rem",
            md: "2.5rem",
          },
          fontWeight: 800,
          letterSpacing: 1,
          boxShadow: 4,
        }}
      >
        🌟 Celebrating Our Top Contributors
      </Box>

      <Grid container spacing={4}>
        {contributors.map((contributor, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
            >
              <Card
                elevation={6}
                sx={{
                  borderRadius: 5,
                  background: `linear-gradient(to bottom right, ${theme.palette.primary.light}, ${theme.palette.background.paper})`,
                  color: theme.palette.text.primary,
                  boxShadow: theme.shadows[10],
                  overflow: "hidden",
                  px: 3,
                  pt: 3,
                  pb: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      background: "linear-gradient(to right, #FF6B6B, #FFD93D)",
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                      width: 60,
                      height: 60,
                      color: "#fff",
                    }}
                  >
                    {contributor.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {contributor.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {contributor.house}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  icon={<StarsIcon />}
                  label={contributor.designation}
                  color="secondary"
                  size="small"
                  sx={{
                    mt: 2,
                    fontWeight: "bold",
                    borderRadius: "8px",
                    px: 1.5,
                  }}
                />

                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  gutterBottom
                  sx={{ textTransform: "uppercase", color: theme.palette.mode === "dark" ? "text.secondary" : "#121212" }}
                >
                  🏆 Achievements
                </Typography>

                {contributor.achievements.map((ach, i) => (
                  <Box
                    key={i}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={1}
                  >
                    <Tooltip title="Achievement" arrow>
                      <EmojiEventsIcon
                        fontSize="small"
                        color="warning"
                        sx={{ mt: "1px" }}
                      />
                    </Tooltip>
                    <Typography variant="body2">{ach}</Typography>
                  </Box>
                ))}
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TopContributorsPage;
