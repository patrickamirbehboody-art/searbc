// Static reference data that rarely changes
// These match Airtable exactly

export const PRODUCTS = {
  VCT: 'reci5Mz7pLshg7HcQ',
  LCS: 'recKRUFRhtdc4MQaU',
  TFT: 'recThnzGrKQCDgf9J',
  '2XKO': 'recfkI36kujAxW7w6',
  Other: 'recFvv4KKusZOUivv',
};

export const PRODUCT_COLORS = {
  VCT: '#E8001A',
  LCS: '#F5C518',
  TFT: '#00C8D4',
  '2XKO': '#9B59E8',
  Other: '#888888',
};

export const DAY_CATEGORIES = [
  'Show Day',
  'Rehearsal Day',
  'Tech Check',
  'ESU',
  'Player Tech Check',
  'Dark Day',
];

export const DEPARTMENTS = ['Production', 'EVS', 'Audio', 'TOC', 'Engineering', 'MAM', 'Graphics'];

export const DEPT_SHORT = {
  Production: 'PROD',
  EVS: 'EVS',
  Audio: 'AUDIO',
  TOC: 'TOC',
  Engineering: 'ENG',
  MAM: 'MAM',
  Graphics: 'GFX',
};

export const DEPT_COLORS = {
  Production: '#6366f1',
  EVS: '#0ea5e9',
  Audio: '#8b5cf6',
  TOC: '#f59e0b',
  Engineering: '#10b981',
  MAM: '#ec4899',
  Graphics: '#f97316',
};

// Templates: product|dayCategory => dept slot counts
// [Prod, EVS, Audio, TOC, Eng, MAM, GFX]
export const TEMPLATES = {
  'VCT|Show Day':           [1, 4, 1, 2, 2, 2, 2],
  'VCT|Rehearsal Day':      [1, 3, 1, 2, 2, 2, 2],
  'VCT|Tech Check':         [1, 3, 1, 1, 2, 1, 2],
  'VCT|ESU':                [1, 3, 1, 2, 2, 2, 2],
  'VCT|Player Tech Check':  [1, 4, 1, 2, 2, 2, 2],
  'VCT|Dark Day':           [0, 0, 0, 0, 0, 0, 0],
  'LCS|Show Day':           [1, 3, 1, 2, 2, 2, 1],
  'LCS|Rehearsal Day':      [1, 3, 1, 2, 2, 2, 1],
  'LCS|Tech Check':         [1, 3, 1, 1, 2, 2, 1],
  'LCS|ESU':                [1, 2, 1, 2, 2, 2, 1],
  'LCS|Player Tech Check':  [1, 3, 1, 2, 2, 2, 1],
  'LCS|Dark Day':           [0, 0, 0, 0, 0, 0, 0],
  'TFT|Show Day':           [1, 4, 1, 2, 2, 2, 2],
  'TFT|Rehearsal Day':      [1, 4, 1, 2, 2, 2, 2],
  'TFT|Tech Check':         [1, 4, 1, 2, 2, 2, 2],
  'TFT|ESU':                [1, 4, 1, 2, 2, 2, 2],
  '2XKO|Show Day':          [0, 0, 0, 2, 0, 2, 0],
  'Other|Show Day':         [0, 0, 0, 2, 1, 2, 0],
};

export const VENUES = [
  'Riot Games Arena',
  'Riot Games RBC',
  'On Location',
];

export const CALL_TIMES = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];
