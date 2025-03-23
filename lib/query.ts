import { gql } from "@apollo/client";



export const GET_AIRPORTS = gql`
query Airportsv2($input: AirportsV2Input!) {
  airportsv2(input: $input) {
    atc {
      atcRank
      startTime
      type
      userId
      username
      virtualOrganization
    }
    atis
    city
    class
    elevation
    has3dBuildings
    hasJetbridges
    hasSafedockUnits
    hasTaxiwayRouting
    iata
    icao
    inbounds
    latitude
    longitude
    name
    outbounds
    state
    timezone
  }
}`


// variables = none
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
export const GET_FLIGHTS = gql`
query Flightsv2($input: FlightsV2Input!) {
  flightsv2(input: $input) {
    id
    latitude
    longitude
    heading
  }
}`


// variables = session: string (sessionId) id: string (flightId)
export const GET_FLIGHTPATH = gql`
  query Flightv2($input: FlightV2Input!) {
  flightv2(input: $input) {
    track {
      a
      b
      c
      h
      i
      r
      s
      v
      z
    }
  }
}`

// variables = session: string (sessionId) id: string (flightId)
export const GET_FLIGHT = gql`
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
    takeoffTimes {
      a
      b
      c
      r
    }
    landingTimes {
      a
      b
      c
      r
    }
    track {
      a
      b
      c
      h
      i
      r
      s
      v
      z
    }
  }
}`



export const GET_FLIGHTPLAN = gql`
query flightplan($flightplanId: String!) {
  flightplan(id: $flightplanId) {
    code
    flightPlan {
      flightPlanItems {
        identifier
        name
        type
        location {
          altitude
          latitude
          longitude
        }
        children {
          identifier
          name
          type
          location {
            altitude
            latitude
            longitude
          }
        }
        
      }
    }
  }
}`