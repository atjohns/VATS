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
  Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { SportType, ALL_SPORTS } from '../constants/sports';
// No longer need fbsTeams import as we're getting data from the API

import { getTeamScores, updateTeamScores, TeamScore } from '../services/teamScores';
import { getAllTeamSelections, TeamSelection } from '../services/api';

// Enhanced type that combines TeamScore and TeamSelection
interface EnhancedTeamScore extends Partial<TeamSelection>, Partial<TeamScore> {
  teamId: string;
  schoolName: string;
  teamName: string;
  conference: string;
  sport: SportType;
  regularSeasonPoints: number;
  postseasonPoints: number;
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
        
        console.log(`Fetching team data for sport: ${selectedSport}`);
        
        // First, get all team selections across users to know which teams to show
        const allSelectedTeams = await getAllTeamSelections(selectedSport);
        console.log(`Found ${allSelectedTeams.length} teams selected by users`);
        
        if (!allSelectedTeams || allSelectedTeams.length === 0) {
          setError('No teams have been selected by any users yet.');
          setTeamScores([]);
          return;
        }
        
        // Get existing scores from API
        const existingScores = await getTeamScores(selectedSport);
        console.log('API returned scores:', existingScores);
        
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
          
          return {
            teamId: team.id || team.schoolName, // Use id as teamId or fallback to schoolName
            schoolName: team.schoolName,
            teamName: team.teamName,
            conference: team.conference,
            sport: selectedSport as SportType,
            regularSeasonPoints: existingScore?.regularSeasonPoints || 0,
            postseasonPoints: existingScore?.postseasonPoints || 0
          } as EnhancedTeamScore;
        });
        
        console.log(`Created ${teamsWithScores.length} team scores`);
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

  // Handle score change
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
      
      console.log(`Saving scores for ${teamsToUpdate.length} teams with non-zero values`);
      console.log('Teams to update:', teamsToUpdate);
      
      // Call API to update scores
      const success = await updateTeamScores(teamsToUpdate);
      
      if (success) {
        console.log('Successfully saved team scores');
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
  type SortField = 'schoolName' | 'teamName' | 'conference' | 'regularSeasonPoints' | 'postseasonPoints' | 'total';
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
        team.teamName?.toLowerCase().includes(searchText) ||
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
              <TableCell 
                onClick={() => handleSort('teamName')} 
                sx={{ cursor: 'pointer', fontWeight: sortField === 'teamName' ? 'bold' : 'normal' }}
              >
                Team {sortField === 'teamName' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
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
                <TableCell>{team.teamName}</TableCell>
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
    </Box>
  );
};

export default TeamScores;