import * as React from "react";
import { GlobalStyles } from "@mui/material";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { createTheme, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import Grid from "@mui/material/Grid";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import GroupsIcon from "@mui/icons-material/Groups";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PollIcon from "@mui/icons-material/Poll";
import ForumIcon from "@mui/icons-material/Forum";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SocietyLogo from "./logo";
import Switch from "@mui/material/Switch";
import SangamLogo from "./sangamLogo";
import MySociety from "../pages/MySociety";
import Typography from "@mui/material/Typography";
import appLogo from "../assets/appLogo.png";
import ChatsPage from "../pages/Chats";
import PollsPage from "../pages/Polls";
import ProductsPage from "../pages/Products";
import ComplaintForm from "../pages/complaints";
import NoticesPage from "../pages/Notices";
import EventPage from "../pages/Events";
import SocietyBuzz from "../pages/Buzz";
import NeighboursPage from "../pages/Neighbours";
import SocietyGalleryPage from "../pages/Gallery";
import UserEngagementPage from "../pages/UserEngagement";
import TopContributorsPage from "../pages/TopContributors";
import SocietyHealthScore from "../pages/HealthScore";
import IntegrationPage from "../pages/Integration";
import ResidentLogin from "../pages/ResidentLogin";
import { Info } from "@mui/icons-material";
import AdminLogin from "../pages/AdminLogin";

const NAVIGATION = [
  {
    kind: "header",
    title: "Dashboard",
  },
  {
    segment: "my-society",
    title: "My society",
    icon: <HomeIcon />,
    path: "/my-society",
    children: [
      {
        segment: "chats",
        title: "Chats",
        icon: <ForumIcon />,
        path: "/my-society/chats",
      },
      {
        segment: "polls",
        title: "Polls",
        icon: <PollIcon />,
        path: "/my-society/polls",
      },
      {
        segment: "ads",
        title: "New products",
        icon: <LocalOfferIcon />,
        path: "/my-society/ads",
      },
      {
        segment: "complaints",
        title: "Complaints",
        icon: <ReportProblemIcon />,
        path: "/my-society/complains",
      },
      {
        segment: "events",
        title: "Events",
        icon: <EventIcon />,
        path: "/my-society/events",
      },
      {
        segment: "notices",
        title: "Notices",
        icon: <CampaignIcon />,
        path: "/my-society/notices",
      },
    ],
  },
  {
    segment: "buzz",
    title: "Society Buzz",
    icon: <DynamicFeedIcon />,
    path: "/buzz",
  },
  {
    segment: "neighbours",
    title: "Neighbours",
    icon: <GroupsIcon />,
    path: "/neighbours",
  },
  {
    segment: "gallery",
    title: "Gallery",
    icon: <PhotoLibraryIcon />,
    path: "/gallery",
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Analytics",
  },
  {
    segment: "reports",
    title: "Reports",
    icon: <BarChartIcon />,
    path: "/reports",
    children: [
      {
        segment: "user_engagement",
        title: "User Engagement",
        icon: <ShowChartIcon />,
        path: "/reports/user_engagement",
      },
      {
        segment: "top_contributors",
        title: "Top Contributors",
        icon: <MilitaryTechIcon />,
        path: "/reports/top_contributors",
      },
      {
        segment: "society_health_score",
        title: "Society Health Score",
        icon: <HealthAndSafetyIcon />,
        path: "/reports/society_health_score",
      },
      {
        segment: "age_groups",
        title: "Age Groups",
        icon: <Diversity3Icon />,
        path: "/reports/age_groups",
      },
    ],
  },
  {
    segment: "integrations",
    title: "Integrations",
    icon: <LayersIcon />,
    path: "/integrations",
  },
];

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const [mode, setMode] = React.useState(
    () => window?.localStorage.getItem("theme") || "light"
  );

  const navigate = useNavigate();
  const location = useLocation();

  const demoTheme = React.useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: "Outfit, sans-serif",
        },
        palette: {
          mode,
          primary: {
            main: "#212121",
            dark: "grey",
          },
          text: {
            primary: mode === "light" ? "#212121" ? "#121212":
            secondary: "#f5f5f5",
          },
          background: {
            default: mode === "light" ? "#E5E5E5" : "#121212",
          },
        },
        components: {
          MuiTypography: {
            styleOverrides: {
              root: {
                "&.MuiTypography-h4": {
                  display: "none",
                },
              },
            },
          },
          MuiBreadcrumbs: {
            styleOverrides: {
              root: {
                display: "none",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#e8e8e8" : "#121212",
                color: mode === "light" ? "#E5E5E5" : "#fff",
                boxShadow: "none",
                borderBottom:
                  mode === "light" ? "1px solid #ccc" : "1px solid #333",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                margin: "2px",
                color: mode === "light" ? "black" : "white",
                "&:hover": {
                  backgroundColor: mode === "light" ? "#B0B0B0" : "White",
                  color: "black",
                  "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                    color: "black",
                  },
                },
                "&:active": {
                  backgroundColor: mode === "light" ? "white" : "white",
                },
                "&.Mui-selected": {
                  backgroundColor: "white",
                  color: "black",
                  "& .MuiListItemIcon-root, & .MuiSvgIcon-root": {
                    color: "black",
                  },
                },
              },
            },
          },
          MuiListItemText: {
            styleOverrides: {
              primary: {
                color: "var(--mui-palette-text-primary)",
                fontWeight: 500,
              },
            },
          },
          MuiListItemIcon: {
            styleOverrides: {
              root: {
                color: "black",
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const goToMySociety = () => {
    navigate("/my-society");
  };

  const MoonSwitch = styled(Switch)(({ theme }) => ({
    width: 60,
    height: 34,
    padding: 8,
    "& .MuiSwitch-switchBase": {
      margin: 3,
      padding: 0,
      transform: "translateX(5px)",
      "&.Mui-checked": {
        transform: "translateX(22px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor: "white",
          opacity: 1,
          border: 0,
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: "#fff",
      width: 28,
      height: 28,
      borderRadius: "50%",
      boxShadow: "inset -2px -2px 4px rgba(0,0,0,0.2)",
      position: "relative",
      "&:before": {
        content: '"☀️"',
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb:before": {
      content: '"🌙"',
    },
    "& .MuiSwitch-track": {
      borderRadius: 20 / 2,
      backgroundColor: "#ccc",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));

  return (
    <>
      <AppProvider
        navigation={NAVIGATION}
        theme={demoTheme}
        window={window ? window() : undefined}
        branding={{
          title: <span className="mt-1.5"><SangamLogo /></span>,
          logo: (
            <div style={{ maxWidth: 200, cursor: "pointer" }} onClick={goToMySociety}>
              <img src={appLogo} alt="App Logo" style={{ width: "100%", height: "100%", marginLeft: 15 }} />
            </div>
          ),
        }}
      >
        <div style={{ position: "absolute", top: 10, right: 8, zIndex: 1500 }}>
          <MoonSwitch checked={mode === "dark"} onChange={toggleMode} />
        </div>
        <DashboardLayout>
          <PageContainer sx={{ padding: 0, margin: 0 }}>
            <Routes>
              <Route path="/" element={<MySociety />} />
              <Route path="/my-society" element={<MySociety />} />
              <Route path="/my-society/chats" element={<ChatsPage />} />
              <Route path="/my-society/polls" element={<PollsPage />} />
              <Route path="/my-society/ads" element={<ProductsPage />} />
              <Route path="/my-society/complaints" element={<ComplaintForm />} />
              <Route path="/my-society/events" element={<EventPage />} />
              <Route path="/my-society/notices" element={<NoticesPage />} />
              <Route path="/resident-login" element={<ResidentLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/buzz" element={<SocietyBuzz />} />
              <Route path="/neighbours" element={<NeighboursPage />} />
              <Route path="/gallery" element={<SocietyGalleryPage />} />
              <Route path="/reports/user_engagement" element={<UserEngagementPage />} />
              <Route path="/reports/top_contributors" element={<TopContributorsPage />} />
              <Route path="/reports/society_health_score" element={<SocietyHealthScore />} />
              <Route path="/integrations" element={<IntegrationPage />} />
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </>
  );
}