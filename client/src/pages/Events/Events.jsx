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
  Slide,
  Fade,
  Zoom,
  useMediaQuery,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import cleanUp from "../../assets/CleanUp.jpg";
import bbq from "../../assets/bbq.jpeg";
import Events_Bg from "../../assets/Events_Bg.jpg";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const { token, societyId, user, axios } = useAppContext();

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

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token || !user || !user._id) return;

      try {
        const res = await axios.get("/api/users/events", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedEvents = res.data.events || [];

        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };

    fetchEvents();
  }, [token, user, axios]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      organizer,
      date,
      time,
      place,
      imgFile,
      isNeighbour,
      description,
    } = form;

    if (!name.trim() || !organizer.trim() || !date || !time || !place.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      alert("Event date must be in the future.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("eventName", name.trim());
      formData.append("organiserName", organizer.trim());
      formData.append("date", date);
      formData.append("time", time);
      formData.append("place", place.trim());
      formData.append("isNeighbourEvent", isNeighbour ? "true" : "false");
      formData.append("description", description || "");

      if (imgFile) {
        formData.append("image", imgFile);
      }

      const res = await axios.post("/api/users/events/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newEvent = res.data?.event;

      if (!newEvent || !newEvent._id || newEvent._id.length !== 24) {
        throw new Error("Invalid event response");
      }

      setEvents((prev) => [newEvent, ...prev]);

      toast.success("Event created successfully.");
      navigate(`/my-society/events/send_invites/${newEvent._id}`);
    } catch (err) {
      console.error(
        "Failed to create event:",
        err.response?.data || err.message
      );
      alert("Failed to create event. Please try again.");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(
    (ev) =>
      new Date(ev.date) > today &&
      ev.createdBy?.toString() === user?._id?.toString()
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        m: 0,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        minHeight: "100vh",
        py: 4,
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
          filter: "blur(8px)",
          zIndex: -2,
          animation: "panBackground 60s linear infinite alternate",
          "@keyframes panBackground": {
            "0%": {
              backgroundPosition: "0% 0%",
            },
            "100%": {
              backgroundPosition: "100% 100%",
            },
          },
        },
        ...(isDark && {
          "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(10, 10, 10, 0.3)",
            zIndex: -1,
          },
        }),
      }}
    >
      <Slide
        direction="down"
        in={true}
        mountOnEnter
        unmountOnExit
        timeout={700}
      >
        <Box
          display="flex"
          alignItems="center"
          mb={4}
          gap={isMobile ? 1 : 2}
          px={isMobile ? 2 : 4}
          py={3}
          flexWrap="wrap"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={1}>
            <EventAvailableIcon
              color="primary"
              sx={{ fontSize: isMobile ? 40 : 50 }}
            />
            <Typography
              component="h4"
              fontWeight="bold"
              sx={{
                userSelect: "none",
                fontSize: isMobile ? "1.8rem" : "2.5rem",
                lineHeight: 1.2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark ? "0 0 8px rgba(255,255,255,0.2)" : "none",
              }}
            >
              Upcoming Events
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={isMobile ? 1 : 2}
            mt={isMobile ? 2 : 0}
          >
            <Paper
              elevation={4}
              sx={{
                px: 2.5,
                py: 0.8,
                backgroundColor: theme.palette.primary.dark,
                color: "white",
                borderRadius: 3,
                userSelect: "none",
                fontWeight: "bold",
                fontSize: isMobile ? "0.9rem" : "1rem",
                boxShadow: theme.shadows[6],
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            >
              {upcomingEvents.length}{" "}
              {upcomingEvents.length === 1 ? "Event" : "Events"}
            </Paper>
            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{
                ml: isMobile ? 0 : 2,
                mt: isMobile ? 1 : 0,
                borderRadius: 3,
                px: isMobile ? 2 : 3,
                py: isMobile ? 0.8 : 1.2,
                fontSize: isMobile ? "0.75rem" : "0.9rem",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
              onClick={() => navigate("/my-society/events/view_invitations")}
            >
              View Invitations
            </Button>
          </Box>
        </Box>
      </Slide>

      <Box
        sx={{
          paddingLeft: isMobile ? 2 : 4,
          paddingRight: isMobile ? 2 : 4,
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: isMobile ? "center" : "flex-start",
        }}
        mb={6}
      >
        {upcomingEvents.length === 0 && (
          <Fade in={true} timeout={1000}>
            <Typography
              color="text.secondary"
              sx={{ width: "100%", textAlign: "center", mt: 5 }}
              variant="h6"
            >
              No upcoming events found. Be the first to organize one!
            </Typography>
          </Fade>
        )}

        {upcomingEvents.map((ev, index) => (
          <Slide
            key={ev.id}
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={500 + index * 100}
          >
            <Paper
              elevation={6}
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                width: isMobile ? "100%" : "calc(50% - 1.5rem)",
                height: isMobile ? "auto" : 160,
                gap: 2,
                p: 2.5,
                borderRadius: 3,
                alignItems: "center",
                overflow: "hidden",
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(5px)",
                border: `1px solid ${theme.palette.divider}`,
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px) scale(1.01)",
                  boxShadow: theme.shadows[10],
                },
              }}
            >
              <Box
                component="img"
                src={ev.image || cleanUp}
                alt={ev.eventName}
                sx={{
                  width: isMobile ? "100%" : 200,
                  height: isMobile ? 180 : "100%",
                  objectFit: "cover",
                  borderRadius: 2,
                  flexShrink: 0,
                  boxShadow: theme.shadows[3],
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              />
              <Box flexGrow={1} sx={{ mt: isMobile ? 1 : 0 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  mb={0.5}
                  sx={{
                    color: isDark ? "#fff" : theme.palette.primary.dark,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {ev.eventName}
                </Typography>
                <Typography
                  variant="body2"
                  color={isDark ? "#ccc" : ""}
                  mb={0.5}
                  noWrap
                >
                  <Typography component="span" fontWeight="medium">
                    Organizer:
                  </Typography>{" "}
                  {ev.organiserName}
                </Typography>

                <Typography
                  variant="body2"
                  color={isDark ? "#ccc" : ""}
                  mb={0.5}
                >
                  <Typography component="span" fontWeight="medium">
                    Date:
                  </Typography>{" "}
                  {new Date(ev.date).toLocaleDateString()} at {ev.time}
                </Typography>
                <Typography
                  variant="body2"
                  color={isDark ? "#ccc" : ""}
                  mb={0.5}
                  noWrap
                >
                  <Typography component="span" fontWeight="medium">
                    Place:
                  </Typography>{" "}
                  {ev.place}
                </Typography>
                <Typography
                  variant="caption"
                  color={ev.isNeighbourEvent ? "success.main" : "info.main"}
                  fontWeight="bold"
                  sx={{
                    px: 1,
                    py: 0.3,
                    borderRadius: 1,
                    backgroundColor: ev.isNeighbourEvent
                      ? theme.palette.success.light + "20"
                      : theme.palette.info.light + "20",
                  }}
                >
                  {ev.isNeighbourEvent
                    ? "Neighbourhood Event"
                    : "Society Event"}
                </Typography>
              </Box>
            </Paper>
          </Slide>
        ))}
      </Box>

      <Fade in={true} timeout={1200}>
        <Paper
          elevation={8}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 4,
            bgcolor: isDark
              ? "rgba(35, 35, 35, 0.9)"
              : "rgba(245, 245, 245, 0.95)",
            m: isMobile ? 2 : 4,
            transition:
              "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <Box
            component="h4"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 4,
              fontSize: "2rem", // adjust to match Typography variant="h4"
              color: theme.palette.text.primary,
              textShadow: isDark ? "0 0 5px rgba(255,255,255,0.1)" : "none",
            }}
          >
            Organize a New Event
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "grid",
              gap: isMobile ? 2.5 : 3,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            {[
              {
                label: "Event Name",
                name: "name",
                type: "text",
                required: true,
              },
              {
                label: "Organizer Name",
                name: "organizer",
                type: "text",
                required: true,
              },
              {
                label: "Date",
                name: "date",
                type: "date",
                required: true,
                inputProps: { min: new Date().toISOString().split("T")[0] },
              },
              { label: "Time", name: "time", type: "time", required: true },
              { label: "Place", name: "place", type: "text", required: true },
            ].map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleInputChange}
                fullWidth
                required={field.required}
                InputLabelProps={{ shrink: true }}
                inputProps={field.inputProps}
                sx={{
                  maxWidth: isMobile ? 140 : "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition:
                      "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    "& fieldset": {
                      borderColor: theme.palette.divider,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                      borderWidth: "2px",
                      boxShadow: `0 0 0 2px ${theme.palette.primary.light}80`,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "grey.400" : "grey.700",
                    "&.Mui-focused": {
                      color: theme.palette.primary.main,
                    },
                    "&.MuiInputLabel-shrink": {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              />
            ))}

            <TextField
              label="Event Description (optional)"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
              sx={{
                gridColumn: "span 2",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  transition:
                    "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light}80`,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDark ? "grey.400" : "grey.700",
                  "&.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  "&.MuiInputLabel-shrink": {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            />

            <Box
              gridColumn="span 2"
              display="flex"
              alignItems="center"
              gap={2}
              flexWrap="wrap"
            >
              <Button
                variant="contained"
                component="label"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {form.imgPreview && (
                <Zoom in={true} timeout={500}>
                  <Box
                    component="img"
                    src={form.imgPreview}
                    alt="Preview"
                    sx={{
                      height: 80,
                      borderRadius: 2,
                      boxShadow: theme.shadows[4],
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  />
                </Zoom>
              )}
            </Box>

            <FormControlLabel
              name="isNeighbour"
              checked={form.isNeighbour}
              onChange={handleInputChange}
              control={
                <Checkbox
                  sx={{
                    color: isDark ? "grey.400" : "grey.700",
                    "&.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography color={isDark ? "grey.300" : "grey.800"}>
                  Neighbourhood Event
                </Typography>
              }
              sx={{ gridColumn: "span 2" }}
            />

            <Box gridColumn="span 2" textAlign="center" mt={2}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: "1.1rem",
                  boxShadow: theme.shadows[6],
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                Add Event
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}
