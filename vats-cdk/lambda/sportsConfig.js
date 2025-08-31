/**
 * Sports configuration for the VATS application
 */

// Define all available sports with their properties
const sports = [
  { 
    id: 'overall', 
    name: 'Overall', 
    standingsActive: true  // Only overall leaderboard is active
  },
  { 
    id: 'football', 
    name: 'Football', 
    standingsActive: true 
  },
  { 
    id: 'mensbball', 
    name: 'Men\'s Basketball', 
    standingsActive: false 
  },
  { 
    id: 'womensbball', 
    name: 'Women\'s Basketball', 
    standingsActive: false 
  },
  { 
    id: 'baseball', 
    name: 'Baseball', 
    standingsActive: false 
  },
  { 
    id: 'softball', 
    name: 'Softball', 
    standingsActive: false 
  }
];

/**
 * Get sports configuration
 */
function getSportsConfig() {
  return {
    sports,
    activeSports: sports.filter(sport => sport.standingsActive)
  };
}

module.exports = {
  sports,
  getSportsConfig
};
