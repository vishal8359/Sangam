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
import { useAppContext } from "../../context/AppContext";

export default function UploadImagePage() {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    galleryImages,
    setGalleryImages,
    societyId,
    userProfile,
  } = useAppContext();

  const handleUpload = () => {
    if (!file || !userProfile) return;

    const newImage = {
      id: Date.now(),
      src: URL.createObjectURL(file),
      description: desc,
      societyId,
      uploadedBy: {
        name: userProfile.user_name || "Unknown",
        avatar: userProfile.user_img || "",
      },
      uploadedAt: new Date().toISOString(),
    };

    setGalleryImages([newImage, ...galleryImages]);
    navigate("/gallery/images");
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
        <Box sx={{ my: 2 }}>
          <Typography variant="body2" mb={1}>
            Preview:
          </Typography>

          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #ccc",
            }}
          >
            <Avatar
              variant="rounded"
              src={URL.createObjectURL(file)}
              alt="Preview"
              sx={{ width: "100%", height: 250, objectFit: "cover" }}
            />

            {/* Overlay: uploader info */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  src={userProfile?.user_img}
                  alt={userProfile?.user_name}
                  sx={{ width: 30, height: 30 }}
                />
                <Typography variant="body2">
                  {userProfile?.user_name}
                </Typography>
              </Box>
              <Typography variant="caption">
                {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
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
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
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

      <Button fullWidth variant="text" onClick={() => navigate("/gallery/images")}>
        Go to Gallery Images
      </Button>
    </Box>
  );
}
