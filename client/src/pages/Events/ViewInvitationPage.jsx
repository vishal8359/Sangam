import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
} from "@mui/material";
import { FaStar } from "react-icons/fa";
import { useAppContext } from "../../context/AppContext";
import eventPlaceholder from "../../assets/Events_Bg.jpg";

const ViewInvitations = () => {
  const { token, axios } = useAppContext();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await axios.get("/api/users/events/invitations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
      } catch (err) {
        console.error("Failed to fetch invitations:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchInvitations();
  }, [token, axios]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 6,
        px: isMobile ? 2 : 4,
        minHeight: "calc(100vh - 64px)",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "150vh",
          backgroundImage: `url(${eventPlaceholder})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
          filter: "blur(6px)",
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
            backgroundColor: "rgba(10, 10, 10, 0.2)",
            zIndex: -1,
          },
        }),
      }}
    >
      <Slide direction="down" in={true} mountOnEnter unmountOnExit timeout={700}>
        <Typography
          variant="h4"
          component="h2"
          fontWeight="bold"
          mt={4}
          mb={6}
          textAlign="center"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: isDark ? "0 0 8px rgba(255,255,255,0.2)" : "none",
          }}
        >
          Received Invitations
        </Typography>
      </Slide>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress color="primary" />
          <Typography variant="h6" color="text.secondary" ml={2}>
            Loading invitations...
          </Typography>
        </Box>
      ) : invitations.length === 0 ? (
        <Fade in={true} timeout={1000}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="text.secondary">
              No invitations received yet.
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(300px, 1fr))",
            },
            gap: 4,
            justifyContent: "center",
          }}
        >
          {invitations.map((invite, index) => (
            <Slide
              key={invite._id || index}
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
                  alignItems: isMobile ? "center" : "flex-start",
                  gap: 3,
                  p: 3,
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: theme.shadows[10],
                  },
                  backgroundColor: isDark
                    ? "rgba(30, 30, 30, 0.85)"
                    : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(5px)",
                  border: `1px solid ${theme.palette.divider}`,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: isMobile ? "100%" : 120,
                    height: isMobile ? 180 : 120,
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: theme.shadows[3],
                    position: "relative",
                    "& img": {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    },
                  }}
                >
                  <img
                    src={invite.event?.image || `https://source.unsplash.com/300x300/?${invite.event?.eventName || 'event'}`}
                    alt={invite.event?.eventName || "Event"}
                  />
                </Box>

                <Box flexGrow={1} textAlign={isMobile ? "center" : "left"}>
                  {invite.event?.isCancelled && (
                    <Typography
                      variant="body2"
                      color="error"
                      fontWeight="bold"
                      mb={1}
                      display="flex"
                      alignItems="center"
                      justifyContent={isMobile ? "center" : "flex-start"}
                    >
                      <FaStar className="mr-1" style={{ fontSize: "1rem" }} />
                      CANCELLED
                    </Typography>
                  )}

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    mb={0.5}
                  >
                    {invite.event?.eventName || "Untitled Event"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <Typography component="span" fontWeight="medium">
                      Organizer:
                    </Typography>{" "}
                    {invite.event?.organiserName || "Unknown"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <Typography component="span" fontWeight="medium">
                      Address:
                    </Typography>{" "}
                    {invite.invitedBy?.address || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <Typography component="span" fontWeight="medium">
                      Location:
                    </Typography>{" "}
                    {invite.event?.place || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <Typography component="span" fontWeight="medium">
                      Date:
                    </Typography>{" "}
                    {invite.event?.date
                      ? new Date(invite.event.date).toLocaleDateString()
                      : "N/A"}{" "}
                    at{" "}
                    <Typography component="span" fontWeight="medium">
                      Time:
                    </Typography>{" "}
                    {invite.event?.time || "N/A"}
                  </Typography>
                  {invite.event?.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontStyle="italic"
                      mt={1}
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        pt: 1,
                        display: "block",
                      }}
                    >
                      {invite.event.description}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Slide>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default ViewInvitations;