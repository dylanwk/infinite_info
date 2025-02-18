

export type Session = {
    maxUsers: number;
    worldType: number;
    userCount: number;
    type: number;
    name: string;
    minimumGradeLevel: number;
    id: string;
  }

// lightweight flight object for mapping flights to mapbox
export type Flights = {
    id: string,
    latitude: number,
    longitude: number,
    heading: number,
}

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
    track: GQL_Track_Type[];
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
}

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