import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { IconButton, Box } from "@mui/material";
import { PlayArrow, Pause } from "@mui/icons-material";

const createWaveformOptions = (container, fromSender) => ({
  container,
  waveColor: fromSender ? "#666" : "#aaa",
  progressColor: fromSender ? "#000" : "#fff",
  cursorColor: fromSender ? "#000" : "#fff",
  barWidth: 2,
  barRadius: 2,
  responsive: true,
  height: 35,
  normalize: true,
  partialRender: true,
});

const WaveformPlayer = ({ audioUrl, fromSender = false }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    const options = createWaveformOptions(waveformRef.current, fromSender);
    wavesurfer.current = WaveSurfer.create(options);
    wavesurfer.current.load(audioUrl);

    wavesurfer.current.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl, fromSender]);

  const togglePlayPause = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.playPause();
    setIsPlaying((prev) => !prev);
  };

  return (
    <Box display="flex" alignItems="center" gap={1} mt={1}>
      <IconButton
        onClick={togglePlayPause}
        size="small"
        sx={{
          color: fromSender ? "#000" : "#fff",
        }}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>
      <Box
        ref={waveformRef}
        sx={{ flexGrow: 1, cursor: "pointer", minWidth: 100 }}
      />
    </Box>
  );
};

export default WaveformPlayer;
