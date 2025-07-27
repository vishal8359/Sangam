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

  const [userReels, setUserReels] = useState([]);

  const [themeMode, setThemeMode] = useState("light");

  const [user, setUser] = useState(null);

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

  const [events, setEvents] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [members, setMembers] = useState([]);
  const [buzzGroups, setBuzzGroups] = useState([]);

  const [polls, setPolls] = useState([]);

  let messageHandler = null;

  const [notices, setNotices] = useState([]);

  const [onlineStatus, setOnlineStatus] = useState({});

  const [galleryImages, setGalleryImages] = useState(() => {
    const saved = localStorage.getItem("gallery-images");
    return saved ? JSON.parse(saved) : [];
  });

  const fetchCurrentUser = async () => {
    if (!token) {
      console.log("AppContext: fetchCurrentUser skipped, no token.");
      return;
    }
    try {
      console.log("AppContext: Attempting to fetch current user with token.");
      const { data } = await axios.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      setUserId(data.user._id); // Ensure this is MongoDB _id
      setUserProfile(data.user);
      console.log("AppContext: User data fetched and set:", data.user);
    } catch (err) {
      console.error(
        "AppContext: Failed to fetch logged-in user:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  // Derive societyId from the fetched user object's roles
  useEffect(() => {
    if (user && user.roles && user.roles.length > 0) {
      // Assuming the first role's society_id is the primary one for the current context
      const primarySocietyId = user.roles[0].society_id;
      if (societyId !== primarySocietyId) {
        setSocietyId(primarySocietyId);
        console.log(
          "AppContext: societyId updated from fetched user profile:",
          primarySocietyId
        );
      }
    } else {
      console.log(
        "AppContext: User or user.roles not available to derive societyId from profile."
      );
    }
  }, [user, societyId]);

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
    const stored = JSON.parse(localStorage.getItem("sangam-user"));
    const savedToken = localStorage.getItem("token");
    const savedTheme = localStorage.getItem("theme-mode");

    if (stored && savedToken) {
      setUserId(stored.userId || null);
      setHouseId(stored.houseId || "");
      setSocietyId(stored.societyId || "");
      setUserRole(stored.userRole || "");
      setUserProfile(stored.userProfile || null);
      setToken(savedToken);
      setIsAuthenticated(true);

      const currentPath = window.location.pathname;

      if (
        currentPath === "/" 
      ) {
        navigate("/my-society");
      }
    } else {
      console.log(
        "AppContext: No user data or token found in localStorage on initial load."
      );
    }

    if (savedTheme) setThemeMode(savedTheme);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
      console.log("AppContext: Axios Authorization header removed.");
    }
  }, [token]);

  useEffect(() => {
    
    const fetchSociety = async () => {
      if (!societyId || !token) {
        console.log(
          "AppContext: fetchSociety skipped due to missing societyId or token."
        );
        return;
      }
      try {
        const res = await axios.get(`/api/users/society/${societyId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSocietyDetails(res.data.society);
        console.log("AppContext: Society details fetched successfully.");
      } catch (err) {
        console.error(
          "AppContext: Failed to fetch society:",
          err.response?.data || err.message
        );
      }
    };
    fetchSociety();
  }, [societyId, token]);

  useEffect(() => {
    const fetchPolls = async () => {
      if (!societyId || !token) {
        console.log(
          "AppContext: fetchPolls skipped due to missing societyId or token."
        );
        return;
      }

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
          votedHouses: new Set(),
        }));

        setPolls(mapped);
        console.log("AppContext: Polls fetched successfully.");
      } catch (err) {
        console.error(
          "AppContext: Failed to fetch polls:",
          err.response?.data || err.message
        );
      }
    };

    fetchPolls();
  }, [societyId, token, userRole]);

  useEffect(() => {

    const fetchProducts = async () => {
      if (!token || !societyId) {
        console.log(
          "AppContext: fetchProducts skipped due to missing societyId or token."
        );
        setProductsLoading(false);
        return;
      }
      try {
        setProductsLoading(true);
        const { data } = await axios.get(
          `/api/users/products?societyId=${societyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProducts(data);
        console.log("AppContext: Products fetched successfully.");
      } catch (err) {
        console.error(
          "AppContext: Failed to fetch products:",
          err.response?.data || err.message
        );
      } finally {
        setProductsLoading(false);
      }
    };

    if (token && societyId) {
      fetchProducts();
    }
  }, [token, societyId]);

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
          "❌ AppContext: Failed to fetch cart products:",
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
    // Ensure data.userId, data.societyId, data.houseId are consistently MongoDB ObjectIds as strings
    const {
      userId: backendUserId,
      houseId,
      societyId,
      userRole,
      userProfile,
      token,
    } = data;

    setUserId(backendUserId); 
    setHouseId(houseId);
    setSocietyId(societyId);
    setUserRole(userRole);
    setUserProfile(userProfile || null);
    setIsAuthenticated(true);
    setToken(token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log(
      "AppContext: Login function called. Setting societyId:",
      societyId,
      "userId:",
      backendUserId,
      "userRole:",
      userRole
    );
    console.log("AppContext: Login function received data:", data);

    localStorage.setItem("token", token);
    localStorage.setItem(
      "sangam-user",
      JSON.stringify({
        userId: backendUserId, // Store MongoDB _id string
        houseId,
        societyId,
        userRole,
        userProfile,
      })
    );
    console.log("AppContext: Data stored in localStorage.");
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
    setCartItems({});
    localStorage.removeItem("sangam-cart");
    console.log("AppContext: User logged out, data cleared.");
  };

  const fetchComplaints = async () => {
    if (!societyId || !token) return [];
    try {
      const endpoint =
        userRole === "admin"
          ? `/api/admin/complaints/${societyId}`
          : `/api/users/complaints/society/${societyId}`;

      const { data } = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    } catch (err) {
      console.error(
        "AppContext: Failed to fetch complaints:",
        err.response?.data || err.message
      );
      return [];
    }
  };

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log(
      "AppContext: Socket useEffect triggered. userId:",
      userId,
      "token exists:",
      !!token
    );
    if (!userId || !token) {
      console.log(
        "AppContext: Socket connection skipped due to missing userId or token."
      );
      return;
    }

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      query: { token },
    });

    socket.emit("setup", userId);
    socketRef.current = socket;
    console.log("AppContext: Socket connected and setup emitted.");

    socket.on("receive message", (msg) => {
      console.log("AppContext: Message received via socket:", msg);
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
      console.log("🔴 AppContext: Socket disconnected");
    });

    return () => {
      console.log("AppContext: Socket cleanup initiated.");
      socket.disconnect();
      socket.off("user status");
      socket.off("receive message");
      socket.off("online status");
      socket.off("buzz message deleted for me");
      socket.off("buzz message deleted for all");
      socket.off("buzzMessageDeleted");
    };
  }, [userId, token]);

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
    user,
    setUser,
    fetchCurrentUser,
    galleryImages,
    setGalleryImages,
    addGalleryImage,
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
    polls,
    setPolls,
    notices,
    setNotices,
    addNotice,
    navigate,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
