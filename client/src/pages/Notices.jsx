import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  useMediaQuery,
  Badge,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import notices_bg from "../assets/Notices_Bg.jpg";
function NoticePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Water Supply Cut",
      description:
        "Water supply will be interrupted from 9 AM to 1 PM on 7th June.",
      date: "2025-06-06",
      postedBy: "Admin",
    },
    {
      id: 2,
      title: "Maintenance Work",
      description: "Annual maintenance will take place in basement parking.",
      date: "2025-06-05",
      postedBy: "Admin",
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    postedBy: "Admin", // Only admin posts notices
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const newNotice = {
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      date: new Date().toISOString().split("T")[0],
      postedBy: "Admin",
    };

    setNotices((prev) => [newNotice, ...prev]);
    setForm({ title: "", description: "", postedBy: "Admin" });

  };
  const isDark = theme.palette.mode === "dark";
  return (
    <Container
      maxWidth="lg"
      sx={{
        m: 0,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "150vh",
          backgroundImage: `url(${notices_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(6px)",
          zIndex: -2,
        },
        ...(isDark && {
          "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(100, 10, 10, 0.1)", // dark overlay
            zIndex: -1,
          },
        }),
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        pl={5}
        pt={4}
        mr={5}
      >
        <Box
          component="h4"
          fontWeight="bold"
          sx={{
            fontSize: "2rem",
            userSelect: "none",
            color: "#121212",
          }}
        >
          Society Notices
        </Box>
        <Badge badgeContent={notices.length} color="error">
          <IconButton>
            <NotificationsActiveIcon color="warning" fontSize="large" />
          </IconButton>
        </Badge>
      </Box>

      {/* Admin Upload Section */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mb: 4, ml: 5, mr: 4 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Admin Notice Upload
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: isMobile ? "flex" : "grid",
            flexDirection: isMobile ? "column" : "",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <TextField
            label="Notice Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            fullWidth
            InputLabelProps={{
              style: {
                color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined,
              },
            }}
          />
          <TextField
            label="Posted By"
            name="postedBy"
            value="Admin"
            disabled
            fullWidth
          />
          <TextField
            label="Notice Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={4}
            sx={{ gridColumn: "span 2" }}
            InputLabelProps={{
              style: {
                color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined,
              },
            }}
          />

          <Box gridColumn="span 2" textAlign="right">
            <Button type="submit" variant="contained" size="large">
              Upload Notice
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Notices List */}
      <Box display="grid" gap={3} mb={4}>
        {notices.length === 0 && (
          <Typography align="center" color="text.secondary">
            No notices available.
          </Typography>
        )}
        {notices.map((notice) => (
          <Card sx={{ ml: 5, mr: 4 }} key={notice.id} elevation={5}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {notice.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {notice.description}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Posted by: {notice.postedBy} | Date: {notice.date}
              </Typography>
            </CardContent>
            <CardActions
              sx={{ justifyContent: "flex-end", px: 2 }}
            ></CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
}

export default NoticePage;
