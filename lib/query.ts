import { gql } from "@apollo/client";


// variables = none
// purpose: get sessions dynamically
export const GET_SESSIONS = gql`
query GET_SESSIONS {
  sessionsv2 {
    maxUsers
    worldType
    userCount
    type
    name
    minimumGradeLevel
    id
  }
}`

// variables = session: string (sessionId)
export const FlightsV2 = gql`
query Flightsv2($input: FlightsV2Input!) {
  flightsv2(input: $input) {
    id
    latitude
    longitude
    heading
  }
}`


// variables = {server: string, max: int}
// purpose: get flights specifically to add to map
export const GET_FLIGHTS = gql`
query FlightsTest($server: Servers!, $max: Int) {
  flights(server: $server, max: $max) {
    aircraft
    altitude
    callsign
    latitude
    longitude
    flightId
    heading
    speed
  }
}
`

export const SIMPLE_FLIGHT_INFO = gql`
  query SimplePlaneInfo($server: Servers!, $flightId: String!) {
  flight(server: $server, flightId: $flightId) {
    latitude
    longitude
    speed
    flightId
    userId
    landingETA
    altitude
    callsign
    aircraft
    verticalSpeed
    username
    heading
    org
    livery
  }
}`

export const GET_FLIGHTV2 = gql`
  query Flightv2($input: FlightV2Input!) {
  flightv2(input: $input) {
    latitude
    longitude
    speed
    id
    userId
    altitude
    callsign
    aircraft
    verticalSpeed
    username
    heading
    org
    livery
    
  }
}`

// input -> session, id
export const GET_FLIGHTV3 = gql`
query Flightv2($input: FlightV2Input!) {
  flightv2(input: $input) {
    latitude
    longitude
    speed
    flightId
    userId
    landingETA
    altitude
    callsign
    aircraft
    verticalSpeed
    username
    heading
    org
    livery
  }
}
`


export const GET_FLIGHT = gql`
query TrackAndFPLV2($server: Servers!, $flightId: String!) {
  flight(server: $server, flightId: $flightId) {
    latitude
    longitude
    speed
    flightId
    userId
    track {
      date
      latitude
      longitude
      altitude
      groundSpeed
      verticalSpeed
      track
    }
    takeoffTimes {
      altitude
      date
      latitude
      longitude
    }
    landingTimes {
      altitude
      date
      latitude
      longitude
    }
  
}
}
`;

export const GET_AIRPORTS = gql`
query ExampleQuery($input: AirportsV2Input!) {
  airportsv2(input: $input) {
    latitude
    longitude
  }
}
`;