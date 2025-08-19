export interface D1Teams {
  id: string;
  schoolName: string;
  conference: string;
  fbs: boolean;
  disabled?: boolean; // Optional flag to disable team selection
}

export const d1Teams: D1Teams[] = [
   {
    "id": "albany",
    "schoolName": "University at Albany, SUNY (Albany or UAlbany)",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "bin",
    "schoolName": "Binghamton University",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "bry",
    "schoolName": "Bryant University",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "umaine",
    "schoolName": "University of Maine (UMaine)",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "dallas",
    "schoolName": "Dallas Baptist",
    "conference": "Conference USA",
    "fbs": false
  },
  {
    "id": "umbc",
    "schoolName": "University of Maryland, Baltimore County (UMBC)",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "uml",
    "schoolName": "University of Massachusetts Lowell (UMass Lowell)",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "unh",
    "schoolName": "University of New Hampshire",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "njit",
    "schoolName": "New Jersey Institute of Technology (NJIT)",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "uv",
    "schoolName": "University of Vermont",
    "conference": "America East",
    "fbs": false
  },
  {
    "id": "charlotte",
    "schoolName": "University of North Carolina at Charlotte (Charlotte)",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "ecu",
    "schoolName": "East Carolina University (ECU)",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "fau",
    "schoolName": "Florida Atlantic University (FAU)",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "memphis",
    "schoolName": "University of Memphis (U of M)",
    "conference": "The American",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "unt",
    "schoolName": "University of North Texas (UNT)",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "rice",
    "schoolName": "Rice University",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "usf",
    "schoolName": "University of South Florida (USF)",
    "conference": "The American",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "temple",
    "schoolName": "Temple University",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "uab",
    "schoolName": "University of Alabama at Birmingham (UAB)",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "utsa",
    "schoolName": "University of Texas at San Antonio (UTSA)",
    "conference": "The American",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "tulane",
    "schoolName": "Tulane University",
    "conference": "The American",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "ut",
    "schoolName": "University of Tulsa",
    "conference": "The American",
    "fbs": true
  },
  {
    "id": "wsu",
    "schoolName": "Wichita State University",
    "conference": "The American",
    "fbs": false
  },
  {
    "id": "bc",
    "schoolName": "Boston College (BC)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "cal",
    "schoolName": "University of California, Berkeley (California, Cal)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "clemson",
    "schoolName": "Clemson University",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "duke",
    "schoolName": "Duke University",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "fsu",
    "schoolName": "Florida State University (FSU)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "gatech",
    "schoolName": "Georgia Institute of Technology (Georgia Tech)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "ul",
    "schoolName": "University of Louisville",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "miami",
    "schoolName": "University of Miami (FL)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "unc",
    "schoolName": "University of North Carolina at Chapel Hill (North Carolina, UNC)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "ncstate",
    "schoolName": "North Carolina State University (NC State)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "notredame",
    "schoolName": "University of Notre Dame",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "pitt",
    "schoolName": "University of Pittsburgh (Pitt)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "smu",
    "schoolName": "Southern Methodist University (SMU)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "stanford",
    "schoolName": "Stanford University",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "syracuse",
    "schoolName": "Syracuse University",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "uva",
    "schoolName": "University of Virginia (UVA)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "vtech",
    "schoolName": "Virginia Polytechnic Institute and State University (Virginia Tech)",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "wake",
    "schoolName": "Wake Forest University",
    "conference": "ACC",
    "fbs": true
  },
  {
    "id": "austinpeay",
    "schoolName": "Austin Peay State University (Austin Peay)",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "bell",
    "schoolName": "Bellarmine University",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "uca",
    "schoolName": "University of Central Arkansas",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "eku",
    "schoolName": "Eastern Kentucky University",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "fgcu",
    "schoolName": "Florida Gulf Coast University (FGCU)",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "jac",
    "schoolName": "Jacksonville University",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "lip",
    "schoolName": "Lipscomb University",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "una",
    "schoolName": "University of North Alabama",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "unf",
    "schoolName": "University of North Florida",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "queens",
    "schoolName": "Queens University of Charlotte",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "stetson",
    "schoolName": "Stetson University",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "uwg",
    "schoolName": "University of West Georgia",
    "conference": "ASUN",
    "fbs": false
  },
  {
    "id": "davidson",
    "schoolName": "Davidson College",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "dayton",
    "schoolName": "University of Dayton",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "duquesne",
    "schoolName": "Duquesne University",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "fordham",
    "schoolName": "Fordham University",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "gmu",
    "schoolName": "George Mason University",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "gwu",
    "schoolName": "George Washington University (GW)",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "lasalle",
    "schoolName": "La Salle University",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "loyolachi",
    "schoolName": "Loyola University Chicago (Loyola Chicago)",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "umass",
    "schoolName": "University of Massachusetts Amherst (UMass)",
    "conference": "A-10",
    "fbs": true
  },
  {
    "id": "uri",
    "schoolName": "University of Rhode Island",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "richmond",
    "schoolName": "University of Richmond",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "stbona",
    "schoolName": "St. Bonaventure University",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "stjoes",
    "schoolName": "Saint Joseph's University (Saint Joe's)",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "slu",
    "schoolName": "Saint Louis University (SLU)",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "vcu",
    "schoolName": "Virginia Commonwealth University (VCU)",
    "conference": "A-10",
    "fbs": false
  },
  {
    "id": "butler",
    "schoolName": "Butler University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "creighton",
    "schoolName": "Creighton University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "depaul",
    "schoolName": "DePaul University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "georgetown",
    "schoolName": "Georgetown University",
    "conference": "Big East",
    "fbs": true
  },
  {
    "id": "marquette",
    "schoolName": "Marquette University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "providence",
    "schoolName": "Providence College",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "stjohns",
    "schoolName": "St. John's University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "seton",
    "schoolName": "Seton Hall University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "uconn",
    "schoolName": "University of Connecticut (UConn)",
    "conference": "Big East",
    "fbs": true
  },
  {
    "id": "nova",
    "schoolName": "Villanova University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "xavier",
    "schoolName": "Xavier University",
    "conference": "Big East",
    "fbs": false
  },
  {
    "id": "ewu",
    "schoolName": "Eastern Washington University",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "idaho",
    "schoolName": "University of Idaho",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "idst",
    "schoolName": "Idaho State University",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "montana",
    "schoolName": "University of Montana",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "montst",
    "schoolName": "Montana State University",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "nau",
    "schoolName": "Northern Arizona University",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "uncolo",
    "schoolName": "University of Northern Colorado",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "portst",
    "schoolName": "Portland State University",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "sacstate",
    "schoolName": "California State University, Sacramento (Sacramento State)",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "web",
    "schoolName": "Weber State University",
    "conference": "Big Sky",
    "fbs": false
  },
  {
    "id": "cha",
    "schoolName": "Charleston Southern University",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "gw",
    "schoolName": "Gardner–Webb University",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "hp",
    "schoolName": "High Point University",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "lon",
    "schoolName": "Longwood University",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "pre",
    "schoolName": "Presbyterian College",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "rad",
    "schoolName": "Radford University",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "unca",
    "schoolName": "University of North Carolina at Asheville (UNC Asheville)",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "uscu",
    "schoolName": "University of South Carolina Upstate (USC Upstate)",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "win",
    "schoolName": "Winthrop University",
    "conference": "Big South",
    "fbs": false
  },
  {
    "id": "ucla",
    "schoolName": "University of California, Los Angeles (UCLA)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "illinois",
    "schoolName": "University of Illinois Urbana–Champaign (Illinois, U of I)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "iu",
    "schoolName": "Indiana University Bloomington (Indiana, IU)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "ui",
    "schoolName": "University of Iowa",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "maryland",
    "schoolName": "University of Maryland, College Park (Maryland)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "mich",
    "schoolName": "University of Michigan",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "msu",
    "schoolName": "Michigan State University",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "um",
    "schoolName": "University of Minnesota",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "neb",
    "schoolName": "University of Nebraska–Lincoln (Nebraska)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "nw",
    "schoolName": "Northwestern University",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "osu",
    "schoolName": "Ohio State University",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "oregon",
    "schoolName": "University of Oregon",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "psu",
    "schoolName": "Pennsylvania State University (Penn State)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "purdue",
    "schoolName": "Purdue University",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "rutgers",
    "schoolName": "Rutgers University–New Brunswick (Rutgers)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "usc",
    "schoolName": "University of Southern California (USC)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "uw",
    "schoolName": "University of Washington (UW, U-Dub)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "wisc",
    "schoolName": "University of Wisconsin–Madison (Wisconsin)",
    "conference": "Big Ten",
    "fbs": true
  },
  {
    "id": "ua",
    "schoolName": "University of Arizona",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "asu",
    "schoolName": "Arizona State University",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "bay",
    "schoolName": "Baylor University",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "byu",
    "schoolName": "Brigham Young University (BYU)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "ucf",
    "schoolName": "University of Central Florida (UCF)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "uc",
    "schoolName": "University of Cincinnati (UC)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "cu",
    "schoolName": "University of Colorado Boulder (Colorado)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "uh",
    "schoolName": "University of Houston",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "isu",
    "schoolName": "Iowa State University",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "ku",
    "schoolName": "University of Kansas",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "ksu",
    "schoolName": "Kansas State University",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "okst",
    "schoolName": "Oklahoma State University–Stillwater (Oklahoma State)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "tcu",
    "schoolName": "Texas Christian University (TCU)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "ttu",
    "schoolName": "Texas Tech University",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "utah",
    "schoolName": "University of Utah",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "wvu",
    "schoolName": "West Virginia University (WVU)",
    "conference": "Big 12",
    "fbs": true
  },
  {
    "id": "calpoly",
    "schoolName": "California Polytechnic State University (Cal Poly)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "csub",
    "schoolName": "California State University, Bakersfield (CSU Bakersfield or Cal State Bakersfield)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "csuf",
    "schoolName": "California State University, Fullerton (Cal State Fullerton)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "csun",
    "schoolName": "California State University, Northridge (Cal State Northridge or CSUN)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "hawaii",
    "schoolName": "University of Hawaiʻi at Mānoa (Hawaii)",
    "conference": "Big West",
    "fbs": true
  },
  {
    "id": "lbs",
    "schoolName": "California State University, Long Beach (Long Beach State)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "ucd",
    "schoolName": "University of California, Davis (UC Davis)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "uci",
    "schoolName": "University of California, Irvine (UC Irvine)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "ucr",
    "schoolName": "University of California, Riverside (UC Riverside)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "ucsd",
    "schoolName": "University of California, San Diego (UC San Diego, UCSD)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "ucsb",
    "schoolName": "University of California, Santa Barbara (UC Santa Barbara, UCSB)",
    "conference": "Big West",
    "fbs": false
  },
  {
    "id": "camp",
    "schoolName": "Campbell University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "cofc",
    "schoolName": "College of Charleston (Charleston)",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "ud",
    "schoolName": "University of Delaware",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "drex",
    "schoolName": "Drexel University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "elon",
    "schoolName": "Elon University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "hamp",
    "schoolName": "Hampton University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "hof",
    "schoolName": "Hofstra University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "mon",
    "schoolName": "Monmouth University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "ncat",
    "schoolName": "North Carolina Agricultural and Technical State University (North Carolina A&T)",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "neu",
    "schoolName": "Northeastern University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "stony",
    "schoolName": "Stony Brook University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "tow",
    "schoolName": "Towson University",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "uncw",
    "schoolName": "University of North Carolina at Wilmington (UNCW or UNC Wilmington)",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "wm",
    "schoolName": "College of William & Mary",
    "conference": "CAA",
    "fbs": false
  },
  {
    "id": "fiu",
    "schoolName": "Florida International University (FIU)",
    "conference": "Conference USA",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "jaxst",
    "schoolName": "Jacksonville State University",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "kennesaw",
    "schoolName": "Kennesaw State University",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "lib",
    "schoolName": "Liberty University",
    "conference": "Conference USA",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "latech",
    "schoolName": "Louisiana Tech University",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "mtsu",
    "schoolName": "Middle Tennessee State University (Middle Tennessee, MTSU)",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "nmsu",
    "schoolName": "New Mexico State University",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "shsu",
    "schoolName": "Sam Houston State University (Sam Houston)",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "utep",
    "schoolName": "University of Texas at El Paso (UTEP)",
    "conference": "Conference USA",
    "fbs": true
  },
  {
    "id": "wku",
    "schoolName": "Western Kentucky University (WKU)",
    "conference": "Conference USA",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "csu",
    "schoolName": "Cleveland State University",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "udm",
    "schoolName": "University of Detroit Mercy",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "iui",
    "schoolName": "Indiana University Indianapolis (IU Indy)",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "uwm",
    "schoolName": "University of Wisconsin-Milwaukee (Milwaukee)",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "nku",
    "schoolName": "Northern Kentucky University (NKU)",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "oak",
    "schoolName": "Oakland University",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "pfw",
    "schoolName": "Purdue University Fort Wayne (Purdue Fort Wayne)",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "rmu",
    "schoolName": "Robert Morris University",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "uwgb",
    "schoolName": "University of Wisconsin–Green Bay (Green Bay)",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "wsu",
    "schoolName": "Wright State University",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "ysu",
    "schoolName": "Youngstown State University",
    "conference": "Horizon League",
    "fbs": false
  },
  {
    "id": "brown",
    "schoolName": "Brown University",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "col",
    "schoolName": "Columbia University",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "cor",
    "schoolName": "Cornell University",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "dart",
    "schoolName": "Dartmouth College",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "harv",
    "schoolName": "Harvard University",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "penn",
    "schoolName": "University of Pennsylvania (Penn)",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "prin",
    "schoolName": "Princeton University",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "yale",
    "schoolName": "Yale University",
    "conference": "Ivy League",
    "fbs": false
  },
  {
    "id": "can",
    "schoolName": "Canisius University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "fair",
    "schoolName": "Fairfield University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "iona",
    "schoolName": "Iona University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "man",
    "schoolName": "Manhattan University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "mar",
    "schoolName": "Marist College",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "merr",
    "schoolName": "Merrimack College",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "msm",
    "schoolName": "Mount St. Mary's University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "niag",
    "schoolName": "Niagara University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "quin",
    "schoolName": "Quinnipiac University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "rider",
    "schoolName": "Rider University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "shu",
    "schoolName": "Sacred Heart University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "spu",
    "schoolName": "Saint Peter's University",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "siena",
    "schoolName": "Siena College",
    "conference": "MAAC",
    "fbs": false
  },
  {
    "id": "akron",
    "schoolName": "University of Akron",
    "conference": "MAC",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "bsu",
    "schoolName": "Ball State University",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "bgsu",
    "schoolName": "Bowling Green State University (Bowling Green)",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "buff",
    "schoolName": "University at Buffalo",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "cmu",
    "schoolName": "Central Michigan University",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "emu",
    "schoolName": "Eastern Michigan University",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "kent",
    "schoolName": "Kent State University",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "miaoh",
    "schoolName": "Miami University (OH)",
    "conference": "MAC",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "niu",
    "schoolName": "Northern Illinois University (NIU)",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "ohio",
    "schoolName": "Ohio University",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "toledo",
    "schoolName": "University of Toledo",
    "conference": "MAC",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "wmu",
    "schoolName": "Western Michigan University",
    "conference": "MAC",
    "fbs": true
  },
  {
    "id": "coppin",
    "schoolName": "Coppin State University",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "delst",
    "schoolName": "Delaware State University",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "howard",
    "schoolName": "Howard University",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "umes",
    "schoolName": "University of Maryland Eastern Shore (UMES)",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "morgan",
    "schoolName": "Morgan State University",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "nsu",
    "schoolName": "Norfolk State University",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "nccu",
    "schoolName": "North Carolina Central University (NCCU)",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "scsu",
    "schoolName": "South Carolina State University (SC State)",
    "conference": "MEAC",
    "fbs": false
  },
  {
    "id": "belmont",
    "schoolName": "Belmont University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "brad",
    "schoolName": "Bradley University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "drake",
    "schoolName": "Drake University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "ue",
    "schoolName": "University of Evansville",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "ilsu",
    "schoolName": "Illinois State University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "insu",
    "schoolName": "Indiana State University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "most",
    "schoolName": "Missouri State University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "murray",
    "schoolName": "Murray State University",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "uni",
    "schoolName": "University of Northern Iowa (UNI)",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "siu",
    "schoolName": "Southern Illinois University Carbondale (Southern Illinois, SIU)",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "uic",
    "schoolName": "University of Illinois Chicago (UIC)",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "valpo",
    "schoolName": "Valparaiso University (Valpo)",
    "conference": "Missouri Valley",
    "fbs": false
  },
  {
    "id": "af",
    "schoolName": "United States Air Force Academy (Air Force)",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "boise",
    "schoolName": "Boise State University",
    "conference": "Mountain West",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "colostate",
    "schoolName": "Colorado State University",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "fresno",
    "schoolName": "California State University, Fresno (Fresno State)",
    "conference": "Mountain West",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "unr",
    "schoolName": "University of Nevada, Reno (Nevada, UNR)",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "unm",
    "schoolName": "University of New Mexico (UNM)",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "sdsu",
    "schoolName": "San Diego State University (SDSU)",
    "conference": "Mountain West",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "sjsu",
    "schoolName": "San Jose State University",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "unlv",
    "schoolName": "University of Nevada, Las Vegas (UNLV)",
    "conference": "Mountain West",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "usuagg",
    "schoolName": "Utah State University",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "wyo",
    "schoolName": "University of Wyoming",
    "conference": "Mountain West",
    "fbs": true
  },
  {
    "id": "ccsu",
    "schoolName": "Central Connecticut State University (Central Connecticut)",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "chist",
    "schoolName": "Chicago State University",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "fdu",
    "schoolName": "Fairleigh Dickinson University",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "lem",
    "schoolName": "Le Moyne College",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "liu",
    "schoolName": "Long Island University (LIU)",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "mercy",
    "schoolName": "Mercyhurst University",
    "conference": "Northeast",
    "fbs": false
  },
   {
    "id": "sfupa",
    "schoolName": "Saint Francis University (Saint Francis PA, SFU)",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "stone",
    "schoolName": "Stonehill College",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "wagner",
    "schoolName": "Wagner College",
    "conference": "Northeast",
    "fbs": false
  },
  {
    "id": "eiu",
    "schoolName": "Eastern Illinois University",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "linden",
    "schoolName": "Lindenwood University",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "ualr",
    "schoolName": "University of Arkansas at Little Rock (Little Rock)",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "more",
    "schoolName": "Morehead State University",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "semo",
    "schoolName": "Southeast Missouri State University (Southeast Missouri or SEMO)",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "siue",
    "schoolName": "Southern Illinois University Edwardsville (SIU Edwardsville or SIUE)",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "usi",
    "schoolName": "University of Southern Indiana",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "utm",
    "schoolName": "University of Tennessee at Martin (UT Martin)",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "tnst",
    "schoolName": "Tennessee State University",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "tntech",
    "schoolName": "Tennessee Technological University (Tennessee Tech)",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "wiu",
    "schoolName": "Western Illinois University",
    "conference": "Ohio Valley",
    "fbs": false
  },
  {
    "id": "amer",
    "schoolName": "American University",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "army",
    "schoolName": "United States Military Academy (Army or Army West Point)",
    "conference": "Patriot League",
    "fbs": true
  },
  {
    "id": "bu",
    "schoolName": "Boston University",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "buck",
    "schoolName": "Bucknell University",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "colg",
    "schoolName": "Colgate University",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "holy",
    "schoolName": "College of the Holy Cross",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "laf",
    "schoolName": "Lafayette College",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "leh",
    "schoolName": "Lehigh University",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "loymd",
    "schoolName": "Loyola University Maryland (Loyola Maryland)",
    "conference": "Patriot League",
    "fbs": false
  },
  {
    "id": "navy",
    "schoolName": "United States Naval Academy (Navy)",
    "conference": "American",
    "fbs": true
  },
  {
    "id": "bama",
    "schoolName": "University of Alabama",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "ark",
    "schoolName": "University of Arkansas",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "aub",
    "schoolName": "Auburn University",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "uf",
    "schoolName": "University of Florida",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "uga",
    "schoolName": "University of Georgia (UGA)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "uk",
    "schoolName": "University of Kentucky (UK)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "lsu",
    "schoolName": "Louisiana State University (LSU)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "olemiss",
    "schoolName": "University of Mississippi (Ole Miss)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "msstate",
    "schoolName": "Mississippi State University",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "mizzou",
    "schoolName": "University of Missouri (Mizzou)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "ou",
    "schoolName": "University of Oklahoma",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "scar",
    "schoolName": "University of South Carolina",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "tenn",
    "schoolName": "University of Tennessee",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "texas",
    "schoolName": "University of Texas at Austin (Texas)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "tamu",
    "schoolName": "Texas A&M University",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "vandy",
    "schoolName": "Vanderbilt University (Vandy)",
    "conference": "SEC",
    "fbs": true
  },
  {
    "id": "utc",
    "schoolName": "University of Tennessee at Chattanooga (Chattanooga)",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "citadel",
    "schoolName": "The Citadel",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "etsu",
    "schoolName": "East Tennessee State University (ETSU)",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "furman",
    "schoolName": "Furman University",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "mercer",
    "schoolName": "Mercer University",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "samford",
    "schoolName": "Samford University",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "uncg",
    "schoolName": "University of North Carolina at Greensboro (UNCG or UNC Greensboro)",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "vmi",
    "schoolName": "Virginia Military Institute (VMI)",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "wcu",
    "schoolName": "Western Carolina University",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "woff",
    "schoolName": "Wofford College",
    "conference": "Southern",
    "fbs": false
  },
  {
    "id": "etam",
    "schoolName": "East Texas A&M University",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "hcu",
    "schoolName": "Houston Christian University (HCU)",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "uiw",
    "schoolName": "University of the Incarnate Word (UIW)",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "lamar",
    "schoolName": "Lamar University",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "mcneese",
    "schoolName": "McNeese State University (McNeese)",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "neworleans",
    "schoolName": "University of New Orleans",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "nicholls",
    "schoolName": "Nicholls State University (Nicholls)",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "nwst",
    "schoolName": "Northwestern State University",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "sela",
    "schoolName": "Southeastern Louisiana University",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "sfa",
    "schoolName": "Stephen F. Austin State University (Stephen F. Austin, SFA)",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "tamucc",
    "schoolName": "Texas A&M University-Corpus Christi",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "utrgv",
    "schoolName": "University of Texas Rio Grande Valley (UTRGV)",
    "conference": "Southland",
    "fbs": false
  },
  {
    "id": "aamu",
    "schoolName": "Alabama Agricultural and Mechanical University (Alabama A&M)",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "alst",
    "schoolName": "Alabama State University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "alcorn",
    "schoolName": "Alcorn State University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "uapb",
    "schoolName": "University of Arkansas at Pine Bluff (Arkansas–Pine Bluff, UAPB)",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "bcu",
    "schoolName": "Bethune–Cookman University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "famu",
    "schoolName": "Florida Agricultural and Mechanical University (Florida A&M, FAMU)",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "gram",
    "schoolName": "Grambling State University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "jsu",
    "schoolName": "Jackson State University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "mvsu",
    "schoolName": "Mississippi Valley State University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "pvamu",
    "schoolName": "Prairie View A&M University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "southern",
    "schoolName": "Southern University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "txso",
    "schoolName": "Texas Southern University",
    "conference": "SWAC",
    "fbs": false
  },
  {
    "id": "denver",
    "schoolName": "University of Denver",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "umkc",
    "schoolName": "University of Missouri–Kansas City (Kansas City)",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "und",
    "schoolName": "University of North Dakota",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "ndsu",
    "schoolName": "North Dakota State University (NDSU)",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "uno",
    "schoolName": "University of Nebraska Omaha (Omaha)",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "oru",
    "schoolName": "Oral Roberts University",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "tommies",
    "schoolName": "University of St. Thomas",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "usd",
    "schoolName": "University of South Dakota",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "sdakst",
    "schoolName": "South Dakota State University",
    "conference": "The Summit",
    "fbs": false
  },
  {
    "id": "appst",
    "schoolName": "Appalachian State University",
    "conference": "Sun Belt",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "arkst",
    "schoolName": "Arkansas State University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "coastal",
    "schoolName": "Coastal Carolina University",
    "conference": "Sun Belt",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "gaso",
    "schoolName": "Georgia Southern University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "gast",
    "schoolName": "Georgia State University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "jmu",
    "schoolName": "James Madison University (JMU)",
    "conference": "Sun Belt",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "ull",
    "schoolName": "University of Louisiana at Lafayette (Louisiana)",
    "conference": "Sun Belt",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "ulm",
    "schoolName": "University of Louisiana at Monroe (Louisiana–Monroe or ULM)",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "marshall",
    "schoolName": "Marshall University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "odu",
    "schoolName": "Old Dominion University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "usa",
    "schoolName": "University of South Alabama",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "usm",
    "schoolName": "University of Southern Mississippi (Southern Miss)",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "txst",
    "schoolName": "Texas State University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "troy",
    "schoolName": "Troy University",
    "conference": "Sun Belt",
    "fbs": true
  },
  {
    "id": "zags",
    "schoolName": "Gonzaga University",
    "conference": "West Coast",
    "fbs": false,
    "disabled": true
  },
  {
    "id": "lmu",
    "schoolName": "Loyola Marymount University",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "orst",
    "schoolName": "Oregon State University",
    "conference": "P12",
    "fbs": true,
    "disabled": true
  },
  {
    "id": "pacific",
    "schoolName": "University of the Pacific",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "pepp",
    "schoolName": "Pepperdine University",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "port",
    "schoolName": "University of Portland",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "smc",
    "schoolName": "Saint Mary's College of California (Saint Mary's)",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "sandiego",
    "schoolName": "University of San Diego",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "sanfran",
    "schoolName": "University of San Francisco",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "scu",
    "schoolName": "Santa Clara University",
    "conference": "West Coast",
    "fbs": false
  },
  {
    "id": "wasu",
    "schoolName": "Washington State University",
    "conference": "P12",
    "fbs": true
  },
  {
    "id": "acu",
    "schoolName": "Abilene Christian University",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "cbu",
    "schoolName": "California Baptist University (CBU)",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "gcu",
    "schoolName": "Grand Canyon University",
    "conference": "WAC",
    "fbs": false,
    "disabled": true
  },
  {
    "id": "sea",
    "schoolName": "Seattle University",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "suu",
    "schoolName": "Southern Utah University",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "tarleton",
    "schoolName": "Tarleton State University (Tarleton)",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "utech",
    "schoolName": "Utah Tech University",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "uvu",
    "schoolName": "Utah Valley University",
    "conference": "WAC",
    "fbs": false
  },
  {
    "id": "uta",
    "schoolName": "University of Texas at Arlington (UT Arlington)",
    "conference": "WAC",
    "fbs": false
  }
];