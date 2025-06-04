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
  CircularProgress
} from '@mui/material';
import ProfileForm from '../components/ProfileForm';
import TeamSelectionForm from '../components/TeamSelectionForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, signOut, isLoading } = useAuth();
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            V.A.T.S.
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Hello, {user?.username || 'User'}
          </Typography>
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
          <Tab label="College Football" />
          <Tab label="Your Profile" />
        </Tabs>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <TabPanel value={tabValue} index={0}>
          <TeamSelectionForm />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ProfileForm />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Home;