import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ImageIcon from "@mui/icons-material/Image";
import { keyframes } from "@emotion/react";
import gallery_bg from "../../assets/gallery_bg.jpg";

export default function SocietyGalleryPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const sections = [
    {
      title: "Reels Engagement",
      description: "Post your reels with tags and descriptions",
      icon: (
        <VideoLibraryIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />
      ),
      path: "/gallery/upload-reel",
    },
    {
      title: "Scroll Reels",
      description: "Watch and interact with reels from the community",
      icon: (
        <AddPhotoAlternateIcon sx={{ fontSize: 50, color: theme.palette.secondary.main }} />
      ),
      path: "/gallery/reels",
    },
    {
      title: "Upload Images",
      description: "Share pictures visible only to residents of your society",
      icon: (
        <ImageIcon sx={{ fontSize: 50, color: theme.palette.success.main }} />
      ),
      path: "/gallery/upload-image",
    },
    {
      title: "Images",
      description: "View images from your society only.",
      icon: (
        <ImageIcon sx={{ fontSize: 50, color: theme.palette.success.dark }} />
      ),
      path: "/gallery/images",
    },
  ];

  const backgroundMove = keyframes`
    0% { background-position: 0% 100%; }
    100% { background-position: 0% 0%; }
  `;

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Blurred animated background layer */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${gallery_bg})`,
          backgroundSize: "cover",
          backgroundRepeat: "repeat-y",
          backgroundPosition: "center bottom",
          animation: `${backgroundMove} 60s linear infinite`,
          filter: "blur(6px)",
          opacity: 0.6,
        }}
      />

      {/* Optional dark overlay for better contrast */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backgroundColor: isDark ? "rgba(100, 10, 10, 0.1)" : "rgba(255,255,255,0.3)",
        }}
      />

      {/* Main content layer */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          p: { xs: 2, sm: 4 },
          color: isDark ? "#f5f5ff" : "inherit",
        }}
      >
        <Box
          component="h4"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: 4,
            fontSize: "2rem",
            color: isDark ?"#f5f5ff" : "#121212",
          }}
        >
          Society Gallery Hub
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {sections.map((section) => (
            <Grid item xs={12} sm={6} md={4} key={section.title}>
              <Card
                elevation={4}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 3,
                  textAlign: "center",
                  borderRadius: 3,
                }}
              >
                {section.icon}
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {section.description}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(section.path)}
                    sx={{
                      bgcolor: isDark ? "#ffffff" : "primary.main",
                      color: isDark ? "#000000" : "#ffffff",
                      "&:hover": {
                        bgcolor: isDark ? "#f0f0f0" : "primary.dark",
                      },
                    }}
                  >
                    Go
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
