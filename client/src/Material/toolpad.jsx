import * as React from "react";
import { GlobalStyles } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createTheme, styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

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
import UploadReelPage from "../pages/Gallery/uploadReelPage";
import ScrollReelsPage from "../pages/Gallery/scrollReelsPage";
import UploadImagePage from "../pages/Gallery/uploadImagePage";

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
  },
  {
    segment: "neighbours",
    title: "Neighbours",
    icon: <GroupsIcon />,
  },
  {
    segment: "gallery",
    title: "Gallery",
    icon: <PhotoLibraryIcon />,
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
    children: [
      {
        segment: "user_engagement",
        title: "User Engagement",
        icon: <ShowChartIcon />,
      },
      {
        segment: "top_contributors",
        title: "Top Contributors",
        icon: <MilitaryTechIcon />,
      },
      {
        segment: "Society_health_score",
        title: "Society Health Score",
        icon: <HealthAndSafetyIcon />,
      },
      {
        segment: "age_groups",
        title: "Age Groups",
        icon: <Diversity3Icon />,
      },
    ],
  },
  {
    segment: "integrations",
    title: "Integrations",
    icon: <LayersIcon />,
  },
];

function useDemoRouter(initialPath = "/") {
  const [location, setLocation] = React.useState(() => {
    const url = new URL(`http://localhost${initialPath}`);
    return {
      pathname: url.pathname,
      searchParams: new URLSearchParams(url.search),
    };
  });

  const navigate = React.useCallback((path) => {
    const url = new URL(`http://localhost${path}`);
    setLocation({
      pathname: url.pathname,
      searchParams: new URLSearchParams(url.search),
    });
  }, []);

  return React.useMemo(
    () => ({
      pathname: location.pathname,
      searchParams: location.searchParams,
      navigate,
    }),
    [location, navigate]
  );
}

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const [mode, setMode] = React.useState(
    () => window?.localStorage.getItem("theme") || "light"
  );
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const router = useDemoRouter("/");
  const demoWindow = window ? window() : undefined;

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
            primary: mode === "light" ? "#212121" : "#E5E5E5",
            secondary: "#757575",
          },
          background: {
            default: mode === "light" ? "#E5E5E5" : "#121212",
          },
        },
        components: {
          MuiTypography: {
            styleOverrides: {
              root: {
                // Hide header titles only if they belong to the PageHeader
                "&.MuiTypography-h4": {
                  display: "none", // Hides "Chats" title
                },
              },
            },
          },
          MuiBreadcrumbs: {
            styleOverrides: {
              root: {
                display: "none", // Hides "My society / Chats" breadcrumb
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
                // or if you want the selected state:
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
  function renderPage(pathname) {
    switch (pathname) {
      case "/":
      case "/my-society":
        return <MySociety />;
      case "/my-society/chats":
        return <ChatsPage />;
      case "/my-society/polls":
        return <PollsPage />;
      case "/my-society/ads":
        return <ProductsPage />;
      case "/my-society/complaints":
        return <ComplaintForm />;
      case "/my-society/events":
        return <EventPage />;
      case "/my-society/notices":
        return <NoticesPage />;
      case "/buzz":
        return <SocietyBuzz />;
      case "/neighbours":
        return <NeighboursPage />;
      case "/gallery":
        return <SocietyGalleryPage />;
      case "/gallery/upload-reel":
        return <UploadReelPage />;
      case "/gallery/reels":
        return <ScrollReelsPage />;
      case "/gallery/upload-image":
        return <UploadImagePage />;
      case "/reports/user_engagement":
        return <UserEngagementPage />;
      case "/reports/top_contributors":
        return <TopContributorsPage />;
      case "/reports/Society_health_score":
        return <SocietyHealthScore />;
      case "/integrations":
        return <IntegrationPage />;
      default:
        return <div>Page Not Found</div>;
    }
  }

  const toggleMode = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));

  const goToMySociety = () => {
    router.navigate("/my-society");
  };

  // Create a custom moon-style switch
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

  React.useEffect(() => {
    const collapseButton = document.querySelector(
      'button[aria-label="Collapse navigation menu"]'
    );
    if (isDesktop && collapseButton) {
      // Disable interaction
      collapseButton.disabled = true;
      collapseButton.style.pointerEvents = "none";
      collapseButton.style.opacity = "0.5"; // Optional: make it look disabled
      // Or fully hide it with:
      // collapseButton.style.display = "none";
    } else if (collapseButton) {
      // Re-enable on smaller screens
      collapseButton.disabled = false;
      collapseButton.style.pointerEvents = "auto";
      collapseButton.style.opacity = "1";
      // collapseButton.style.display = "inline-flex";
    }
  }, [isDesktop]);

  return (
    <>
      <AppProvider
        navigation={NAVIGATION}
        router={router}
        theme={demoTheme}
        window={demoWindow}
        branding={{
          title: (
            <span className="mt-1.5">
              <SangamLogo />
            </span>
          ),
          logo: (
            <div
              style={{ maxWidth: 200, cursor: "pointer" }}
              onClick={goToMySociety}
            >
              <img
                src={appLogo}
                alt="App Logo"
                style={{ width: "100%", height: "100%", marginLeft: 15 }}
              />
            </div>
          ),
        }}
      >
        <div style={{ position: "absolute", top: 10, right: 8, zIndex: 1500 }}>
          <MoonSwitch checked={mode === "dark"} onChange={toggleMode} />
        </div>

        <DashboardLayout>
          <PageContainer
            sx={{
              padding: 0,
              margin: 0,
              width: "100%",
            }}
          >
            {console.log(router.pathname)}
            {router.pathname ? (
              renderPage(router.pathname)
            ) : (
              <div>Loading...</div>
            )}
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </>
  );
}
