import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CalendarMonth, AccessTime, LocationOn, Event } from "@mui/icons-material";

const events = [
  {
    id: 1,
    name: "Cleanliness Drive",
    date: "2025-06-08",
    time: "10:00 AM",
    place: "Community Park",
    image: "https://source.unsplash.com/featured/?park",
    organiser: "RWA Committee",
    type: "local",
  },
  {
    id: 2,
    name: "Yoga Session",
    date: "2025-06-09",
    time: "6:00 AM",
    place: "Club House",
    image: "https://source.unsplash.com/featured/?yoga",
    organiser: "Wellness Club",
    type: "local",
  },
  {
    id: 3,
    name: "Street Food Festival",
    date: "2025-06-10",
    time: "5:00 PM",
    place: "Sector 5 Ground",
    image: "https://source.unsplash.com/featured/?festival",
    organiser: "Neighbouring Society",
    type: "neighbouring",
  },
];

const EventCard = ({ event }) => (
  <Card sx={{ width: 320, borderRadius: 4, m: 2, boxShadow: 4 }}>
    <CardMedia component="img" height="160" image={event.image} alt={event.name} />
    <CardContent>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {event.name}
      </Typography>
      <Box display="flex" alignItems="center" mb={1}>
        <CalendarMonth fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2">{event.date}</Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={1}>
        <AccessTime fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2">{event.time}</Typography>
      </Box>
      <Box display="flex" alignItems="center" mb={1}>
        <LocationOn fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2">{event.place}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
        <Typography variant="body2">{event.organiser}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const EventPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const localEvents = events.filter((e) => e.type === "local");
  const neighbouringEvents = events.filter((e) => e.type === "neighbouring");

  return (
    <Box p={2} sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Events
        </Typography>
        <Badge badgeContent={events.length} color="primary" showZero>
          <Event color="action" fontSize="large" />
        </Badge>
      </Box>

      <Box mb={4}>
        <Typography variant="h5" fontWeight="medium" mb={2}>
          Society Events
        </Typography>
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          flexWrap="wrap"
          justifyContent="flex-start"
        >
          {localEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" fontWeight="medium" mb={2}>
          Neighbouring Events
        </Typography>
        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          flexWrap="wrap"
          justifyContent="flex-start"
        >
          {neighbouringEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default EventPage;
