import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import cleanUp from "../../assets/CleanUp.jpg";
import bbq from "../../assets/bbq.jpeg";
import Events_Bg from "../../assets/Events_Bg.jpg";
import { useNavigate } from "react-router-dom";

const initialEvents = [
  {
    id: 1,
    name: "Community Clean-Up",
    organizer: "John Doe",
    date: "2025-06-10",
    time: "09:00",
    place: "Central Park",
    img: cleanUp,
    isNeighbour: false,
  },
  {
    id: 2,
    name: "Neighbourhood BBQ Party",
    organizer: "Jane Smith",
    date: "2025-06-15",
    time: "18:00",
    place: "Maple Street",
    img: bbq,
    isNeighbour: true,
  },
];

export default function EventPage() {
  const [events, setEvents] = useState(initialEvents);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [form, setForm] = useState({
    name: "",
    organizer: "",
    date: "",
    time: "",
    place: "",
    imgFile: null,
    imgPreview: null,
    isNeighbour: false,
    description: "",
  });

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        imgFile: file,
        imgPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.organizer.trim() ||
      !form.date ||
      !form.time ||
      !form.place.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      alert("Event date must be greater than today's date.");
      return;
    }

    const newEvent = {
      id: Date.now(),
      name: form.name.trim(),
      organizer: form.organizer.trim(),
      date: form.date,
      time: form.time,
      place: form.place.trim(),
      img: form.imgPreview || "https://source.unsplash.com/400x200/?event",
      isNeighbour: form.isNeighbour,
      description: form.description.trim(),
    };

    setEvents((prev) => [newEvent, ...prev]);

    setForm({
      name: "",
      organizer: "",
      date: "",
      time: "",
      place: "",
      imgFile: null,
      imgPreview: null,
      isNeighbour: false,
      description: "",
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter((ev) => new Date(ev.date) > today);

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
          backgroundImage: `url(${Events_Bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(10px)",
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
            backgroundColor: "rgba(100, 10, 10, 0.1)",
            zIndex: -1,
          },
        }),
      }}
    >
      <Box display="flex" alignItems="center" mb={1} gap={1} px={4} py={3} flexWrap="wrap">
        <EventAvailableIcon color="primary" fontSize="large" />
        <Box
          component="h4"
          fontWeight="bold"
          flexGrow={1}
          sx={{
            userSelect: "none",
            fontSize: "2.125rem",
            lineHeight: 1.235,
          }}
        >
          Upcoming Events
        </Box>
        <Paper
          elevation={3}
          sx={{
            px: 2,
            py: 0.5,
            backgroundColor: "primary.main",
            color: "white",
            borderRadius: 2,
            userSelect: "none",
          }}
        >
          {upcomingEvents.length} {upcomingEvents.length === 1 ? "Event" : "Events"}
        </Paper>
        <Button
          variant="outlined"
          size="small"
          sx={{ ml: 2, mt: isMobile ? 1 : 0 }}
          onClick={() => navigate("/my-society/events/view_invitations")}
        >
          View Invitations
        </Button>
      </Box>

      <Box
        sx={{
          paddingLeft: 4,
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "flex-start",
        }}
        mb={6}
      >
        {upcomingEvents.length === 0 && (
          <Typography color="text.secondary" sx={{ width: "100%", textAlign: "center" }}>
            No upcoming events found.
          </Typography>
        )}

        {upcomingEvents.map((ev) => (
          <Paper
            key={ev.id}
            elevation={4}
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              width: isMobile ? "90%" : "48%",
              height: isMobile ? "auto" : 140,
              gap: 2,
              p: 2,
              borderRadius: 3,
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={ev.img}
              alt={ev.name}
              sx={{
                width: isMobile ? "100%" : 200,
                height: isMobile ? 150 : "100%",
                objectFit: "cover",
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <Box flexGrow={1} sx={{ mt: isMobile ? 1 : 0 }}>
              <Typography variant="h6" fontWeight="bold" mb={0.5} noWrap>
                {ev.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5} noWrap>
                Organizer: {ev.organizer}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Date: {new Date(ev.date).toLocaleDateString()} at {ev.time}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={0.5} noWrap>
                Place: {ev.place}
              </Typography>
              <Typography
                variant="caption"
                color={ev.isNeighbour ? "success.main" : "info.main"}
                fontWeight="bold"
              >
                {ev.isNeighbour ? "Neighbourhood Event" : "Society Event"}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          bgcolor: "background.paper",
          m: isMobile ? 2 : 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Organize a New Event
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: isMobile ? "flex" : "grid",
            flexDirection: isMobile ? "column" : "",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <TextField
            label="Event Name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{
              sx: {
                color: theme.palette.mode === "dark" ? "grey" : undefined,
                "&.Mui-focused": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
                "&.MuiInputLabel-shrink": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
              },
            }}
          />
          <TextField
            label="Organizer Name"
            name="organizer"
            value={form.organizer}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{
              sx: {
                color: theme.palette.mode === "dark" ? "grey" : undefined,
                "&.Mui-focused": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
                "&.MuiInputLabel-shrink": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
              },
            }}
          />
          <TextField
            label="Date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
          />
          <TextField
            label="Time"
            type="time"
            name="time"
            value={form.time}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
          <TextField
            label="Place"
            name="place"
            value={form.place}
            onChange={handleInputChange}
            fullWidth
            required
            InputLabelProps={{
              sx: {
                color: theme.palette.mode === "dark" ? "grey" : undefined,
                "&.Mui-focused": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
                "&.MuiInputLabel-shrink": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
              },
            }}
          />
          <TextField
            label="Event Description (optional)"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            multiline
            rows={3}
            fullWidth
            InputLabelProps={{
              sx: {
                color: theme.palette.mode === "dark" ? "grey" : undefined,
                "&.Mui-focused": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
                "&.MuiInputLabel-shrink": { color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined },
              },
            }}
          />

          <Box gridColumn="span 2" display="flex" alignItems="center" gap={2}>
            <Button variant="contained" component="label">
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {form.imgPreview && (
              <Box
                component="img"
                src={form.imgPreview}
                alt="Preview"
                sx={{ height: 80, borderRadius: 2 }}
              />
            )}
            <Button
              variant="outlined"
              size="medium"
              sx={{ width: "30%" }}
              onClick={() => navigate("/my-society/events/send_invites")}
            >
              Send Invitation
            </Button>
          </Box>

          <FormControlLabel
            name="isNeighbour"
            checked={form.isNeighbour}
            onChange={handleInputChange}
            control={
              <Checkbox
                sx={{
                  color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined,
                  "&.Mui-checked": {
                    color: theme.palette.mode === "dark" ? "#f5f5f5" : undefined,
                  },
                }}
              />
            }
            label="Neighbourhood Event"
            sx={{ gridColumn: "span 2" }}
          />

          <Box gridColumn="span 2" textAlign="center" mt={2}>
            <Button type="submit" variant="contained" size="large">
              Add Event
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
