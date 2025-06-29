// pages/ComplaintsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ComplaintsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("complaints")) || [];
    setComplaints(stored);
  }, []);

  return (
    <Box px={isMobile ? 2 : 8} py={5} minHeight="100vh">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={3}
      >
        <Typography variant="h5" fontWeight={600}>
          📋 All Registered Complaints
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/my-society/complaints/new")}
        >
          Register Complaint
        </Button>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
        {complaints.length === 0 ? (
          <Typography>No complaints registered yet.</Typography>
        ) : (
          complaints.map((c) => (
            <Card
              key={c.id}
              sx={{ width: isMobile ? "100%" : 300 }}
              elevation={4}
            >
              <CardContent>
                <Typography variant="h6">{c.type}</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {c.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Flat:</strong> {c.flat}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {c.description}
                </Typography>
                {c.reply && (
                  <Typography variant="body2" color="success.main" mt={1}>
                    <strong>Reply:</strong> {c.reply}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
};

export default ComplaintsPage;
