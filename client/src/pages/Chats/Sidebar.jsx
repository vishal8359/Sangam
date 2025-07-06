import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  useTheme,
  ListItemButton,
} from "@mui/material";
import { useAppContext } from "../../context/AppContext";

export default function Sidebar({
  members = [],
  selectedChatId,
  setSelectedChatId,
  searchTerm,
  setSearchTerm,
  isMobile,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user } = useAppContext();

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width={isMobile ? "100%" : "100%"}
      height="100%"
      borderRight={isMobile ? "none" : `1px solid ${theme.palette.divider}`}
      bgcolor={isDark ? "#272727" : "#f5f5f5"}
      sx={{ color: isDark ? "#f5f5ff" : "" }}
    >
      <Typography
        variant="h6"
        px={isMobile ? 8 : 2.5}
        py={isMobile ? 2 : 1.5}
        fontWeight={700}
      >
        Conversations
      </Typography>
      <Divider />
      <Box px={2.5} py={1}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <List>
        {/* 👤 Your Profile */}
        {user && (
          <>
            <Typography
              variant="caption"
              px={2.5}
              py={0.5}
              sx={{ opacity: 0.6 }}
            >
              You
            </Typography>
            <ListItem
              button
              selected={selectedChatId === user._id}
              onClick={() => setSelectedChatId(user._id)} 
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor:
                  selectedChatId === user._id
                    ? theme.palette.action.selected
                    : "transparent",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={user.avatar || undefined}>{user.name?.[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.name || "Your Name"} />
            </ListItem>
            <Divider />
          </>
        )}

        {/* 🔁 Other members */}
        {filteredMembers.map((member) => (
          <ListItem key={member._id} disablePadding>
            <ListItemButton
              selected={selectedChatId === member._id}
              onClick={() => setSelectedChatId(member._id)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                mb: 1,
                bgcolor:
                  selectedChatId === member._id
                    ? theme.palette.action.selected
                    : "transparent",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={member.avatar || undefined}>
                  {member.name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={member.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
