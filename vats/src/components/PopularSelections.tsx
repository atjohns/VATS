import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SportType, SPORTS, ALL_SPORTS, DEFAULT_SPORT, SLOT_LABELS } from '../constants/sports';
import { getAllUsers, getUserTeamSelections, UserData, UserSelections } from '../services/api';

interface TeamSelectionCount {
  teamId: string;
  schoolName: string;
  conference: string;
  count: number;
  percentage: number;
  slotBreakdown?: { [slotIndex: number]: number }; // Count by slot position
}

interface PopularSelectionsProps {
  isAdmin?: boolean;
}

const PopularSelections: React.FC<PopularSelectionsProps> = ({ isAdmin = false }) => {
  const [selectedSport, setSelectedSport] = useState<SportType>(DEFAULT_SPORT);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [popularTeams, setPopularTeams] = useState<TeamSelectionCount[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [usersWithSelections, setUsersWithSelections] = useState<number>(0);

  const handleSportChange = (event: SelectChangeEvent) => {
    setSelectedSport(event.target.value as SportType);
  };

  useEffect(() => {
    const fetchPopularSelections = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all users
        const users: UserData[] = await getAllUsers();
        setTotalUsers(users.length);
        
        if (users.length === 0) {
          setPopularTeams([]);
          setUsersWithSelections(0);
          return;
        }
        
        // Count team selections for the selected sport
        const teamCounts: { [key: string]: { 
          count: number; 
          schoolName: string; 
          conference: string;
          slotBreakdown: { [slotIndex: number]: number };
        } } = {};
        
        // Get team selections for each user
        const userSelectionsPromises = users.map(user => 
          getUserTeamSelections(user.userId).catch(error => {
            console.warn(`Error getting selections for user ${user.userId}:`, error);
            return null; // Return null for failed requests
          })
        );
        
        const allUserSelections = await Promise.all(userSelectionsPromises);
        let usersWithSelectionsCount = 0;
        
        // Process each user's selections
        allUserSelections.forEach((userSelections: UserSelections | null) => {
          if (!userSelections) return; // Skip failed requests
          
          try {
            // Get selections for the selected sport
            let sportSelections: any[] = [];
            
            switch (selectedSport) {
              case SportType.FOOTBALL:
                sportSelections = userSelections.footballSelections || [];
                break;
              case SportType.MENS_BASKETBALL:
                sportSelections = userSelections.mensbballSelections || [];
                break;
              case SportType.WOMENS_BASKETBALL:
                sportSelections = userSelections.womensbballSelections || [];
                break;
              case SportType.BASEBALL:
                sportSelections = userSelections.baseballSelections || [];
                break;
              case SportType.SOFTBALL:
                sportSelections = userSelections.softballSelections || [];
                break;
              default:
                sportSelections = [];
            }
            
            // Check if user has any selections for this sport
            if (sportSelections.length > 0) {
              usersWithSelectionsCount++;
            }
            
            // Count each team selection with slot information
            sportSelections.forEach((selection: any, slotIndex: number) => {
              if (selection && selection.id && selection.schoolName) {
                const teamId = selection.id;
                if (!teamCounts[teamId]) {
                  teamCounts[teamId] = {
                    count: 0,
                    schoolName: selection.schoolName,
                    conference: selection.conference || 'Unknown',
                    slotBreakdown: {}
                  };
                }
                teamCounts[teamId].count++;
                
                // Track which slot this selection was in
                if (!teamCounts[teamId].slotBreakdown[slotIndex]) {
                  teamCounts[teamId].slotBreakdown[slotIndex] = 0;
                }
                teamCounts[teamId].slotBreakdown[slotIndex]++;
              }
            });
          } catch (selectionError) {
            console.warn('Error processing user selections:', selectionError);
            // Continue processing other users
          }
        });
        
        setUsersWithSelections(usersWithSelectionsCount);
        
        // Convert to array and calculate percentages
        const teamArray: TeamSelectionCount[] = Object.entries(teamCounts).map(([teamId, data]) => ({
          teamId,
          schoolName: data.schoolName,
          conference: data.conference,
          count: data.count,
          percentage: usersWithSelectionsCount > 0 ? (data.count / usersWithSelectionsCount) * 100 : 0,
          slotBreakdown: data.slotBreakdown
        }));
        
        // Sort by count (descending)
        teamArray.sort((a, b) => b.count - a.count);
        
        setPopularTeams(teamArray);
      } catch (err) {
        console.error('Error fetching popular selections:', err);
        setError('Failed to load popular selections data.');
        setPopularTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSelections();
  }, [selectedSport]);

  if (!isAdmin) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Access denied. Admin privileges required.</Typography>
      </Box>
    );
  }

  const slotLabels = SLOT_LABELS[selectedSport] || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Popular Team Selections
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              {SPORTS[selectedSport].displayName} - Most Selected Teams
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {usersWithSelections} of {totalUsers} users have made selections for this sport
            </Typography>
          </Box>
          
          {popularTeams.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">
                No team selections found for {SPORTS[selectedSport].displayName}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Conference</TableCell>
                    <TableCell align="right">Selections</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="center">Popularity</TableCell>
                    <TableCell align="center">Slot Breakdown</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {popularTeams.map((team, index) => (
                    <TableRow key={team.teamId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          #{index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {team.schoolName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {team.conference}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {team.count}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {team.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            team.percentage >= 50 ? 'Very High' :
                            team.percentage >= 25 ? 'High' :
                            team.percentage >= 10 ? 'Medium' :
                            'Low'
                          }
                          color={
                            team.percentage >= 50 ? 'error' :
                            team.percentage >= 25 ? 'warning' :
                            team.percentage >= 10 ? 'primary' :
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ p: 0, minHeight: '32px!important' }}
                          >
                            <Typography variant="caption">
                              View Details
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 1 }}>
                            <Box>
                              {Object.entries(team.slotBreakdown || {}).map(([slotIndex, count]) => (
                                <Box key={slotIndex} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {slotLabels[parseInt(slotIndex)] || `Slot ${parseInt(slotIndex) + 1}`}:
                                  </Typography>
                                  <Typography variant="caption" fontWeight="medium">
                                    {count}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default PopularSelections;
