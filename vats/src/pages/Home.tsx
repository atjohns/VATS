import React, { useState } from 'react';
import { 
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import TeamSelectionForm from '../components/TeamSelectionForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import vatsLogo from '../assets/vats.png';
import { SportType, ALL_SPORTS, DEFAULT_SPORT } from '../constants/sports';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Home: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src={vatsLogo} 
              alt="VATS Logo" 
              style={{ 
                height: 40,
                marginRight: 12
              }} 
            />
            <Typography variant="h6" component="div">
              V.A.T.S.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar 
              src={user?.picture} 
              alt={user?.friendlyUsername || user?.username} 
              sx={{ width: 32, height: 32, mr: 1 }} 
            />
            <Typography variant="subtitle1">
              {user?.friendlyUsername || user?.username || 'User'}
            </Typography>
          </Box>
          <Button 
            color="inherit" 
            onClick={() => window.open("https://docs.google.com/document/d/1mb4BbbiSpCG0faw9xfS0WTnc7c6StA57wGuTWwpl4WI/edit?usp=sharing", "_blank", "noopener,noreferrer")}
            sx={{ mr: 2 }}
          >
            Rules
          </Button>
          {isAdmin && (
            <Button 
              color="inherit" 
              onClick={() => navigate('/admin')}
              sx={{ mr: 2 }}
            >
              Admin
            </Button>
          )}
          <Button 
            color="inherit" 
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? <CircularProgress size={24} color="inherit" /> : 'Sign Out'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="basic tabs example"
          centered
        >
          {ALL_SPORTS.map((sport, index) => (
            <Tab key={sport.id} label={sport.displayName} />
          ))}
        </Tabs>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {ALL_SPORTS.map((sport, index) => (
          <TabPanel key={sport.id} value={tabValue} index={index}>
            <TeamSelectionForm sport={sport.id} />
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default Home;