import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, useTheme, useMediaQuery, Fab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import chats_bg from "../../assets/chats_bg.jpg";
import { useAppContext } from "../../context/AppContext";
import Sidebar from "./Sidebar";
import ChatContainer from "./ChatContainer";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatsPage() {
  const { societyId, userId, userProfile, axios, socket, token } =
    useAppContext();
  const { socket: socketRef, setMessageHandler } = useAppContext();

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messagesEndRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [chats, setChats] = useState({});
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  const selectedChat = selectedChatId ? chats[selectedChatId] || [] : [];

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const message = {
      sender: userId,
      text: newMessage,
      receiver: selectedChatId,
    };

    setChats((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), { ...message }],
    }));

    setNewMessage("");

    socket?.emit("send message", message);

    try {
      await axios.post("/api/chats/send", message);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleBack = () => setSelectedChatId(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log("Fetching members for:", societyId);
        const { data } = await axios.get(
          `/api/users/society/${societyId}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Members response:", data);
        if (data.success) {
          const filtered = data.users.filter((u) => u._id !== userId);
          setMembers(filtered);
        }
      } catch (err) {
        console.error("Error loading members:", err);
      }
    };

    if (societyId && userId) {
      fetchMembers();
    }
    // console.log("Society ID:", societyId);
  }, [societyId, userId]);

  useEffect(() => {
    if (socketRef?.current && userId) {
      socketRef.current.emit("setup", userId);

      socketRef.current.on("receive message", (msg) => {
        const otherId = msg.sender === userId ? msg.receiver : msg.sender;
        setChats((prev) => ({
          ...prev,
          [otherId]: [...(prev[otherId] || []), msg],
        }));
      });
    }

    // console.log("🔎 userId:", userId, typeof userId);

    return () => {
      socketRef?.current?.off("receive message");
    };
  }, [socketRef, userId]);
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId || !userId) return;

      try {
        const { data } = await axios.get(
          `/api/users/chats/${userId}/${selectedChatId}`
        );

        if (data.success) {
          setChats((prev) => ({
            ...prev,
            [selectedChatId]: data.messages,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchMessages();
  }, [selectedChatId, userId]);

  useEffect(() => {
    const handleIncomingMessage = (msg) => {
      const otherId = msg.sender === userId ? msg.receiver : msg.sender;
      setChats((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg],
      }));
    };

    setMessageHandler(handleIncomingMessage);

    return () => {
      // clear on unmount to avoid memory leak
      setMessageHandler(null);
    };
  }, [userId]);

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      height={isMobile ? "100%" : "92vh"}
      position="relative"
      overflow="hidden"
      zIndex={1}
      bgcolor={theme.palette.background.default}
      sx={{
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "150vh",
          backgroundImage: `url(${chats_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(8px)",
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
      {isMobile && !selectedChatId && (
        <Fab
          size="small"
          onClick={() => setShowSidebar((prev) => !prev)}
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": { bgcolor: theme.palette.primary.dark },
          }}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || showSidebar) && (
          <motion.div
            key="sidebar"
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: isMobile ? "100%" : "30%" }}
          >
            <Sidebar
              members={members}
              selectedChatId={selectedChatId}
              setSelectedChatId={(id) => {
                setSelectedChatId(id);
                setShowSidebar(false); // auto close on mobile
              }}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat container */}
      {(!isMobile || selectedChatId) && (
        <ChatContainer
          isMobile={isMobile}
          selectedChatId={selectedChatId}
          members={members}
          selectedChat={selectedChat}
          userId={userId}
          chats={chats}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSend={handleSend}
          handleBack={handleBack}
          setChats={setChats}
        />
      )}
    </Box>
  );
}
