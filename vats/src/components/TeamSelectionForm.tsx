import React, { useState, useEffect } from 'react';
import { 
  Autocomplete, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  IconButton,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getTeamSelections, updateTeamSelections, TeamSelection } from '../services/api';
import { fbsTeams } from '../fbs-teams';

const MAX_TEAMS = 8;

const TeamSelectionForm: React.FC = () => {
  const [selectedTeams, setSelectedTeams] = useState<TeamSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TeamSelection | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);

  // Data loading effect
  useEffect(() => {
    const fetchTeamSelections = async () => {
      try {
        setLoading(true);
        console.log('Fetching team selections from API...');
        
        // Get team selections from API
        const selections = await getTeamSelections();
        console.log('Raw data from API:', selections);
        
        // Ensure selections is always an array with valid team objects
        let teamSelectionsArray = [];
        
        if (Array.isArray(selections)) {
          teamSelectionsArray = selections;
          console.log('Selections is already an array with length:', selections.length);
        } else if (selections && typeof selections === 'object') {
          // Try to extract teamSelections property if it exists
          const extractedSelections = (selections as any).teamSelections;
          if (Array.isArray(extractedSelections)) {
            teamSelectionsArray = extractedSelections;
            console.log('Extracted teamSelections array with length:', extractedSelections.length);
          } else {
            console.warn('Could not extract teamSelections array from object:', selections);
          }
        } else {
          console.warn('API returned invalid selections format:', typeof selections);
        }
        
        console.log('Final processed team selections:', teamSelectionsArray);
        
        // Validate each team object to ensure it has the required properties
        const validTeams = teamSelectionsArray.filter(team => {
          const isValid = Boolean(team && typeof team === 'object' && team.schoolName);
          if (!isValid) {
            console.warn('Invalid team object found:', team);
          }
          return isValid;
        });
        
        console.log('Valid teams after filtering:', validTeams);
        
        // Update state with valid team selections
        setSelectedTeams(validTeams);
        
        // Check if user has full team selections already
        const hasFullRoster = validTeams.length === MAX_TEAMS;
        console.log('Has full roster?', hasFullRoster, 'Count:', validTeams.length);
        
        setHasExistingSelections(hasFullRoster);
        
        // Start in view mode if user already has selections
        setEditMode(!hasFullRoster);
        console.log('Setting edit mode to:', !hasFullRoster);
        
      } catch (error) {
        console.error('Error fetching team selections:', error);
        setEditMode(true); // If error, default to edit mode
      } finally {
        setLoading(false);
      }
    };

    fetchTeamSelections();
  }, []);

  // Effect to handle empty teams in read-only mode
  useEffect(() => {
    console.log('Changed selections state:', selectedTeams);
    console.log('Has existing selections:', hasExistingSelections);
    console.log('Edit mode:', editMode);
    
    // Check if we're in read-only mode but have no teams to display
    if (hasExistingSelections && !editMode && (!selectedTeams || selectedTeams.length === 0)) {
      console.warn('No teams to display in read-only mode, forcing edit mode');
      setEditMode(true);
    }
  }, [selectedTeams, hasExistingSelections, editMode]);

  const handleAddTeam = () => {
    if (currentTeam && selectedTeams.length < MAX_TEAMS) {
      if (!selectedTeams.some(team => team.schoolName === currentTeam.schoolName)) {
        setSelectedTeams([...selectedTeams, currentTeam]);
      } else {
        alert('This team is already selected');
      }
      setCurrentTeam(null);
    }
  };

  const handleRemoveTeam = (index: number) => {
    const newTeams = [...selectedTeams];
    newTeams.splice(index, 1);
    setSelectedTeams(newTeams);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (selectedTeams.length !== MAX_TEAMS) {
      alert(`Please select exactly ${MAX_TEAMS} teams`);
      return;
    }
    
    try {
      setSaving(true);
      await updateTeamSelections(selectedTeams);
      alert('Team selections saved successfully');
      setHasExistingSelections(true);
      setEditMode(false); // Switch back to view mode after save
    } catch (error) {
      console.error('Error saving team selections:', error);
      alert('Failed to save team selections');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }


  // Read-only view for existing selections
  if (hasExistingSelections && !editMode) {
    console.log('RENDER: Read-only view with teams:', selectedTeams);
    
    // We don't need the setTimeout here as it's handled in the useEffect above
    // This prevents potential React warning about state updates during render
    
    return (
      <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
        <Typography variant="h5" gutterBottom>
          Your College Football Roster
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              You've selected these {selectedTeams.length} teams for your roster
            </Typography>
            
            {selectedTeams && selectedTeams.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {selectedTeams.map((team, index) => {
                  console.log(`Rendering team ${index}:`, team);
                  
                  // Guard against invalid team objects
                  if (!team || typeof team !== 'object') {
                    console.warn(`Invalid team at index ${index}:`, team);
                    return null;
                  }
                  
                  // Extract team properties with fallbacks
                  const { id, schoolName = 'Unknown School', teamName = '', location = '', conference = '' } = team;
                  
                  return (
                    <ListItem key={id || `team-${index}`} divider={index < selectedTeams.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {teamName ? teamName[0] : schoolName[0] || '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${schoolName} ${teamName}`}
                        secondary={location ? `${location}${conference ? ` • ${conference}` : ''}` : ''}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography>No teams found in your selection.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Click Edit Selections below to add teams to your roster.
                </Typography>
              </Box>
            )}
          </CardContent>
          <Divider />
          <CardActions>
            <Button 
              startIcon={<EditIcon />} 
              onClick={handleEditMode} 
              color="primary"
              sx={{ ml: 'auto' }}
            >
              Edit Selections
            </Button>
          </CardActions>
        </Card>
      </Box>
    );
  }

  // Edit mode or new selections
  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {hasExistingSelections ? 'Edit Your College Football Roster' : 'Select College Football Roster'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Choose {MAX_TEAMS} college football teams for your roster
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            id="team-select"
            value={currentTeam}
            onChange={(_, newValue) => setCurrentTeam(newValue)}
            options={fbsTeams}
            getOptionLabel={(option) => `${option.schoolName} ${option.teamName}`}
            renderInput={(params) => <TextField {...params} label="Search for college teams" />}
            isOptionEqualToValue={(option, value) => option.schoolName === value.schoolName}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar sx={{ width: 30, height: 30 }}>{option.teamName[0]}</Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2">
                      <strong>{option.schoolName}</strong> {option.teamName} 
                      <Typography variant="caption" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                        {option.location} • {option.conference}
                      </Typography>
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
          />
          <Button
            variant="outlined"
            onClick={handleAddTeam}
            disabled={!currentTeam || selectedTeams.length >= MAX_TEAMS}
            sx={{ mt: 1 }}
          >
            Add Team
          </Button>
        </Box>

        <Paper elevation={2} sx={{ mb: 3, maxHeight: 400, overflow: 'auto' }}>
          <List>
            {selectedTeams.map((team, index) => (
              <ListItem
                key={team.id || `team-${index}`}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveTeam(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar>{team.teamName[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${team.schoolName} ${team.teamName}`}
                  secondary={`${team.location} • ${team.conference}`}
                />
              </ListItem>
            ))}
            {selectedTeams.length === 0 && (
              <ListItem>
                <ListItemText primary="No teams selected yet" />
              </ListItem>
            )}
          </List>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {selectedTeams.length} of {MAX_TEAMS} teams selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {hasExistingSelections && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving || selectedTeams.length !== MAX_TEAMS}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Selections'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default TeamSelectionForm;