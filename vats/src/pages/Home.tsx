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
  Avatar,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import TeamSelectionForm from '../components/TeamSelectionForm';
import Leaderboard from '../components/Leaderboard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import vatsLogo from '../assets/vats.png';
import { SportType, ALL_SPORTS } from '../constants/sports';

// Define Overall as a special type
const OVERALL = 'overall';

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
  // Main tab index: sports (0, 1, ...) or leaderboard (ALL_SPORTS.length)
  const [tabIndex, setTabIndex] = useState(0);
  // Selected sport for the leaderboard
  const [selectedLeaderboardSport, setSelectedLeaderboardSport] = useState<string>(OVERALL);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleLeaderboardSportChange = (event: SelectChangeEvent) => {
    setSelectedLeaderboardSport(event.target.value as SportType);
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
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="main-tabs"
          centered
        >
          {/* Sports tabs for team selections */}
          {ALL_SPORTS.map((sport) => (
            <Tab key={sport.id} label={sport.displayName} />
          ))}
          
          {/* Leaderboard tab */}
          <Tab label="Leaderboard" />
        </Tabs>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Sport-specific team selection panels */}
        {ALL_SPORTS.map((sport, i) => (
          <TabPanel key={sport.id} value={tabIndex} index={i}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>{sport.displayName} Selections</Typography>
              <Divider sx={{ mb: 2 }} />
              <TeamSelectionForm sport={sport.id} />
            </Paper>
          </TabPanel>
        ))}
        
        {/* Leaderboard panel with sport selector */}
        <TabPanel value={tabIndex} index={ALL_SPORTS.length}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Leaderboard</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="leaderboard-sport-select-label">Sport</InputLabel>
                <Select
                  labelId="leaderboard-sport-select-label"
                  value={selectedLeaderboardSport}
                  label="Sport"
                  onChange={handleLeaderboardSportChange}
                >
                  <MenuItem value={OVERALL}>
                    Overall
                  </MenuItem>
                  {ALL_SPORTS.map(sport => (
                    <MenuItem key={sport.id} value={sport.id}>
                      {sport.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Leaderboard sport={selectedLeaderboardSport} />
          </Paper>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default Home;