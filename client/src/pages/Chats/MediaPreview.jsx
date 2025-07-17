import React, { useRef, useState } from "react";
import {
  Dialog,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const MediaUpload = () => {
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("❌ File too large. Max allowed size is 10MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (file.type.startsWith("image/")) setPreviewType("image");
    else if (file.type.startsWith("video/")) setPreviewType("video");
    else if (file.type.startsWith("audio/")) setPreviewType("audio");
    else if (file.type === "application/pdf") setPreviewType("pdf");
    else {
      alert("Unsupported file type");
      return;
    }

    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    URL.revokeObjectURL(previewUrl);
  };

  return (
    <>
      <IconButton onClick={() => fileInputRef.current.click()}>
        <AttachFileIcon />
      </IconButton>

      <input
        type="file"
        accept="image/*,video/*,audio/*,application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Dialog open={previewOpen} onClose={closePreview} fullScreen>
        <Box
          onClick={closePreview}
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: theme.palette.mode === "dark" ? "#000" : "#fff",
            cursor: "pointer",
          }}
        >
          {previewType === "image" && (
            <img
              src={previewUrl}
              alt="preview"
              style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 8 }}
            />
          )}

          {previewType === "video" && (
            <video
              src={previewUrl}
              controls
              autoPlay
              style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 8 }}
            />
          )}

          {previewType === "audio" && (
            <audio
              src={previewUrl}
              controls
              autoPlay
              style={{ maxWidth: "90%" }}
            />
          )}

          {previewType === "pdf" && (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                previewUrl
              )}&embedded=true`}
              style={{
                width: "90%",
                height: "90%",
                border: "none",
                borderRadius: 8,
              }}
              title="PDF Preview"
            />
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default MediaUpload;
