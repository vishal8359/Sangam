import { Box, Badge, useTheme } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const FloatingCartIcon = () => {
  const { getCartCount, firstCartId } = useAppContext();
  const theme = useTheme();
  const navigate = useNavigate();

  if (getCartCount() === 0 || !firstCartId) return null;

  return (
    <Box
      onClick={() => navigate("/my-society/ads/cart")}
      sx={{
        position: "fixed",
        top: 30,
        right: 20,
        zIndex: 999,
        cursor: "pointer",
        bgcolor: theme.palette.background.paper,
        borderRadius: "50%",
        boxShadow: 3,
        p: 1.2,
      }}
    >
      <Badge badgeContent={getCartCount()} color="primary">
        <ShoppingCartIcon
          sx={{ fontSize: 30, color: theme.palette.primary.main }}
        />
      </Badge>
    </Box>
  );
};

export default FloatingCartIcon;
