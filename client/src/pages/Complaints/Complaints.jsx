// pages/ComplaintsPage.jsx
import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done"; // optional resolve icon
import axios from "axios";

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
import { useAppContext } from "../../context/AppContext";

const ComplaintsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { fetchComplaints, userId, societyId, token, userRole } =
    useAppContext();
  const [complaints, setComplaints] = useState([]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      const url =
        userRole === "admin"
          ? `/api/admin/complaints/${id}`
          : `/api/users/complaints/${id}`;

      await axios.delete(url);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete complaint");
      console.error(err.response?.data || err.message);
    }
  };

  const handleResolve = async (id) => {
    if (!confirm("Mark this complaint as resolved?")) return;
    try {
      await axios.put(`/api/admin/complaints/resolve/${id}`);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "Resolved" } : c))
      );
    } catch (err) {
      alert("Failed to resolve complaint");
    }
  };

  useEffect(() => {
    const loadComplaints = async () => {
      if (!societyId || !token) return;
      const data = await fetchComplaints();
      setComplaints(data || []);
    };
    loadComplaints();
  }, [societyId, token]);

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
              key={c._id}
              sx={{ width: isMobile ? "100%" : 300, position: "relative" }}
              elevation={4}
            >
              <CardContent>
                {(userId?.toString() === c.user?._id?.toString() ||
                  userRole === "admin") && (
                  <IconButton
                    onClick={() => handleDelete(c._id)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                )}

                <Typography variant="h6">{c.complaint_type}</Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {c.user?.name || "Unknown"}
                </Typography>
                <Typography variant="body2">
                  <strong>Flat:</strong> {c.house_no}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {c.description}
                </Typography>
                {c.reply && (
                  <Typography variant="body2" color="success.main" mt={1}>
                    <strong>Reply:</strong> {c.reply}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color={c.status === "Resolved" ? "green" : "orange"}
                >
                  <strong>Status:</strong> {c.status}
                </Typography>

                {c.file_url && (
                  <Box mt={1}>
                    <img
                      src={c.file_url}
                      alt="Complaint"
                      style={{
                        width: "100%",
                        borderRadius: "6px",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}

                {userRole === "admin" && c.status !== "Resolved" && (
                  <Button
                    onClick={() => handleResolve(c._id)}
                    variant="outlined"
                    color="success"
                    fullWidth
                    startIcon={<DoneIcon />}
                    sx={{ mt: 1 }}
                  >
                    Mark as Resolved
                  </Button>
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
