import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";

export default function UploadImagePage() {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleUpload = () => {
    // TODO: Replace this with actual API call
    console.log("Image:", file);
    console.log("Description:", desc);

    // Simulate upload delay
    setTimeout(() => {
      navigate("/gallery/images");
    }, 1000);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: isMobile ? 2 : 4,
        bgcolor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
        Upload Image
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        (This image will be visible only to residents of your society.)
      </Typography>

      <TextField
        fullWidth
        label="Description"
        multiline
        rows={3}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        margin="normal"
      />

      {file && (
        <Box sx={{ textAlign: "center", my: 2 }}>
          <Typography variant="body2" mb={1}>Preview:</Typography>
          <Avatar
            src={URL.createObjectURL(file)}
            variant="rounded"
            alt="Preview"
            sx={{ width: "100%", height: 250, objectFit: "cover", borderRadius: 2 }}
          />
        </Box>
      )}

      <Stack spacing={2} mt={3}>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          component="label"
          color="primary"
        >
          {file ? "Change Image" : "Select Image"}
          <input hidden type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </Button>

        <Button
          variant="contained"
          disabled={!file}
          onClick={handleUpload}
          sx={{ py: 1.5 }}
        >
          Upload Image
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Button
        fullWidth
        variant="text"
        onClick={() => navigate("/gallery/images")}
      >
        Go to Gallery Images
      </Button>
    </Box>
  );
}
