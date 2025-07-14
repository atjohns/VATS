import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FormHelperText,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTeamSelections, updateTeamSelections, TeamSelection } from '../services/api';
import { UserPerkSelection } from '../constants/perks';
import PerkSelector from './PerkSelector';
import { useAuth } from '../contexts/AuthContext';
import { d1Teams, D1Teams } from '../constants/d1teams';
import { SportType, SPORTS, DEFAULT_SPORT, SLOT_LABELS as SPORT_SLOT_LABELS } from '../constants/sports';


interface TeamSelectionFormProps {
  sport?: SportType; // The sport type this form handles
  readOnly?: boolean; // If true, shows read-only view initially
  initialTeams?: TeamSelection[]; // For admin/edit mode
  initialPerks?: UserPerkSelection[]; // For admin/edit mode
  initialPerkAdjustments?: { [key: string]: number }; // For admin/edit mode
  userId?: string; // For admin mode
  isAdmin?: boolean; // For admin mode
  onSave?: (teams: TeamSelection[], perks?: UserPerkSelection[], perkAdjustments?: { [key: string]: number }) => void; // For custom save handling
  onSaveSuccess?: () => void; // Callback for when save succeeds (without passing data)
}

const TeamSelectionForm: React.FC<TeamSelectionFormProps> = ({ 
  sport = DEFAULT_SPORT,
  readOnly = false,
  initialTeams = [],
  initialPerks = [],
  initialPerkAdjustments = {},
  userId,
  isAdmin = false,
  onSave,
  onSaveSuccess
}) => {
  // Get sport-specific configuration
  const sportConfig = SPORTS[sport] || SPORTS[DEFAULT_SPORT];
  const slotLabels = SPORT_SLOT_LABELS[sport] || SPORT_SLOT_LABELS[DEFAULT_SPORT];
  const maxTeams = sportConfig.maxTeams;
  // Initialize array with 8 null slots  
  const { user } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState<(TeamSelection | null)[]>(Array(maxTeams).fill(null));
  const [selectedPerks, setSelectedPerks] = useState<UserPerkSelection[]>([]);
  const [allSportsPerks, setAllSportsPerks] = useState<UserPerkSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(!readOnly);
  const [hasExistingSelections, setHasExistingSelections] = useState(false);
  const [errors, setErrors] = useState<string[]>(Array(maxTeams).fill(''));
  const [perkAdjustments, setPerkAdjustments] = useState<{[key: string]: number}>(initialPerkAdjustments || {});
  
  // Track teams selected in other sports
  const [teamsInOtherSports, setTeamsInOtherSports] = useState<TeamSelection[]>([]);

  // Use ref to track if API has been called already (won't trigger re-renders)
  const hasLoadedFromApiRef = useRef(false);

  // Initialize from initialTeams and initialPerks props if available
  // Initialize perk adjustments from props
  useEffect(() => {
    if (initialPerkAdjustments && Object.keys(initialPerkAdjustments).length > 0) {
      setPerkAdjustments(initialPerkAdjustments);
    }
  }, [initialPerkAdjustments]);
  
  useEffect(() => {
    if (initialTeams && initialTeams.length > 0 && initialTeams.some(team => team !== null)) {
      
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
    
    // Initialize perks if provided
    if (initialPerks && initialPerks.length > 0) {
      
      // Filter perks for this sport
      const sportPerks = initialPerks.filter(perk => perk.sportType === sport);
      setSelectedPerks(sportPerks);
      
      // Set all sports perks
      setAllSportsPerks(initialPerks);
    }
  }, [initialTeams, initialPerks, sport, maxTeams]);
  
  // API data fetching effect - runs once on component mount
  useEffect(() => {
    // Skip API call if we already loaded data once
    if (hasLoadedFromApiRef.current) {
      return;
    }
    
    // Only skip API call in admin mode if initialTeams are provided
    if (isAdmin && initialTeams && initialTeams.length > 0) {
      return;
    }
    
    const fetchTeamSelections = async () => {
      try {
        setLoading(true);
        
        // We already handle initialTeams in a separate useEffect
        
        // Get team selections and perks from API
        const userSelections = await getTeamSelections(userId || user?.userId || '', isAdmin);
        
        // Get perks from the response
        const fetchedPerks = userSelections.perks || [];
        setAllSportsPerks(fetchedPerks);
        
        // Filter perks for just this sport
        const sportPerks = fetchedPerks.filter(perk => perk.sportType === sport);
        setSelectedPerks(sportPerks);
        
        // Get team selections for current sport
        let teamSelectionsArray:any[] = [];
        
        // Get all team selections across all sports to track duplicates
        const allSportsTeams: TeamSelection[] = [];
        
        // Add teams from all sports
        if (Array.isArray(userSelections.footballSelections)) {
          allSportsTeams.push(...userSelections.footballSelections);
        }
        if (Array.isArray(userSelections.mensbballSelections)) {
          allSportsTeams.push(...userSelections.mensbballSelections);
        }
        if (Array.isArray(userSelections.womensbballSelections)) {
          allSportsTeams.push(...userSelections.womensbballSelections);
        }
        if (Array.isArray(userSelections.baseballSelections)) {
          allSportsTeams.push(...userSelections.baseballSelections);
        }
        if (Array.isArray(userSelections.softballSelections)) {
          allSportsTeams.push(...userSelections.softballSelections);
        }
        
        // Set teams from other sports
        setTeamsInOtherSports(allSportsTeams.filter(team => team.sport !== sport));
        
        // Set teams for current sport
        if (sport === SportType.FOOTBALL && Array.isArray(userSelections.footballSelections)) {
          teamSelectionsArray = userSelections.footballSelections;
          setPerkAdjustments(userSelections.perkAdjustments || initialPerkAdjustments)
        } else if (sport === SportType.MENS_BASKETBALL && Array.isArray(userSelections.mensbballSelections)) {
          teamSelectionsArray = userSelections.mensbballSelections;
          setPerkAdjustments(userSelections.perkAdjustments || initialPerkAdjustments)
        } else if (sport === SportType.WOMENS_BASKETBALL && Array.isArray(userSelections.womensbballSelections)) {
          teamSelectionsArray = userSelections.womensbballSelections;
          setPerkAdjustments(userSelections.perkAdjustments || initialPerkAdjustments)
        } else if (sport === SportType.BASEBALL && Array.isArray(userSelections.baseballSelections)) {
          teamSelectionsArray = userSelections.baseballSelections;
          setPerkAdjustments(userSelections.perkAdjustments || initialPerkAdjustments)
        }else if (sport === SportType.SOFTBALL && Array.isArray(userSelections.softballSelections)) {
          teamSelectionsArray = userSelections.softballSelections;
          setPerkAdjustments(userSelections.perkAdjustments || initialPerkAdjustments)
        } else {
        }
               
        // Validate each team object to ensure it has the required properties
        const validTeams = teamSelectionsArray.filter(team => {
          const isValid = Boolean(team && typeof team === 'object' && team.schoolName);
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
        console.error('Error fetching team selections');
        setEditMode(true); // If error, default to edit mode
      } finally {
        setLoading(false);
        // Mark that we've successfully loaded data
        hasLoadedFromApiRef.current = true;
      }
    };

    fetchTeamSelections();
  }, [initialTeams, userId, user?.userId, sport, isAdmin, maxTeams, user]);

  // Effect to handle empty teams in read-only mode
  useEffect(() => {   
    // Check if we're in read-only mode but have no teams to display
    if (hasExistingSelections && !editMode && 
        (!selectedTeams || selectedTeams.every(team => team === null))) {
      setEditMode(true);
    }
  }, [selectedTeams, hasExistingSelections, editMode]);

  const handleTeamChange = (index: number, newValue: D1Teams | null) => {
    const newTeams = [...selectedTeams];
    
    // Check if this team is already selected in another slot in the current sport
    const isDuplicateInSport = newValue && 
      newTeams.some((team, i) => i !== index && team && team.id === newValue.id);
    
    // Check if this team is already selected in another sport
    const isDuplicateInOtherSport = newValue && 
      teamsInOtherSports.some(team => team && team.id === newValue.id);
    
    if (isDuplicateInSport) {
      // Set error for this field
      const newErrors = [...errors];
      newErrors[index] = 'This team is already selected in another slot';
      setErrors(newErrors);
      return;
    }
    
    if (isDuplicateInOtherSport) {
      // Set error for this field
      const newErrors = [...errors];
      newErrors[index] = 'This team is already selected in another sport';
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
        onSave(teamsToSave, selectedPerks, perkAdjustments);
      } else {
        // Otherwise use the default API call
        await updateTeamSelections(
          teamsToSave, 
          userId || user?.userId || '', 
          isAdmin,
          selectedPerks,
          perkAdjustments
        );
        alert('Team selections saved successfully');
      }
      
      // Call onSaveSuccess callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      setHasExistingSelections(true);
      setEditMode(false); // Switch back to view mode after save
    } catch (error) {
      console.error('Error saving team selections');
      alert('Failed to save team selections');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handlePerkSelect = (perk: UserPerkSelection) => {
    // Check if we already have 2 perks for this sport
    const currentSportPerks = selectedPerks.filter(p => p.sportType === sport);
    if (currentSportPerks.length >= 2) {
      alert('You can only select 2 perks per sport.');
      return;
    }
    
    // Check if this perk is already selected
    if (selectedPerks.some(p => p.perkId === perk.perkId && p.sportType === sport)) {
      alert('You have already selected this perk for this sport.');
      return;
    }
    
    // Add the new perk
    setSelectedPerks([...selectedPerks, perk]);
    setAllSportsPerks([...allSportsPerks, perk]);
  };
  
  const handlePerkRemove = (perkId: string) => {
    // Remove from selected perks
    setSelectedPerks(selectedPerks.filter(p => !(p.perkId === perkId && p.sportType === sport)));
    
    // Also remove from all sports perks
    setAllSportsPerks(allSportsPerks.filter(p => !(p.perkId === perkId && p.sportType === sport)));
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
       {isAdmin && (
          <Box sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Perk Point Adjustments for {sport}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField 
                  label="Point Adjustment"
                  disabled={true}
                  value={perkAdjustments[sport] || 0}                  
                />
              </Box>
            </Paper>
          </Box>
        )}    
        {/* Team Selections Card */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                You've selected these teams for your roster
              </Typography>
              <Button 
                startIcon={<EditIcon />} 
                onClick={handleEditMode} 
                color="primary"
                size="small"
                variant="outlined"
              >
                Edit
              </Button>
            </Box>
            
            {selectedTeams && selectedTeams.some(team => team !== null) ? (
              <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {selectedTeams.map((team, index) => {
                    if (!team) return null;
                    
                    // Extract team properties with fallbacks
                    const { schoolName = 'Unknown School', conference = '' } = team;
                    
                    return (
                      <Paper 
                        key={`team-${index}`}
                        elevation={1} 
                        sx={{ p: 2, width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33% - 16px)' } }}
                      >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          {slotLabels[index]}
                        </Typography>
                        <Typography variant="body1">
                          {schoolName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {conference}
                        </Typography>
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
        </Card>

        {/* Selected Perks Card */}
        <PerkSelector
          sport={sport}
          selectedPerks={selectedPerks.filter(p => p.sportType === sport)}
          onPerkSelect={handlePerkSelect}
          onPerkRemove={handlePerkRemove}
          allUserPerks={allSportsPerks}
          availableTeams={selectedTeams.filter((team): team is TeamSelection => team !== null)
            .map(team => ({
              id: team.id,
              schoolName: team.schoolName,
              conference: team.conference || '',
              fbs: true
            })) as D1Teams[]}
          edit={false}
        />
      </Box>
    );
  }

  // Edit mode or new selections
  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>     
      <form onSubmit={handleSubmit}>
        {/* Admin-only Perk Adjustments */}
        {isAdmin && (
          <Box sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Perk Point Adjustments for {sport}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField 
                  label="Point Adjustment"
                  type="number"
                  size="small"
                  value={perkAdjustments[sport] || 0}
                  onChange={(e) => {
                    // Ensure the value is a proper number
                    const value = parseInt(e.target.value) || 0;
                    // Create a new object to ensure state update triggers correctly
                    const newAdjustments = {
                      ...perkAdjustments,
                      [sport]: value
                    };
                    setPerkAdjustments(newAdjustments);
                  }}
                  helperText="Manual adjustment to add or subtract points from total score"
                />
              </Box>
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {slotLabels.map((label, index) => {
            // Define filtering rules based on the slot index/label
            const getFilteredTeams = () => {
              const p4Conferences = ["SEC", "ACC", "Big Ten", "Big 12"];
              
              // First filter by sport
              const availableTeams = d1Teams.filter(team => {
                // For football, only show FBS teams
                if (sport === SportType.FOOTBALL) {
                  return team.fbs === true;
                } 
                // For basketball, show all teams
                else {
                  return true;
                }
              });
              
              // Ride or Die (index 0) and Wild Card (index 5) - allow any team (that's not selected elsewhere)
              if (index === 0 || index === 5) {
                return availableTeams;
              }
              // SEC (index 1)
              else if (index === 1) {
                return availableTeams.filter(team => team.conference === "SEC" || team.conference === "Southeastern Conference");
              }
              // ACC (index 2)
              else if (index === 2) {
                return availableTeams.filter(team => team.conference === "ACC" || team.conference === "Atlantic Coast Conference");
              }
              // Big Ten (index 3)
              else if (index === 3) {
                return availableTeams.filter(team => team.conference === "Big Ten" || team.conference === "Big Ten Conference");
              }
              // Big 12 (index 4)
              else if (index === 4) {
                return availableTeams.filter(team => team.conference === "Big 12" || team.conference === "Big 12 Conference");
              }
              // Non-P4 (index 6 and 7) - exclude P4 conferences
              else if (index === 6 || index === 7) {
                return availableTeams.filter(team => 
                  !p4Conferences.includes(team.conference) && 
                  team.conference !== "Southeastern Conference" &&
                  team.conference !== "Atlantic Coast Conference" &&
                  team.conference !== "Big Ten Conference" &&
                  team.conference !== "Big 12 Conference");
              }
              
              // Default case (shouldn't reach here)
              return availableTeams;
            };
            
            return (
              <Box key={`slot-${index}`} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {label}
                </Typography>
                <Autocomplete
                  id={`team-select-${index}`}
                  value={selectedTeams[index] as D1Teams | null}
                  onChange={(_, newValue) => handleTeamChange(index, newValue)}
                  options={getFilteredTeams()}
                  getOptionLabel={(option) => `${option.schoolName}`}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      error={!!errors[index]}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderOption={(props, option) => (
                    <li {...props} key={option.schoolName}>
                      <Box>
                        <Typography variant="body2">
                          <strong>{option.schoolName}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.conference}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  getOptionDisabled={(option) => {
                    // Disable options that are already selected in other sports
                    return teamsInOtherSports.some(team => team.id === option.id);
                  }}
                />
                {errors[index] && <FormHelperText error>{errors[index]}</FormHelperText>}
                
                {/* Remove admin-only score fields */}
              </Box>
            );
          })}
        </Box>                

        {/* Perk Selector */}
        <PerkSelector
          sport={sport}
          selectedPerks={selectedPerks.filter(p => p.sportType === sport)}
          onPerkSelect={handlePerkSelect}
          onPerkRemove={handlePerkRemove}
          allUserPerks={allSportsPerks}
          availableTeams={selectedTeams.filter((team): team is TeamSelection => team !== null)
            .map(team => ({
              id: team.id,
              schoolName: team.schoolName,
              conference: team.conference || '',
              fbs: true
            })) as D1Teams[]}
          edit={true}
        />

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