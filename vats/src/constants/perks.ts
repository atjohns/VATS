import { SportType } from './sports';
import { 
  ShotOfAdrenaline,
  CallYourShot,
  DoubleDown,
  LateSub,
  ShowMeTheMoney,
  NuclearOption,
  RussianRoulette,
  PoisonTheWell,
  MeatShield,
  TwoForOne
} from '../assets';

// For perks that require additional information
export enum PerkInputType {
  NONE = 'none',      // No additional input needed
  TEAM = 'team',      // Select a specific team
  OPPONENT = 'opponent', // Select an opponent team
  PLAYER = 'player',  // Select a player
  DATE = 'date',      // Select a date
}

export interface PerkInput {
  type: PerkInputType;
  value?: string | number | Date;
  required: boolean;
  label: string;
  placeholder?: string;
}

export interface Perk {
  id: string;          // Unique identifier for the perk
  title: string;       // Display title
  description: string; // Longer description explaining the perk
  image: string;       // Image URL or path
  inputs?: PerkInput[]; // Additional inputs this perk requires
  usageCount: number;   // How many times used across all sports
  maxUses: number;      // Maximum times it can be used (default 2)
}

export interface UserPerkSelection {
  perkId: string;           // ID of the selected perk
  sportType: SportType;     // Sport this selection is for
  inputs?: {                // User inputs for this perk
    [key: string]: string | number | Date;
  };
}

// Define 10 perks for users to choose from
export const AVAILABLE_PERKS: Perk[] = [
  {
    id: 'adrenaline',
    title: 'Shot of Adrenaline',
    description: 'Select a team, each tournament win for that team grants an extra 5 points (10 for CFP)',
    image: ShotOfAdrenaline,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.TEAM,
      label: 'Team',
      required: true,
      placeholder: 'Select a team to apply this perk to'
    }]
  },
  {
    id: 'poison',
    title: 'Poison The Well',
    description: 'Select an opponent, one tournament-eligible team on that roster at random will earn 1/4 points (a roster can only be poisoned once per tournament).',
    image: PoisonTheWell,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.PLAYER,
      label: 'Player',
      required: true,
      placeholder: 'Select another player'
    }]
  },
  {
    id: 'callyourshot',
    title: 'Call Your Shot',
    description: ' Double the tournament points of any bottom-half seed on your roster (7th or lower in CFP, 9th or lower in CBB, 3rd or lower in baseball/softball in a region)',
    image: CallYourShot,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.TEAM,
      label: 'Team',
      required: true,
      placeholder: 'Select a team'
    }]
  },
  {
    id: 'double_down',
    title: 'Double Down',
    description: 'Select a team on your roster, that team will earn double points for the tournament but no other team on your roster can earn tournament points (teams retain all regular seasons/conference tournament points).',
    image: DoubleDown,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.TEAM,
      label: 'Team',
      required: true,
      placeholder: 'Select a team'
    }]
  },
  {
    id: 'late_sub',
    title: 'Late Sub',
    description: 'Replace a team to your roster with any other team, the newly added team earns half points for the tournament (you do not receive any previously earned points by this team).',
    image: LateSub,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.OPPONENT,
      label: 'Sub',
      required: true,
      placeholder: 'Select a new team'
    },{
      type: PerkInputType.TEAM,
      label: 'Replaced team',
      required: true,
      placeholder: 'Select a team to drop'
    }]
  },
  {
    id: 'money',
    title: 'Show Me the Money',
    description: 'Get 50 points instantly',
    image: ShowMeTheMoney,
    usageCount: 0,
    maxUses: 2,
    inputs: []
  },
  {
    id: 'nuclear',
    title: 'Nuclear Option',
    description: 'A glorious death awaits, as you eliminate yourself but not without making your competitors pay. Four random teams will lose 50 points (unlike other perks, a team may be hit by multiple nuclear options per tournament).',
    image: NuclearOption,
    usageCount: 0,
    maxUses: 2,
    inputs: []
  },
  {
    id: 'roulette',
    title: 'Russian Roulette',
    description: 'Remove 50 points from a random team (this could be you, but a roster can only take one bullet once per tournament)',
    image: RussianRoulette,
    usageCount: 0,
    maxUses: 2,
    inputs: []
  },
  {
    id: 'shield',
    title: 'Meat Shield',
    description: 'Select a top-half seed on your roster (6th or higher in CFP, 8th or higher in CBB, 2nd or higher in baseball). This team can score no points but will block up to two poisons/bullets/blasts from your opponents.',
    image: MeatShield,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.TEAM,
      label: 'Team',
      required: true,
      placeholder: 'Select a meat shield'
    }]
  },
  {
    id: 'twoforone',
    title: 'Two for One',
    description: 'Throw away two teams and replace them with a new team who earns full tournament points, but you lose all regular season points from the discarded teams.You also do not gain any regular season points for the new team.',
    image: TwoForOne,
    usageCount: 0,
    maxUses: 2,
    inputs: [{
      type: PerkInputType.TEAM,
      label: 'Discarded Team',
      required: true,
      placeholder: 'Select the first sacrified team'
    }, {
      type: PerkInputType.TEAM,
      label: 'Discarded Team',
      required: true,
      placeholder: 'Select the second sacrified team'
    }, {
      type: PerkInputType.OPPONENT,
      label: 'Replacement team',
      required: true,
      placeholder: 'Select the replacement team'
    }]
  }
];

// Helper functions for perks
export const getPerkById = (perkId: string): Perk | undefined => {
  return AVAILABLE_PERKS.find(perk => perk.id === perkId);
};

export const getAvailablePerksForUser = (): Perk[] => {
  // In a real implementation, this would filter based on the user's existing selections
  // For now, return all perks
  return AVAILABLE_PERKS;
};

export const getSelectedPerkCount = (): number => {
  // Sum up the usage counts of all perks
  return AVAILABLE_PERKS.reduce((total, perk) => total + perk.usageCount, 0);
};

export const canSelectPerk = (perkId: string): boolean => {
  const perk = getPerkById(perkId);
  if (!perk) return false;
  
  // Check if this specific perk has reached its usage limit
  if (perk.usageCount >= perk.maxUses) return false;
  
  // Check if total perk selections have reached the global limit
  if (getSelectedPerkCount() >= 2) return false;
  
  return true;
};