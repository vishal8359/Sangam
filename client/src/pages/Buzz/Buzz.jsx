import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { Send, Mic, CameraAlt } from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import ForumIcon from "@mui/icons-material/Forum";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import AddIcon from "@mui/icons-material/Add";
import chatWindow from "../../assets/ChatWindow.jpg";
import { useAppContext } from "../../context/AppContext";

export default function SocietyBuzz() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    buzzGroups,
    setBuzzGroups,
    userProfile,
    userId,
    userRole,
    societyId,
    members,
  } = useAppContext();

  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);
  const isDark = theme.palette.mode === "dark";
  const tabColor = isDark ? "#f5f5f5" : "inherit";

  const [openDialog, setOpenDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const currentGroup = tab > 0 ? buzzGroups[tab - 1] : null;
      const newMessage = {
        id: Date.now(),
        sender: userId,
        content: message,
        group: currentGroup || null,
        senderName: userProfile?.name || "Unknown",
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    }
  };

  const getFilteredMessages = () => {
    if (tab === 0) return messages.filter((msg) => !msg.group);
    return messages.filter((msg) => msg.group === buzzGroups[tab - 1]);
  };

  const handleToggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateGroup = () => {
    const trimmed = newGroupName.trim();
    if (trimmed && !buzzGroups.includes(trimmed)) {
      setBuzzGroups([...buzzGroups, trimmed]);
      // Optionally handle selectedMembers here
    }
    setNewGroupName("");
    setSelectedMembers([]);
    setOpenDialog(false);
  };

  return (
    <Box sx={{ maxWidth: "100vw", height: "94vh", bgcolor: isDark ? "#121212" : "#f0f0f0" }}>
      <Paper
        sx={{ maxWidth: "1200px", mx: "auto", p: isMobile ? 1 : 3, borderRadius: 0, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box component="h4" textAlign="center" fontWeight="bold" mb={1} pt={1} sx={{ color: isDark ? "#ccc" : theme.palette.primary.main, fontSize: "2rem" }}>
          Society Buzz
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            textColor={tabColor}
            indicatorColor="primary"
            sx={{ flexGrow: 1, "& .MuiTabs-indicator": { backgroundColor: isDark ? "#f5f5f5" : "#122525", height: 2, borderRadius: 2 } }}
          >
            <Tab
              label={<Box sx={{ display: "flex", alignItems: "center", gap: 1, color: tabColor }}><ForumIcon sx={{ fontSize: 20 }} /> Public Chat</Box>}
              sx={{ color: tabColor, minHeight: "48px", px: 2 }}
            />
            {buzzGroups.map((g, i) => (
              <Tab
                key={i}
                label={<Box display="flex" alignItems="center"><Groups2Icon sx={{ fontSize: 20, mr: 1, color: tabColor }} />{g}</Box>}
                sx={{ color: tabColor, minHeight: "48px", px: 2 }}
              />
            ))}
          </Tabs>
          {userRole === "admin" && (
            <Tooltip title="Create New Group">
              <IconButton onClick={() => setOpenDialog(true)} color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box
          sx={{
            height: 600,
            flexGrow: 1,
            overflowY: "auto",
            bgcolor: isDark ? "#1a1a1a" : "#ffffff",
            borderRadius: 2,
            p: 2,
            mb: 3,
            boxShadow: isDark ? "0 0 10px #000" : "0 0 5px #ccc",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${chatWindow})`,
              backgroundSize: "cover",
              backgroundRepeat: "repeat-y",
              backgroundPosition: "center",
              filter: "blur(6px) opacity(0.2)",
              zIndex: 0,
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1, overflowY: "auto", height: "100%" }}>
            {getFilteredMessages().map((msg, idx) => (
              <Box
                key={msg.id}
                sx={{ display: "flex", justifyContent: msg.sender === userId ? "flex-end" : "flex-start", mb: 1.5, px: 1 }}
              >
                <Box display="flex" flexDirection="column" alignItems={msg.sender === userId ? "flex-end" : "flex-start"}>
                  <Typography variant="caption" color={isDark ? "#ccc" : "#121212"} mb={0.3}>{msg.senderName}</Typography>
                  <Box
                    sx={{
                      maxWidth: isMobile ? "75%" : "90%",
                      bgcolor: msg.sender === userId ? theme.palette.primary.main : theme.palette.grey[300],
                      color: msg.sender === userId ? "white" : "black",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: "0.9rem",
                      whiteSpace: "pre-line",
                      boxShadow: 3,
                    }}
                  >
                    {msg.content}
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={bottomRef} />
          </Box>
        </Box>

        <TextField
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          variant="outlined"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Tooltip title="Add Emoji">
                  <IconButton size="small"><EmojiEmotionsIcon /></IconButton>
                </Tooltip>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Record Voice"><IconButton><Mic /></IconButton></Tooltip>
                <Tooltip title="Upload Reels"><IconButton><CameraAlt /></IconButton></Tooltip>
                <Tooltip title="Send"><IconButton onClick={handleSend}><Send /></IconButton></Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: isDark ? "#2c2c2c" : "white", borderRadius: 2, boxShadow: isDark ? "0 0 10px #111" : "0 0 5px #aaa" }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="standard"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <Typography variant="subtitle2" mt={2} mb={1} fontWeight="bold">
            Select Members
          </Typography>
          <FormGroup>
            {members.map((member) => (
              <FormControlLabel
                key={member._id}
                control={
                  <Checkbox
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => handleToggleMember(member._id)}
                  />
                }
                label={member.name || member.email}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
