// context/AppContext.js
import { useTheme } from "@emotion/react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const socketRef = useRef(null);

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
  const [buzzMessages, setBuzzMessages] = useState([]);

  // Reels
  const [userReels, setUserReels] = useState([]);

  // Theme
  const [themeMode, setThemeMode] = useState("light");

  // General user and data
  const [user, setUser] = useState(null);

  // Marketplace
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("sangam-cart");
    return stored ? JSON.parse(stored) : {};
  });
  const [productsLoading, setProductsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [firstCartId, setFirstCartId] = useState(null);
  const currency = import.meta.env.VITE_CURRENCY;
  const [cartArray, setCartArray] = useState([]);

  // Events
  const [events, setEvents] = useState([]);
  const [invitations, setInvitations] = useState([]);

  // Members
  const [members, setMembers] = useState([]);
  const [buzzGroups, setBuzzGroups] = useState([]);

  //polls
  const [polls, setPolls] = useState([]);

  //Address
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  let messageHandler = null;
  // Notices
  const [notices, setNotices] = useState([]);

  const [onlineStatus, setOnlineStatus] = useState({});

  // Gallery Images (visible only to society members)
  const [galleryImages, setGalleryImages] = useState(() => {
    const saved = localStorage.getItem("gallery-images");
    return saved ? JSON.parse(saved) : [];
  });

  // AppContext.js
  useEffect(() => {
    const fetchUser = async () => {
      if (!token || user) return; 
      try {
        const { data } = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data.user); 
        setUserId(data.user._id);
      } catch (err) {
        console.error(
          "❌ Failed to fetch logged-in user:",
          err.response?.data || err.message
        );
      }
    };

    fetchUser();
  }, [token]);

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
    localStorage.setItem("sangam-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("notices", JSON.stringify(notices));
  }, [notices]);

  const addNotice = (newNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
  };

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("sangam-user"));
    const savedToken = sessionStorage.getItem("token");
    const savedTheme = localStorage.getItem("theme-mode"); // keep theme in localStorage

    if (stored && savedToken) {
      setUserId(stored.userId || null);
      setHouseId(stored.houseId || "");
      setSocietyId(stored.societyId || "");
      setUserRole(stored.userRole || "");
      setUserProfile(stored.userProfile || null);
      setToken(savedToken);
      setIsAuthenticated(true);
    }

    if (savedTheme) setThemeMode(savedTheme);
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);
  useEffect(() => {
    console.log("✅ Setting token in axios:", token);
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    const fetchSociety = async () => {
      if (!societyId || !token) return; // ensure token exists
      try {
        const res = await axios.get(`/api/users/society/${societyId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSocietyDetails(res.data.society);
      } catch (err) {
        console.error(
          "Failed to fetch society:",
          err.response?.data || err.message
        );
      }
    };
    fetchSociety();
  }, [societyId, token]);
  useEffect(() => {
    const fetchPolls = async () => {
      if (!societyId || !token) return;

      try {
        const { data } = await axios.get(
          `/api/${userRole === "admin" ? "admin" : "users"}/polls/${societyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const mapped = data.map((poll) => ({
          id: poll._id,
          question: poll.question,
          type: poll.type || "single",
          logo: poll.logo || "/path/to/default/icon.png",
          locked: poll.locked,
          options: poll.options.map((opt) => ({
            name: opt.text,
            votes: opt.votes.length,
          })),
          votedHouses: new Set(), // optional: support voting history later
        }));

        setPolls(mapped);
      } catch (err) {
        console.error(
          "❌ Failed to fetch polls:",
          err.response?.data || err.message
        );
      }
    };

    fetchPolls();
  }, [societyId, token, userRole]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const { data } = await axios.get("/api/users/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(data.products);
      } catch (err) {
        console.error(
          "❌ Failed to fetch products:",
          err.response?.data || err.message
        );
      } finally {
        setProductsLoading(false);
      }
    };

    if (token && products.length === 0) {
      fetchProducts();
    }
  }, [token]);

  useEffect(() => {
    const fetchCartProducts = async () => {
      const cartProductIds = Object.keys(cartItems);
      if (cartProductIds.length === 0) {
        setCartArray([]);
        return;
      }

      try {
        const { data } = await axios.post(
          "/api/users/products/cart",
          { ids: cartProductIds },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const formatted = data.products.map((product) => ({
          ...product,
          cartQuantity: cartItems[product._id] || 1,
        }));

        setCartArray(formatted);
      } catch (err) {
        console.error(
          "❌ Failed to fetch cart products:",
          err.response?.data || err.message
        );
      }
    };

    if (token && Object.keys(cartItems).length > 0) {
      fetchCartProducts();
    } else {
      setCartArray([]);
    }
  }, [token, cartItems]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };
  const setMessageHandler = (handlerFn) => {
    messageHandler = handlerFn;
  };
  const login = (data) => {
    const { userId, houseId, societyId, userRole, userProfile, token } = data;

    setUserId(userProfile?._id);
    setHouseId(houseId);
    setSocietyId(societyId);
    setUserRole(userRole);
    setUserProfile(userProfile || null);
    setIsAuthenticated(true);
    setToken(token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Use sessionStorage instead of localStorage
    sessionStorage.setItem("token", token);
    sessionStorage.setItem(
      "sangam-user",
      JSON.stringify({
        userId: userProfile?._id,
        houseId,
        societyId,
        userRole,
        userProfile,
      })
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
    sessionStorage.removeItem("sangam-user");
    sessionStorage.removeItem("token");
    setCartItems({});
    localStorage.removeItem("sangam-cart");
  };

  const fetchComplaints = async () => {
    if (!societyId || !token) return [];
    try {
      const endpoint =
        userRole === "admin"
          ? `/api/admin/complaints/${societyId}` // ✅ corrected path
          : `/api/users/complaints/society/${societyId}`;

      const { data } = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (err) {
      console.error(
        "❌ Failed to fetch complaints:",
        err.response?.data || err.message
      );
      return [];
    }
  };

  useEffect(() => {
    if (!userId || !token) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      query: { token },
    });

    socket.emit("setup", userId);
    socketRef.current = socket;

    socket.on("receive message", (msg) => {
      console.log("📩 Message received via socket:", msg);
      if (typeof messageHandler === "function") {
        messageHandler(msg);
      }
    });
    socket.on("user status", ({ userId, isOnline, lastSeen }) => {
      setOnlineStatus((prev) => ({
        ...prev,
        [userId]: { isOnline, lastSeen },
      }));
    });

    socket.on("online status", (statusMap) => {
      setOnlineStatus(statusMap);
    });
    socket.on("buzz message deleted for me", ({ messageId }) => {
      setBuzzMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    socket.on("buzz message deleted for all", ({ messageId }) => {
      setBuzzMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });
    socket.on(
      "buzzMessageDeleted",
      ({ messageId, type, userId: deleterId }) => {
        setMessages((prevMessages) =>
          type === "me"
            ? prevMessages.filter((msg) =>
                // Only remove if it's the deleter’s own message (for "me" delete)
                deleterId === userId ? msg._id !== messageId : true
              )
            : prevMessages.map((msg) =>
                msg._id === messageId
                  ? {
                      ...msg,
                      content: "🗑 Message deleted",
                      fileUrl: null,
                      audioUrl: null,
                    }
                  : msg
              )
        );
      }
    );
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socket.off("user status");
    };
  }, [userId, token]);

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
  useEffect(() => {
    localStorage.setItem("sangam-cart", JSON.stringify(cartItems));
    const ids = Object.keys(cartItems);
    setCartCount(Object.values(cartItems).reduce((a, b) => a + b, 0));
    setFirstCartId(ids.length > 0 ? ids[0] : null);
  }, [cartItems]);

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
    return cartArray.reduce(
      (total, item) => total + (item.offerPrice || 0) * item.cartQuantity,
      0
    );
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
    fetchComplaints,
    onlineStatus,
    // theme
    theme,
    themeMode,
    toggleTheme,
    socket: socketRef,
    setMessageHandler,
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
    productsLoading,
    cartArray,
    setCartArray,

    // society features
    members,
    setMembers,
    buzzGroups,
    setBuzzGroups,
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
