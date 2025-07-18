import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player'; // You'd need to install this: npm install react-player
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// This would be a new component you'd create or integrate
export const CustomVideoPlayer = ({ url, isMobile }) => {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false); // For desktop controls visibility

  const handlePlayPause = () => setPlaying(!playing);
  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    setMuted(newValue === 0);
  };
  const handleMute = () => {
    setMuted(!muted);
    setVolume(muted ? 0.8 : 0); // Restore volume if unmuting from 0
  };
  const handleProgress = (state) => {
    setProgress(state.played);
  };
  const handleDuration = (duration) => {
    setDuration(duration);
  };
  const handleSeek = (e, newValue) => {
    playerRef.current.seekTo(newValue, 'fraction');
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    return `${mm}:${ss}`;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        maxHeight: 360,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        '&:hover .controls-overlay': { opacity: 1 }, // Show controls on hover for desktop
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        width="100%"
        height="auto" // Adjust height as needed, or use '100%' if parent has fixed height
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload' // Prevents download option on some browsers for native controls (if not using custom)
            }
          }
        }}
      />

      {/* Custom Controls Overlay */}
      <Box
        className="controls-overlay"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isMobile || playing ? 1 : 0, // Always show on mobile, show on desktop if hovering or playing
          p: 1,
        }}
      >
        {/* Progress Bar */}
        <Slider
          value={progress}
          min={0}
          max={1}
          step={0.01}
          onChange={handleSeek}
          aria-label="Video progress"
          sx={{ color: 'white', height: 4, '& .MuiSlider-thumb': { width: 12, height: 12 } }}
        />

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={handleMute} sx={{ color: 'white' }}>
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={muted ? 0 : volume}
              min={0}
              max={1}
              step={0.01}
              onChange={handleVolumeChange}
              aria-label="Volume"
              sx={{ width: 80, color: 'white', ml: 1 }}
            />
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="caption" sx={{ color: 'white' }}>
              {formatTime(duration * progress)} / {formatTime(duration)}
            </Typography>
            {/* Fullscreen is more complex and often involves browser APIs, left out for brevity */}
            {/* <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton> */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};