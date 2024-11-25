import { gql } from "@apollo/client";

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