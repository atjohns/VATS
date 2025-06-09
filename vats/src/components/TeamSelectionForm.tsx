import React, { useState, useEffect, useRef } from 'react';
import { 
  Autocomplete, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Paper,
  Divider,
  Card,
  CardContent,
  CardActions,
  FormHelperText,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTeamSelections, updateTeamSelections, TeamSelection } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { fbsTeams, FBSTeam } from '../fbs-teams';
import { SportType, SPORTS, DEFAULT_SPORT, SLOT_LABELS as SPORT_SLOT_LABELS } from '../constants/sports';

// MAX_TEAMS is now dynamically set from sportConfig.maxTeams

interface TeamSelectionFormProps {
  sport?: SportType; // The sport type this form handles
  readOnly?: boolean; // If true, shows read-only view initially
  initialTeams?: TeamSelection[]; // For admin/edit mode
  userId?: string; // For admin mode
  isAdmin?: boolean; // For admin mode
  onSave?: (teams: TeamSelection[]) => void; // For custom save handling
}

const TeamSelectionForm: React.FC<TeamSelectionFormProps> = ({ 
  sport = DEFAULT_SPORT,
  readOnly = false,
  initialTeams = [],
  userId,
  isAdmin = false,
  onSave
}) => {
  // Get sport-specific configuration
  const sportConfig = SPORTS[sport] || SPORTS[DEFAULT_SPORT];
  const slotLabels = SPORT_SLOT_LABELS[sport] || SPORT_SLOT_LABELS[DEFAULT_SPORT];
  const maxTeams = sportConfig.maxTeams;
  // Initialize array with 8 null slots  
  const { user } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState<(TeamSelection | null)[]>(Array(maxTeams).fill(null));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(!readOnly);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);
  const [errors, setErrors] = useState<string[]>(Array(maxTeams).fill(''));

  // Use ref to track if API has been called already (won't trigger re-renders)
  const hasLoadedFromApiRef = useRef(false);

  // Initialize from initialTeams prop if available
  useEffect(() => {
    if (initialTeams && initialTeams.length > 0 && initialTeams.some(team => team !== null)) {
      console.log('Initializing from initialTeams prop');
      
      // Filter by sport if needed
      const sportFiltered = initialTeams.filter(
        (team: TeamSelection) => !team.sport || team.sport === sport
      );
      
      // Create an array of maxTeams length with the valid teams or null
      const teamsArray = Array(maxTeams).fill(null);
      sportFiltered.forEach((team, index) => {
        if (index < maxTeams) {
          teamsArray[index] = team;
        }
      });
      
      setSelectedTeams(teamsArray);
      setHasExistingSelections(sportFiltered.length > 0);
    }
  }, [initialTeams, sport, maxTeams]);
  
  // API data fetching effect - runs once on component mount
  useEffect(() => {
    // Skip API call if we already loaded data once
    if (hasLoadedFromApiRef.current) {
      console.log('Skipping API call - data already loaded');
      return;
    }
    
    // Admin mode should never make API calls
    if (isAdmin) {
      console.log('Admin mode - skipping API call');
      return;
    }
    
    const fetchTeamSelections = async () => {
      try {
        setLoading(true);
        
        // We already handle initialTeams in a separate useEffect
        
        console.log('User', user);
        // Get team selections from API
        const selections = await getTeamSelections(userId || user?.userId || '', isAdmin);
        
        // Filter selections based on sport if needed
        const sportFiltered = selections.filter(
          (team: TeamSelection) => !team.sport || team.sport === sport
        );
        
        // Ensure selections is always an array with valid team objects
        let teamSelectionsArray = [];
        
        if (Array.isArray(selections)) {
          teamSelectionsArray = sportFiltered; // Use the filtered selections based on sport
        } else if (selections && typeof selections === 'object') {
          // Try to extract teamSelections property if it exists
          const extractedSelections = (selections as any).teamSelections;
          if (Array.isArray(extractedSelections)) {
            teamSelectionsArray = extractedSelections.filter(
              (team: TeamSelection) => !team.sport || team.sport === sport
            );
          } else {
            console.warn('Could not extract teamSelections array from object:', selections);
          }
        } else {
          console.warn('API returned invalid selections format:', typeof selections);
        }
               
        // Validate each team object to ensure it has the required properties
        const validTeams = teamSelectionsArray.filter(team => {
          const isValid = Boolean(team && typeof team === 'object' && team.schoolName);
          if (!isValid) {
            console.warn('Invalid team object found:', team);
          }
          return isValid;
        });
                
        // Create an array of maxTeams length with the valid teams or null
        const teamsArray = Array(maxTeams).fill(null);
        validTeams.forEach((team, index) => {
          if (index < maxTeams) {
            teamsArray[index] = team;
          }
        });
        
        // Update state with valid team selections
        setSelectedTeams(teamsArray);
        
        // Check if user has full team selections already
        const hasFullRoster = validTeams.length === maxTeams && 
                             validTeams.every(team => team !== null);
        
        setHasExistingSelections(hasFullRoster);
        
        // Start in view mode if user already has selections
        setEditMode(!hasFullRoster);
        
      } catch (error) {
        console.error('Error fetching team selections:', error);
        setEditMode(true); // If error, default to edit mode
      } finally {
        setLoading(false);
        // Mark that we've successfully loaded data
        hasLoadedFromApiRef.current = true;
      }
    };

    console.log('Starting team selections fetch');
    fetchTeamSelections();
  }, [initialTeams, userId, user?.userId, sport, isAdmin]);

  // Effect to handle empty teams in read-only mode
  useEffect(() => {   
    // Check if we're in read-only mode but have no teams to display
    if (hasExistingSelections && !editMode && 
        (!selectedTeams || selectedTeams.every(team => team === null))) {
      console.warn('No teams to display in read-only mode, forcing edit mode');
      setEditMode(true);
    }
  }, [selectedTeams, hasExistingSelections, editMode]);

  const handleTeamChange = (index: number, newValue: FBSTeam | null) => {
    const newTeams = [...selectedTeams];
    
    // Check if this team is already selected in another slot
    const isDuplicate = newValue && 
      newTeams.some((team, i) => i !== index && team && team.id === newValue.id);
    
    if (isDuplicate) {
      // Set error for this field
      const newErrors = [...errors];
      newErrors[index] = 'This team is already selected in another slot';
      setErrors(newErrors);
      return;
    }
    
    // Clear error if exists
    if (errors[index]) {
      const newErrors = [...errors];
      newErrors[index] = '';
      setErrors(newErrors);
    }
    
    // Cast the FBSTeam to TeamSelection since they have the same structure
    // Add the sport property
    newTeams[index] = newValue ? {
      ...newValue as TeamSelection,
      sport: sport
    } : null;
    
    setSelectedTeams(newTeams);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check if all slots are filled
    if (selectedTeams.some(team => team === null)) {
      alert(`Please select a team for each slot`);
      return;
    }
    
    // Filter out null values (this is just a safety check, shouldn't happen if all slots are filled)
    const teamsToSave = selectedTeams.filter((team): team is TeamSelection => team !== null);
    
    try {
      setSaving(true);
      
      // If a custom onSave handler is provided, use it instead
      if (onSave) {
        onSave(teamsToSave);
      } else {
        // Otherwise use the default API call
        await updateTeamSelections(teamsToSave, userId || user?.userId || '', isAdmin);
        alert('Team selections saved successfully');
      }
      
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
    return (
      <Box sx={{ maxWidth: 800, margin: '0 auto' }}>       
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              You've selected these teams for your roster
            </Typography>
            
            {selectedTeams && selectedTeams.some(team => team !== null) ? (
              <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {selectedTeams.map((team, index) => {
                    if (!team) return null;
                    
                    // Extract team properties with fallbacks
                    const { id, schoolName = 'Unknown School', teamName = '', location = '', conference = '', regularSeasonPoints = 0, postseasonPoints = 0 } = team;
                    
                    return (
                      <Paper 
                        key={id || `team-${index}`}
                        elevation={1} 
                        sx={{ p: 2, width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33% - 16px)' } }}
                      >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {slotLabels[index]}
                        </Typography>
                        <Typography variant="body1">
                          {schoolName} {teamName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location} • {conference}
                        </Typography>
                        {/* Remove points display */}
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
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
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {hasExistingSelections ? `Edit Your ${sportConfig.displayName} Roster` : `Select ${sportConfig.displayName} Roster`}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Choose a {sportConfig.displayName.toLowerCase()} team for each of the {maxTeams} slots
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {slotLabels.map((label, index) => {
            // Define filtering rules based on the slot index/label
            const getFilteredTeams = () => {
              const p4Conferences = ["SEC", "ACC", "Big Ten", "Big 12"];
              
              // Ride or Die (index 0) and Wild Card (index 5) - allow any team
              if (index === 0 || index === 5) {
                return fbsTeams;
              }
              // SEC (index 1)
              else if (index === 1) {
                return fbsTeams.filter(team => team.conference === "SEC");
              }
              // ACC (index 2)
              else if (index === 2) {
                return fbsTeams.filter(team => team.conference === "ACC");
              }
              // Big Ten (index 3)
              else if (index === 3) {
                return fbsTeams.filter(team => team.conference === "Big Ten");
              }
              // Big 12 (index 4)
              else if (index === 4) {
                return fbsTeams.filter(team => team.conference === "Big 12");
              }
              // Non-P4 (index 6 and 7) - exclude P4 conferences
              else if (index === 6 || index === 7) {
                return fbsTeams.filter(team => !p4Conferences.includes(team.conference));
              }
              
              // Default case (shouldn't reach here)
              return fbsTeams;
            };
            
            return (
              <Box key={`slot-${index}`} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {label}
                </Typography>
                <Autocomplete
                  id={`team-select-${index}`}
                  value={selectedTeams[index] as FBSTeam | null}
                  onChange={(_, newValue) => handleTeamChange(index, newValue)}
                  options={getFilteredTeams()}
                  getOptionLabel={(option) => `${option.schoolName} ${option.teamName}`}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      error={!!errors[index]}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">
                          <strong>{option.schoolName}</strong> {option.teamName} 
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.location} • {option.conference}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                {errors[index] && <FormHelperText error>{errors[index]}</FormHelperText>}
                
                {/* Remove admin-only score fields */}
              </Box>
            );
          })}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedTeams.filter(team => team !== null).length} of {maxTeams} slots filled
          </Typography>
          <Stack direction="row" spacing={2}>
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
              disabled={saving || selectedTeams.some(team => team === null)}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Selections'}
            </Button>
          </Stack>
        </Box>
      </form>
    </Box>
  );
};

export default TeamSelectionForm;