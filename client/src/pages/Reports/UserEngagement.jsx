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
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const screenTimeData = [
  { house: "101", time: 4 },
  { house: "102", time: 7 },
  { house: "103", time: 10 },
  { house: "104", time: 5 },
  { house: "105", time: 12 },
  { house: "106", time: 3 },
];

const activeUsers = ["Radha", "Krishna", "Mira", "Shyam"];

const UserEngagementPage = () => {
  const theme = useTheme();

  return (
    <Box
      p={{ xs: 2, md: 4 }}
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        maxWidth: 1200,
        // mx: "auto",
      }}
    >
      {/* Greetings */}
      <Box
        component="h4"
        mb={3}
        sx={{
          fontWeight: 700,
          color: theme.palette.mode === "dark" ? "#f5f5f5": theme.palette.primary.main,
          letterSpacing: 0.5,
          fontSize: "2.125rem", // equivalent to h4 in MUI default
          lineHeight: 1.235,
        }}
      >
        👋 Welcome back, Vishal!
      </Box>

      {/* Active Users */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          bgcolor: theme.palette.background.paper,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Currently Active Members
          </Typography>
          <Box display="flex" mt={1} gap={2}>
            {activeUsers.map((user, idx) => (
              <Avatar
                key={idx}
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  boxShadow: `0 0 8px ${theme.palette.secondary.light}`,
                  cursor: "pointer"
                }}
              >
                {user.charAt(0)}
              </Avatar>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* CTAs */}
      <Grid container spacing={3} mb={5}>
        {[
          { label: "Post Update", variant: "contained", color: "primary" },
          { label: "Join Discussion", variant: "outlined", color: "secondary" },
          { label: "Upload Photo", variant: "contained", color: "secondary" },
          { label: "Invite Neighbour", variant: "outlined", color: "success" },
        ].map(({ label, variant, color }, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Button
              variant={variant}
              color={color}
              fullWidth
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                py: 1.5,
                textTransform: "none",
                boxShadow: variant === "contained" ? theme.shadows[3] : "none",
                "&:hover": {
                  boxShadow:
                    variant === "contained"
                      ? theme.shadows[8]
                      : `0 0 8px ${theme.palette[color]?.main || theme.palette.primary.main}`,
                },
              }}
            >
              {label}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* User Activities */}
      <Card
        sx={{
          mb: 5,
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          bgcolor: theme.palette.background.paper,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight="600" mb={2}>
            Your Recent Activities
          </Typography>
          <List>
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                  📸
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Uploaded 3 photos to Community Wall"
                secondary="2 hours ago"
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                  💬
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Commented on Krishna’s post"
                secondary="4 hours ago"
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                  🎉
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Joined Yoga Day Event"
                secondary="1 day ago"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Grid container spacing={3} mb={5}>
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
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[6],
                bgcolor: theme.palette.background.paper,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: theme.shadows[12],
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  mb={1}
                  sx={{ userSelect: "none" }}
                >
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Graph: Screen Time vs House Numbers */}
      
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: theme.shadows[6],
          bgcolor: theme.palette.background.paper,
          p: 2,
        }}
      >
        
        <Typography
          variant="h6"
          fontWeight="600"
          mb={2}
          sx={{ userSelect: "none", color: theme.palette.text.primary }}
        >
          📊 Screen Time vs House Numbers
        </Typography>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            cursor="pointer"
            data={screenTimeData}
            margin={{ top: 10, bottom: 10, left: 0, right: 10 }}
          >
            {/* Removed CartesianGrid for clean look */}
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
            />
            <YAxis
              domain={[0, 24]}
              label={{
                value: "Hours",
                angle: -90,
                position: "insideLeft",
                fill: theme.palette.text.secondary,
                fontWeight: 600,
                dx: 10,
              }}
              tick={{ fill: theme.palette.text.primary }}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                boxShadow: theme.shadows[5],
                color: theme.palette.mode === "dark" ? "#121212" : "",
              }}
              cursor={{ stroke: theme.palette.primary.main, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke={theme.palette.primary.main}
              strokeWidth={4}
              activeDot={{
                r: 9,
                strokeWidth: 3,
                stroke: theme.palette.secondary.main,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default UserEngagementPage;
