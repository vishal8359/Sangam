import { useTheme } from "@emotion/react";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create context
export const AppContext = createContext();

// Provider component
export const AppContextProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [houseId, setHouseId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState("light"); // "light" or "dark"

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("sangam-user"));
    const savedTheme = localStorage.getItem("theme-mode");

    if (storedData) {
      setUserId(storedData.userId || null);
      setHouseId(storedData.houseId || "");
      setSocietyId(storedData.societyId || "");
      setUserRole(storedData.userRole || "");
      setUserProfile(storedData.userProfile || null);
      setIsAuthenticated(true);
    }

    if (savedTheme) {
      setThemeMode(savedTheme);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  const login = (data) => {
    const { userId, houseId, societyId, userRole, userProfile } = data;

    setUserId(userId);
    setHouseId(houseId);
    setSocietyId(societyId);
    setUserRole(userRole);
    setUserProfile(userProfile || null);
    setIsAuthenticated(true);

    localStorage.setItem("sangam-user", JSON.stringify(data));
  };

  const logout = () => {
    setUserId(null);
    setHouseId("");
    setSocietyId("");
    setUserRole("");
    setUserProfile(null);
    setIsAuthenticated(false);

    localStorage.removeItem("sangam-user");
  };

  const value = {
    // auth
    userId,
    houseId,
    societyId,
    userRole,
    userProfile,
    isAuthenticated,
    loading,
    login,
    logout,

    // theme
    theme,
    navigate,
    themeMode,
    toggleTheme,
    isDark: themeMode === "dark",
    colors: {
      background: themeMode === "dark" ? "#121212" : "#ffffff",
      text: themeMode === "dark" ? "#ffffff" : "#000000",
      primary: themeMode === "dark" ? "#90caf9" : "#1976d2",
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
