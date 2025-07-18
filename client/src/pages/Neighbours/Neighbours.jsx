import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";

// Sample Data
const neighboursSample = [
  { id: 1, name: "Alice Johnson", flat: "A-101", avatar: "", online: true },
  { id: 2, name: "Bob Smith", flat: "B-202", avatar: "", online: false },
  { id: 3, name: "Charlie Davis", flat: "A-303", avatar: "", online: true },
  { id: 4, name: "Diana Prince", flat: "C-404", avatar: "", online: false },
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

// TabPanel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box mt={2}>{children}</Box>}
    </div>
  );
}

// Main Component
export default function NeighboursPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [tab, setTab] = useState(0);
  const [searchText, setSearchText] = useState("");

  const handleTabChange = (_, newValue) => setTab(newValue);
  const filteredNeighbours = neighboursSample.filter((n) =>
    n.name.toLowerCase().includes(searchText.toLowerCase())
  );

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

      <Paper elevation={3}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          aria-label="Neighbours sections"
          centered={!isMobile}
          sx={{mb : 3}}
        >
          <Tab icon={<GroupIcon />} label="Neighbours" />
          <Tab icon={<HelpOutlineIcon />} label="Help & Services" />
          <Tab icon={<StorefrontIcon />} label="Neighbouring Societies" />
        </Tabs>
      </Paper>

      {/* Neighbours Section */}
      <TabPanel value={tab} index={0}>
        <Box sx={{ my: 2, maxWidth: 400 }}>
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
            <Typography variant="body2" align="center" color="text.secondary">
              No neighbours found.
            </Typography>
          )}
        </List>
      </TabPanel>

      {/* Help & Services Section */}
      <TabPanel value={tab} index={1}>
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
            <Typography variant="body2" align="center" color="text.secondary">
              No services available.
            </Typography>
          )}
        </List>
      </TabPanel>

      {/* Neighbouring Societies Section */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
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
            <Typography variant="body2" align="center" color="text.secondary">
              No neighbouring societies found.
            </Typography>
          )}
        </Grid>
      </TabPanel>
    </Box>
  );
}
