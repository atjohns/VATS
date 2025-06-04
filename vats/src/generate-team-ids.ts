import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Define the FBSTeam interface
interface FBSTeam {
  teamName: string;
  schoolName: string;
  location: string;
  conference: string;
}

interface FBSTeamWithId extends FBSTeam {
  id: string;
}

// Read the current teams file
const teamsFilePath = path.join(__dirname, 'fbs-teams.ts');
const teamsFileContent = fs.readFileSync(teamsFilePath, 'utf8');

// Extract the array content from the file
const startPattern = 'export const fbsTeams: FBSTeam[] = [';
const endPattern = '];';

const startIndex = teamsFileContent.indexOf(startPattern) + startPattern.length;
const endIndex = teamsFileContent.lastIndexOf(endPattern);
const arrayContent = teamsFileContent.substring(startIndex, endIndex).trim();

// Parse the array content to get individual team objects
const teamObjects = arrayContent.split('},')
  .map(teamStr => teamStr.trim())
  .filter(teamStr => teamStr.length > 0)
  .map(teamStr => {
    // Add closing brace if it's missing
    if (!teamStr.endsWith('}')) {
      teamStr += '}';
    }
    
    // Replace the opening and closing braces with empty objects for parsing
    const jsonStr = teamStr
      .replace(/^\s*{/, '{')
      .replace(/}\s*$/, '}');
      
    try {
      // Parse the JSON string into an object (need to fix quotes first)
      const fixedJsonStr = jsonStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2": ');
      return JSON.parse(fixedJsonStr);
    } catch (error) {
      console.error('Error parsing team string:', teamStr);
      console.error(error);
      return null;
    }
  })
  .filter(team => team !== null) as FBSTeam[];

// Add unique IDs to each team
const teamsWithIds = teamObjects.map((team): FBSTeamWithId => ({
  id: uuidv4(),
  ...team
}));

// Format the teams array as a string
const teamsArrayString = teamsWithIds
  .map(team => {
    return `  {
    "id": "${team.id}",
    "teamName": "${team.teamName}",
    "schoolName": "${team.schoolName}",
    "location": "${team.location}",
    "conference": "${team.conference}"
  }`;
  })
  .join(',\n');

// Create the new file content
const newFileContent = `export interface FBSTeam {
  id: string;
  teamName: string;
  schoolName: string;
  location: string;
  conference: string;
}

export const fbsTeams: FBSTeam[] = [
${teamsArrayString}
];`;

// Write the new content back to the file
fs.writeFileSync(teamsFilePath, newFileContent, 'utf8');

console.log(`Added unique IDs to ${teamsWithIds.length} teams.`);