import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserTeamName } from '../services/userService';

const Profile: React.FC = () => {
  const { user, refreshUserAttributes } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize team name from user's preferred_username if available
    if (user?.teamName) {
      setTeamName(user.teamName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserTeamName(teamName);
      setSuccess(true);
      // Refresh user attributes to get the updated team name
      await refreshUserAttributes();
    } catch (err) {
      console.error('Error updating team name:', err);
      setError('Failed to update team name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/home')}
            aria-label="back"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Profile Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Team Profile
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Team name updated successfully!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Team Name"
              variant="outlined"
              fullWidth
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              helperText="This name will be displayed on the leaderboard and in your profile"
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 30 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !teamName.trim()}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Team Name'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
