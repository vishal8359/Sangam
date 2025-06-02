import * as React from 'react';
import { createTheme, styled } from '@mui/material/styles';
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

import appLogo from '../assets/appLogo.png'

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Dashboard',
  },
  {
    segment: 'home',
    title: 'My society',
    icon: < HomeIcon />,
    children: [
      {
        segment: 'chats',
        title: 'Chats',
        icon: <ForumIcon />,
      },
      {
        segment: 'polls',
        title: 'Polls',
        icon: <PollIcon />,
      },
      {
        segment: 'ads',
        title: 'New products',
        icon: <LocalOfferIcon />,
      },
      {
        segment: 'complains',
        title: 'Complains',
        icon: <ReportProblemIcon />,
      },
      {
        segment: 'events',
        title: 'Events',
        icon: <EventIcon />,
      },
      {
        segment: 'notices',
        title: 'Notices',
        icon: <CampaignIcon />,
      },
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

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

export default function DashboardLayoutBasic(props) {
  const { window } = props;
  const [mode, setMode] = React.useState('light');

  const router = useDemoRouter('/dashboard');
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
            main: '#3F51B5',
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
                  color: '#A271F7',
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

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

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
        <div style={{ maxWidth: 200 }}>
          <img src={appLogo} alt="App Logo" style={{ width: '100%', height: '100%', marginLeft: 15}} />
        </div>
      ),

      }}
    >
      {/* Theme toggle switch fixed top-right */}
      <div style={{ position: 'absolute', top: 16, right: 30, zIndex: 1500}}>
        <Switch checked={mode === 'dark'} onChange={toggleMode} />
      </div>

      <DashboardLayout>
        <PageContainer>
          <Grid container spacing={1}>
            <Grid item xs={5} />
            <Grid item xs={12}>
              <Skeleton height={14} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton height={14} />
            </Grid>
            <Grid item xs={4}>
              <Skeleton height={100} />
            </Grid>
            <Grid item xs={8}>
              <Skeleton height={100} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton height={150} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton height={14} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton height={100} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton height={100} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton height={100} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton height={100} />
            </Grid>
          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
