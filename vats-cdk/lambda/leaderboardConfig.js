/**
 * Configuration for leaderboard functionality
 */

// Define all available sports
const availableSports = [
  { id: 'overall', name: 'Overall', enabled: true },
  { id: 'football', name: 'Football', enabled: false },
  { id: 'mensbball', name: 'Men\'s Basketball', enabled: false },
  { id: 'womensbball', name: 'Women\'s Basketball', enabled: false },
  { id: 'baseball', name: 'Baseball', enabled: false },
  { id: 'softball', name: 'Softball', enabled: false }
];

/**
 * Get leaderboard configuration
 */
function getLeaderboardConfig() {
  return {
    availableSports,
    enabledSports: availableSports.filter(sport => sport.enabled).map(sport => sport.id)
  };
}

module.exports = {
  getLeaderboardConfig,
  availableSports
};
