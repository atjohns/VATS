import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  Checkbox,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { SportType, ALL_SPORTS } from '../constants/sports';

import { getTeamScores, updateTeamScores, TeamScore } from '../services/teamScores';
import { getAllTeamSelections, TeamSelection } from '../services/api';

// Enhanced type that combines TeamScore and TeamSelection with sport-specific scoring fields
interface EnhancedTeamScore extends Partial<TeamSelection>, Partial<TeamScore> {
  teamId: string;
  schoolName: string;
  conference: string;
  sport: SportType;
  regularSeasonPoints: number;
  postseasonPoints: number;
  
  // Football specific scoring fields
  regularSeasonWins?: number;
  regularSeasonChampion?: boolean;
  conferenceChampion?: boolean;
  cfpAppearance?: boolean;
  bowlWin?: boolean;
  cfpWins?: number;
  cfpSemiFinalWin?: boolean;
  cfpChampion?: boolean;
  
  // Men's Basketball specific scoring fields
  mbbRegularSeasonWins?: number;
  mbbRegularSeasonTitle?: boolean;
  mbbConferenceTournTitle?: boolean;
  mbbNCAAAppearance?: boolean;
  mbbNCAAWins?: number;
  mbbEliteEightWin?: boolean;
  mbbFinalFourWin?: boolean;
  mbbChampion?: boolean;
  
  // Women's Basketball specific scoring fields
  wbbRegularSeasonWins?: number;
  wbbRegularSeasonTitle?: boolean;
  wbbConferenceTournTitle?: boolean;
  wbbNCAAAppearance?: boolean;
  wbbNCAAWins?: number;
  wbbEliteEightWin?: boolean;
  wbbFinalFourWin?: boolean;
  wbbChampion?: boolean;
  
  // Baseball specific scoring fields
  baseRegularSeasonWins?: number;
  baseRegularSeasonTitle?: boolean;
  baseConferenceTournTitle?: boolean;
  baseNCAAAppearance?: boolean;
  baseRegionalWins?: number;
  baseCWSWins?: number;
  baseChampion?: boolean;
  
  // Softball specific scoring fields
  softRegularSeasonWins?: number;
  softRegularSeasonTitle?: boolean;
  softConferenceTournTitle?: boolean;
  softNCAAAppearance?: boolean;
  softRegionalWins?: number;
  softCWSWins?: number;
  softChampion?: boolean;
}

interface TeamScoresProps {
  isAdmin: boolean;
}

const TeamScores: React.FC<TeamScoresProps> = ({ isAdmin }) => {
  // State variables
  const [selectedSport, setSelectedSport] = useState<SportType>(SportType.FOOTBALL);
  const [teamScores, setTeamScores] = useState<EnhancedTeamScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');

  // Fetch selected teams and their scores
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, get all team selections across users to know which teams to show
        const allSelectedTeams = await getAllTeamSelections(selectedSport);
        if (!allSelectedTeams || allSelectedTeams.length === 0) {
          setError('No teams have been selected by any users yet.');
          setTeamScores([]);
          return;
        }
        
        // Get existing scores from API
        const existingScores = await getTeamScores(selectedSport);
        // Create a map of existing scores by teamId
        const scoreMap = new Map();
        if (existingScores && existingScores.length > 0) {
          existingScores.forEach(score => {
            scoreMap.set(score.teamId, score);
          });
        }
        
        // Merge selected teams with their scores (or default to 0 if no score exists)
        const teamsWithScores = allSelectedTeams.map(team => {
          // Try to find existing score using id as teamId
          const existingScore = scoreMap.get(team.id);
          
          // Create base team object with common fields
          const baseTeam = {
            teamId: team.id || team.schoolName, // Use id as teamId or fallback to schoolName
            schoolName: team.schoolName,
            conference: team.conference,
            sport: selectedSport as SportType,
          };
          
          // For football, include the football-specific scoring fields
          if (selectedSport === SportType.FOOTBALL) {
            return {
              ...baseTeam,
              // Preserve existing football-specific values or initialize with defaults
              regularSeasonWins: existingScore?.regularSeasonWins || 0,
              regularSeasonChampion: existingScore?.regularSeasonChampion || false,
              conferenceChampion: existingScore?.conferenceChampion || false,
              cfpAppearance: existingScore?.cfpAppearance || false,
              bowlWin: existingScore?.bowlWin || false,
              cfpWins: existingScore?.cfpWins || 0,
              cfpSemiFinalWin: existingScore?.cfpSemiFinalWin || false,
              cfpChampion: existingScore?.cfpChampion || false,
              // Set calculated point values
              regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
              postseasonPoints: existingScore?.postseasonPoints || 0
            } as EnhancedTeamScore;
          } else if (selectedSport === SportType.MENS_BASKETBALL) {
            return {
              ...baseTeam,
              // Preserve existing men's basketball specific values or initialize with defaults
              mbbRegularSeasonWins: existingScore?.mbbRegularSeasonWins || 0,
              mbbRegularSeasonTitle: existingScore?.mbbRegularSeasonTitle || false,
              mbbConferenceTournTitle: existingScore?.mbbConferenceTournTitle || false,
              mbbNCAAAppearance: existingScore?.mbbNCAAAppearance || false,
              mbbNCAAWins: existingScore?.mbbNCAAWins || 0,
              mbbEliteEightWin: existingScore?.mbbEliteEightWin || false,
              mbbFinalFourWin: existingScore?.mbbFinalFourWin || false,
              mbbChampion: existingScore?.mbbChampion || false,
              // Set calculated point values
              regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
              postseasonPoints: existingScore?.postseasonPoints || 0
            } as EnhancedTeamScore;
          } else if (selectedSport === SportType.WOMENS_BASKETBALL) {
            return {
              ...baseTeam,
              // Preserve existing women's basketball specific values or initialize with defaults
              wbbRegularSeasonWins: existingScore?.wbbRegularSeasonWins || 0,
              wbbRegularSeasonTitle: existingScore?.wbbRegularSeasonTitle || false,
              wbbConferenceTournTitle: existingScore?.wbbConferenceTournTitle || false,
              wbbNCAAAppearance: existingScore?.wbbNCAAAppearance || false,
              wbbNCAAWins: existingScore?.wbbNCAAWins || 0,
              wbbEliteEightWin: existingScore?.wbbEliteEightWin || false,
              wbbFinalFourWin: existingScore?.wbbFinalFourWin || false,
              wbbChampion: existingScore?.wbbChampion || false,
              // Set calculated point values
              regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
              postseasonPoints: existingScore?.postseasonPoints || 0
            } as EnhancedTeamScore;
          } else if (selectedSport === SportType.BASEBALL) {
            return {
              ...baseTeam,
              // Preserve existing baseball specific values or initialize with defaults
              baseRegularSeasonWins: existingScore?.baseRegularSeasonWins || 0,
              baseRegularSeasonTitle: existingScore?.baseRegularSeasonTitle || false,
              baseConferenceTournTitle: existingScore?.baseConferenceTournTitle || false,
              baseNCAAAppearance: existingScore?.baseNCAAAppearance || false,
              baseRegionalWins: existingScore?.baseRegionalWins || 0,
              baseCWSWins: existingScore?.baseCWSWins || 0,
              baseChampion: existingScore?.baseChampion || false,
              // Set calculated point values
              regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
              postseasonPoints: existingScore?.postseasonPoints || 0
            } as EnhancedTeamScore;
          } else if (selectedSport === SportType.SOFTBALL) {
            return {
              ...baseTeam,
              // Preserve existing softball specific values or initialize with defaults
              softRegularSeasonWins: existingScore?.softRegularSeasonWins || 0,
              softRegularSeasonTitle: existingScore?.softRegularSeasonTitle || false,
              softConferenceTournTitle: existingScore?.softConferenceTournTitle || false,
              softNCAAAppearance: existingScore?.softNCAAAppearance || false,
              softRegionalWins: existingScore?.softRegionalWins || 0,
              softCWSWins: existingScore?.softCWSWins || 0,
              softChampion: existingScore?.softChampion || false,
              // Set calculated point values
              regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
              postseasonPoints: existingScore?.postseasonPoints || 0
            } as EnhancedTeamScore;
          } else {
            // For other sports, use the simple points model
            return {
              ...baseTeam,
              regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
              postseasonPoints: existingScore?.postseasonPoints || 0
            } as EnhancedTeamScore;
          }
        });
        
        setTeamScores(teamsWithScores);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again.');
        setTeamScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [selectedSport]);

  // Handle sport change
  const handleSportChange = (event: SelectChangeEvent) => {
    setSelectedSport(event.target.value as SportType);
  };

  // Calculate sport-specific scores based on the rules
  const calculateTeamScores = (team: EnhancedTeamScore): { regularSeasonPoints: number, postseasonPoints: number } => {
    // Handle football scoring rules
    if (team.sport === SportType.FOOTBALL) {
      // Calculate regular season points
      // 5 per regular season win
      // 10 regular season title
      const regularSeasonPoints = 
        (team.regularSeasonWins || 0) * 5 + 
        (team.regularSeasonChampion ? 10 : 0);
      
      // Calculate postseason points
      // 10 conference championship title
      // 5 CFP appearance
      // 5 bowl win
      // 15 per CFP win
      // 20 CFP semi final win
      // 30 title game winner
      const postseasonPoints = 
        (team.conferenceChampion ? 10 : 0) +
        (team.cfpAppearance ? 5 : 0) +
        (team.bowlWin ? 5 : 0) +
        (team.cfpWins || 0) * 15 +
        (team.cfpSemiFinalWin ? 20 : 0) +
        (team.cfpChampion ? 30 : 0);
        
      return { regularSeasonPoints, postseasonPoints };
    }
    // Handle men's basketball scoring rules
    else if (team.sport === SportType.MENS_BASKETBALL) {
      // Calculate regular season points
      // 3 per regular season win
      // 10 regular season title
      const regularSeasonPoints = 
        (team.mbbRegularSeasonWins || 0) * 3 + 
        (team.mbbRegularSeasonTitle ? 10 : 0);
      
      // Calculate postseason points
      // 10 conference tournament title
      // 5 NCAA Tournament appearance
      // 5 per NCAA Tournament win
      // 10 Elite Eight win
      // 20 Final Four win
      // 30 National Champion
      const postseasonPoints = 
        (team.mbbConferenceTournTitle ? 10 : 0) +
        (team.mbbNCAAAppearance ? 5 : 0) +
        (team.mbbNCAAWins || 0) * 5 +
        (team.mbbEliteEightWin ? 10 : 0) +
        (team.mbbFinalFourWin ? 20 : 0) +
        (team.mbbChampion ? 30 : 0);
        
      return { regularSeasonPoints, postseasonPoints };
    }
    // Handle women's basketball scoring rules - same as men's
    else if (team.sport === SportType.WOMENS_BASKETBALL) {
      // Calculate regular season points
      // 3 per regular season win
      // 10 regular season title
      const regularSeasonPoints = 
        (team.wbbRegularSeasonWins || 0) * 3 + 
        (team.wbbRegularSeasonTitle ? 10 : 0);
      
      // Calculate postseason points
      // 10 conference tournament title
      // 5 NCAA Tournament appearance
      // 5 per NCAA Tournament win
      // 10 Elite Eight win
      // 20 Final Four win
      // 30 National Champion
      const postseasonPoints = 
        (team.wbbConferenceTournTitle ? 10 : 0) +
        (team.wbbNCAAAppearance ? 5 : 0) +
        (team.wbbNCAAWins || 0) * 5 +
        (team.wbbEliteEightWin ? 10 : 0) +
        (team.wbbFinalFourWin ? 20 : 0) +
        (team.wbbChampion ? 30 : 0);
        
      return { regularSeasonPoints, postseasonPoints };
    }
    // Handle baseball scoring rules
    else if (team.sport === SportType.BASEBALL) {
      // Calculate regular season points
      // 1 per regular season win
      // 10 regular season title
      const regularSeasonPoints = 
        (team.baseRegularSeasonWins || 0) * 1 + 
        (team.baseRegularSeasonTitle ? 10 : 0);
      
      // Calculate postseason points
      // 10 conference tournament title
      // 5 NCAA Tournament appearance
      // 5 per Regional/Super Regional win
      // 10 per College World Series win
      // 30 National Champion
      const postseasonPoints = 
        (team.baseConferenceTournTitle ? 10 : 0) +
        (team.baseNCAAAppearance ? 5 : 0) +
        (team.baseRegionalWins || 0) * 5 +
        (team.baseCWSWins || 0) * 10 +
        (team.baseChampion ? 30 : 0);
        
      return { regularSeasonPoints, postseasonPoints };
    }
    // Handle softball scoring rules - same as baseball
    else if (team.sport === SportType.SOFTBALL) {
      // Calculate regular season points
      // 1 per regular season win
      // 10 regular season title
      const regularSeasonPoints = 
        (team.softRegularSeasonWins || 0) * 1 + 
        (team.softRegularSeasonTitle ? 10 : 0);
      
      // Calculate postseason points
      // 10 conference tournament title
      // 5 NCAA Tournament appearance
      // 5 per Regional/Super Regional win
      // 10 per Women's College World Series win
      // 30 National Champion
      const postseasonPoints = 
        (team.softConferenceTournTitle ? 10 : 0) +
        (team.softNCAAAppearance ? 5 : 0) +
        (team.softRegionalWins || 0) * 5 +
        (team.softCWSWins || 0) * 10 +
        (team.softChampion ? 30 : 0);
        
      return { regularSeasonPoints, postseasonPoints };
    }
    // For other sports, just return existing values
    else {
      return {
        regularSeasonPoints: team.regularSeasonPoints || 0,
        postseasonPoints: team.postseasonPoints || 0
      };
    }
  };

  // Handle numeric field change
  const handleNumericFieldChange = (teamId: string, field: 'regularSeasonWins' | 'cfpWins' | 'mbbRegularSeasonWins' | 'mbbNCAAWins' | 'wbbRegularSeasonWins' | 'wbbNCAAWins' | 'baseRegularSeasonWins' | 'baseRegionalWins' | 'baseCWSWins' | 'softRegularSeasonWins' | 'softRegionalWins' | 'softCWSWins', value: string) => {
    // Ensure value is non-negative
    const numValue = Math.max(Number(value) || 0, 0);
    
    setTeamScores(prevScores => 
      prevScores.map(team => {
        if (team.teamId !== teamId) return team;
        
        const updatedTeam = { ...team, [field]: numValue };
        // Recalculate points based on updated values
        const { regularSeasonPoints, postseasonPoints } = calculateTeamScores(updatedTeam);
        
        return {
          ...updatedTeam,
          regularSeasonPoints,
          postseasonPoints
        };
      })
    );
  };
  
  // Handle checkbox field change
  const handleCheckboxChange = (
    teamId: string, 
    field: 'regularSeasonChampion' | 'conferenceChampion' | 'cfpAppearance' | 'bowlWin' | 'cfpSemiFinalWin' | 'cfpChampion' | 
          'mbbRegularSeasonTitle' | 'mbbConferenceTournTitle' | 'mbbNCAAAppearance' | 'mbbEliteEightWin' | 'mbbFinalFourWin' | 'mbbChampion' |
          'wbbRegularSeasonTitle' | 'wbbConferenceTournTitle' | 'wbbNCAAAppearance' | 'wbbEliteEightWin' | 'wbbFinalFourWin' | 'wbbChampion' |
          'baseRegularSeasonTitle' | 'baseConferenceTournTitle' | 'baseNCAAAppearance' | 'baseChampion' |
          'softRegularSeasonTitle' | 'softConferenceTournTitle' | 'softNCAAAppearance' | 'softChampion'
  ) => {
    setTeamScores(prevScores => 
      prevScores.map(team => {
        if (team.teamId !== teamId) return team;
        
        const updatedTeam = { ...team, [field]: !(team[field] || false) };
        // Recalculate points based on updated values
        const { regularSeasonPoints, postseasonPoints } = calculateTeamScores(updatedTeam);
        
        return {
          ...updatedTeam,
          regularSeasonPoints,
          postseasonPoints
        };
      })
    );
  };
  
  // Legacy handler for non-football sports
  const handleScoreChange = (teamId: string, field: 'regularSeasonPoints' | 'postseasonPoints', value: string) => {
    // Ensure value is non-negative
    const numValue = Math.max(Number(value) || 0, 0);
    setTeamScores(prevScores => 
      prevScores.map(team => 
        team.teamId === teamId 
          ? { ...team, [field]: numValue } 
          : team
      )
    );
  };

  // Save the scores to API
  const handleSaveScores = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Only update teams with non-zero values to minimize DB writes
      const teamsToUpdate = teamScores.filter(team => 
        team.regularSeasonPoints > 0 || team.postseasonPoints > 0
      );
      
      // Call API to update scores
      const success = await updateTeamScores(teamsToUpdate);
      
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
      } else {
        console.error('API returned unsuccessful status');
        setError('Failed to save team scores. Please try again.');
      }
    } catch (err) {
      console.error('Error saving team scores:', err);
      setError('Failed to save team scores. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Sort type management
  type SortField = 'schoolName' | 'conference' | 'regularSeasonPoints' | 'postseasonPoints' | 'total';
  const [sortField, setSortField] = useState<SortField>('schoolName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set as new sort field with default direction
      setSortField(field);
      // For points, default to descending; for text fields, default to ascending
      const isPointsField = ['regularSeasonPoints', 'postseasonPoints', 'total'].includes(field);
      setSortDirection(isPointsField ? 'desc' : 'asc');
    }
  };
  
  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    // First filter by search text
    const filtered = teamScores.filter(team => {
      const searchText = filterText.toLowerCase();
      return (
        team.schoolName?.toLowerCase().includes(searchText) ||
        team.conference?.toLowerCase().includes(searchText)
      );
    });
    
    // Then sort by the selected field
    return [...filtered].sort((a, b) => {
      let valueA, valueB;
      
      if (sortField === 'total') {
        valueA = (a.regularSeasonPoints || 0) + (a.postseasonPoints || 0);
        valueB = (b.regularSeasonPoints || 0) + (b.postseasonPoints || 0);
      } else if (sortField === 'regularSeasonPoints') {
        valueA = a.regularSeasonPoints || 0;
        valueB = b.regularSeasonPoints || 0;
      } else if (sortField === 'postseasonPoints') {
        valueA = a.postseasonPoints || 0;
        valueB = b.postseasonPoints || 0;
      } else {
        valueA = a[sortField] || '';
        valueB = b[sortField] || '';
      }
      
      // For strings, use localeCompare
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // For numbers, use numeric comparison
      // Use type assertion to ensure TypeScript knows we're handling numbers
      return sortDirection === 'asc' 
        ? (valueA as number) - (valueB as number) 
        : (valueB as number) - (valueA as number);
    });
  }, [teamScores, filterText, sortField, sortDirection]);

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          You need administrator privileges to access this section.
        </Typography>
      </Paper>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Team Scores</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="score-sport-select-label">Sport</InputLabel>
            <Select
              labelId="score-sport-select-label"
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
          
          <TextField 
            placeholder="Filter teams..."
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          
          <Button
            variant="contained"
            color={saveSuccess ? "success" : "primary"}
            startIcon={<SaveIcon />}
            onClick={handleSaveScores}
            disabled={saving}
          >
            {saving ? 'Saving...' : (saveSuccess ? 'Scores Saved' : 'Save Scores')}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Scores saved successfully!</Alert>}

      {/* Show different UI based on sport */}
      {selectedSport === SportType.FOOTBALL ? (
        /* Football-specific scoring UI */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('schoolName')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'schoolName' ? 'bold' : 'normal' }}
                >
                  School {sortField === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                {/* Team column removed */}
                <TableCell colSpan={8} align="center">Scoring Rules</TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('total')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal' }}
                >
                  Total Points {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={1}></TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regular Season Wins<br/>(5 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Reg Season<br/>Champion<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Conference<br/>Champion<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  CFP<br/>Appearance<br/>(5 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Bowl<br/>Win<br/>(5 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  CFP Wins<br/>(15 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  CFP Semi<br/>Final Win<br/>(20 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  CFP<br/>Champion<br/>(30 pts)
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team, index) => (
                <TableRow key={team.teamId} hover>
                  <TableCell>
                    {sortField === 'total' && sortDirection === 'desc' && (
                      <span style={{ display: 'inline-block', minWidth: '24px', marginRight: '8px', fontWeight: 'bold' }}>
                        {index + 1}.  
                      </span>
                    )}
                    {team.schoolName}
                  </TableCell>
                  {/* Team cell removed */}
                  
                  {/* Regular Season Wins (5 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.regularSeasonWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'regularSeasonWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 15 }}
                    />
                  </TableCell>
                  
                  {/* Regular Season Champion (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.regularSeasonChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'regularSeasonChampion')}
                    />
                  </TableCell>
                  
                  {/* Conference Champion (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.conferenceChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'conferenceChampion')}
                    />
                  </TableCell>
                  
                  {/* CFP Appearance (5 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.cfpAppearance || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'cfpAppearance')}
                    />
                  </TableCell>
                  
                  {/* Bowl Win (5 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.bowlWin || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'bowlWin')}
                    />
                  </TableCell>
                  
                  {/* CFP Wins (15 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.cfpWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'cfpWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 3 }}
                    />
                  </TableCell>
                  
                  {/* CFP Semi Final Win (20 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.cfpSemiFinalWin || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'cfpSemiFinalWin')}
                    />
                  </TableCell>
                  
                  {/* CFP Champion (30 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.cfpChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'cfpChampion')}
                    />
                  </TableCell>
                  
                  {/* Total Points */}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    <Tooltip title="Total: Regular Season + Postseason Points" arrow>
                      <span>{(team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedSport === SportType.MENS_BASKETBALL ? (
        /* Men's Basketball scoring UI */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('schoolName')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'schoolName' ? 'bold' : 'normal' }}
                >
                  School {sortField === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell colSpan={8} align="center">Scoring Rules</TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('total')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal' }}
                >
                  Total Points {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={1}></TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regular Season<br/>Wins<br/>(3 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Reg Season<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Conf Tourn.<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Appearance<br/>(5 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Wins<br/>(5 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Elite Eight<br/>Win<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Final Four<br/>Win<br/>(20 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Champion<br/>(30 pts)
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team, index) => (
                <TableRow key={team.teamId} hover>
                  <TableCell>
                    {sortField === 'total' && sortDirection === 'desc' && (
                      <span style={{ display: 'inline-block', minWidth: '24px', marginRight: '8px', fontWeight: 'bold' }}>
                        {index + 1}.  
                      </span>
                    )}
                    {team.schoolName}
                  </TableCell>
                  
                  {/* Regular Season Wins (3 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.mbbRegularSeasonWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'mbbRegularSeasonWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 40 }}
                    />
                  </TableCell>
                  
                  {/* Regular Season Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.mbbRegularSeasonTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'mbbRegularSeasonTitle')}
                    />
                  </TableCell>
                  
                  {/* Conference Tournament Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.mbbConferenceTournTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'mbbConferenceTournTitle')}
                    />
                  </TableCell>
                  
                  {/* NCAA Tournament Appearance (5 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.mbbNCAAAppearance || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'mbbNCAAAppearance')}
                    />
                  </TableCell>
                  
                  {/* NCAA Tournament Wins (5 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.mbbNCAAWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'mbbNCAAWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 6 }}
                    />
                  </TableCell>
                  
                  {/* Elite Eight Win (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.mbbEliteEightWin || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'mbbEliteEightWin')}
                    />
                  </TableCell>
                  
                  {/* Final Four Win (20 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.mbbFinalFourWin || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'mbbFinalFourWin')}
                    />
                  </TableCell>
                  
                  {/* NCAA Champion (30 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.mbbChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'mbbChampion')}
                    />
                  </TableCell>
                  
                  {/* Total Points */}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    <Tooltip title="Total: Regular Season + Postseason Points" arrow>
                      <span>{(team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedSport === SportType.WOMENS_BASKETBALL ? (
        /* Women's Basketball scoring UI */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('schoolName')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'schoolName' ? 'bold' : 'normal' }}
                >
                  School {sortField === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell colSpan={8} align="center">Scoring Rules</TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('total')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal' }}
                >
                  Total Points {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={1}></TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regular Season<br/>Wins<br/>(3 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Reg Season<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Conf Tourn.<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Appearance<br/>(5 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Wins<br/>(5 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Elite Eight<br/>Win<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Final Four<br/>Win<br/>(20 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Champion<br/>(30 pts)
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team, index) => (
                <TableRow key={team.teamId} hover>
                  <TableCell>
                    {sortField === 'total' && sortDirection === 'desc' && (
                      <span style={{ display: 'inline-block', minWidth: '24px', marginRight: '8px', fontWeight: 'bold' }}>
                        {index + 1}.  
                      </span>
                    )}
                    {team.schoolName}
                  </TableCell>
                  
                  {/* Regular Season Wins (3 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.wbbRegularSeasonWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'wbbRegularSeasonWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 40 }}
                    />
                  </TableCell>
                  
                  {/* Regular Season Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.wbbRegularSeasonTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'wbbRegularSeasonTitle')}
                    />
                  </TableCell>
                  
                  {/* Conference Tournament Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.wbbConferenceTournTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'wbbConferenceTournTitle')}
                    />
                  </TableCell>
                  
                  {/* NCAA Tournament Appearance (5 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.wbbNCAAAppearance || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'wbbNCAAAppearance')}
                    />
                  </TableCell>
                  
                  {/* NCAA Tournament Wins (5 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.wbbNCAAWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'wbbNCAAWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 6 }}
                    />
                  </TableCell>
                  
                  {/* Elite Eight Win (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.wbbEliteEightWin || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'wbbEliteEightWin')}
                    />
                  </TableCell>
                  
                  {/* Final Four Win (20 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.wbbFinalFourWin || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'wbbFinalFourWin')}
                    />
                  </TableCell>
                  
                  {/* NCAA Champion (30 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.wbbChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'wbbChampion')}
                    />
                  </TableCell>
                  
                  {/* Total Points */}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    <Tooltip title="Total: Regular Season + Postseason Points" arrow>
                      <span>{(team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedSport === SportType.BASEBALL ? (
        /* Baseball scoring UI */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('schoolName')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'schoolName' ? 'bold' : 'normal' }}
                >
                  School {sortField === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell colSpan={6} align="center">Scoring Rules</TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('total')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal' }}
                >
                  Total Points {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={1}></TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regular Season<br/>Wins<br/>(1 pt each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Reg Season<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Conf Tourn.<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Appearance<br/>(5 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regional<br/>Wins<br/>(5 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  CWS<br/>Wins<br/>(10 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Champion<br/>(30 pts)
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team, index) => (
                <TableRow key={team.teamId} hover>
                  <TableCell>
                    {sortField === 'total' && sortDirection === 'desc' && (
                      <span style={{ display: 'inline-block', minWidth: '24px', marginRight: '8px', fontWeight: 'bold' }}>
                        {index + 1}.  
                      </span>
                    )}
                    {team.schoolName}
                  </TableCell>
                  
                  {/* Regular Season Wins (1 pt each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.baseRegularSeasonWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'baseRegularSeasonWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 60 }}
                    />
                  </TableCell>
                  
                  {/* Regular Season Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.baseRegularSeasonTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'baseRegularSeasonTitle')}
                    />
                  </TableCell>
                  
                  {/* Conference Tournament Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.baseConferenceTournTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'baseConferenceTournTitle')}
                    />
                  </TableCell>
                  
                  {/* NCAA Tournament Appearance (5 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.baseNCAAAppearance || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'baseNCAAAppearance')}
                    />
                  </TableCell>
                  
                  {/* Regional/Super Regional Wins (5 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.baseRegionalWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'baseRegionalWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 5 }}
                    />
                  </TableCell>
                  
                  {/* College World Series Wins (10 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.baseCWSWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'baseCWSWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 5 }}
                    />
                  </TableCell>
                  
                  {/* NCAA Champion (30 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.baseChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'baseChampion')}
                    />
                  </TableCell>
                  
                  {/* Total Points */}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    <Tooltip title="Total: Regular Season + Postseason Points" arrow>
                      <span>{(team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : selectedSport === SportType.SOFTBALL ? (
        /* Softball scoring UI */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('schoolName')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'schoolName' ? 'bold' : 'normal' }}
                >
                  School {sortField === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell colSpan={6} align="center">Scoring Rules</TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('total')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal' }}
                >
                  Total Points {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={1}></TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regular Season<br/>Wins<br/>(1 pt each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Reg Season<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Conf Tourn.<br/>Title<br/>(10 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Appearance<br/>(5 pts)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Regional<br/>Wins<br/>(5 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  WCWS<br/>Wins<br/>(10 pts each)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  NCAA<br/>Champion<br/>(30 pts)
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team, index) => (
                <TableRow key={team.teamId} hover>
                  <TableCell>
                    {sortField === 'total' && sortDirection === 'desc' && (
                      <span style={{ display: 'inline-block', minWidth: '24px', marginRight: '8px', fontWeight: 'bold' }}>
                        {index + 1}.  
                      </span>
                    )}
                    {team.schoolName}
                  </TableCell>
                  
                  {/* Regular Season Wins (1 pt each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.softRegularSeasonWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'softRegularSeasonWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 60 }}
                    />
                  </TableCell>
                  
                  {/* Regular Season Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.softRegularSeasonTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'softRegularSeasonTitle')}
                    />
                  </TableCell>
                  
                  {/* Conference Tournament Title (10 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.softConferenceTournTitle || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'softConferenceTournTitle')}
                    />
                  </TableCell>
                  
                  {/* NCAA Tournament Appearance (5 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.softNCAAAppearance || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'softNCAAAppearance')}
                    />
                  </TableCell>
                  
                  {/* Regional/Super Regional Wins (5 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.softRegionalWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'softRegionalWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 5 }}
                    />
                  </TableCell>
                  
                  {/* Women's College World Series Wins (10 pts each) */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={team.softCWSWins || 0}
                      onChange={(e) => handleNumericFieldChange(team.teamId, 'softCWSWins', e.target.value)}
                      sx={{ width: 60, input: { textAlign: 'center' } }}
                      inputProps={{ min: 0, max: 5 }}
                    />
                  </TableCell>
                  
                  {/* NCAA Champion (30 pts) */}
                  <TableCell align="center">
                    <Checkbox
                      checked={team.softChampion || false}
                      onChange={() => handleCheckboxChange(team.teamId, 'softChampion')}
                    />
                  </TableCell>
                  
                  {/* Total Points */}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    <Tooltip title="Total: Regular Season + Postseason Points" arrow>
                      <span>{(team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* Default UI for other sports */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSort('schoolName')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'schoolName' ? 'bold' : 'normal' }}
                >
                  School {sortField === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                {/* Team column removed */}
                <TableCell 
                  onClick={() => handleSort('conference')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'conference' ? 'bold' : 'normal' }}
                >
                  Conference {sortField === 'conference' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('regularSeasonPoints')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'regularSeasonPoints' ? 'bold' : 'normal' }}
                >
                  Regular Season Points {sortField === 'regularSeasonPoints' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('postseasonPoints')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'postseasonPoints' ? 'bold' : 'normal' }}
                >
                  Postseason Points {sortField === 'postseasonPoints' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell 
                  align="right" 
                  onClick={() => handleSort('total')} 
                  sx={{ cursor: 'pointer', fontWeight: sortField === 'total' ? 'bold' : 'normal' }}
                >
                  Total Points {sortField === 'total' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedTeams.map((team, index) => (
                <TableRow key={team.teamId} hover>
                  <TableCell>
                    {sortField === 'total' && sortDirection === 'desc' && (
                      <span style={{ display: 'inline-block', minWidth: '24px', marginRight: '8px', fontWeight: 'bold' }}>
                        {index + 1}.  
                      </span>
                    )}
                    {team.schoolName}
                  </TableCell>
                  {/* Team cell removed */}
                  <TableCell>{team.conference}</TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={team.regularSeasonPoints}
                      onChange={(e) => handleScoreChange(team.teamId, 'regularSeasonPoints', e.target.value)}
                      sx={{ width: 80, input: { textAlign: 'right' } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={team.postseasonPoints}
                      onChange={(e) => handleScoreChange(team.teamId, 'postseasonPoints', e.target.value)}
                      sx={{ width: 80, input: { textAlign: 'right' } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    <Tooltip title="Total Points" arrow>
                      <span>{(team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TeamScores;