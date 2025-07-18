import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Tooltip,
  Box,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  TextField,
  Zoom,
  Slide,
  Fade,
} from "@mui/material";

import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { samplePolls } from "../../assets/local.js";
import poll_bg from "../../assets/poll_bg.jpg";
import Poll_icon from "../../assets/Poll_icon.png";
import { AppContext } from "../../context/AppContext.jsx";

const PollsPage = () => {
  const { polls, setPolls, userRole, societyId, navigate, axios, token } =
    useContext(AppContext);

  const [houseNumbers, setHouseNumbers] = useState({});
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data } = await axios.get(
          `/api/${userRole === "admin" ? "admin" : "users"}/polls/${societyId}`
        );
        const mapped = data.map((poll) => ({
          id: poll._id,
          question: poll.question,
          type: poll.type,
          logo: poll.logo || Poll_icon,
          locked: poll.locked,
          options: poll.options.map((opt) => ({
            name: opt.text,
            votes: opt.votes.length,
          })),
          votedHouses: new Set(),
        }));
        setPolls(mapped);
      } catch (err) {
        console.error(
          "Failed to fetch polls:",
          err.response?.data || err.message
        );
      }
    };

    if (societyId) fetchPolls();
  }, [societyId, userRole, axios]);

  const handleVote = async (pollId, optionIndex) => {
    const poll = polls.find((p) => p.id === pollId);
    const isSingleVote = poll?.type === "single";

    const houseNumber = houseNumbers[pollId]?.trim();

    if (isSingleVote && !houseNumber) {
      alert("Please enter your House Number before voting.");
      return;
    }

    try {
      const res = await axios.post(`/api/users/polls/${pollId}/vote`, {
        optionIndex,
        ...(isSingleVote && { houseNumber }),
      });

      const updated = res.data.poll;

      const mappedPoll = {
        id: updated._id,
        question: updated.question,
        type: updated.type,
        logo: updated.logo || Poll_icon,
        locked: updated.locked,
        options: updated.options.map((opt) => ({
          name: opt.text,
          votes: opt.votes.length,
        })),
        votedHouses: new Set([
          ...(poll?.votedHouses || []),
          ...(isSingleVote ? [houseNumber] : []),
        ]),
      };

      setPolls((prev) => prev.map((p) => (p.id === pollId ? mappedPoll : p)));
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting vote");
    }
  };

  const toggleLock = async (pollId) => {
    try {
      const { data } = await axios.patch(`/api/admin/polls/${pollId}/lock`);
      setPolls((prev) =>
        prev.map((poll) =>
          poll.id === pollId ? { ...poll, locked: data.poll.locked } : poll
        )
      );
    } catch (err) {
      console.error(
        "Failed to toggle lock:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <Container
      sx={{
        m: 0,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
        minHeight: "100vh",
        py: 4,
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "150vh",
          backgroundImage: `url(${poll_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          filter: "blur(8px)",
          zIndex: -2,
          animation: "panBackground 60s linear infinite alternate",
          "@keyframes panBackground": {
            "0%": {
              backgroundPosition: "0% 0%",
            },
            "100%": {
              backgroundPosition: "100% 100%",
            },
          },
        },
        ...(isDark && {
          "&::after": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "150vh",
            backgroundColor: "rgba(10, 10, 10, 0.3)",
            zIndex: -1,
          },
        }),
      }}
      maxWidth={false}
    >
      <Slide
        direction="down"
        in={true}
        mountOnEnter
        unmountOnExit
        timeout={700}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          ml={isMobile ? 2 : 4}
          pt={3}
          mr={isMobile ? 2 : 4}
          mt={isMobile ? 2 : 4}
          mb={4}
          flexDirection={isMobile ? "column" : "row"}
          gap={2}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              src={Poll_icon}
              alt="Poll Icon"
              sx={{
                width: isMobile ? 60 : 75,
                height: isMobile ? 60 : 75,
                mr: 2,
                boxShadow: theme.shadows[4],
                animation: "pulseIcon 2s infinite alternate",
                "@keyframes pulseIcon": {
                  "0%": {
                    transform: "scale(1)",
                  },
                  "100%": {
                    transform: "scale(1.05)",
                  },
                },
              }}
            />
            <Box
              component="h4"
              sx={{
                fontSize: isMobile
                  ? theme.typography.h5.fontSize
                  : theme.typography.h4.fontSize,
                fontWeight: "bold",
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark ? "0 0 8px rgba(255,255,255,0.3)" : "none",
              }}
            >
              Society Polls
            </Box>
          </Box>

          {userRole === "admin" && (
            <Zoom in={true} timeout={700}>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  boxShadow: theme.shadows[6],
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: theme.shadows[8],
                  },
                  fontSize: isMobile ? "0.8rem" : "1rem",
                }}
                onClick={() => navigate("/my-society/polls/create")}
              >
                Create Poll
              </Button>
            </Zoom>
          )}
        </Box>
      </Slide>

      {polls.length === 0 && (
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h6" color="text.secondary">
              No polls available at the moment.
            </Typography>
            {userRole === "admin" && (
              <Typography variant="body1" color="text.secondary" mt={2}>
                Click "Create Poll" to get started!
              </Typography>
            )}
          </Box>
        </Fade>
      )}

      {polls.map((poll, index) => {
        const totalVotes = poll.options.reduce(
          (acc, opt) => acc + opt.votes,
          0
        );
        const maxVotes = Math.max(...poll.options.map((opt) => opt.votes));
        const currentHouseNumber = houseNumbers[poll.id] || "";

        return (
          <Slide
            key={poll.id}
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={500 + index * 150}
          >
            <Paper
              elevation={6}
              sx={{
                p: isMobile ? 2 : 3,
                m: isMobile ? 1 : 2,
                mb: 4,
                borderRadius: 3,
                overflow: "hidden",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: theme.shadows[10],
                },
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(5px)",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                mb={2}
                flexDirection={isMobile ? "column" : "row"}
                textAlign={isMobile ? "center" : "left"}
              >
                <Avatar
                  src={poll.logo}
                  alt="Poll Logo"
                  sx={{
                    width: 60,
                    height: 60,
                    mr: isMobile ? 0 : 2,
                    mb: isMobile ? 1 : 0,
                    boxShadow: theme.shadows[2],
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight="bold"
                  flexGrow={1}
                  sx={{
                    color: isDark
                      ? theme.palette.primary.light
                      : theme.palette.primary.dark,
                  }}
                >
                  {poll.question}
                </Typography>
                <Box ml={isMobile ? 0 : "auto"} mt={isMobile ? 1 : 0}>
                  <Tooltip
                    title={poll.locked ? "Votes are locked" : "Votes are open"}
                    TransitionComponent={Zoom}
                    arrow
                  >
                    <span>
                      <IconButton
                        onClick={() => toggleLock(poll.id)}
                        color={poll.locked ? "error" : "success"}
                        disabled={userRole !== "admin"}
                        sx={{
                          transition: "transform 0.2s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {poll.locked ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>

              <Typography
                variant="subtitle2"
                mb={3}
                color="text.secondary"
                fontStyle="italic"
              >
                Voting type:{" "}
                <Typography component="span" fontWeight="bold">
                  {poll.type === "single"
                    ? "One vote per house"
                    : "Multiple votes per house allowed"}
                </Typography>
              </Typography>

              {poll.type === "single" && userRole !== "admin" && (
                <Fade in={true} timeout={1000}>
                  <Box mb={3}>
                    <TextField
                      label="Enter your House Number"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={currentHouseNumber}
                      onChange={(e) =>
                        setHouseNumbers((prev) => ({
                          ...prev,
                          [poll.id]: e.target.value,
                        }))
                      }
                      disabled={poll.locked}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: theme.palette.divider,
                          },
                          "&:hover fieldset": {
                            borderColor: theme.palette.primary.main,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: theme.palette.primary.main,
                            borderWidth: "2px",
                          },
                        },
                      }}
                    />
                  </Box>
                </Fade>
              )}

              <Table size="medium" sx={{ minWidth: 300 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Option</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Votes</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Percentage</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Action</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {poll.options.map((opt, i) => {
                    const percent = totalVotes
                      ? Math.round((opt.votes / totalVotes) * 100)
                      : 0;
                    const isMajority = opt.votes === maxVotes && maxVotes !== 0;

                    return (
                      <TableRow
                        key={i}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.02)",
                          },
                          transition: "background-color 0.2s ease-in-out",
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {isMobile
                                ? opt.name.length > 15
                                  ? `${opt.name.slice(0, 8)}..`
                                  : opt.name
                                : opt.name}
                            </Typography>
                            {isMajority && (
                              <Tooltip
                                title="Current Leader"
                                TransitionComponent={Zoom}
                                arrow
                              >
                                <EmojiEventsIcon
                                  color="warning"
                                  fontSize="small"
                                  sx={{
                                    ml: 1,
                                    animation: "bounceIcon 1s infinite",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="primary.main"
                          >
                            {opt.votes}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ width: 100 }}>
                          <Box display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={{
                                width: "100%",
                                height: 10,
                                borderRadius: 5,
                                mr: 1,
                                bgcolor: isDark
                                  ? "rgba(255,255,255,0.1)"
                                  : "grey.300",
                                "& .MuiLinearProgress-bar": {
                                  transition: "transform 0.5s ease-out",
                                },
                              }}
                              color={isMajority ? "success" : "primary"}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {percent}%
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="center">
                          {userRole !== "admin" && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<HowToVoteIcon />}
                              disabled={
                                poll.locked ||
                                (poll.type === "single" &&
                                  (poll.votedHouses.has(
                                    currentHouseNumber.trim()
                                  ) ||
                                    !currentHouseNumber.trim()))
                              }
                              onClick={() => handleVote(poll.id, i)}
                              sx={{
                                borderRadius: 2,
                                px: isMobile ? 1.5 : 2.5,
                                py: isMobile ? 0.5 : 1,
                                fontSize: isMobile ? "0.7rem" : "0.8rem",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                                "&.Mui-disabled": {
                                  backgroundColor:
                                    theme.palette.action.disabledBackground,
                                  color: theme.palette.action.disabled,
                                  cursor: "not-allowed",
                                },
                              }}
                            >
                              Vote
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Slide>
        );
      })}
    </Container>
  );
};

export default PollsPage;
