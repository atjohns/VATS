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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SportType, SPORTS } from '../constants/sports';
import { getLeaderboard, UserScore, getAllSportsLeaderboard } from '../services/leaderboard';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayData, UserDisplayData } from '../services/userService';

interface LeaderboardProps {
  sport: string; // Can be SportType or 'overall'
}

const Leaderboard: React.FC<LeaderboardProps> = ({ sport }) => {
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{[key: string]: UserDisplayData}>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if this sport's leaderboard is allowed to be shown
        if (sport !== 'overall' && !SPORTS[sport as SportType].showLeaderboard) {
          setError('This leaderboard is not currently available.');
          setUserScores([]);
          return;
        }
        
        let leaderboard;
        if (sport === 'overall') {
          leaderboard = await getAllSportsLeaderboard();
        } else {
          leaderboard = await getLeaderboard(sport as SportType);
        }
        
        // Check if the leaderboard has valid data
        if (!leaderboard || leaderboard.length === 0) {
          setUserScores([]);
          return;
        }
        
        // Sort by total points descending
        const sortedLeaderboard = [...leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);
        setUserScores(sortedLeaderboard);
        
        // Get unique user IDs from the leaderboard
        const userIds = Array.from(new Set(sortedLeaderboard.map(score => score.userId)));
        
        // Fetch display data for all users in a single batch
        const displayData = await getUserDisplayData(userIds);
        setUserData(displayData);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data.');
        setUserScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sport]);

  // Helper function to format team display name
  const formatTeamDisplay = (userScore: UserScore) => {
    const displayName = userData[userScore.userId]?.displayName || userScore.name || userScore.username || userScore.userId;
    const teamName = userData[userScore.userId]?.teamName;
    const profile = userData[userScore.userId]?.profile;
    
    // Create the profile image element if profile exists
    const profileImage = profile ? (
      <img 
        src={`/assets/logos/${profile}`}
        alt={`${teamName || displayName} logo`}
        style={{
          height: '25px',
          marginRight: '10px',
          objectFit: 'contain',
          verticalAlign: 'middle'
        }}
        onError={(e) => {
          // Hide image if it fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    ) : null;
    
    if (teamName) {
      return (
        <>
          {profileImage}
          {teamName} <Typography component="span" variant="body2" color="text.secondary">({displayName})</Typography>
        </>
      );
    }
    
    return (
      <>
        {profileImage}
        {displayName}
      </>
    );
  };

  // Define table rendering function - no state checks yet
  const renderLeaderboardContent = () => {
    // Empty state check
    if (userScores.length === 0) {
      return <Typography variant="body1">No leaderboard data available yet.</Typography>;
    }
    
    // For overall view, show columns for each sport
    if (sport === 'overall') {
      return (
        <TableContainer component={Paper}>
           <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Team</TableCell>
                <TableCell align="right">Football</TableCell>
                <TableCell align="right">Men's Ball</TableCell>
                <TableCell align="right">Women's Ball</TableCell>
                <TableCell align="right">Baseball</TableCell>
                <TableCell align="right">Softball</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userScores.map((userScore, index) => (
                <TableRow 
                  key={userScore.userId}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: user?.userId === userScore.userId ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {formatTeamDisplay(userScore)}
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
                  {/* Sport-specific columns */}
                  <TableCell align="right">
                    <Typography variant="body2">
                      {userScore.sportPoints?.football || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {userScore.sportPoints?.mensbball || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {userScore.sportPoints?.womensbball || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {userScore.sportPoints?.baseball || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {userScore.sportPoints?.softball || 0}
                    </Typography>
                  </TableCell>
                  {/* Total points */}
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {userScore.totalPoints}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    
    // For sport-specific view, show the original table
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">Team Points</TableCell>
              <TableCell align="right">Perks Adj</TableCell>
              <TableCell align="right">Total</TableCell>
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
                        {formatTeamDisplay(userScore)}
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
                    {/* Calculate team points (total minus perk adjustment) */}
                    <Typography variant="body2">
                      {userScore.totalPoints - (userScore.perkAdjustment || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {/* Show perk adjustment with color based on positive/negative */}
                    <Typography 
                      variant="body2" 
                      color={userScore.perkAdjustment ? (userScore.perkAdjustment > 0 ? 'success.main' : userScore.perkAdjustment < 0 ? 'error.main' : 'text.primary') : 'text.primary'}
                    >
                      {userScore.perkAdjustment ? (userScore.perkAdjustment > 0 ? '+' : '') + userScore.perkAdjustment : '0'}
                    </Typography>
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
                              {/* Always show perk adjustments row with appropriate styling */}
                              <TableRow sx={{
                                bgcolor: userScore.perkAdjustment ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                                fontStyle: 'italic'
                              }}>
                                <TableCell><i>Perk Adjustments</i></TableCell>
                                <TableCell align="right">-</TableCell>
                                <TableCell align="right">-</TableCell>
                                <TableCell align="right">
                                  <Typography
                                    component="span"
                                    color={userScore.perkAdjustment ? (userScore.perkAdjustment > 0 ? 'success.main' : userScore.perkAdjustment < 0 ? 'error.main' : 'text.secondary') : 'text.secondary'}
                                    fontWeight="bold"
                                  >
                                    {userScore.perkAdjustment ? (userScore.perkAdjustment > 0 ? '+' : '') + userScore.perkAdjustment : '0'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                              {/* Add a total row */}
                              <TableRow sx={{ fontWeight: 'bold', bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                                <TableCell><b>TOTAL</b></TableCell>
                                <TableCell align="right">
                                  {userScore.teams.reduce((sum, team) => sum + (team.regularSeasonPoints || 0), 0)}
                                </TableCell>
                                <TableCell align="right">
                                  {userScore.teams.reduce((sum, team) => sum + (team.postseasonPoints || 0), 0)}
                                </TableCell>
                                <TableCell align="right">
                                  <b>{userScore.totalPoints}</b>
                                </TableCell>
                              </TableRow>
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
    );
  };
  
  // Memoize the table content
  const memoizedTable = useMemo(() => renderLeaderboardContent(), [userScores, sport, userData, user]);
  
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {sport === 'overall' ? 'Overall' : SPORTS[sport as SportType].displayName} Leaderboard
      </Typography>
      
      {/* Handle loading and error states here */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : memoizedTable}
    </Box>
  );
};

export default Leaderboard;
