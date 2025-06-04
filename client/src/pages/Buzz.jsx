import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  IconButton,
  Button,
  TextField,
  Grid,
  Stack,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { PhotoCamera, Mic, Videocam, Favorite, ChatBubbleOutline, Send } from '@mui/icons-material';

const SocietyBuzz = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [gossipGroups] = useState([
    { id: 1, name: 'Gym Bros', members: ["Vishal", "Radhe"] },
    { id: 2, name: 'Evening Tea', members: ["Aunties"] },
  ]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);

  const handlePost = () => {
    const newPost = {
      id: posts.length + 1,
      user: 'You',
      time: new Date().toLocaleString(),
      text,
    };
    setPosts([newPost, ...posts]);
    setText('');
  };

  const openGroup = (groupId) => {
    setSelectedGroup(gossipGroups.find(g => g.id === groupId));
    setGroupMessages([]); // Placeholder for messages
  };

  const sendMessage = () => {
    setGroupMessages([...groupMessages, { from: 'You', text: message }]);
    setMessage('');
  };

  return (
    <Box p={2}>
      {!selectedGroup ? (
        <>
          <Typography variant="h4" fontWeight="bold" mb={3} color={isDark ? '#ccc' : '#333'}>
            🔊 Society Buzz
          </Typography>

          <Box bgcolor={isDark ? '#333' : '#f9f9f9'} p={2} borderRadius={2} boxShadow={3} mb={4}>
            <TextField
              multiline
              fullWidth
              rows={3}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              InputProps={{ sx: { color: isDark ? '#fff' : '#000' } }}
            />
            <Stack direction="row" spacing={2} mt={1} alignItems="center">
              <IconButton component="label"><PhotoCamera /></IconButton>
              <IconButton component="label"><Mic /></IconButton>
              <IconButton component="label"><Videocam /></IconButton>
              <Button variant="contained" onClick={handlePost}>Post</Button>
            </Stack>
          </Box>

          <Grid container spacing={2}>
            {posts.map(post => (
              <Grid item xs={12} md={6} key={post.id}>
                <Card sx={{ backgroundColor: '#fff' }}>
                  <CardHeader
                    avatar={<Avatar>{post.user[0]}</Avatar>}
                    title={post.user}
                    subheader={post.time}
                  />
                  <CardContent>
                    <Typography>{post.text}</Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton><Favorite /></IconButton>
                    <IconButton><ChatBubbleOutline /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h5" fontWeight="bold" mt={5} mb={2} color={isDark ? '#ccc' : '#333'}>
            🗨️ My Gossips
          </Typography>
          <Grid container spacing={2}>
            {gossipGroups.map(group => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6">{group.name}</Typography>
                  <Typography variant="body2">{group.members.length} members</Typography>
                  <Button size="small" onClick={() => openGroup(group.id)}>Enter</Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Box height="80vh" display="flex" flexDirection="column">
          <Button onClick={() => setSelectedGroup(null)} sx={{ mb: 2 }}>⬅ Back to Gossips</Button>
          <Typography variant="h5" fontWeight="bold" mb={2}>{selectedGroup.name} Chat</Typography>

          <Box flexGrow={1} overflow="auto" p={2}>
            {groupMessages.map((msg, idx) => (
              <Box key={idx} alignSelf={msg.from === 'You' ? 'flex-end' : 'flex-start'}>
                <Paper sx={{ p: 1, mb: 1 }}>{msg.text}</Paper>
              </Box>
            ))}
          </Box>

          <TextField
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton onClick={sendMessage}><Send /></IconButton>
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default SocietyBuzz;
