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
  Slide,
  Fade,
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
    <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={500}>
      <Box
        width={isMobile ? "100%" : "100%"}
        height="100%"
        borderRight={isMobile ? "none" : `1px solid ${theme.palette.divider}`}
        bgcolor={isDark ? "#272727" : "#fff"}
        sx={{ color: isDark ? "#f5f5ff" : "", overflowY: "auto" }}
      >
        <Box
          px={isMobile ? 8 : 2.5}
          py={isMobile ? 2 : 1.5}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Conversations
          </Typography>
        </Box>
        <Divider />
        <Box px={2.5} py={1} sx={{ bgcolor: isDark ? "#272727" : "#fff" }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease-in-out",
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `${theme.palette.primary.main} 0px 0px 0px 2px`,
                },
              },
            }}
          />
        </Box>

        <List sx={{ px: 1.5, pt: 0.5 }}>
          {user && (
            <Fade in={true} timeout={700}>
              <Box mb={1}>
                <Typography
                  variant="caption"
                  px={1}
                  py={0.5}
                  sx={{
                    opacity: 0.7,
                    color: isDark ? theme.palette.grey[400] : theme.palette.grey[600],
                  }}
                >
                  You
                </Typography>
                <ListItemButton
                  selected={selectedChatId === user._id}
                  onClick={() => setSelectedChatId(user._id)}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    bgcolor:
                      selectedChatId === user._id
                        ? isDark
                          ? theme.palette.primary.dark
                          : theme.palette.primary.light
                        : "transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedChatId === user._id
                          ? isDark
                            ? theme.palette.primary.dark
                            : theme.palette.primary.light
                          : theme.palette.action.hover,
                      transform: "translateX(4px)",
                      transition: "transform 0.2s ease-out",
                    },
                    transition: "background-color 0.3s ease-in-out, transform 0.2s ease-out",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={user.avatar || undefined}
                      sx={{
                        boxShadow: `0px 0px 0px 2px ${theme.palette.primary.main}`,
                      }}
                    >
                      {user.name?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name || "Your Name"}
                    primaryTypographyProps={{
                      fontWeight: selectedChatId === user._id ? 600 : 500,
                      color: selectedChatId === user._id ? (isDark ? "#fff" : "#000") : "inherit",
                    }}
                  />
                </ListItemButton>
                <Divider variant="inset" component="li" sx={{ ml: 7, my: 1 }} />
              </Box>
            </Fade>
          )}

          {filteredMembers.map((member, index) => (
            <Fade in={true} timeout={500 + index * 100} key={member._id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedChatId === member._id}
                  onClick={() => setSelectedChatId(member._id)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor:
                      selectedChatId === member._id
                        ? isDark
                          ? theme.palette.primary.dark
                          : theme.palette.primary.light
                        : "transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedChatId === member._id
                          ? isDark
                            ? theme.palette.primary.dark
                            : theme.palette.primary.light
                          : theme.palette.action.hover,
                      transform: "translateX(4px)",
                      transition: "transform 0.2s ease-out",
                    },
                    transition: "background-color 0.3s ease-in-out, transform 0.2s ease-out",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={member.avatar || undefined}
                      sx={{
                        boxShadow: `0px 0px 0px 1px ${theme.palette.divider}`,
                      }}
                    >
                      {member.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    primaryTypographyProps={{
                      fontWeight: selectedChatId === member._id ? 600 : 400,
                      color: selectedChatId === member._id ? (isDark ? "#fff" : "#000") : "inherit",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          ))}
        </List>
      </Box>
    </Slide>
  );
}