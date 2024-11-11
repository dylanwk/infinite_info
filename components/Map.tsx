"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import { gql, useQuery } from "@apollo/client";
import client from "@/lib/apolloClient";

// GraphQL Query
const GET_AIRPORTS = gql`
  query ExampleQuery($input: AirportsV2Input!) {
    airportsv2(input: $input) {
      latitude
      longitude
    }
  }
`;

import "mapbox-gl/dist/mapbox-gl.css";

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Dylan's access token
    //mapboxgl.accessToken = "pk.eyJ1IjoiZHlsYW53ayIsImEiOiJjbTJ3Y2dvNnAwNWE2MmpxMndlcGNmdnV2In0.jJTZ-WlDOdKqez58HYGmCA";

    // Ethan's access token
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZXRoYWFhbiIsImEiOiJja3AzN2JuNTIxcHpwMnBxcWNmNnc2bXJvIn0.FNggbSkQ3ULC55kwLEJZJg";

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current as HTMLElement,
        style: "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx/draft", // this one only works with Ethan's access token
        zoom: 3,
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  /* TEST IMPLEMENTAION OF GQL API

  const variables = { input: { only3d: true } };

  const { data, loading, error } = useQuery(GET_AIRPORTS, {
    client,
    variables,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{data} </p>;
  console.log(error);
  
  console.log(data);
  */

  return (
    <>
      <div
        id="map-container"
        className="h-[100vh] w-full"
        ref={mapContainerRef}
      >
        
      </div>
    </>
  );
};

export default Map;
