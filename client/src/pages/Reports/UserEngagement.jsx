import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
}
 from "recharts";
import { motion } from "framer-motion";
import { useAppContext } from "../../context/AppContext";

// Create Motion components for better animation control
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionCard = motion(Card);
const MotionGrid = motion(Grid);
const MotionButton = motion(Button);
const MotionListItem = motion(ListItem);

const screenTimeData = [
  { house: "101", time: 4 },
  { house: "102", time: 7 },
  { house: "103", time: 10 },
  { house: "104", time: 5 },
  { house: "105", time: 12 },
  { house: "106", time: 3 },
  { house: "107", time: 8 },
  { house: "108", time: 6 },
  { house: "109", time: 9 },
  { house: "110", time: 4.5 },
];

const activeUsers = ["Radha", "Krishna", "Mira", "Shyam", "Gopal", "Priya"];

const UserEngagementPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const {user} = useAppContext();
  // Framer Motion Variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      p={{ xs: 2, md: 4 }}
      sx={{
        minHeight: "100vh",
        maxWidth: 1200,
        // mx: "auto",
        position: "relative",
        overflow: "hidden",
        borderRadius: 0,
        zIndex: 1,
        backgroundColor: isDark ? theme.palette.background.default : theme.palette.grey[50], 
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)", 
          zIndex: -1,
          borderRadius: 'inherit', 
        },
      }}
    >
      {/* Greetings */}
      <MotionBox
        component="h4" 
        mb={isMobile ? 3 : 4}
        sx={{
          fontWeight: 700,
          fontSize: isMobile ? theme.typography.h5.fontSize : theme.typography.h4.fontSize,
          lineHeight: isMobile ? theme.typography.h5.lineHeight : theme.typography.h4.lineHeight,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: isDark ? "0 0 8px rgba(255,255,255,0.1)" : "none",
          textAlign: isMobile ? "center" : "left",
          display: 'block', 
        }}
        variants={itemVariants}
      >
        👋 Welcome back, {user.name}!
      </MotionBox>

      {/* --- */}

      {/* Active Users */}
      <MotionCard
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          bgcolor: theme.palette.background.paper,
          p: isMobile ? 2 : 3,
          overflowX: 'auto',
        }}
        variants={itemVariants}
      >
        <CardContent sx={{ p: '0 !important' }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Currently Active Members
          </Typography>
          <Box display="flex" mt={2} gap={isMobile ? 1.5 : 2} py={1}>
            {activeUsers.map((user, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    fontWeight: "bold",
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    width: isMobile ? 48 : 56,
                    height: isMobile ? 48 : 56,
                    boxShadow: `0 0 12px ${theme.palette.secondary.light}80`,
                    cursor: "pointer",
                    border: `2px solid ${theme.palette.secondary.dark}`,
                    transition: "all 0.2s ease-in-out",
                  }}
                  title={user}
                >
                  {user.charAt(0)}
                </Avatar>
              </motion.div>
            ))}
          </Box>
        </CardContent>
      </MotionCard>

      {/* --- */}

      {/* CTAs */}
      <MotionGrid container spacing={isMobile ? 2 : 3} mb={isMobile ? 4 : 5} variants={containerVariants}>
        {[
          { label: "Post Update", variant: "contained", color: "primary" },
          { label: "Join Discussion", variant: "outlined", color: "secondary" },
          { label: "Upload Photo", variant: "contained", color: "secondary" },
          { label: "Invite Neighbour", variant: "outlined", color: "success" },
        ].map(({ label, variant, color }, i) => (
          <MotionGrid item xs={12} sm={6} md={3} key={i} variants={itemVariants}>
            <MotionButton
              variant={variant}
              color={color}
              fullWidth
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                py: 1.5,
                textTransform: "none",
                boxShadow: variant === "contained" ? theme.shadows[3] : "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow:
                    variant === "contained"
                      ? theme.shadows[8]
                      : `0 0 10px ${theme.palette[color]?.main || theme.palette.primary.main}`,
                  transform: "translateY(-3px)",
                },
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </MotionButton>
          </MotionGrid>
        ))}
      </MotionGrid>

      {/* --- */}

      {/* User Activities */}
      <MotionCard
        sx={{
          mb: isMobile ? 4 : 5,
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          bgcolor: theme.palette.background.paper,
          p: isMobile ? 2 : 3,
        }}
        variants={itemVariants}
      >
        <CardContent sx={{ p: '0 !important' }}>
          <Typography variant="h6" fontWeight="600" mb={isMobile ? 1.5 : 2}>
            Your Recent Activities
          </Typography>
          <List>
            <MotionListItem
              sx={{ px: 0, py: 1.5 }}
              variants={itemVariants}
              whileHover={{ x: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                  📸
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="bold">
                    Uploaded 3 photos to Community Wall
                  </Typography>
                }
                secondary="2 hours ago"
              />
            </MotionListItem>
            <MotionListItem
              sx={{ px: 0, py: 1.5 }}
              variants={itemVariants}
              whileHover={{ x: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.contrastText }}>
                  💬
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="bold">
                    Commented on Krishna’s post
                  </Typography>
                }
                secondary="4 hours ago"
              />
            </MotionListItem>
            <MotionListItem
              sx={{ px: 0, py: 1.5 }}
              variants={itemVariants}
              whileHover={{ x: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.contrastText }}>
                  🎉
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="bold">
                    Joined Yoga Day Event
                  </Typography>
                }
                secondary="1 day ago"
              />
            </MotionListItem>
          </List>
        </CardContent>
      </MotionCard>

      {/* --- */}

      {/* Achievements */}
      <MotionGrid container spacing={isMobile ? 2 : 3} mb={isMobile ? 4 : 5} variants={containerVariants}>
        {[
          {
            title: "🏅 Community Contributor",
            desc: "10 posts made this month",
          },
          {
            title: "🔥 Daily Streak",
            desc: "7 days active in a row",
          },
          {
            title: "💡 Idea Sharer",
            desc: "5 discussions initiated",
          },
        ].map(({ title, desc }, i) => (
          <MotionGrid item xs={12} sm={6} md={4} key={i} variants={itemVariants}>
            <MotionCard
              whileHover={{ scale: 1.05, boxShadow: theme.shadows[12] }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[6],
                bgcolor: theme.palette.background.paper,
                minHeight: isMobile ? 120 : 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: isMobile ? 1 : 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  mb={1}
                  sx={{ userSelect: "none" }}
                  color={theme.palette.primary.main}
                >
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {desc}
                </Typography>
              </CardContent>
            </MotionCard>
          </MotionGrid>
        ))}
      </MotionGrid>

      {/* --- */}

      {/* Graph: Screen Time vs House Numbers */}
      <MotionCard
        sx={{
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          bgcolor: theme.palette.background.paper,
          p: isMobile ? 2 : 3,
        }}
        variants={itemVariants}
      >
        <Typography
          variant="h6"
          fontWeight="600"
          mb={isMobile ? 1.5 : 2}
          sx={{ userSelect: "none", color: theme.palette.text.primary }}
        >
          📊 Screen Time vs House Numbers
        </Typography>

        <ResponsiveContainer width="100%" height={isMobile ? 250 : 320}>
          <LineChart
            cursor="pointer"
            data={screenTimeData}
            margin={{ top: 10, bottom: 10, left: isMobile ? -20 : 0, right: isMobile ? 0 : 10 }}
          >
            <XAxis
              dataKey="house"
              label={{
                value: "House No.",
                position: "insideBottom",
                offset: -10,
                fill: theme.palette.text.secondary,
                fontWeight: 600,
              }}
              tick={{ fill: theme.palette.text.primary }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              domain={[0, 15]}
              label={{
                value: "Hours",
                angle: -90,
                position: "insideLeft",
                fill: theme.palette.text.secondary,
                fontWeight: 600,
                dx: isMobile ? 0 : 10,
              }}
              tick={{ fill: theme.palette.text.primary }}
              axisLine={{ stroke: theme.palette.divider }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                boxShadow: theme.shadows[5],
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
              labelStyle={{ color: theme.palette.text.primary }}
              itemStyle={{ color: theme.palette.text.secondary }}
              cursor={{ stroke: theme.palette.primary.main, strokeWidth: 2, strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke={theme.palette.primary.main}
              strokeWidth={4}
              dot={{ stroke: theme.palette.primary.dark, strokeWidth: 2, r: 5 }}
              activeDot={{
                r: 9,
                strokeWidth: 3,
                stroke: theme.palette.secondary.main,
                fill: theme.palette.secondary.light,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </MotionCard>
    </MotionBox>
  );
};

export default UserEngagementPage;