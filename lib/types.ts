
export type DrawerView = "default" | "graph" | "flight-plan";

export const TERRAIN = "mapbox://styles/ethaaan/clyc4nfqi00ze01nz1mgk31z9";
export const DARK = "mapbox://styles/ethaaan/cl5brx866001d14jgxqxhw6j4";
export const SATELLITE = "mapbox://styles/ethaaan/clf7mmn4v000e01q62b10pz9b";
export const DEFAULT = "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx/draft";

export type MapStyle = typeof TERRAIN | typeof DARK | typeof SATELLITE | typeof DEFAULT;

export type PROJECTION_TYPE = "globe" | "mercator";

export type IconSize = 0.2 | 0.3 | 0.9;

export type Session = {
  maxUsers: number;
  worldType: number;
  userCount: number;
  type: number;
  name: string;
  minimumGradeLevel: number;
  id: string;
};

export interface Airport {
  atc: ATC[];
  atis: string | null;
  city: string;
  class: number;
  elevation: number;
  has3dBuildings: boolean;
  hasJetbridges: boolean;
  hasSafedockUnits: boolean;
  hasTaxiwayRouting: boolean;
  iata: string;
  icao: string;
  inbounds: string[];
  latitude: number;
  longitude: number;
  name: string;
  outbounds: string[];
  state: string | null;
  timezone: string;
}

export interface ATC {
  atcRank: string;
  startTime: string;
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  userId: string;
  username: string;
  virtualOrganization: string | null;
}

// Airport query input NEW
export interface AirportQueryInput {
  icao?: string;
  only3d?: boolean;
  onlyATC?: boolean;
  server?: string;
}

// Airport query response NEW
export interface AirportsQueryResponse {
  data: {
    airportsv2: Airport[];
  };
}

// lightweight flight object for mapping flights to mapbox
export type Flights = {
  id: string;
  latitude: number;
  longitude: number;
  heading: number;
};

// heavy-weight flight object for displaying extensive flight details
export type Flight = {
  latitude: number;
  longitude: number;
  speed: number;
  id: string;
  userId: string;
  altitude: number;
  callsign: string;
  aircraft: string;
  verticalSpeed: number;
  username: string;
  heading: number;
  org: string;
  livery: string;
  landingTimes: FlightInformationItem[];
  takeoffTimes: FlightInformationItem[];
  //track: GQL_Track_Type[];
};

export type FlightPlanResponse = {
  flightplan: {
    code: number;
    flightPlan: {
      flightPlanItems: FlightPlanItem[];
    };
  };
};

export type FlightPlan = {
  code: number;
  flightPlanItems: FlightPlanItem[];
};

export type FlightPlanItem = {
  identifier: string | null;
  name: string | null;
  type: number;
  location: LocationType;
  children: FlightPlanItem[] | null;
  distanceFromPrevious?: number;
};

export type FPLDistanceResponse = {
  flightplan: {
    flightPlan: {
      flightPlanItems: FPLDistanceItem[]
    }
  }
}

export type FPLDistanceItem = {
  location: LocationType;
  children: ChildItem[] | null
}

export type ChildItem = {
  location: LocationType;
}

export type LocationType = {
  altitude: number;
  latitude: number;
  longitude: number;
};

// object for mapping takeoff & landing times
export type FlightInformationItem = {
  a: number; // altitude?
  b: number; // latitude
  c: number; // longitude
  r: string; // reported time
};

export type GQL_Track_Type = {
  a: number;
  b: number;
  c: number;
  h: number;
  i: string;
  r: string;
  s: number;
  v: number;
  z: string;
};

export type Track = {
  altitude: number;
  latitude: number;
  longitude: number;
  heading: number;
  nearestAirport: string;
  reportedTime: string;
  speed: number;
  verticalSpeed: number;
  aircraftState: string;
};
