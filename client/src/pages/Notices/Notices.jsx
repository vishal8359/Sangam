import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Badge,
  Card,
  CardContent,
  Divider,
  Button,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import notices_bg from "../../assets/Notices_Bg.jpg";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

const NoticesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userRole, societyId, token, axios, setNotices, notices } =
    useAppContext();
  const isDark = theme.palette.mode === "dark";
  const [loading, setLoading] = useState(true);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: "easeIn" } },
  };

  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: "easeOut" } },
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
    hover: { scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.98 },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.95 },
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const role = userRole === "admin" ? "admin" : "users";
        const { data } = await axios.get(`/api/${role}/notices/${societyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotices(data);
      } catch (err) {
        console.error(
          "❌ Failed to fetch notices:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (societyId && token) fetchNotices();
  }, [societyId, token, axios, setNotices, userRole]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{
        padding:30,
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          py: isMobile ? 2 : 4,
          px: isMobile ? 2 : 5,
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
              backgroundColor: "rgba(100, 10, 10, 0.1)",
              zIndex: -1,
            },
          }),
        }}
      >
        <motion.div
          variants={headerVariants}
          initial="initial"
          animate="animate"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={isMobile ? 3 : 4}
          >
            <Typography
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" }, lineHeight: 1.2 }}
              color={theme.palette.text.primary}
            >
              Society Notices
            </Typography>

            <Box display="flex" alignItems="center" gap={isMobile ? 2 : 4} sx={{pt:1.5, mr: 2}}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Badge badgeContent={notices.length} color="error" max={99}>
                  <IconButton>
                    <NotificationsActiveIcon color="warning" sx={{ fontSize: { xs: 35, md: 45 } }} />
                  </IconButton>
                </Badge>
              </motion.div>

              {userRole !== "resident" && (
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button
                    variant="contained"
                    size={isMobile ? "medium" : "large"}
                    onClick={() => navigate("/my-society/notices/new")}
                    sx={{
                      borderRadius: 3,
                      px: isMobile ? 2 : 4,
                      py: isMobile ? 1 : 1.5,
                      fontWeight: 'bold',
                      boxShadow: theme.shadows[4],
                      "&:hover": {
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    Post Notice
                  </Button>
                </motion.div>
              )}
            </Box>
          </Box>
        </motion.div>

        <Box display="grid" gap={isMobile ? 2 : 3} mb={4}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress color="primary" size={50} />
              <Typography ml={2} variant="h6" color="text.secondary">
                Loading Notices...
              </Typography>
            </Box>
          ) : notices.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h5" color="text.secondary">
                No notices available at the moment.
              </Typography>
              <Typography variant="body1" color="text.secondary" mt={1}>
                Check back later for updates!
              </Typography>
            </Box>
          ) : (
            <AnimatePresence>
              {notices.map((notice) => (
                <motion.div
                  key={notice._id}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  layout
                >
                  <Card
                    elevation={6}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant={isMobile ? "h6" : "h5"}
                        fontWeight="bold"
                        gutterBottom
                        sx={{ lineHeight: 1.3 }}
                      >
                        {notice.title}
                      </Typography>
                      <Typography variant="body1"  paragraph>
                        {notice.description}
                      </Typography>
                      <Divider sx={{ my: isMobile ? 1.5 : 2, borderColor: theme.palette.divider }} />
                      <Typography variant="caption" color="text.secondary">
                        Posted by:{" "}
                        <Typography component="span" fontWeight="bold" sx={{color: isDark? "#f5f5f5" : ""}}>
                          {notice.posted_by?.name || "Admin"}
                        </Typography>{" "}
                        | {dayjs(notice.createdAt).format("MMM D, YYYY hh:mm A")}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </Box>
      </Container>
    </motion.div>
  );
};

export default NoticesPage;
