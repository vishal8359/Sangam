import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import invite_bg from "../../assets/societyBg.jpg";
import { useParams } from "react-router-dom";
const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);

const InviteMembersPage = () => {
  const { token, societyId, axios } = useAppContext();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState({});
  const [loading, setLoading] = useState(true);
  const { eventId } = useParams();

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMembers(res.data || []);
        const initial = {};
        (res.data || []).forEach((m) => (initial[m._id] = false));
        setInvites(initial);
        setLoading(false);
      } catch (err) {
        console.error(
          "Failed to fetch members:",
          err.response?.data || err.message
        );
        toast.error("Failed to load members.");
        setLoading(false);
      }
    };

    if (societyId && token) fetchMembers();
    else setLoading(false);
  }, [societyId, token, axios]);

  const handleToggle = (id) => {
    setInvites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInviteAll = () => {
    const allInvited = members.every((m) => invites[m._id]);
    const updated = {};
    members.forEach((m) => {
      updated[m._id] = !allInvited;
    });
    setInvites(updated);
  };

  const handleSendInvites = async () => {
    const selectedIds = Object.keys(invites).filter((id) => invites[id]);
    if (selectedIds.length === 0) {
      toast.error("Please select at least one member to invite.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/events/invite`,
        {
          eventId,
          invitees: selectedIds,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Invites sent successfully!");
      navigate("/my-society/events/view_invitations");
    } catch (err) {
      console.error("Invite error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to send invites.");
    }
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress color="primary" />
        <Typography ml={2} color="text.secondary">
          Loading members...
        </Typography>
      </Box>
    );
  }

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={700}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: { xs: 2, sm: 4, md: 6 },
          py: 5,
          position: "relative",
          zIndex: 1,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${invite_bg})`,
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
        <MotionBox
          sx={{
            width: "100%",
            maxWidth: 900,
            p: isMobile ? 3 : 5,
            borderRadius: theme.shape.borderRadius * 3,
            boxShadow: theme.shadows[10],
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[12],
            },
          }}
          variants={itemVariants}
        >
          <MotionBox display="flex" justifyContent="space-between" alignItems="center" mb={isMobile ? 3 : 4} variants={itemVariants}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight={700}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark ? "0 0 8px rgba(255,255,255,0.2)" : "none",
              }}
            >
              🤝 Invite Members
            </Typography>
            <MotionButton
              onClick={handleInviteAll}
              variant="contained"
              color="secondary"
              sx={{ px: isMobile ? 2 : 4, py: isMobile ? 1 : 1.5, borderRadius: 3, fontSize: isMobile ? '0.8rem' : '1rem' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {members.every((m) => invites[m._id]) ? "Remove All" : "Invite All"}
            </MotionButton>
          </MotionBox>

          <MotionGrid container spacing={isMobile ? 2 : 3} variants={containerVariants}>
            {members.length === 0 ? (
              <MotionGrid item xs={12} variants={itemVariants}>
                <Typography variant="h6" color="text.secondary" textAlign="center" py={5}>
                  No other members found in your society.
                </Typography>
              </MotionGrid>
            ) : (
              members.map((member) => (
                <MotionGrid item xs={12} sm={6} md={4} key={member._id} variants={itemVariants}>
                  <MotionCard
                    whileHover={{ scale: 1.03, boxShadow: theme.shadows[6] }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    sx={{
                      width: isMobile? 350 : 800,
                      maxWidth: isMobile? 300 : 800,
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: theme.shape.borderRadius * 2,
                      boxShadow: theme.shadows[3],
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: invites[member._id] ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Avatar
                      src={member.avatar || `https://i.pravatar.cc/150?u=${member._id}`}
                      alt="Avatar"
                      sx={{ width: 56, height: 56, mr: 2, boxShadow: theme.shadows[2] }}
                    />
                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {member.address}
                      </Typography>
                    </Box>
                    <Switch
                      checked={invites[member._id]}
                      onChange={() => handleToggle(member._id)}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-thumb': {
                          bgcolor: invites[member._id] ? theme.palette.primary.main : theme.palette.grey[500],
                        },
                        '& .MuiSwitch-track': {
                          bgcolor: invites[member._id] ? theme.palette.primary.light : theme.palette.grey[400],
                          opacity: 0.5,
                        },
                      }}
                    />
                  </MotionCard>
                </MotionGrid>
              ))
            )}
          </MotionGrid>

          <MotionBox mt={isMobile ? 4 : 6} display="flex" justifyContent="center" variants={itemVariants}>
            <MotionButton
              onClick={handleSendInvites}
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: isMobile ? 4 : 6, py: 1.5, borderRadius: 3, fontSize: isMobile ? '1rem' : '1.1rem', mt:3 }}
              whileHover={{ scale: 1.05, boxShadow: theme.shadows[8] }}
              whileTap={{ scale: 0.95 }}
            >
              Send Invites
            </MotionButton>
          </MotionBox>
        </MotionBox>
      </MotionBox>
    </Slide>
  );
};

export default InviteMembersPage;
