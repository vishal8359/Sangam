import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { createTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import GroupsIcon from '@mui/icons-material/Groups';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CampaignIcon from '@mui/icons-material/Campaign';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PollIcon from '@mui/icons-material/Poll';
import ForumIcon from '@mui/icons-material/Forum';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SocietyLogo from './logo';
import Switch from '@mui/material/Switch';
import SangamLogo from './sangamLogo';
import MySociety from '../pages/MySociety';
import Typography from '@mui/material/Typography';
import WhiteBox from './box';
import appLogo from '../assets/appLogo.png'


const NAVIGATION = [
  {
    kind: 'header',
    title: 'Dashboard',
  },
  { 
    segment: 'home',
    title: 'My society',
    icon: <HomeIcon />,
    path: '/my-society',
    children: [
      { segment: 'chats', title: 'Chats', icon: <ForumIcon />, path: '/my-society/chats' },
      { segment: 'polls', title: 'Polls', icon: <PollIcon />, path: '/my-society/polls' },
      { segment: 'ads', title: 'New products', icon: <LocalOfferIcon />, path: '/my-society/ads' },
      { segment: 'complains', title: 'Complains', icon: <ReportProblemIcon />, path: '/my-society/complains' },
      { segment: 'events', title: 'Events', icon: <EventIcon />, path: '/my-society/events' },
      { segment: 'notices', title: 'Notices', icon: <CampaignIcon />, path: '/my-society/notices' },
    ],
  },
  {
    segment: 'feed',
    title: 'Society Buzz',
    icon: <DynamicFeedIcon />,
  },
  {
    segment: 'neighbours',
    title: 'Neighbours',
    icon: <GroupsIcon />,
  },
  {
    segment: 'gallery',
    title: 'Gallery',
    icon: <PhotoLibraryIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Analytics',
  },
  {
    segment: 'reports',
    title: 'Reports',
    icon: <BarChartIcon />,
    children: [
      {
        segment: 'user_engagement',
        title: 'User Engagement',
        icon: <ShowChartIcon />,
      },
      {
        segment: 'top_contributors',
        title: 'Top Contributors',
        icon: <MilitaryTechIcon />,
      },
      {
        segment: 'Society_health_score',
        title: 'Society Health Score',
        icon: <HealthAndSafetyIcon />,
      },
      {
        segment: 'age_groups',
        title: 'Age Groups',
        icon: <Diversity3Icon />,
      },
    ],
  },
  {
    segment: 'integrations',
    title: 'Integrations',
    icon: <LayersIcon />,
  },
];


function useDemoRouter(initialPath = '/') {
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

  return React.useMemo(() => ({
    pathname: location.pathname,
    searchParams: location.searchParams,
    navigate,
  }), [location, navigate]);
}



export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const [mode, setMode] = React.useState(() => window?.localStorage.getItem('theme') || 'light');


  const router = useDemoRouter('/my-society');
  const demoWindow = window ? window() : undefined;

  const demoTheme = React.useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: 'Outfit, sans-serif',
        },
        palette: {
          mode,
          primary: {
            main: '#6B21A8',
            dark: '#5C6BC0',
          },
          text: {
            primary: mode === 'light' ? '#212121' : '#E5E5E5',
            secondary: '#757575',
          },
          background: {
            default: mode === 'light' ? '#E5E5E5' : '#121212',
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#e8e8e8' : '#000000',
                color: mode === 'light' ? '#E5E5E5' : '#fff',
                boxShadow: 'none',
                borderBottom: mode === 'light' ? '1px solid #ccc' : '1px solid #333',
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#5C6BC0',
                },
              },
            },
          },
          MuiListItemText: {
            styleOverrides: {
              primary: {
                color: 'var(--mui-palette-text-primary)',
                fontWeight: 700,
              },
            },
          },
          MuiListItemIcon: {
            styleOverrides: {
              root: {
                color: '#D8B4FE',
              },
            },
          },
        },
      }),
    [mode]
  );
  function renderPage(pathname) {
    switch (pathname) {
      case '/':
        return <MySociety/>
      case '/my-society':
        return <MySociety />;
      case '/my-society/chats':
        return <ChatsPage />;
      case '/my-society/polls':
        return <PollsPage />;
      // ... add other cases
      default:
        return <div>Page Not Found</div>;
    }
  }

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const goToMySociety = () => {
    router.push('/my-society')
  }

// Create a custom moon-style switch
  const MoonSwitch = styled(Switch)(({ theme }) => ({
    width: 60,
    height: 34,
    padding: 8,
    '& .MuiSwitch-switchBase': {
      margin: 2,
      padding: 0,
      transform: 'translateX(5px)',
      '&.Mui-checked': {
        transform: 'translateX(22px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,

          opacity: 1,
          border: 0,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: '#fff',
      width: 28,
      height: 28,
      borderRadius: '50%',
      boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.2)',
      position: 'relative',
      '&:before': {
        content: '"☀️"',
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb:before': {
      content: '"🌙"',
    },

    '& .MuiSwitch-track': {
      borderRadius: 20 / 2,
      backgroundColor: '#ccc',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));


  return (
    
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
      
      branding={{
      title: (
        <span className='mt-1.5'>
          <SangamLogo/>
        </span>
      ),
      logo: (
        <div style={{ maxWidth: 200, cursor: 'pointer' }}
        onClick={goToMySociety}>
          <img src={appLogo} alt="App Logo" style={{ width: '100%', height: '100%', marginLeft: 15}} />
        </div>
      ),
      
      }}
      
    >

      {/* Theme toggle switch fixed top-right */}
      
      <div style={{ position: 'absolute', top: 10, right: 8, zIndex: 1500 }}>
        <MoonSwitch checked={mode === 'dark'} onChange={toggleMode} />
      </div>


      <DashboardLayout>
        <PageContainer sx={{
          padding: 0,
          margin: 0,
        }}>
          {router.pathname ? renderPage(router.pathname) : <div>Loading...</div>}

        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
