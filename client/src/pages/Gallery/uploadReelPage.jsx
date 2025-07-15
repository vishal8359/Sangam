import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Chip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const dummyStats = {
  totalViews: 32500,
  uploads: 15,
  followers: 2200,
  earnings: 5600,
  reach: 78,
  viewerTypes: [
    { name: "Residents", value: 60 },
    { name: "Other Societies", value: 30 },
    { name: "Guests", value: 10 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const UploadReelPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [stats, setStats] = useState(null);
  const [userData, setUserData] = useState(null);
  const { userProfile, userReels, setUserReels, axios, userId, token } =
    useAppContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`/api/users/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(data);
      } catch (err) {
        console.error("❌ Failed to fetch user info:", err);
      }
    };

    if (userId && token) fetchUserData();
  }, [userId, token]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}/reel-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch reel stats:", err);
      }
    };

    if (userId && token) fetchStats();
  }, [userId, token]);

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {value}
      </text>
    );
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);
    formData.append("tags", JSON.stringify(tags));
    formData.append("description", desc);

    try {
      const toastId = toast.loading("Uploading reel...");

      const response = await axios.post(
        "/api/users/gallery/reels/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const savedReel = response.data.reel; 

      if (!savedReel || !savedReel.videoUrl) {
        throw new Error("Invalid reel data returned from server");
      }

      setUserReels((prev) => [savedReel, ...prev]);

      toast.success(" Reel uploaded successfully!", { id: toastId });
      navigate("/gallery");
    } catch (error) {
      console.error("❌ Reel upload failed:", error);
      toast.dismiss();
      toast.error("Failed to upload reel");
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", mt: 4, p: 3, borderRadius: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        {/* Left Stats Panel */}
        <Box
          flex={1}
          p={2}
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 2,
          }}
        >
          <div className="flex justify-between gap-1">
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar
              src={userData?.avatar || "/user_photo.jpg"}
              sx={{ width: 56, height: 56 }}
            />
            <Box>
              <Typography variant="h6">{userData?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {userData?.address}
              </Typography>
            </Box>
          </Stack>
          <button onClick={() => {
            navigate('./myreels')
          }} className="border-1 rounded-2xl p-2 cursor-pointer bg-gray-300 hover:bg-gray-100">My reels</button>
          </div>

          <Typography fontWeight="bold" mt={2}>
            Reel Stats
          </Typography>
          <Stack spacing={1} my={2}>
            <Typography>Total Reels Uploaded: {stats?.uploads ?? 0}</Typography>
            <Typography>Total Views: {stats?.totalViews ?? 0}</Typography>
            <Typography>Followers: {stats?.followers ?? 0}</Typography>
            <Typography>Expected Earnings: ₹{stats?.earnings ?? 0}</Typography>
          </Stack>

          <Typography mt={3} fontWeight="bold">
            Viewer Type Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: "Residents", value: 60 },
                  { name: "Other Societies", value: 30 },
                  { name: "Guests", value: 10 },
                ]}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                fill="#8884d8"
                labelLine={false}
                label={renderCustomLabel}
              >
                {COLORS.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Typography mt={3} fontWeight="bold">
            Reach
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={[{ name: "Reach", value: stats?.reach || 0 }]}
            >
              <RadialBar
                minAngle={15}
                background
                dataKey="value"
                fill="#00C49F"
                cornerRadius={10}
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </Box>

        {/* Right Upload Section */}
        <div className="w-110">
          <Box
          flex={1}
          p={3}
          borderRadius={3}
          boxShadow={3}
          bgcolor={theme.palette.background.paper}
          sx={{
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: 6 },
            border: `1px solid ${theme.palette.divider}`,
            mt: 1.5,
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            🎬 Upload a New Reel
          </Typography>

          <TextField
            fullWidth
            label="Reel Description"
            placeholder="Describe your reel content..."
            multiline
            rows={3}
            variant="outlined"
            sx={{ mb: 2 }}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="mb-2">
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <TextField
                size="small"
                label="Add Tag"
                value={tagInput}
                variant="outlined"
                fullWidth
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTagAdd()}
              />
              <Button
                variant="outlined"
                onClick={handleTagAdd}
                sx={{
                  textTransform: "none",
                  height: "40px",
                  px: 2,
                }}
              >
                Add
              </Button>
            </Stack>
          </div>

          {tags.length > 0 && (
            <Box sx={{ width: "100%", mt: 3 }}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.action.hover,
                }}
              >
                {tags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={`#${tag}`}
                    onDelete={() => setTags(tags.filter((t) => t !== tag))}
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            component="label"
            fullWidth
            sx={{
              mt: 2,
              mb: 2,
              bgcolor: theme.palette.secondary.main,
              "&:hover": {
                bgcolor: theme.palette.secondary.dark,
              },
              textTransform: "none",
              fontWeight: 600,
              py: 1.2,
            }}
          >
            Select Reel
            <input
              hidden
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>

          {file && (
            <Box
              mb={2}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 2,
              }}
            >
              <video
                src={URL.createObjectURL(file)}
                controls
                width="100%"
                style={{
                  height: 300,
                  borderRadius: 8,
                  // objectFit: "cover",
                }}
              />
            </Box>
          )}

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            fullWidth
            disabled={!file}
            sx={{
              py: 1.2,
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Upload Reel
          </Button>
          {userReels.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                My Reels Preview
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {userReels.map((reel) => (
                  <video
                    key={reel.id}
                    src={reel.videoUrl}
                    width={120}
                    height={180}
                    muted
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        </div>
      </Stack>
    </Box>
  );
};

export default UploadReelPage;
