import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import ReplyIcon from "@mui/icons-material/Reply";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import moment from "moment";

const MotionCard = motion(Card);

const ComplaintsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { fetchComplaints, userId, societyId, token, userRole } = useAppContext();
  const [complaints, setComplaints] = useState([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openResolveConfirm, setOpenResolveConfirm] = useState(false);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});

  const handleDeleteConfirmOpen = (id) => {
    setSelectedComplaintId(id);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirmClose = () => {
    setOpenDeleteConfirm(false);
    setSelectedComplaintId(null);
  };

  const handleDelete = async () => {
    if (!selectedComplaintId) return;
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}${
        userRole === "admin"
          ? `/api/admin/complaints/${selectedComplaintId}`
          : `/api/users/complaints/${selectedComplaintId}`
      }`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) => prev.filter((c) => c._id !== selectedComplaintId));
      toast.success("Complaint deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete complaint");
      console.error(err.response?.data || err.message);
    } finally {
      handleDeleteConfirmClose();
    }
  };

  const handleResolveConfirmOpen = (id) => {
    setSelectedComplaintId(id);
    setOpenResolveConfirm(true);
  };

  const handleResolveConfirmClose = () => {
    setOpenResolveConfirm(false);
    setSelectedComplaintId(null);
  };

  const handleResolve = async () => {
    if (!selectedComplaintId) return;
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/complaints/resolve/${selectedComplaintId}`;
      const res = await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaintId ? { ...c, status: res.data.complaint.status } : c))
      );
      toast.success("Complaint marked as resolved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve complaint");
      console.error(err.response?.data || err.message);
    } finally {
      handleResolveConfirmClose();
    }
  };

  const handleReplyDialogOpen = (id) => {
    setSelectedComplaintId(id);
    setOpenReplyDialog(true);
    setReplyText("");
  };

  const handleReplyDialogClose = () => {
    setOpenReplyDialog(false);
    setSelectedComplaintId(null);
    setReplyText("");
  };

  const handleAddReply = async () => {
    if (!selectedComplaintId || !replyText.trim()) {
      toast.error("Reply text cannot be empty.");
      return;
    }
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/complaints/reply/${selectedComplaintId}`;
      const res = await axios.put(url,
        { replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaintId ? res.data.complaint : c))
      );
      toast.success("Reply added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add reply");
      console.error(err.response?.data || err.message);
    } finally {
      handleReplyDialogClose();
    }
  };

  const toggleReplies = (id) => {
    setExpandedReplies(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await fetchComplaints();
        setComplaints(data || []);
      } catch (error) {
        toast.error("Failed to load complaints.");
        console.error("Error loading complaints:", error);
      }
    };
    loadComplaints();
  }, [societyId, token, fetchComplaints]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box
      px={isMobile ? 2 : 8}
      py={5}
      minHeight="100vh"
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.default : "#fff",
        animation: 'fadeIn 0.5s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={4}
      >
        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          📋 All Registered Complaints
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/my-society/complaints/new")}
          sx={{
            py: 1.5,
            px: 3,
            borderRadius: theme.shape.borderRadius,
            fontSize: isMobile ? "0.8rem" : "1rem",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[6],
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          Register New Complaint
        </Button>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={isMobile ? 2 : 3}
        justifyContent={complaints.length === 0 ? "center" : "flex-start"}
      >
        {complaints.length === 0 ? (
          <Typography variant="h6" color="text.secondary" sx={{ mt: 5 }}>
            No complaints registered yet. Why not register one?
          </Typography>
        ) : (
          complaints.map((c, index) => (
            <MotionCard
              key={c._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: theme.shadows[8] }}
              sx={{
                width: isMobile ? "100%" : 320,
                position: "relative",
                borderRadius: theme.shape.borderRadius,
                display: "flex",
                flexDirection: "column",
                boxShadow: theme.shadows[3],
                transition: "all 0.3s ease-in-out",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {(userId?.toString() === c.user?._id?.toString() ||
                  userRole === "admin") && (
                  <IconButton
                    onClick={() => handleDeleteConfirmOpen(c._id)}
                    sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                )}

                <Typography variant="h6" component="div" mb={1} color="primary.dark">
                  {c.complaint_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {c.user?.name || c.name || "Unknown"}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  <strong>Flat:</strong> {c.house_no}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, mb: 1.5, fontStyle: 'italic' }}>
                  "{c.description}"
                </Typography>

                {c.replies && c.replies.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                        Admin Replies ({c.replies.length})
                      </Typography>
                      <IconButton onClick={() => toggleReplies(c._id)} size="small">
                        {expandedReplies[c._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={expandedReplies[c._id]} timeout="auto" unmountOnExit>
                      <List dense sx={{ mt: 1, maxHeight: 150, overflowY: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                        {c.replies.map((reply, replyIndex) => (
                          <React.Fragment key={reply._id || replyIndex}>
                            <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight="bold" color="success.dark">
                                    {reply.adminName || (reply.admin && typeof reply.admin === 'object' ? reply.admin.name : 'Admin')}
                                    <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                                      {moment(reply.createdAt).fromNow()}
                                    </Typography>
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {reply.text}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {replyIndex < c.replies.length - 1 && <Divider component="li" variant="inset" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                )}

                <Box sx={{ mt: 2, mb: 1 }}>
                  <Chip
                    label={`Status: ${c.status}`}
                    color={c.status === "Resolved" ? "success" : "warning"}
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>

                {c.file_url && (
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      href={c.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                    >
                      View Attached File
                    </Button>
                    {c.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                      <img
                        src={c.file_url}
                        alt="Complaint Attachment"
                        style={{
                          width: "100%",
                          borderRadius: theme.shape.borderRadius,
                          maxHeight: "150px",
                          objectFit: "contain",
                          marginTop: theme.spacing(1),
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                    )}
                  </Box>
                )}

                {userRole === "admin" && c.status !== "Resolved" && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      onClick={() => handleResolveConfirmOpen(c._id)}
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<DoneIcon />}
                      sx={{ py: 1 }}
                    >
                      Resolve
                    </Button>
                    <IconButton
                        color="info"
                        onClick={() => handleReplyDialogOpen(c._id)}
                        sx={{
                          border: `1px solid ${theme.palette.info.main}`,
                          borderRadius: theme.shape.borderRadius,
                          '&:hover': {
                              backgroundColor: theme.palette.info.light,
                          }
                        }}
                    >
                        <ReplyIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </MotionCard>
          ))
        )}
      </Box>

      <Dialog
        open={openDeleteConfirm}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this complaint? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openResolveConfirm}
        onClose={handleResolveConfirmClose}
        aria-labelledby="resolve-dialog-title"
        aria-describedby="resolve-dialog-description"
      >
        <DialogTitle id="resolve-dialog-title">{"Confirm Resolution"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="resolve-dialog-description">
            Are you sure you want to mark this complaint as resolved?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResolveConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResolve} color="success" autoFocus>
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openReplyDialog}
        onClose={handleReplyDialogClose}
        aria-labelledby="reply-dialog-title"
      >
        <DialogTitle id="reply-dialog-title">Add Admin Reply</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="reply"
            label="Your Reply"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReplyDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddReply} color="primary" variant="contained" disabled={!replyText.trim()}>
            Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintsPage;