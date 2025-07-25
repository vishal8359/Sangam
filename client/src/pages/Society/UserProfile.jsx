import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Box,
  useMediaQuery,
} from "@mui/material";
import {
  FaUserCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaBolt,
  FaIdBadge,
  FaHome,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";

export default function UserProfileCard() {
  const theme = useTheme();
  const { axios, token, user: appContextUser, setUser: setAppContextUser, loading: appLoading, isAuthenticated } = useAppContext();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [user, setUser] = useState(null);
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhoneNo, setEditablePhoneNo] = useState("");
  const [editableAddress, setEditableAddress] = useState(""); // New state for editable address
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (appContextUser) {
      setUser(appContextUser);
      setEditableName(appContextUser.name || "");
      setEditableEmail(appContextUser.email || "");
      setEditablePhoneNo(appContextUser.phone_no || "");
      setEditableAddress(appContextUser.address || ""); // Initialize editable address
      setLoading(false);
    } else if (!appLoading && !isAuthenticated) {
      setLoading(false);
      toast.error("Authentication required to view profile.");
    }
  }, [appContextUser, appLoading, isAuthenticated]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setUser((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (editableName !== user.name) formData.append("name", editableName);
      if (editableEmail !== user.email) formData.append("email", editableEmail);
      if (editablePhoneNo !== user.phone_no) formData.append("phone_no", editablePhoneNo);
      if (editableAddress !== user.address) formData.append("address", editableAddress); // Add address to formData
      if (avatarFile) formData.append("avatar", avatarFile);

      if (Array.from(formData.entries()).length === 0) {
        toast("No changes to update.");
        setIsUpdating(false);
        return;
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile/me`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Profile updated successfully!");
      setAppContextUser(response.data.user);
      setAvatarFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" mt={2}>Loading profile...</Typography>
      </Stack>
    );
  }

  if (!user) {
    return (
      <Stack justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
        <Typography variant="h6" color="error">Failed to load user profile.</Typography>
      </Stack>
    );
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(45deg, ${ (isMobile || isDark) ? theme.palette.primary.light : "#fff" }30%, ${theme.palette.secondary.light} 95%)`,
        p: 2,
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <Card
          component={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          sx={{
            maxWidth: "100vw",
            width: isMobile ? 350 : "50vw",
            boxShadow: 10,
            borderRadius: 4,
            height: "auto",
            py: 4,
            background: theme.palette.background.paper,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 123,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              zIndex: 0,
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: 2,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "relative",
                mb: 2,
              }}
            >
              <Avatar
                component={motion.div}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                src={user.avatar || "https://i.pravatar.cc/150?img=32"}
                alt="User Avatar"
                sx={{
                  width: 120,
                  height: 120,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: `0 0 0 4px ${theme.palette.primary.main}`,
                  mt: -8,
                }}
              />
              <Typography
                component={motion.div}
                variants={itemVariants}
                variant="body2"
                sx={{
                  color: isDark? "#fff" : theme.palette.primary.main,
                  textDecoration: "underline",
                  cursor: "pointer",
                  mt: 1,
                  "&:hover": {
                    color: theme.palette.primary.dark,
                  },
                }}
                onClick={() => avatarInputRef.current.click()}
              >
                Upload Profile Image
              </Typography>
            </Box>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              ref={avatarInputRef}
            />

            <motion.div variants={itemVariants} style={{ width: "100%", maxWidth: 350 }}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                sx={{ mb: 2 }}
              />
            </motion.div>
            <motion.div variants={itemVariants} style={{ width: "100%", maxWidth: 350 }}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={editableEmail}
                onChange={(e) => setEditableEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
            </motion.div>
            <motion.div variants={itemVariants} style={{ width: "100%", maxWidth: 350 }}>
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                value={editablePhoneNo}
                onChange={(e) => setEditablePhoneNo(e.target.value)}
                sx={{ mb: 2 }}
              />
            </motion.div>
            {/* New TextField for Address */}
            <motion.div variants={itemVariants} style={{ width: "100%", maxWidth: 350 }}>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                value={editableAddress}
                onChange={(e) => setEditableAddress(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={2}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FaBolt color={theme.palette.info.main} /> EB No : {user.electricity_bill_no || "N/A"}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FaHome color={theme.palette.success.main} /> Society ID : {user.societyId || user.soc_id || "N/A"}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <FaIdBadge color={theme.palette.warning.main} /> User ID : {user.user_id || "N/A"}
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <FaIdBadge color={theme.palette.error.main} /> Home ID : {user.home_id || "N/A"}
              </Typography>
            </motion.div>

            <Button
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              color="primary"
              onClick={handleUpdateProfile}
              sx={{ mt: 2, py: 1.5, px: 4, borderRadius: 3 }}
              disabled={isUpdating}
            >
              {isUpdating ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Stack>
  );
}
