// context/AppContext.js
import { useTheme } from "@emotion/react";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { samplePolls } from "../assets/local.js";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

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
  const [societyDetails, setSocietyDetails] = useState(null);
  const [token, setToken] = useState("");

  // Reels
  const [userReels, setUserReels] = useState([]);

  // Theme
  const [themeMode, setThemeMode] = useState("light");

  // General user and data
  const [user, setUser] = useState(null);

  // Marketplace
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [firstCartId, setFirstCartId] = useState(null);
  const currency = import.meta.env.VITE_CURRENCY;

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

  // Notices
  const [notices, setNotices] = useState([]);

  // Gallery Images (visible only to society members)
  const [galleryImages, setGalleryImages] = useState(() => {
    const saved = localStorage.getItem("gallery-images");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("gallery-images", JSON.stringify(galleryImages));
  }, [galleryImages]);

  const addGalleryImage = (image) => {
    setGalleryImages((prev) => [image, ...prev]);
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notices")) || [];
    setNotices(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("notices", JSON.stringify(notices));
  }, [notices]);

  const addNotice = (newNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("sangam-user"));
    const savedToken = localStorage.getItem("token"); // ✅ this is required!
    const savedTheme = localStorage.getItem("theme-mode");

    if (stored && savedToken) {
      setUserId(stored.userId || null);
      setHouseId(stored.houseId || "");
      setSocietyId(stored.societyId || "");
      setUserRole(stored.userRole || "");
      setUserProfile(stored.userProfile || null);
      setToken(savedToken); // ✅ restore token correctly
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

  useEffect(() => {
    const fetchSociety = async () => {
      if (!societyId) return;
      try {
        const res = await axios.get(`/api/users/society/${societyId}/details`);
        setSocietyDetails(res.data.society);
      } catch (err) {
        console.error("Failed to fetch society:", err.message);
      }
    };
    fetchSociety();
  }, [societyId]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const login = (data) => {
    const { userId, houseId, societyId, userRole, userProfile, token } = data;

    setUserId(userId);
    setHouseId(houseId);
    setSocietyId(societyId);
    setUserRole(userRole);
    setUserProfile(userProfile || null);
    setIsAuthenticated(true);
    setToken(token);

    localStorage.setItem("token", token);
    localStorage.setItem(
      "sangam-user",
      JSON.stringify({ userId, houseId, societyId, userRole, userProfile })
    );
  };

  const logout = () => {
    setUserId(null);
    setHouseId("");
    setSocietyId("");
    setUserRole("");
    setUserProfile(null);
    setIsAuthenticated(false);
    setToken("");
    localStorage.removeItem("sangam-user");
    localStorage.removeItem("token");
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
    setUserRole,
    userProfile,
    isAuthenticated,
    loading,
    login,
    logout,
    societyDetails,
    setSocietyDetails,
    token,
    setToken,

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

    // gallery
    galleryImages,
    setGalleryImages,
    addGalleryImage,

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
    userReels,
    setUserReels,

    //polls
    polls,
    setPolls,

    // notices
    notices,
    setNotices,
    addNotice,

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
