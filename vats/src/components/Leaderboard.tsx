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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SportType, SPORTS } from '../constants/sports';
import { getLeaderboard, UserScore } from '../services/leaderboard';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName } from '../services/userService';

interface LeaderboardProps {
  sport: SportType;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ sport }) => {
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching leaderboard for sport: ${sport}`);
        const leaderboard = await getLeaderboard(sport);
        
        // Check if the leaderboard has valid data
        if (!leaderboard || leaderboard.length === 0) {
          console.log('No leaderboard data returned');
          setUserScores([]);
          return;
        }
        
        // Log the raw leaderboard data to help debug
        console.log(`Got ${leaderboard.length} user entries in leaderboard`);
        console.log('First user example:', leaderboard[0]);
        
        // Sort by total points descending
        const sortedLeaderboard = [...leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);
        setUserScores(sortedLeaderboard);
        
        // Fetch display names for all users in the leaderboard
        const userIds = sortedLeaderboard.map(score => score.userId);
        const namesPromises = userIds.map(async (userId) => {
          const name = await getUserDisplayName(userId);
          return { userId, name };
        });
        
        // Wait for all name lookups to complete
        const nameResults = await Promise.all(namesPromises);
        
        // Build a map of user IDs to display names
        const namesMap: {[key: string]: string} = {};
        nameResults.forEach(({ userId, name }) => {
          namesMap[userId] = name;
        });
        
        setUserNames(namesMap);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data.');
        setUserScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sport]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {SPORTS[sport].displayName} Leaderboard
      </Typography>
      
      {userScores.length === 0 ? (
        <Typography variant="body1">No leaderboard data available yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">Total Points</TableCell>
                <TableCell>Teams</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userScores.map((userScore, index) => (
                <React.Fragment key={userScore.userId}>
                  <TableRow 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: user?.userId === userScore.userId ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {userNames[userScore.userId] || userScore.name || userScore.username || userScore.userId}
                          {user?.userId === userScore.userId && (
                            <Chip 
                              label="You" 
                              size="small" 
                              color="primary" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {userScore.totalPoints}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Accordion sx={{ 
                        boxShadow: 'none', 
                        '&:before': { display: 'none' },
                        bgcolor: 'transparent' 
                      }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ p: 0, minHeight: '40px!important' }}
                        >
                          <Typography variant="body2">
                            View {userScore.teams.length} teams
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0, pt: 1 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>School</TableCell>
                                  <TableCell align="right">Regular Season</TableCell>
                                  <TableCell align="right">Postseason</TableCell>
                                  <TableCell align="right">Total</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {userScore.teams.map((team) => (
                                  <TableRow key={team.teamId}>
                                    <TableCell>{team.schoolName || 'Unknown School'}</TableCell>
                                    <TableCell align="right">{team.regularSeasonPoints || 0}</TableCell>
                                    <TableCell align="right">{team.postseasonPoints || 0}</TableCell>
                                    <TableCell align="right">{team.totalPoints || (team.regularSeasonPoints || 0) + (team.postseasonPoints || 0)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Leaderboard;