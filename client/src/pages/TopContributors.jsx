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
      {/* Page Heading */}
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ color: theme.palette.primary.main, letterSpacing: 0.5 }}
      >
        🌟 Top Contributors of Our Society
      </Typography>

      {/* Contributor Cards */}
      <Grid container spacing={3} mt={1}>
        {contributors.map((contributor, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <Card
                elevation={4}
                sx={{
                  borderRadius: 4,
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      width: 56,
                      height: 56,
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
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {contributor.house}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  icon={<StarsIcon />}
                  label={contributor.designation}
                  color="primary"
                  sx={{ mb: 2, fontWeight: "medium" }}
                />

                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  gutterBottom
                >
                  🏆 Achievements
                </Typography>
                {contributor.achievements.map((ach, i) => (
                  <Box
                    key={i}
                    display="flex"
                    alignItems="center"
                    mb={1}
                    gap={1}
                  >
                    <EmojiEventsIcon
                      fontSize="small"
                      color="secondary"
                      sx={{ mt: "2px" }}
                    />
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
