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
        ml={4}
        pt={3}
        mr={4}
        mt={4}
        mb={2}
      >
        <Box display="flex" alignItems="center">
          <img
            className="w-15 h-15 rounded-2xl mr-2"
            src={Poll_icon}
            alt="Poll Icon"
          />
          <Typography component="h4" variant="h5" fontWeight="bold">
            Society Polls
          </Typography>
        </Box>

        {userRole === "admin" && (
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
            onClick={() => navigate("/my-society/polls/create")}
          >
            Create Poll
          </Button>
        )}
      </Box>

      {polls.map((poll) => {
        const totalVotes = poll.options.reduce(
          (acc, opt) => acc + opt.votes,
          0
        );
        const maxVotes = Math.max(...poll.options.map((opt) => opt.votes));
        const currentHouseNumber = houseNumbers[poll.id] || "";

        return (
          <Paper key={poll.id} elevation={4} sx={{ p: 2, m: 1, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                src={poll.logo}
                alt="Poll Logo"
                sx={{ width: 50, height: 50, mr: 2 }}
              />
              <Typography variant="h6" fontWeight="medium">
                {poll.question}
              </Typography>
              <Box ml="auto">
                <Tooltip
                  title={poll.locked ? "Votes are locked" : "Votes are open"}
                >
                  <span>
                    <IconButton
                      onClick={() => toggleLock(poll.id)}
                      color={poll.locked ? "error" : "success"}
                      disabled={userRole !== "admin"}
                    >
                      {poll.locked ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>

            <Typography variant="subtitle2" mb={2} color="text.secondary">
              Voting type:{" "}
              {poll.type === "single"
                ? "One vote per house"
                : "Multiple votes per house allowed"}
            </Typography>

            {poll.type === "single" && userRole !== "admin" && (
              <Box mb={2}>
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
                />
              </Box>
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
                    <TableRow key={i}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {isMobile
                            ? opt.name.length > 15
                              ? `${opt.name.slice(0, 8)}..`
                              : opt.name
                            : opt.name}

                          {isMajority && (
                            <EmojiEventsIcon
                              color="warning"
                              fontSize="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell align="center">{opt.votes}</TableCell>
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
                            }}
                            color={isMajority ? "success" : "primary"}
                          />
                          <Typography variant="body2">{percent}%</Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        {userRole !== "admin" && (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={
                              poll.locked ||
                              (poll.type === "single" &&
                                (poll.votedHouses.has(
                                  currentHouseNumber.trim()
                                ) ||
                                  !currentHouseNumber.trim()))
                            }
                            onClick={() => handleVote(poll.id, i)}
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
        );
      })}
    </Container>
  );
};

export default PollsPage;
