import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  MenuItem,
  LinearProgress,
  useTheme,
  lighten,
  darken,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HomeIcon from "@mui/icons-material/Home";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

import { SEVERE_CONDITIONS } from "../../assets/local.js";
import { useAppContext } from "../../context/AppContext.jsx";
import { toast } from 'react-hot-toast'; // Assuming you have react-toastify for alerts

const initialPerson = {
  name: "",
  house: "",
  age: "",
  feet: "",
  inches: "",
  weight: "",
  fat: "",
  condition: "",
};

const computeHealthScore = ({ age, bmi, fat, condition }) => {
  let score = 10;

  if (age > 60) score -= 1;
  else if (age < 18) score -= 0.5;

  if (bmi < 18.5 || bmi > 24.9) score -= 1;

  if (fat > 25) score -= 1.2;

  if (SEVERE_CONDITIONS.includes(condition)) score -= 5;
  else if (condition !== "None") score -= 2;

  return Math.max(0, Math.min(10, score.toFixed(1)));
};

const calculateBMI = (feet, inches, weight) => {
  const heightInMeters =
    parseFloat(feet || 0) * 0.3048 + parseFloat(inches || 0) * 0.0254;
  if (!heightInMeters || !weight) return "";
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

export default function SocietyHealthScore() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const [allSocietyData, setAllSocietyData] = useState([]);
  const [person, setPerson] = useState(initialPerson);
  const [loadingHealthData, setLoadingHealthData] = useState(true);
  const [addingHealthEntry, setAddingHealthEntry] = useState(false);
  const { axios, token, user, societyId } = useAppContext();

  // Filter data for the current user's uploaded entries
  const myUploadedEntriesData = allSocietyData.filter(
    (item) => user && item.user === user._id
  );

  const bmi = calculateBMI(person.feet, person.inches, person.weight);

  const handleChange = (e) => {
    setPerson({ ...person, [e.target.name]: e.target.value });
  };

  // Calculate average health scores per family for the chart
  const familyScores = Object.values(
    allSocietyData.reduce((acc, cur) => {
      if (!acc[cur.house])
        acc[cur.house] = { house: cur.house, total: 0, count: 0 };
      acc[cur.house].total += cur.healthScore;
      acc[cur.house].count += 1;
      return acc;
    }, {})
  ).map((item) => ({
    house: item.house,
    avgScore: parseFloat((item.total / item.count).toFixed(2)),
  }));

  // Auto-fill house number from user's address
  useEffect(() => {
    if (user?.address) {
      const houseNo = user.address.split(",")[0]?.trim();
      setPerson((prev) => ({ ...prev, house: houseNo }));
    } else {
      console.log("User address not available yet or is null.");
    }
  }, [user]);

  const handleAdd = async () => {
    const { name, age, feet, inches, weight, fat, condition, house } = person;
    if (
      !name ||
      !age ||
      !feet ||
      !inches ||
      !weight ||
      !fat ||
      !condition ||
      !house
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const calculatedBmi = calculateBMI(feet, inches, weight);
    const healthScore = computeHealthScore({
      age,
      bmi: calculatedBmi,
      fat,
      condition,
    });

    setAddingHealthEntry(true);
    try {
      const res = await axios.post(
        "/api/users/addhealth",
        {
          name,
          age,
          feet,
          inches,
          weight,
          fat,
          condition,
          bmi: calculatedBmi,
          healthScore,
          house: person.house,
          societyId: societyId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchHealthData();
      setPerson(initialPerson);
      toast.success("Health entry added successfully!");
    } catch (err) {
      console.error("Submit error", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to add health entry.");
    } finally {
      setAddingHealthEntry(false);
    }
  };

  const fetchHealthData = async () => {
    setLoadingHealthData(true);
    try {
      const res = await axios.get(`/api/users/gethealth?societyId=${societyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllSocietyData(res.data);
    } catch (err) {
      console.error("Fetch error", err);
      toast.error("Failed to load health data.");
    } finally {
      setLoadingHealthData(false);
    }
  };

  useEffect(() => {
    if (token && societyId) {
      fetchHealthData();
    } else if (!societyId) {
      setLoadingHealthData(false);
      // toast.error("Society ID not available. Cannot fetch health data.");
    }
  }, [token, societyId]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/health/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Health entry deleted successfully!");
      fetchHealthData();
    } catch (err) {
      console.error(
        "Delete failed",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.message || "Failed to delete health entry.");
    }
  };

  // --- Start of Changes for Bar Chart Handling 200+ Bars ---
  const BAR_WIDTH = 40; // Individual bar width, adjusted for better visibility
  const BAR_SPACING = 15; // Space between bars
  const MIN_CHART_DISPLAY_WIDTH = 600; // Minimum width for the chart even if few bars

  const calculatedChartWidth = useMemo(() => {
    if (familyScores.length === 0) return MIN_CHART_DISPLAY_WIDTH;
    // Calculate total width needed for all bars and their spacing
    const totalContentWidth = familyScores.length * BAR_WIDTH + (familyScores.length - 1) * BAR_SPACING;
    // Ensure the chart is at least MIN_CHART_DISPLAY_WIDTH wide
    return Math.max(totalContentWidth, MIN_CHART_DISPLAY_WIDTH);
  }, [familyScores.length]);
  // --- End of Changes ---

  return (
    <Box
      p={4}
      sx={{
        background: isDark
          ? "linear-gradient(135deg, #121212 0%, #2a2a2a 100%)"
          : "linear-gradient(135deg, #fff 0%, #f5f5f5 100%)",
        minHeight: "100vh",
        color: isDark ? theme.palette.common.white : theme.palette.common.black,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={4}
        color={isDark ? "#fff" : "primary.main"}
        sx={{
          textShadow: isDark
            ? "2px 2px 5px rgba(0,0,0,0.7)"
            : "2px 2px 5px rgba(0,0,0,0.2)",
          textAlign: "center",
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
        }}
      >
        <HomeIcon sx={{ mr: 1, fontSize: "inherit" }} /> Society Health Scores
      </Typography>

      <Box
        p={3}
        mb={5}
        borderRadius={3}
        sx={{
          background: isDark
            ? "linear-gradient(145deg, #1e1e1e 0%, #2c2c2c 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
          boxShadow: isDark
            ? "0px 8px 20px rgba(0,0,0,0.8)"
            : "0px 8px 20px rgba(0,0,0,0.2)",
          maxWidth: "100%",
          mx: "auto",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        <Typography
          variant="h5"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          <PersonAddIcon sx={{ mr: 1 }} /> Add Individual Health Data
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Name"
              name="name"
              value={person.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="House No. (Auto-filled)"
              name="house"
              value={person.house}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Age"
              name="age"
              type="number"
              value={person.age}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              label="Height (Feet)"
              name="feet"
              type="number"
              value={person.feet}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Height (Inches)"
              name="inches"
              type="number"
              value={person.inches}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={person.weight}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="BMI (Auto Calculated)"
              value={bmi}
              disabled
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fat %"
              name="fat"
              type="number"
              value={person.fat}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              required
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Medical Condition"
              name="condition"
              value={person.condition}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              sx={{ minWidth: 222, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              required
            >
              {[
                "None",
                "Heart Disease",
                "Cancer",
                "Chronic Kidney",
                "Severe Diabetes",
                "Asthma",
                "Hypertension",
                "Other",
              ].map((option) => (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAdd}
              disabled={addingHealthEntry}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                background: isDark
                  ? "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)"
                  : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                "&:hover": {
                  opacity: 0.9,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease-in-out",
              }}
              required
            >
              {addingHealthEntry ? <CircularProgress size={24} color="inherit" /> : <PersonAddIcon sx={{ mr: 1 }} />} Add Person
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        color={isDark ? "secondary.light" : "primary.dark"}
        sx={{ textAlign: "center", textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}
      >
        <HealthAndSafetyIcon sx={{ mr: 1, fontSize: "inherit" }} /> My Uploaded
        Health Entries
      </Typography>
      {loadingHealthData ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" ml={2} color="text.secondary">
            Loading Health Data...
          </Typography>
        </Box>
      ) : myUploadedEntriesData.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="text.secondary">
            No health entries uploaded by you yet.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Use the form above to add your first entry!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} mb={6} justifyContent="center">
          {myUploadedEntriesData.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  width: isMobile ? '100%' : 250,
                  background: isDark
                    ? "linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)"
                    : "linear-gradient(135deg, #fafafa 0%, #ffffff 100%)",
                  borderRadius: 3,
                  boxShadow: isDark
                    ? "0px 6px 15px rgba(0,0,0,0.6)"
                    : "0px 6px 15px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: isDark
                      ? "0px 10px 25px rgba(0,0,0,0.9)"
                      : "0px 10px 25px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    House: <strong>{item.house}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Age: {item.age}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    BMI: {item.bmi}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fat %: {item.fat}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: SEVERE_CONDITIONS.includes(item.condition)
                        ? theme.palette.error.main
                        : theme.palette.info.main,
                      fontWeight: "medium",
                      mt: 0.5,
                    }}
                  >
                    Condition: {item.condition}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      Health Score: {item.healthScore} / 10 ⭐
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(item.healthScore / 10) * 100}
                      sx={{
                        height: 12,
                        borderRadius: 5,
                        bgcolor: isDark
                          ? darken(theme.palette.background.paper, 0.3)
                          : lighten(theme.palette.background.paper, 0.3),
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            item.healthScore >= 7
                              ? theme.palette.success.main
                              : item.healthScore >= 4
                                ? theme.palette.warning.main
                                : theme.palette.error.main,
                          transition: "width 0.5s ease-in-out",
                        },
                      }}
                    />
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(item._id)}
                      sx={{ mt: 1, borderRadius: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box
        p={3}
        borderRadius={3}
        sx={{
          background: isDark
            ? "linear-gradient(145deg, #1e1e1e 0%, #2c2c2c 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
          boxShadow: isDark
            ? "0px 8px 20px rgba(0,0,0,0.8)"
            : "0px 8px 20px rgba(0,0,0,0.2)",
          transition: "transform 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
          },
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          color="text.primary"
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          <TrendingUpIcon sx={{ mr: 1 }} /> Average Health Score Per Family
        </Typography>
        {loadingHealthData ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress color="primary" size={60} />
          </Box>
        ) : familyScores.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6" color="text.secondary">
              No family health scores available yet.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Add some health entries to see the chart!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}> {/* This creates the scrollable area */}
            <ResponsiveContainer width={calculatedChartWidth} height={300}>
              <BarChart data={familyScores} margin={{ top: 5, right: 30, left: isMobile ? -30 : 0, bottom: 5 }}>
                <XAxis
                  dataKey="house"
                  stroke={isDark ? theme.palette.grey[300] : theme.palette.grey[700]}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? theme.palette.grey[600] : theme.palette.grey[400] }}
                  
                />
                <YAxis
                  domain={[0, 10]}
                  stroke={isDark ? theme.palette.grey[300] : theme.palette.grey[700]}
                  tickLine={false}
                  axisLine={{ stroke: isDark ? theme.palette.grey[600] : theme.palette.grey[400] }}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
                  contentStyle={{
                    backgroundColor: isDark ? "#333333" : "#ffffff",
                    color: isDark ? "#ffffff" : "#000000",
                    borderRadius: 8,
                    border: `1px solid ${isDark ? "#555" : "#ddd"}`,
                    boxShadow: isDark
                      ? "0 4px 10px rgba(0,0,0,0.5)"
                      : "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: isDark ? "#ffffff" : "#000000" }}
                />
                <Bar
                  dataKey="avgScore"
                  fill={theme.palette.success.main}
                  radius={[10, 10, 0, 0]}
                  barSize={BAR_WIDTH} 
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
}