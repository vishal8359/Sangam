import React, { useState } from 'react';
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
  Switch,
  Box,
  Avatar
} from '@mui/material';

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const samplePolls = [
  {
    id: 1,
    question: "Who should be the next society president?",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    options: [
      { name: "Mr. Sharma", votes: 60 },
      { name: "Ms. Rani", votes: 90 },
      { name: "Mr. Khan", votes: 30 },
    ],
    locked: false,
  },
  {
    id: 2,
    question: "Which area needs renovation first?",
    logo: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png",
    options: [
      { name: "Playground", votes: 120 },
      { name: "Lift Area", votes: 150 },
      { name: "Parking", votes: 70 },
    ],
    locked: true,
  },
];

const PollsPage = () => {
  const [polls, setPolls] = useState(samplePolls);

  const toggleLock = (id) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === id ? { ...poll, locked: !poll.locked } : poll
      )
    );
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        <HowToVoteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Society Polls
      </Typography>

      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
        const maxVotes = Math.max(...poll.options.map((opt) => opt.votes));
        
        return (
          <Paper key={poll.id} elevation={4} sx={{ p: 3, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar src={poll.logo} sx={{ width: 50, height: 50, mr: 2 }} />
              <Typography variant="h6" fontWeight="medium">{poll.question}</Typography>
              <Box ml="auto">
                <Tooltip title={poll.locked ? "Votes are locked" : "Votes are open"}>
                  <IconButton onClick={() => toggleLock(poll.id)} color={poll.locked ? "error" : "success"}>
                    {poll.locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Option</b></TableCell>
                  <TableCell align="center"><b>Votes</b></TableCell>
                  <TableCell align="center"><b>Percentage</b></TableCell>
                  <TableCell align="center"><b>Majority</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {poll.options.map((opt, i) => {
                  const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const isMajority = opt.votes === maxVotes && maxVotes !== 0;

                  return (
                    <TableRow key={i}>
                      <TableCell>{opt.name}</TableCell>
                      <TableCell align="center">{opt.votes}</TableCell>
                      <TableCell align="center" sx={{ width: 200 }}>
                        <Box display="flex" alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              width: '100%',
                              height: 10,
                              borderRadius: 5,
                              mr: 1,
                            }}
                            color={isMajority ? 'success' : 'primary'}
                          />
                          <Typography variant="body2">{percent}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {isMajority && <EmojiEventsIcon color="warning" />}
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
