import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  Autocomplete,
  FormControl,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { 
  AVAILABLE_PERKS, 
  PerkInputType, 
  UserPerkSelection,
  getPerkById,
  canSelectPerk
} from '../constants/perks';
import { SportType } from '../constants/sports';
import { D1Teams, d1Teams } from '../constants/d1teams';
import { User, getAllUsers, formatUserDisplayName } from '../services/userService';

interface PerkSelectorProps {
  sport: SportType;
  selectedPerks: UserPerkSelection[];
  onPerkSelect: (perk: UserPerkSelection) => void;
  onPerkRemove: (perkId: string) => void;
  allUserPerks?: UserPerkSelection[]; // All perks across sports
  availableTeams?: D1Teams[];  // Teams that can be selected for team inputs
  edit: boolean;
}

const PerkSelector: React.FC<PerkSelectorProps> = ({
  sport,
  selectedPerks,
  onPerkSelect,
  onPerkRemove,
  allUserPerks = [],
  availableTeams = [],
  edit = true
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerkId, setSelectedPerkId] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<{[key: string]: any}>({});
  const [inputErrors, setInputErrors] = useState<{[key: string]: string}>({});
  const [activeStep, setActiveStep] = useState(0); // For stepper
  const [stepperPerk, setStepperPerk] = useState<string | null>(null); // Perk being configured in stepper
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Filter to only show perks for current sport
  const currentSportPerks = selectedPerks.filter(p => p.sportType === sport);
  
  // Get total usage count for each perk
  const perkUsageCounts = allUserPerks.reduce((counts: {[key: string]: number}, perk) => {
    counts[perk.perkId] = (counts[perk.perkId] || 0) + 1;
    return counts;
  }, {});

  // Load users when needed
  useEffect(() => {
    async function fetchUsers() {
      if (dialogOpen && !users.length) {
        setLoadingUsers(true);
        try {
          const allUsers = await getAllUsers();
          setUsers(allUsers);
        } catch (error) {
          console.error('Failed to load users for player selection:', error);
        } finally {
          setLoadingUsers(false);
        }
      }
    }
    
    fetchUsers();
  }, [dialogOpen, users.length]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setSelectedPerkId(null);
    setInputValues({});
    setInputErrors({});
    setActiveStep(0);
    setStepperPerk(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePerkSelect = (perkId: string | null) => {
    setSelectedPerkId(perkId);
    setInputValues({});
    setInputErrors({});
    
    // Always move to the next step if a perk is selected, even if it has no inputs
    if (perkId) {
      setActiveStep(1);
      setStepperPerk(perkId);
    }
  };

  const handleInputChange = (inputType: string, value: any) => {
    setInputValues({
      ...inputValues,
      [inputType]: value
    });
    
    // Clear error for this input if it exists
    if (inputErrors[inputType]) {
      const newErrors = {...inputErrors};
      delete newErrors[inputType];
      setInputErrors(newErrors);
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };
  
  const handleNext = () => {
    // If on step 0 (perk selection), must have a perk selected
    if (activeStep === 0) {
      if (!selectedPerkId) return;
      
      // Always move to step 2 for a full description view
      setActiveStep(1);
      setStepperPerk(selectedPerkId);
    }
  };

  const handleAddPerk = () => {
    if (!selectedPerkId) return;
    
    const perk = getPerkById(selectedPerkId);
    if (!perk) return;
    
    // For perks with no inputs, add immediately
    if (!perk.inputs || perk.inputs.length === 0) {
      const newPerkSelection: UserPerkSelection = {
        perkId: selectedPerkId,
        sportType: sport,
        inputs: {}
      };
      
      onPerkSelect(newPerkSelection);
      handleCloseDialog();
      return;
    }
    
    // For perks with inputs that are in step 2, validate
    if (activeStep === 1) {
      let hasErrors = false;
      const newErrors: {[key: string]: string} = {};
      
      perk.inputs?.forEach(input => {
        if (input.required && !inputValues[input.type]) {
          newErrors[input.type] = `${input.label} is required`;
          hasErrors = true;
        }
      });
      
      if (hasErrors) {
        setInputErrors(newErrors);
        return;
      }
      
      // Create new perk selection
      const newPerkSelection: UserPerkSelection = {
        perkId: selectedPerkId,
        sportType: sport,
        inputs: inputValues
      };
      
      onPerkSelect(newPerkSelection);
      handleCloseDialog();
    }
  };
  
  const renderPerkInputs = () => {
    if (!selectedPerkId) return null;
    
    const perk = getPerkById(selectedPerkId);
    if (!perk || !perk.inputs || perk.inputs.length === 0) return null;
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Additional Information Needed
        </Typography>
        
        {perk.inputs.map((input, index) => {
          switch (input.type) {
            case PerkInputType.TEAM:
              return (
                <FormControl 
                  key={`${input.type}-${index}`} 
                  fullWidth 
                  margin="dense"
                  error={!!inputErrors[input.type]}
                >
                  <Autocomplete
                    id={`team-input-${index}`}
                    options={availableTeams.length > 0 ? availableTeams : d1Teams}
                    getOptionLabel={(option) => `${option.schoolName}`}
                    value={inputValues[input.type] || null}
                    onChange={(_, newValue) => handleInputChange(input.type, newValue)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label={input.label}
                        placeholder={input.placeholder}
                        error={!!inputErrors[input.type]}
                        helperText={inputErrors[input.type]}
                      />
                    )}
                  />
                </FormControl>
              );
              
            case PerkInputType.OPPONENT:
              return (
                <FormControl 
                  key={`${input.type}-${index}`} 
                  fullWidth 
                  margin="dense"
                  error={!!inputErrors[input.type]}
                >
                  <Autocomplete
                    id={`opponent-input-${index}`}
                    options={d1Teams.filter(team => !availableTeams.some(selectedTeam => selectedTeam.schoolName === team.schoolName))}
                    getOptionLabel={(option) => `${option.schoolName}`}
                    value={inputValues[input.type] || null}
                    onChange={(_, newValue) => handleInputChange(input.type, newValue)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label={input.label}
                        placeholder={input.placeholder}
                        error={!!inputErrors[input.type]}
                        helperText={inputErrors[input.type]}
                      />
                    )}
                  />
                </FormControl>
              );
              
            case PerkInputType.PLAYER:
              return (
                <FormControl 
                  key={`${input.type}-${index}`} 
                  fullWidth 
                  margin="dense"
                  error={!!inputErrors[input.type]}
                >
                  {loadingUsers ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Loading users...</Typography>
                    </Box>
                  ) : (
                    <Autocomplete
                      id={`player-input-${index}`}
                      options={users}
                      getOptionLabel={(option) => formatUserDisplayName(option)}
                      value={inputValues[input.type] || null}
                      onChange={(_, newValue) => handleInputChange(input.type, newValue)}
                      isOptionEqualToValue={(option, value) => 
                        option.userId === value?.userId || option.username === value?.username
                      }
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label={input.label}
                          placeholder={input.placeholder}
                          error={!!inputErrors[input.type]}
                          helperText={inputErrors[input.type]}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.userId}>
                          <Typography>{formatUserDisplayName(option)}</Typography>
                        </li>
                      )}
                    />
                  )}
                </FormControl>
              );
              
            case PerkInputType.DATE:
              return (
                <FormControl 
                  key={`${input.type}-${index}`} 
                  fullWidth 
                  margin="dense"
                  error={!!inputErrors[input.type]}
                >
                  <TextField
                    type="date"
                    label={input.label}
                    value={inputValues[input.type] || ''}
                    onChange={(e) => handleInputChange(input.type, e.target.value)}
                    error={!!inputErrors[input.type]}
                    helperText={inputErrors[input.type]}
                    slotProps={{
                      inputLabel: {
                        shrink: true
                      }
                    }}
                  />
                </FormControl>
              );
              
            default:
              return null;
          }
        })}
      </Box>
    );
  };

  // Render selected perks
  const renderSelectedPerks = () => {
    if (currentSportPerks.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No perks selected for this sport.
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
        {currentSportPerks.map((perkSelection) => {
          const perk = getPerkById(perkSelection.perkId);
          if (!perk) return null;
          
          return (
            <Box key={perkSelection.perkId} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex' }}>
                  {/* For now, we'll use a colored placeholder instead of an image */}
                  <Box sx={{ 
                    width: 80,
                    backgroundImage: `url(${perk.image})`,    
                    backgroundRepeat: "no-repeat",        
                    bgcolor: `hsl(${parseInt(perkSelection.perkId, 36) % 360}, 70%, 80%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}/>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '70%' }}>
                    <CardContent sx={{ pb: 0 }}>
                      <Typography variant="subtitle1" component="div">
                        {perk.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {perk.description}
                      </Typography>
                    </CardContent>
                  </Box>
                </Box>
                
                {/* Parameters display */}
                {perkSelection.inputs && Object.keys(perkSelection.inputs).length > 0 && (
                  <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    {perk.inputs?.map((input, idx) => {
                      const inputValue = perkSelection.inputs?.[input.type];
                      if (!inputValue) return null;
                      
                      return (
                        <Box key={`param-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{input.label}:</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {typeof inputValue === 'object' && inputValue !== null ? (
                              'schoolName' in inputValue ? 
                                String(inputValue.schoolName) : 
                                'userId' in inputValue ? 
                                  formatUserDisplayName(inputValue as unknown as User) : 
                                  String(inputValue)
                            ) : String(inputValue)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                
                {edit && <CardActions>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => onPerkRemove(perkSelection.perkId)}
                  >
                    Remove
                  </Button>
                </CardActions>}
              </Card>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Check if user has reached the limit of perks for this sport
  const hasReachedSportLimit = currentSportPerks.length >= 2;
  
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Perks ({currentSportPerks.length}/2)
        </Typography>
        {edit && <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          disabled={hasReachedSportLimit} 
        >
          Add Perk
        </Button>}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        {renderSelectedPerks()}
      </Box>
      
      {/* Perk Selection Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {activeStep === 0 ? 'Select a Perk' : 'Configure Perk'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Select Perk</StepLabel>
            </Step>
            <Step>
              <StepLabel>Configure Parameters</StepLabel>
            </Step>
          </Stepper>
          
          {activeStep === 0 ? (
            // Step 1: Perk Selection
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
              {AVAILABLE_PERKS.map(perk => {
                const isSelected = selectedPerkId === perk.id;
                const usageCount = perkUsageCounts[perk.id] || 0;
                const isDisabled = usageCount >= perk.maxUses || !canSelectPerk(perk.id);
                
                return (
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }} key={perk.id}>
                    <Card 
                      variant={isSelected ? "elevation" : "outlined"} 
                      elevation={isSelected ? 4 : 0}
                      sx={{ 
                        height: '100%',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.6 : 1,
                        transition: 'all 0.2s',
                        border: isSelected ? '2px solid primary.main' : undefined,
                        '&:hover': {
                          boxShadow: isDisabled ? 0 : 2
                        }
                      }}
                      onClick={() => !isDisabled && handlePerkSelect(perk.id)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        {/* For now, we'll use a colored placeholder instead of an image */}
                        <Box sx={{ 
                          height: 80, 
                          backgroundImage: `url(${perk.image})`,    
                          backgroundRepeat: "no-repeat",   
                          bgcolor: `hsl(${parseInt(perk.id, 36) % 360}, 70%, 80%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'right',
                          color: '#fff',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}/>
                        <Chip 
                          label={`${usageCount}/${perk.maxUses} used`} 
                          size="small"
                          color={usageCount >= perk.maxUses ? "error" : "default"}
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                        />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle1" component="div">
                          {perk.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ height: 40, overflow: 'hidden' }}>
                          {perk.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
            </Box>
          ) : (
            // Step 2: Configure Perk Parameters
            <Box>
              {stepperPerk && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Perk icon/avatar */}
                    <Box sx={{ 
                      height: 80,
                      width: 200,
                      backgroundImage: `url(${getPerkById(stepperPerk)?.image})`,   
                      backgroundRepeat: "no-repeat",   
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'left',
                      color: '#fff',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}/>                    
                    <Box>
                      <Typography variant="h6" component="div">
                        {getPerkById(stepperPerk)?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getPerkById(stepperPerk)?.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
              {/* Always render inputs if available */}
              {stepperPerk && getPerkById(stepperPerk)?.inputs && (getPerkById(stepperPerk)?.inputs || []).length > 0 
                ? renderPerkInputs() 
                : ('')}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && (
            <Button 
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}>
              Back
            </Button>
          )}
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {activeStep === 0 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={!selectedPerkId}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleAddPerk}
              variant="contained"
            >
              Add Perk
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerkSelector;