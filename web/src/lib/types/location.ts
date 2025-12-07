// Shared types for location system
export interface Country {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
}

export interface Region {
  id: string;
  name: string;
  country_id: string;
  code: string | null;
}

// City type - Database'deki gerçek yapıya göre
export interface City {
  id: string;
  name: string;
  region_id: string;
  country_id: string;
}

