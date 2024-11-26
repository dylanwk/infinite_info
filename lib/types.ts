

// used for mapping flights
export type Flight_Test = {
    aircraft: string;
    altitude: string;
    callsign: string;
    latitude: number;
    longitude: number;
    flightId: string;
    heading: number;
    speed: number;
}

// Variables for the query
export interface GetFlightVariables {
    server: string;
    flightId: string;
}

export interface SimpleFlightInfo {
    latitude: number;
    longitude: number;
    speed: number;
    flightId: string;
    userId: string;
    landingETA: string | null;
    altitude: number;
    callsign: string;
    aircraft: string;
    verticalSpeed: number;
    username: string;
    heading: number;
    org: string;
    livery: string;
  }

// Main response type for the query
export interface GetFlightResponse {
    flight: Flight | null;
}

// Type for the Flight object
export interface Flight {
    latitude: number;
    longitude: number;
    speed: number;
    flightId: string;
    userId: string;
    track: Track[];
    takeoffTimes: TakeoffLandingTime[];
    landingTimes: TakeoffLandingTime[];
}

// Type for Track information
export interface Track {
    date: string; // ISO date string
    latitude: number;
    longitude: number;
    altitude: number;
    groundSpeed: number;
    verticalSpeed: number;
    track: number;
}

// Type for Takeoff and Landing Times
export interface TakeoffLandingTime {
    altitude: number;
    date: string; // ISO date string
    latitude: number;
    longitude: number;
}
