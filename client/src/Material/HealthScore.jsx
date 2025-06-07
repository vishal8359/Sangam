import React, { useState } from "react";
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
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Severe conditions list
const SEVERE_CONDITIONS = [
  "Heart Disease",
  "Cancer",
  "Chronic Kidney",
  "Severe Diabetes",
];

const initialPerson = {
  name: "",
  house: "",
  age: "",
  bmi: "",
  fat: "",
  condition: "",
};

const computeHealthScore = ({ age, bmi, fat, condition }) => {
  let score = 10;

  if (age > 60) score -= 1;
  else if (age < 18) score -= 0.5;

  if (bmi < 18.5 || bmi > 24.9) score -= 1;

  if (fat > 25) score -= 1;

  if (SEVERE_CONDITIONS.includes(condition)) score -= 5;
  else if (condition !== "None") score -= 2;

  return Math.max(0, Math.min(10, score.toFixed(1)));
};

export default function SocietyHealthScore() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [data, setData] = useState([]);
  const [person, setPerson] = useState(initialPerson);

  const handleChange = (e) => {
    setPerson({ ...person, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    const healthScore = computeHealthScore(person);
    const newPerson = { ...person, healthScore: parseFloat(healthScore) };
    setData([...data, newPerson]);
    setPerson(initialPerson);
  };

  const familyScores = Object.values(
    data.reduce((acc, cur) => {
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

  return (
    <Box p={4} bgcolor={isDark ? "#121212" : "#f5f5f5"} minHeight="100vh">
      <Box
        fontSize={{ xs: "1.8rem", sm: "2.2rem", md: "2.5rem" }}
        fontWeight="bold"
        mb={3}
        color={isDark ? "secondary.light" : "primary.main"}
      >
        🏡 Society Health Score System
      </Box>

      {/* Form */}
      <Box
        p={3}
        mb={5}
        borderRadius={2}
        bgcolor={isDark ? "#1e1e1e" : "#ffffff"}
        boxShadow={3}
        maxWidth="100vw"
      >
        <Typography variant="h6" color="text.primary" gutterBottom>
          Add Individual Health Data
        </Typography>
        <Grid container spacing={2}>
          {["name", "house", "age", "bmi", "fat"].map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                value={person[field]}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <TextField
              select
              label="Medical Condition"
              name="condition"
              value={person.condition}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              sx={{ minWidth: 222 }}
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
            <Button variant="contained" fullWidth onClick={handleAdd} sx={{mt:2, ml: 3}}>
              ➕ Add Person
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Individual Cards */}
      <Grid container spacing={2} mb={6}>
        {data.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                bgcolor: isDark ? "#1e1e1e" : "#fafafa",
                boxShadow: 4,
              }}
            >
              <CardContent>
                <Typography variant="h6" color="text.primary">
                  {item.name}
                </Typography>
                <Typography variant="body2">House: {item.house}</Typography>
                <Typography variant="body2">Age: {item.age}</Typography>
                <Typography variant="body2">BMI: {item.bmi}</Typography>
                <Typography variant="body2">Fat %: {item.fat}</Typography>
                <Typography
                  variant="body2"
                  color={
                    SEVERE_CONDITIONS.includes(item.condition)
                      ? "error"
                      : "text.secondary"
                  }
                >
                  Condition: {item.condition}
                </Typography>
                <Box mt={1}>
                  <Typography variant="body2">
                    Health Score: {item.healthScore} / 10 ⭐
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(item.healthScore / 10) * 100}
                    color={
                      item.healthScore >= 7
                        ? "success"
                        : item.healthScore >= 4
                          ? "warning"
                          : "error"
                    }
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bar Chart */}
      <Box
        p={3}
        bgcolor={isDark ? "#1e1e1e" : "#ffffff"}
        borderRadius={2}
        boxShadow={3}
      >
        <Typography variant="h6" gutterBottom color="text.primary">
          📊 Average Health Score Per Family
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={familyScores}>
            <XAxis dataKey="house" stroke={isDark ? "#fff" : "#000"} />
            <YAxis domain={[0, 10]} stroke={isDark ? "#fff" : "#000"} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#333" : "#fff",
                color: isDark ? "#fff" : "#000",
              }}
            />
            <Bar dataKey="avgScore" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
