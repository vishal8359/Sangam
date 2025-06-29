// context/AppContext.js
import { useTheme } from "@emotion/react";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { samplePolls } from "../assets/local.js";
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Auth and user info
  const [userId, setUserId] = useState(null);
  const [houseId, setHouseId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme
  const [themeMode, setThemeMode] = useState("light");

  // General user and data
  const [user, setUser] = useState(null);

  // Marketplace
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [firstCartId, setFirstCartId] = useState(null);
  const currency = "₹";

  // Events
  const [events, setEvents] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Members
  const [members, setMembers] = useState([]);
  const [buzzGroups, setBuzzGroups] = useState([]);
  const [complaints, setComplaints] = useState([]);

  //polls
  const [polls, setPolls] = useState(samplePolls);

  //Address
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sangam-user"));
    const savedTheme = localStorage.getItem("theme-mode");

    if (stored) {
      setUserId(stored.userId || null);
      setHouseId(stored.houseId || "");
      setSocietyId(stored.societyId || "");
      setUserRole(stored.userRole || "");
      setUserProfile(stored.userProfile || null);
      setIsAuthenticated(true);
    }

    if (savedTheme) setThemeMode(savedTheme);
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/products");
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Fetch products error:", err.message);
      }
    };
    fetchProducts();
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

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

  // Cart logic
  const updateCartItem = (productId, quantity) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (quantity > 0) updated[productId] = quantity;
      else delete updated[productId];

      const ids = Object.keys(updated);
      setFirstCartId(ids.length > 0 ? ids[0] : null);
      setCartCount(Object.values(updated).reduce((a, b) => a + b, 0));
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((acc, qty) => acc + qty, 0);

  const getCartAmount = () => {
    return Object.keys(cartItems).reduce((total, id) => {
      const product = products.find((p) => p._id === id);
      return total + (product?.offerPrice || 0) * cartItems[id];
    }, 0);
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
    themeMode,
    toggleTheme,
    isDark: themeMode === "dark",
    colors: {
      background: themeMode === "dark" ? "#121212" : "#ffffff",
      text: themeMode === "dark" ? "#ffffff" : "#000000",
      primary: themeMode === "dark" ? "#90caf9" : "#1976d2",
    },

    // user data
    user,
    setUser,

    // products and cart
    products,
    setProducts,
    cartItems,
    setCartItems,
    updateCartItem,
    removeFromCart,
    getCartCount,
    getCartAmount,
    cartCount,
    setCartCount,
    firstCartId,
    setFirstCartId,
    currency,

    // society features
    members,
    setMembers,
    buzzGroups,
    setBuzzGroups,
    complaints,
    setComplaints,
    events,
    setEvents,
    invitations,
    setInvitations,

    //polls
    polls,
    setPolls,

    //address
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,

    // utils
    navigate,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
