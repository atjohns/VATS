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
  Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getTeamSelections, updateTeamSelections, TeamSelection } from '../services/api';
import { fcsTeams } from '../fcs-teams';

const MAX_TEAMS = 8;

const TeamSelectionForm: React.FC = () => {
  const [selectedTeams, setSelectedTeams] = useState<TeamSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TeamSelection | null>(null);

  useEffect(() => {
    const fetchTeamSelections = async () => {
      try {
        setLoading(true);
        const selections = await getTeamSelections();
        setSelectedTeams(selections);
      } catch (error) {
        console.error('Error fetching team selections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamSelections();
  }, []);

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
    } catch (error) {
      console.error('Error saving team selections:', error);
      alert('Failed to save team selections');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        Select Your Tournament Teams
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Choose {MAX_TEAMS} college football teams for your tournament.
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            id="team-select"
            value={currentTeam}
            onChange={(_, newValue) => setCurrentTeam(newValue)}
            options={fcsTeams}
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
                key={index}
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving || selectedTeams.length !== MAX_TEAMS}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Selections'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TeamSelectionForm;