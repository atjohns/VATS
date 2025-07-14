/**
 * Sports constants for the VATS application
 */

export enum SportType {
  FOOTBALL = 'football',
  MENS_BASKETBALL = 'mensbball',
  WOMENS_BASKETBALL = 'womensbball',
  BASEBALL = 'baseball',
  SOFTBALL = 'softball'
}

export interface SportDefinition {
  id: SportType;
  displayName: string;
  showLeaderboard: boolean,
  maxTeams: number;
}

export const SPORTS: Record<SportType, SportDefinition> = {
  [SportType.FOOTBALL]: {
    id: SportType.FOOTBALL,
    displayName: 'Football',
    showLeaderboard: false,
    maxTeams: 8
  },
  [SportType.MENS_BASKETBALL]: {
    id: SportType.MENS_BASKETBALL,
    displayName: 'Men\'s Ball',
    showLeaderboard: false,
    maxTeams: 8
  },
  [SportType.WOMENS_BASKETBALL]: {
    id: SportType.WOMENS_BASKETBALL,
    displayName: 'Women\'s Bball',
    showLeaderboard: false,
    maxTeams: 8
  },
  [SportType.BASEBALL]: {
    id: SportType.BASEBALL,
    displayName: 'Baseball',
    showLeaderboard: false,
    maxTeams: 8
  },
  [SportType.SOFTBALL]: {
    id: SportType.SOFTBALL,
    displayName: 'Softball',
    showLeaderboard: false,
    maxTeams: 8
  }
};

// Array of all sports for iteration
export const ALL_SPORTS: SportDefinition[] = Object.values(SPORTS);

// Sport selection types (for team categories)
export const FOOTBALL_SELECTION_TYPES = {
  RIDE_OR_DIE: 'ride_or_die',
  SEC: 'sec',
  ACC: 'acc',
  BIG_TEN: 'big_ten',
  BIG_12: 'big_12',
  WILD_CARD: 'wild_card',
  NON_P4: 'non_p4'
};

// Labels for each team slot by sport
export const SLOT_LABELS: Record<SportType, string[]> = {
  [SportType.FOOTBALL]: [
    'Ride or Die Team',
    'SEC',
    'ACC',
    'Big Ten',
    'Big 12',
    'Wild Card',
    'Non-P4', 
    'Non-P4'
  ],
  [SportType.MENS_BASKETBALL]: [
    'Ride or Die Team',
    'SEC',
    'ACC',
    'Big Ten',
    'Big 12',
    'Wild Card',
    'Non-P4', 
    'Non-P4'
  ],
  [SportType.WOMENS_BASKETBALL]: [
    'Ride or Die Team',
    'SEC',
    'ACC',
    'Big Ten',
    'Big 12',
    'Wild Card',
    'Non-P4', 
    'Non-P4'
  ],
  [SportType.BASEBALL]: [
    'Ride or Die Team',
    'SEC',
    'ACC',
    'Big Ten',
    'Big 12',
    'Wild Card',
    'Non-P4', 
    'Non-P4'
  ],
  [SportType.SOFTBALL]: [
    'Ride or Die Team',
    'SEC',
    'ACC',
    'Big Ten',
    'Big 12',
    'Wild Card',
    'Non-P4', 
    'Non-P4'
  ]
};

// Default sport
export const DEFAULT_SPORT = SportType.FOOTBALL;