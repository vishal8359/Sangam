import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import GroupIcon from "@mui/icons-material/Group";
import PollIcon from "@mui/icons-material/Poll";

const neighboursSample = [
  { id: 1, name: "Alice Johnson", flat: "A-101", avatar: "", online: true },
  { id: 2, name: "Bob Smith", flat: "B-202", avatar: "", online: false },
  { id: 3, name: "Charlie Davis", flat: "A-303", avatar: "", online: true },
  { id: 4, name: "Diana Prince", flat: "C-404", avatar: "", online: false },
];

const announcementsSample = [
  {
    id: 1,
    title: "Water Supply Disruption",
    date: "2025-06-10",
    details:
      "Water supply will be disrupted from 9 AM to 1 PM due to maintenance.",
  },
];

const eventsSample = [
  {
    id: 1,
    title: "Community Cleanup Drive",
    date: "2025-06-15",
    description: "Join us for a cleanup drive in the park at 9 AM.",
  },
  {
    id: 2,
    title: "Yoga Session",
    date: "2025-06-20",
    description: "Morning yoga at the club house from 7 AM.",
  },
];

const helpServicesSample = [
  {
    id: 1,
    name: "Neha Sharma",
    service: "Tutoring (Math)",
    contact: "neha@example.com",
  },
  {
    id: 2,
    name: "Ravi Kumar",
    service: "Home Repairs",
    contact: "ravi@example.com",
  },
];

const neighbouringSocietiesSample = [
  { id: 1, name: "Greenwood Residency", location: "Sector 12", flats: 120 },
  { id: 2, name: "Sunrise Apartments", location: "Sector 15", flats: 80 },
  { id: 3, name: "Maple Leaf Society", location: "Sector 18", flats: 150 },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      style={{ marginTop: 16 }}
    >
      {value === index && children}
    </div>
  );
}

export default function NeighboursPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [searchText, setSearchText] = useState("");

  // Filter neighbours by search
  const filteredNeighbours = neighboursSample.filter((n) =>
    n.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  const openNeighbouringSocieties = () => {
    setTab(5); 
  };

  return (
    <Box
      sx={{
        p: isMobile ? 1 : 4,
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Box
        component="h4"
        sx={{
          fontWeight: "bold",
          mb: 2,
          fontSize: (theme) => theme.typography.h4.fontSize,
          lineHeight: (theme) => theme.typography.h4.lineHeight,
        }}
      >
        Neighbours Community
      </Box>

      {/* Tabs for different sections */}
      <Paper elevation={3}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          aria-label="Neighbours sections tabs"
          centered={!isMobile}
        >
          <Tab icon={<GroupIcon />} label="Neighbours" />
          <Tab icon={<AnnouncementIcon />} label="Announcements" />
          <Tab icon={<EventAvailableIcon />} label="Events" />
          <Tab icon={<HelpOutlineIcon />} label="Help & Services" />
          <Tab icon={<PollIcon />} label="N-Polls" />
          <Tab icon={<StorefrontIcon />} label="Neighbouring Societies" />
        </Tabs>
      </Paper>

      {/* Button to open Neighbouring Societies */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-end",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={openNeighbouringSocieties}
          startIcon={<StorefrontIcon />}
          sx={{ minWidth: 200 }}
        >
          View Neighbouring Societies
        </Button>
      </Box>

      {/* Neighbours List */}
      <TabPanel value={tab} index={0}>
        <Box sx={{ mb: 2, mt: 1, maxWidth: 400 }}>
          <TextField
            label="Search Neighbours"
            variant="outlined"
            fullWidth
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "grey.600" }} />,
            }}
          />
        </Box>

        <List>
          {filteredNeighbours.map((n) => (
            <ListItem key={n.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: n.online ? "green" : "grey" }}>
                  {n.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={n.name}
                secondary={`Flat: ${n.flat} | ${n.online ? "Online" : "Offline"}`}
              />
              <Button variant="outlined" size="small">
                Message
              </Button>
            </ListItem>
          ))}
          {filteredNeighbours.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center">
              No neighbours found.
            </Typography>
          )}
        </List>
      </TabPanel>

      {/* Announcements */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2} mt={1}>
          {announcementsSample.map((a) => (
            <Grid item xs={12} md={6} key={a.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{a.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.date}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography>{a.details}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {announcementsSample.length === 0 && (
            <Typography align="center" color="text.secondary" mt={2}>
              No announcements.
            </Typography>
          )}
        </Grid>
      </TabPanel>

      {/* Events */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2} mt={1}>
          {eventsSample.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{event.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.date).toDateString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography>{event.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" color="primary">
                    RSVP
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {eventsSample.length === 0 && (
            <Typography align="center" color="text.secondary" mt={2}>
              No upcoming events.
            </Typography>
          )}
        </Grid>
      </TabPanel>

      {/* Help & Services */}
      <TabPanel value={tab} index={3}>
        <List>
          {helpServicesSample.map((service) => (
            <ListItem key={service.id} divider>
              <ListItemText
                primary={service.name}
                secondary={`${service.service} | Contact: ${service.contact}`}
              />
              <Button variant="outlined" size="small">
                Contact
              </Button>
            </ListItem>
          ))}
          {helpServicesSample.length === 0 && (
            <Typography align="center" color="text.secondary" mt={2}>
              No services available.
            </Typography>
          )}
        </List>
      </TabPanel>

      {/* N-Polls Placeholder */}
      <TabPanel value={tab} index={4}>
        <Typography variant="h6" color="text.secondary" mt={2}>
          Polls & Surveys feature coming soon...
        </Typography>
      </TabPanel>

      {/* Neighbouring Societies */}
      <TabPanel value={tab} index={5}>
        <Grid container spacing={2} mt={1}>
          {neighbouringSocietiesSample.map((society) => (
            <Grid item xs={12} sm={6} md={4} key={society.id}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">{society.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {society.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Number of Flats: {society.flats}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {neighbouringSocietiesSample.length === 0 && (
            <Typography align="center" color="text.secondary" mt={2}>
              No neighbouring societies found.
            </Typography>
          )}
        </Grid>
      </TabPanel>
    </Box>
  );
}
