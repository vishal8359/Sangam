import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Slide,
  CardActions,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import neighbours_bg from "../../assets/societyBg.jpg";
import { useNavigate } from "react-router-dom";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionTypography = motion(Typography);
const MotionGrid = motion(Grid);
const MotionCard = motion(Card);
const MotionListItem = motion(ListItem);

function TabPanel({ children, value, index, ...other }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (value === index && !hasRendered) {
      setHasRendered(true);
    }
  }, [value, index, hasRendered]);

  return (
    <div
      role="tabpanel"
      style={{ display: value === index ? "block" : "none" }}
      {...other}
    >
      {(value === index || hasRendered) && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: value === index ? 1 : 0, y: value === index ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          mt={2}
          sx={{
            p: isMobile ? 1 : 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[3],
          }}
        >
          {children}
        </MotionBox>
      )}
    </div>
  );
}

export default function NeighboursPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const {
    axios,
    token,
    onlineStatus,
    loading: appLoading,
    isAuthenticated,
    user,
  } = useAppContext();
  const navigate = useNavigate();

  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem('activeTab');
    return savedTab ? parseInt(savedTab, 10) : 0;
  });
  const [searchNeighboursText, setSearchNeighboursText] = useState(() => {
    return localStorage.getItem('searchNeighboursText') || '';
  });
  const [searchServicesText, setSearchServicesText] = useState(() => {
    return localStorage.getItem('searchServicesText') || '';
  });

  const [neighbours, setNeighbours] = useState([]);
  const [loadingNeighbours, setLoadingNeighbours] = useState(true);
  const [helpServices, setHelpServices] = useState([]);
  const [loadingHelpServices, setLoadingHelpServices] = useState(true);

  const [neighbouringSocieties, setNeighbouringSocieties] = useState([]);
  const [loadingNeighbouringSocieties, setLoadingNeighbouringSocieties] = useState(true);
  const [hasFetchedNeighbouringSocieties, setHasFetchedNeighbouringSocieties] = useState(false);

  const [hasFetchedNeighbours, setHasFetchedNeighbours] = useState(false);
  const [hasFetchedHelpServices, setHasFetchedHelpServices] = useState(false);

  const [openAddServiceDialog, setOpenAddServiceDialog] = useState(false);
  const [newServiceTypes, setNewServiceTypes] = useState([{ id: 1, value: "" }]);
  const [addingService, setAddingService] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    localStorage.setItem('activeTab', newValue.toString());
  };

  useEffect(() => {
    localStorage.setItem('searchNeighboursText', searchNeighboursText);
  }, [searchNeighboursText]);

  useEffect(() => {
    localStorage.setItem('searchServicesText', searchServicesText);
  }, [searchServicesText]);

  const handleAddServiceInput = () => {
    setNewServiceTypes((prev) => [
      ...prev,
      { id: prev.length > 0 ? Math.max(...prev.map(s => s.id)) + 1 : 1, value: "" },
    ]);
  };

  const handleRemoveServiceInput = (idToRemove) => {
    setNewServiceTypes((prev) => prev.filter((service) => service.id !== idToRemove));
  };

  const handleServiceInputChange = (id, newValue) => {
    setNewServiceTypes((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, value: newValue } : service
      )
    );
  };

  const fetchNeighbours = useCallback(async () => {
    if (appLoading || !isAuthenticated || !token) {
      setLoadingNeighbours(false);
      if (!isAuthenticated && !appLoading) {
        toast.error("Authentication required to load neighbours.");
      }
      return;
    }

    if (hasFetchedNeighbours) {
      setLoadingNeighbours(false);
      return;
    }

    setLoadingNeighbours(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/homes/neighbours`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNeighbours(response.data.neighbours || []);
      setHasFetchedNeighbours(true);
    } catch (error) {
      console.error("Error fetching neighbours:", error);
      toast.error("Failed to load neighbours.");
    } finally {
      setLoadingNeighbours(false);
    }
  }, [appLoading, isAuthenticated, token, hasFetchedNeighbours, axios]);

  const fetchHelpServices = useCallback(async () => {
    if (appLoading || !isAuthenticated || !token) {
      setLoadingHelpServices(false);
      if (!isAuthenticated && !appLoading) {
        toast.error("Authentication required to load help and services.");
      }
      return;
    }

    setLoadingHelpServices(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/help-services`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHelpServices(response.data.providers || []);
      setHasFetchedHelpServices(true);
    } catch (error) {
      console.error("Error fetching help services:", error);
      toast.error("Failed to load help and services.");
    } finally {
      setLoadingHelpServices(false);
    }
  }, [appLoading, isAuthenticated, token, axios]);

  const fetchNeighbouringSocieties = useCallback(async () => {
    if (appLoading || !isAuthenticated || !token) {
      setLoadingNeighbouringSocieties(false);
      if (!isAuthenticated && !appLoading) {
        toast.error("Authentication required to load neighbouring societies.");
      }
      return;
    }

    if (hasFetchedNeighbouringSocieties) {
        setLoadingNeighbouringSocieties(false);
        return;
    }

    setLoadingNeighbouringSocieties(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/neighbouring-societies`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response && response.data && response.data.societies) {
        setNeighbouringSocieties(response.data.societies);
      } else {
        setNeighbouringSocieties([]);
      }
      setHasFetchedNeighbouringSocieties(true);
    } catch (error) {
      console.error("Error fetching neighbouring societies:", error);
      toast.error(error.response?.data?.message || "Failed to load neighbouring societies.");
      setNeighbouringSocieties([]);
    } finally {
      setLoadingNeighbouringSocieties(false);
    }
  }, [appLoading, isAuthenticated, token, hasFetchedNeighbouringSocieties, axios]);

  const handleAddService = async () => {
    const servicesToAdd = newServiceTypes
      .map((s) => s.value.trim())
      .filter((value) => value !== "");

    if (servicesToAdd.length === 0) {
      toast.error("Please add at least one service type.");
      return;
    }
    if (addingService) return;

    setAddingService(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/addServices`,
        { services: servicesToAdd },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Services added successfully!");
        setNewServiceTypes([{ id: 1, value: "" }]);
        setOpenAddServiceDialog(false);
        setHasFetchedHelpServices(false);
        await fetchHelpServices();
      } else {
        toast.error(response.data.message || "Failed to add service.");
      }
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error(error.response?.data?.message || "Failed to add service.");
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (serviceName) => {
    if (!window.confirm(`Are you sure you want to delete the service: "${serviceName}"?`)) {
      return;
    }
    setDeletingServiceId(serviceName);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/removeService`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: { serviceType: serviceName },
        }
      );

      if (response.status === 200) {
        toast.success(`"${serviceName}" service deleted successfully!`);
        setHasFetchedHelpServices(false);
        await fetchHelpServices();
      } else {
        toast.error(response.data.message || "Failed to delete service.");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error(error.response?.data?.message || "Failed to delete service.");
    } finally {
      setDeletingServiceId(null);
    }
  };


  useEffect(() => {
    if (tab === 0) {
      fetchNeighbours();
    } else if (tab === 1) {
      fetchHelpServices();
    } else if (tab === 2) {
        fetchNeighbouringSocieties();
    }
  }, [tab, fetchNeighbours, fetchHelpServices, fetchNeighbouringSocieties]);

  const filteredNeighbours = neighbours.filter(
    (n) =>
      n.name.toLowerCase().includes(searchNeighboursText.toLowerCase()) ||
      n.house_no?.toLowerCase().includes(searchNeighboursText.toLowerCase()) ||
      n.address?.toLowerCase().includes(searchNeighboursText.toLowerCase())
  );

  const filteredHelpServices = helpServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchServicesText.toLowerCase()) ||
      (Array.isArray(service.services) &&
        service.services.some(s => s.toLowerCase().includes(searchServicesText.toLowerCase()))) ||
      service.email.toLowerCase().includes(searchServicesText.toLowerCase()) ||
      service.phoneNumber.includes(searchServicesText)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
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
    <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={700}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          p: isMobile ? 2 : 4,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${neighbours_bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(5px)",
            zIndex: -2,
            animation: "panBackground 60s linear infinite alternate",
            "@keyframes panBackground": {
              "0%": { backgroundPosition: "0% 0%" },
              "100%": { backgroundPosition: "100% 100%" },
            },
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
            zIndex: -1,
          },
        }}
      >
        <MotionTypography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={700}
          mb={isMobile ? 3 : 4}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: isDark ? "0 0 8px rgba(255,255,255,0.2)" : "none",
          }}
          variants={itemVariants}
        >
          🤝 Neighbours Community
        </MotionTypography>

        <MotionPaper
          elevation={3}
          sx={{ borderRadius: theme.shape.borderRadius * 2, mb: 3 }}
          variants={itemVariants}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            aria-label="Neighbours sections"
            centered={!isMobile}
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius * 2,
              ".MuiTab-root": {
                color: isDark? "#fff" : "",
                "&.Mui-selected": {
                  color: isDark ? "#cfcfcc" : "",
                  fontWeight: "bold",
                },
              },
              ".MuiTabs-indicator": {
                bgcolor: theme.palette.primary.main,
              },
            }}
          >
            <Tab icon={<GroupIcon />} label="Neighbours" />
            <Tab icon={<HelpOutlineIcon />} label="Help & Services" />
            <Tab icon={<StorefrontIcon />} label="Neighbouring Societies" />
          </Tabs>
        </MotionPaper>

        <TabPanel value={tab} index={0}>
          <MotionBox sx={{ my: 2, maxWidth: 500 }} variants={itemVariants}>
            <MotionTextField
              label="Search Neighbours"
              variant="outlined"
              fullWidth
              size="medium"
              value={searchNeighboursText}
              onChange={(e) => setSearchNeighboursText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
                style: {
                  borderRadius: theme.shape.borderRadius * 1.5,
                  color: theme.palette.text.primary,
                },
              }}
              InputLabelProps={{
                style: { color: theme.palette.text.secondary },
              }}
              whileFocus={{ scale: 1.01 }}
            />
          </MotionBox>

          {loadingNeighbours && neighbours.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography ml={2} color="text.secondary">
                Loading neighbours...
              </Typography>
            </Box>
          ) : filteredNeighbours.length === 0 ? (
            <MotionTypography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              py={5}
              variants={itemVariants}
            >
              No neighbours found matching your search.
            </MotionTypography>
          ) : (
            <List
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[2],
                overflow: "hidden",
              }}
            >
              {filteredNeighbours.map((n, index) => (
                <MotionListItem
                  key={n._id || n.id}
                  divider={index < filteredNeighbours.length - 1}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: isDark
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                    },
                  }}
                  variants={itemVariants}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        n.avatar ||
                        `https://i.pravatar.cc/150?u=${n._id || n.id}`
                      }
                      sx={{
                        bgcolor: onlineStatus[n._id]?.isOnline
                          ? theme.palette.success.main
                          : theme.palette.grey[500],
                        width: 50,
                        height: 50,
                        border: `2px solid ${onlineStatus[n._id]?.isOnline ? theme.palette.success.dark : theme.palette.grey[700]}`,
                      }}
                    >
                      {n.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {n.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {`Flat: ${n.house_no || n.flat} | ${n.address || "No address"}`}
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color={
                            onlineStatus[n._id]?.isOnline
                              ? theme.palette.success.main
                              : theme.palette.grey[500]
                          }
                        >
                          {onlineStatus[n._id]?.isOnline ? "Online" : "Offline"}
                        </Typography>
                      </Typography>
                    }
                  />
                  <Button
                    onClick={() => navigate("/my-society/chats")}
                    variant="outlined"
                    size="small"
                    color= {isDark ? "#fff" : ""}
                    sx={{ borderRadius: 2, px: 2.5 }}
                  >
                    Message
                  </Button>
                </MotionListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <MotionBox sx={{ my: 2, maxWidth: 500 }} variants={itemVariants}>
            {/* <MotionTextField
              label="Search Services"
              variant="outlined"
              fullWidth
              size="medium"
              value={searchServicesText}
              onChange={(e) => setSearchServicesText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
                style: {
                  borderRadius: theme.shape.borderRadius * 1.5,
                  color: theme.palette.text.primary,
                },
              }}
              InputLabelProps={{
                style: { color: theme.palette.text.secondary },
              }}
              whileFocus={{ scale: 1.01 }}
            /> */}
          </MotionBox>
          <MotionBox
            display="flex"
            justifyContent="flex-end"
            my={2}
            variants={itemVariants}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenAddServiceDialog(true);
                setNewServiceTypes([{ id: 1, value: "" }]);
              }}
              sx={{ borderRadius: 2 }}
            >
              Add My Service
            </Button>
          </MotionBox>

          {loadingHelpServices && helpServices.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography ml={2} color="text.secondary">
                Loading services...
              </Typography>
            </Box>
          ) : filteredHelpServices.length === 0 ? (
            <MotionTypography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              py={5}
              variants={itemVariants}
            >
              No services available yet.
            </MotionTypography>
          ) : (
            <List
              sx={{
                bgcolor: theme.palette.background.paper,
                borderRadius: theme.shape.borderRadius * 2,
                boxShadow: theme.shadows[2],
                overflow: "hidden",
              }}
            >
              {filteredHelpServices.map((service, index) => (
                <MotionListItem
                  key={service.id}
                  divider={index < filteredHelpServices.length - 1}
                  sx={{
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      bgcolor: isDark
                        ? theme.palette.grey[800]
                        : theme.palette.grey[100],
                    },
                    alignItems: 'flex-start',
                  }}
                  variants={itemVariants}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        service.avatar ||
                        `https://i.pravatar.cc/150?u=${service.id}`
                      }
                      sx={{
                        width: 50,
                        height: 50,
                        border: `2px solid ${theme.palette.secondary.main}`,
                      }}
                    >
                      {service.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {service.name}
                        {service.id === user?._id && (
                          <Typography
                            component="span"
                            variant="caption"
                            ml={1}
                            sx={{
                              bgcolor: theme.palette.success.light,
                              color: theme.palette.success.contrastText,
                              px: 0.8,
                              py: 0.3,
                              borderRadius: 1,
                              fontWeight: 'normal',
                            }}
                          >
                            Your Service
                          </Typography>
                        )}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Services:{" "}
                          {Array.isArray(service.services)
                            ? service.services.join(", ")
                            : service.services}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Phone: {service.phoneNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Email: {service.email}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1, alignItems: 'center' }}>
                    {service.id !== user?._id && (
                      <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        sx={{ borderRadius: 2 }}
                        onClick={() => {
                          if (service.phoneNumber) {
                            window.location.href = `tel:${service.phoneNumber}`;
                          } else {
                            toast.error("Phone number not available for this service.");
                          }
                        }}
                      >
                        Contact
                      </Button>
                    )}
                    {service.id === user?._id && Array.isArray(service.services) && service.services.map((s, sIndex) => (
                      <Box key={sIndex} sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 0 }}>
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 'medium' }}>
                          {s}
                        </Typography>
                        <IconButton
                          edge="end"
                          aria-label={`delete ${s}`}
                          onClick={() => handleDeleteService(s)}
                          color="error"
                          size="small"
                          disabled={deletingServiceId === s}
                        >
                          {deletingServiceId === s ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                          )}
                        </IconButton>
                      </Box>
                    ))}
                    {service.id === user?._id && (
                       <Button
                         variant="outlined"
                         size="small"
                         color="info"
                         sx={{ borderRadius: 2, ml: isMobile ? 0 : 1 }}
                         onClick={() => toast("Edit feature coming soon!")}
                       >
                         Edit
                       </Button>
                    )}
                  </Box>
                </MotionListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tab} index={2}>
          {loadingNeighbouringSocieties && neighbouringSocieties.length === 0 ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography ml={2} color="text.secondary">
                Loading neighbouring societies...
              </Typography>
            </Box>
          ) : neighbouringSocieties.length === 0 ? (
            <MotionTypography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              py={5}
              variants={itemVariants}
            >
              No neighbouring societies found based on your location.
            </MotionTypography>
          ) : (
            <MotionGrid
              container
              spacing={isMobile ? 2 : 3}
              variants={containerVariants}
            >
              {neighbouringSocieties.map((society) => (
                <MotionGrid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={society.id}
                  variants={itemVariants}
                >
                  <MotionCard
                    whileHover={{ scale: 1.03, boxShadow: theme.shadows[6] }}
                    transition={{ type: "spring", stiffness:300, damping: 20 }}
                    sx={{
                      height: "100%",
                      borderRadius: theme.shape.borderRadius * 2,
                      boxShadow: theme.shadows[3],
                      width: isMobile ? 290 : 350,
                      maxWidth:380,
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color= {isDark ? "#fff" : ""}
                      >
                        {society.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Location: {society.location}
                      </Typography>
                      {society.flats && (
                        <Typography variant="body2" color="text.secondary">
                          Flats: {society.flats}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
                      {society.map_url && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ borderRadius: 2, mr: 1 }}
                            onClick={() => window.open(society.map_url, '_blank')}
                          >
                            View on Map
                          </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2 }}
                        onClick={() => toast("Joining feature coming soon!")}
                      >
                        Join Society
                      </Button>
                    </CardActions>
                  </MotionCard>
                </MotionGrid>
              ))}
            </MotionGrid>
          )}
        </TabPanel>

        <Dialog
          open={openAddServiceDialog}
          onClose={() => setOpenAddServiceDialog(false)}
          PaperProps={{
            component: motion.div,
            initial: { opacity: 0, y: -50 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -50 },
            transition: { duration: 0.3 },
          }}
        >
          <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
            Add Your Services
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Provide a clear description for each service you offer (e.g., "Plumbing", "Electrician", "Tuition for Maths").
            </Typography>
            {newServiceTypes.map((serviceInput, index) => (
              <Box key={serviceInput.id} display="flex" alignItems="center" mb={2}>
                <TextField
                  autoFocus={index === 0}
                  margin="dense"
                  id={`service-type-${serviceInput.id}`}
                  label={`Service Type ${index + 1}`}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={serviceInput.value}
                  onChange={(e) => handleServiceInputChange(serviceInput.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                />
                {newServiceTypes.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveServiceInput(serviceInput.id)}
                    color="error"
                    sx={{ ml: 1 }}
                    disabled={addingService}
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddServiceInput}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mt: 1, borderRadius: 2 }}
              disabled={addingService}
            >
              Add another service
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddServiceDialog(false)} color="secondary" disabled={addingService}>
              Cancel
            </Button>
            <Button
              onClick={handleAddService}
              color="primary"
              variant="contained"
              disabled={addingService}
              startIcon={addingService && <CircularProgress size={20} color="inherit" />}
            >
              {addingService ? "Adding..." : "Add Services"}
            </Button>
          </DialogActions>
        </Dialog>
      </MotionBox>
    </Slide>
  );
}