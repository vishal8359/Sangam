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
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import { useAppContext } from "../../context/AppContext";

const CreatePollPage = () => {
  const { colors, setPolls, navigate, axios } = useAppContext();

  const [pollData, setPollData] = useState({
    question: "",
    votingType: "single",
    options: ["", ""],
    logo: "",
  });

  const [error, setError] = useState("");

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setPollData((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const { question, options, votingType, logo } = pollData;

    // Basic frontend validation
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError("Poll question and all options are required.");
      return;
    }

    if (options.length < 2) {
      setError("At least 2 options are required.");
      return;
    }

    try {
      const payload = {
        question: question.trim(),
        options: options.map((opt) => opt.trim()),
        type: votingType, //  Add this
        logo: logo, // (optional)
        expires_at: null,
        society_id: JSON.parse(sessionStorage.getItem("sangam-user"))
          ?.societyId,
      };

      const token = sessionStorage.getItem("token");

      await axios.post("/api/admin/polls/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Optional: Show success toast
      navigate("/my-society/polls");
    } catch (err) {
      console.error("Failed to create poll:", err);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor={colors.background}
      p={3}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 600,
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ color: colors.primary }}
          textAlign="center"
          gutterBottom
        >
          🗳️ Create New Poll
        </Typography>

        <TextField
          label="Poll Question"
          name="question"
          fullWidth
          value={pollData.question}
          onChange={handleChange}
          sx={{ mb: 3 }}
          InputLabelProps={{ style: { color: colors.text } }}
          InputProps={{ style: { color: colors.text } }}
        />

        <FormLabel component="legend" sx={{ color: colors.text, mb: 1 }}>
          Voting Type
        </FormLabel>
        <RadioGroup
          name="votingType"
          value={pollData.votingType}
          onChange={handleChange}
          row
          sx={{ mb: 3 }}
        >
          <FormControlLabel
            value="single"
            control={<Radio />}
            label="One vote per house"
          />
          <FormControlLabel
            value="multiple"
            control={<Radio />}
            label="Multiple votes per house"
          />
        </RadioGroup>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Upload Poll Icon (optional)
          </Typography>
          <Button variant="outlined" component="label">
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Button>

          {pollData.logo && (
            <Box mt={2}>
              <Avatar
                src={pollData.logo}
                sx={{ width: 60, height: 60 }}
                alt="Poll Preview"
              />
            </Box>
          )}
        </Box>

        <Typography variant="h6" gutterBottom>
          Options
        </Typography>

        {pollData.options.map((option, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <TextField
              fullWidth
              label={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              InputLabelProps={{ style: { color: colors.text } }}
              InputProps={{ style: { color: colors.text } }}
            />
            {pollData.options.length > 2 && (
              <IconButton onClick={() => handleRemoveOption(index)}>
                <RemoveCircle sx={{ color: colors.error }} />
              </IconButton>
            )}
          </Box>
        ))}

        {pollData.options.length < 10 && (
          <Button
            onClick={handleAddOption}
            startIcon={<AddCircle />}
            sx={{ mb: 3 }}
          >
            Add Option
          </Button>
        )}

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        <Button variant="contained" fullWidth onClick={handleSubmit}>
          Create Poll
        </Button>
      </Paper>
    </Box>
  );
};

export default CreatePollPage;
