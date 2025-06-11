import React, { useState, useEffect } from 'react';
import { 
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import vatsLogo from '../assets/vats.png';
import { getAllUsers } from '../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import TeamSelectionForm from '../components/TeamSelectionForm';
import TeamScores from '../components/TeamScores';
import { SportType, ALL_SPORTS, DEFAULT_SPORT } from '../constants/sports';
import { Tabs, Tab } from '@mui/material';

interface User {
  userId: string;
  username: string;
  email?: string;
  name?: string;
}

// Using TeamSelection from api.ts instead of redefining here

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // No longer need separate state for team selections, perks, and adjustments
  // TeamSelectionForm will handle this internally
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType>(DEFAULT_SPORT);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const { signOut, isAdmin } = useAuth(); // Remove unused 'user' variable
  const navigate = useNavigate();

  // Load all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle loading state for user selections
  useEffect(() => {
    // Just manage loading state - TeamSelectionForm will handle fetching the data
    if (selectedUser) {
      setLoadingTeams(true);
      // Reset team form display when user or sport changes
      setShowTeamForm(false);
      
      // Small delay to ensure loading indicator shows
      const timer = setTimeout(() => {
        setLoadingTeams(false);
        setError(null);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedUser, selectedSport]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  
  const handleSportChange = (event: SelectChangeEvent) => {
    setSelectedSport(event.target.value as SportType);
  };
  


  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          You do not have permission to access this page.
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/home')}
        >
          Return to Home
        </Button>
      </Container>
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
              V.A.T.S. Admin
            </Typography>
          </Box>
          <Button 
            color="inherit" 
            onClick={() => navigate('/home')}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Home
          </Button>
          <Button 
            color="inherit" 
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="admin tabs"
          >
            <Tab label="User Selections" />
            <Tab label="Team Scores" />
          </Tabs>
        </Box>
        
        {/* Tab 0: User Selections */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* User Selection Panel */}
            <Paper sx={{ width: 300, p: 2, maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Users</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <SearchIcon fontSize="small" color="action" />
                </Box>
              </Box>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <React.Fragment key={user.userId}>
                      <ListItemButton
                        selected={selectedUser?.userId === user.userId}
                        onClick={() => handleUserSelect(user)}
                      >
                        <ListItemText 
                          primary={user.name || user.username} 
                          secondary={user.email}
                        />
                      </ListItemButton>
                      <Divider />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No users found" />
                  </ListItem>
                )}
              </List>
            )}
          </Paper>

          {/* Team Selections Display */}
          <Paper sx={{ flexGrow: 1, p: 2, maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}>
            {selectedUser ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Team Selections for {selectedUser.name || selectedUser.username}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="sport-select-label">Sport</InputLabel>
                      <Select
                        labelId="sport-select-label"
                        value={selectedSport}
                        label="Sport"
                        onChange={handleSportChange}
                      >
                        {ALL_SPORTS.map(sport => (
                          <MenuItem key={sport.id} value={sport.id}>
                            {sport.displayName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {loadingTeams ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  // Let TeamSelectionForm handle all data fetching and processing
                  <TeamSelectionForm 
                    sport={selectedSport}
                    userId={selectedUser.userId}
                    isAdmin={true}
                    readOnly={!showTeamForm}
                  />
                )}
              </>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                Select a user from the list to view their team selections.
              </Typography>
            )}
          </Paper>
        </Box>
        )}
        
        {/* Tab 1: Team Scores */}
        {activeTab === 1 && (
          <TeamScores isAdmin={isAdmin} />
        )}
      </Container>
      
    </Box>
  );
};

export default Admin;