import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Slide,
  Zoom,
  Fade,
} from "@mui/material";
import { AddCircle, RemoveCircle, CloudUpload, Send } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import poll_bg from "../../assets/poll_bg.jpg";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTextField = motion(TextField);
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);

const complaintTypes = [
  "Water Leakage",
  "Electricity Issue",
  "Noise Complaint",
  "Security Concern",
  "Other",
];

const CreatePollPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";
  const { setPolls, axios, token, navigate } = useAppContext();

  const [pollData, setPollData] = useState({
    question: "",
    votingType: "single",
    options: ["", ""],
    logo: "",
    logoFile: null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPollData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    if (pollData.options.length < 10) {
      setPollData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  const handleRemoveOption = (index) => {
    const newOptions = pollData.options.filter((_, i) => i !== index);
    setPollData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file size exceeds 2MB limit.");
      setPollData((prev) => ({ ...prev, logo: "", logoFile: null }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPollData((prev) => ({ ...prev, logo: reader.result, logoFile: file }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { question, options, votingType, logoFile } = pollData;

    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError("Poll question and all options are required.");
      setLoading(false);
      return;
    }

    if (options.length < 2) {
      setError("At least 2 options are required.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("question", question.trim());
    options.forEach((opt, index) => {
      formData.append(`options[${index}]`, opt.trim());
    });
    formData.append("type", votingType);
    if (logoFile) {
      formData.append("logo", logoFile);
    }
    const societyId = JSON.parse(sessionStorage.getItem("sangam-user"))?.societyId;
    if (!societyId) {
      setError("Society ID not found. Please log in again.");
      setLoading(false);
      return;
    }
    formData.append("society_id", societyId);

    try {
      const response = await axios.post("/api/admin/polls/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Poll created successfully!");
      navigate("/my-society/polls");
    } catch (err) {
      console.error("Failed to create poll:", err);
      setError(err.response?.data?.message || "Failed to create poll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          position: "relative",
          zIndex: 1,
          py: 8,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${poll_bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(8px)",
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
            background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)",
            zIndex: -1,
          },
        }}
      >
        <MotionPaper
          elevation={isMobile ? 0 : 10}
          variants={itemVariants}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: isMobile ? 0 : 4,
            width: "100%",
            maxWidth: 650,
            backgroundColor: isDark ? theme.palette.background.paper : theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: isMobile ? "none" : theme.shadows[10],
            overflow: "hidden",
            transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: theme.shadows[12],
            },
          }}
        >
          <MotionBox variants={itemVariants}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight={700}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark ? "0 0 8px rgba(255,255,255,0.2)" : "none",
              }}
              textAlign="center"
              gutterBottom
            >
              🗳️ Create New Poll
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={isMobile ? 3 : 4}>
              Launch a new poll for your society members.
            </Typography>
          </MotionBox>

          <form onSubmit={handleSubmit}>
            <MotionTextField
              label="Poll Question"
              name="question"
              fullWidth
              value={pollData.question}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              sx={{ mb: 3 }}
              InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
              variants={itemVariants}
            />

            <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                Voting Type
              </FormLabel>
              <RadioGroup
                name="votingType"
                value={pollData.votingType}
                onChange={handleChange}
                row
              >
                <FormControlLabel
                  value="single"
                  control={<Radio sx={{ color: theme.palette.primary.main }} />}
                  label="One vote per house"
                  sx={{ color: theme.palette.text.primary }}
                />
                <FormControlLabel
                  value="multiple"
                  control={<Radio sx={{ color: theme.palette.primary.main }} />}
                  label="Multiple votes per house"
                  sx={{ color: theme.palette.text.primary }}
                />
              </RadioGroup>
            </MotionBox>

            <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="text.primary">
                Upload Poll Icon (optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: theme.shape.borderRadius,
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: isDark ? theme.palette.grey[800] : theme.palette.grey[50],
                  },
                }}
              >
                {pollData.logoFile ? pollData.logoFile.name : "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>

              {pollData.logo && (
                <Zoom in={Boolean(pollData.logo)} timeout={500}>
                  <Box mt={2} display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={pollData.logo}
                      sx={{
                        width: 70,
                        height: 70,
                        boxShadow: theme.shadows[3],
                        border: `2px solid ${theme.palette.primary.light}`,
                      }}
                      alt="Poll Preview"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Image selected.
                    </Typography>
                  </Box>
                </Zoom>
              )}
            </MotionBox>

            <MotionBox variants={itemVariants} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom color="text.primary">
                Options
              </Typography>
              {pollData.options.map((option, index) => (
                <Box key={index} display="flex" alignItems="center" mb={2}>
                  <TextField
                    fullWidth
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    variant="outlined"
                    sx={{ mr: 1 }}
                    InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
                    InputProps={{ style: { color: theme.palette.text.primary, borderRadius: theme.shape.borderRadius } }}
                  />
                  {pollData.options.length > 2 && (
                    <MotionIconButton
                      onClick={() => handleRemoveOption(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <RemoveCircle />
                    </MotionIconButton>
                  )}
                </Box>
              ))}

              {pollData.options.length < 10 && (
                <MotionButton
                  onClick={handleAddOption}
                  startIcon={<AddCircle />}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderColor: theme.palette.primary.light,
                    color: theme.palette.primary.main,
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      bgcolor: theme.palette.primary.light + '10',
                    },
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Option
                </MotionButton>
              )}
            </MotionBox>

            {error && (
              <Fade in={Boolean(error)} timeout={500}>
                <Typography color="error" mb={2} textAlign="center" variant="body2" sx={{ fontWeight: 'bold' }}>
                  {error}
                </Typography>
              </Fade>
            )}

            <MotionButton
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
              sx={{
                py: 1.5,
                borderRadius: theme.shape.borderRadius,
                fontSize: "1.1rem",
                boxShadow: theme.shadows[6],
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[8],
                },
                transition: "all 0.3s ease-in-out",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? "Creating Poll..." : "Create Poll"}
            </MotionButton>
          </form>
        </MotionPaper>
      </MotionBox>
    </Slide>
  );
};

export default CreatePollPage;
