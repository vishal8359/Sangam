// pages/NoticesPage.jsx
import React from "react";
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
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import notices_bg from "../../assets/Notices_Bg.jpg";

const NoticesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { notices } = useAppContext();
  const isDark = theme.palette.mode === "dark";

  return (
    <Container
      maxWidth="lg"
      sx={{
        m: 0,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        pl={isMobile ? 1 : 5}
        pr={isMobile ? 1 : 5}
        pt={4}
      >
        <Box
          component="h1"
          fontWeight="bold"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" } }}
        >
          Society Notices
        </Box>

        <Box display="flex" alignItems="center" gap={4}>
          <Badge badgeContent={notices.length} color="error">
            <IconButton>
              <NotificationsActiveIcon color="warning" fontSize="large" />
            </IconButton>
          </Badge>
          <Button
            variant="contained"
            size="medium"
            onClick={() => navigate("/my-society/notices/new")}
          >
            Post Notice
          </Button>
        </Box>
      </Box>

      <Box display="grid" gap={3} mb={4} px={isMobile ? 1 : 5}>
        {notices.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No notices available.
          </Typography>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} elevation={5}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {notice.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {notice.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Posted by: {notice.postedBy} | Date: {notice.date}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default NoticesPage;
