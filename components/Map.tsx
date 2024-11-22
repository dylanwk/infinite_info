"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import { gql, useQuery } from "@apollo/client";
import client from "@/lib/apolloClient";

import { createPolyTrackFeature } from "@/lib/helper/fillExtrusion";

import image from "@/public/images/757.svg";

import * as turf from "@turf/turf";

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
        zoom: 9,
        center: [-103.3895269227353, 40.319005569933466],
        pitch: 45,
        bearing: 0
      });
    }

    const polyFeature = createPolyTrackFeature([
      {
        date: "2024-11-21 13:55:12Z",
        latitude: 39.874375,
        longitude: -102.176968,
        altitude: 37998.16,
        groundSpeed: 383.9205,
        verticalSpeed: -172.1623,
        track: 285.9657,
      },
      {
        date: "2024-11-21 13:58:34Z",
        latitude: 39.982994,
        longitude: -102.574692,
        altitude: 37999.836,
        groundSpeed: 349.6915,
        verticalSpeed: 26.6476,
        track: 290.1258,
      },
      {
        date: "2024-11-21 14:01:54Z",
        latitude: 40.093696,
        longitude: -102.972348,
        altitude: 37999.914,
        groundSpeed: 351.7333,
        verticalSpeed: -25.1237,
        track: 289.8553,
      },
      {
        date: "2024-11-21 14:05:14Z",
        latitude: 40.2038,
        longitude: -103.374344,
        altitude: 38000.09,
        groundSpeed: 354.3656,
        verticalSpeed: -14.4321,
        track: 289.5796,
      },
    ]);

    mapRef.current?.on("style.load", () => {
      // This is 2d line feature colleciton
      // mapRef.current?.addSource('track-data', {
      //   type: 'geojson',
      //   lineMetrics: true,
      //   data: {
      //     type: 'FeatureCollection',
      //     features: [
      //       {
      //         type: 'Feature',
      //         properties: {
      //           altitude: 38000
      //         },
      //         geometry: {
      //           type: 'LineString',
      //           coordinates: [
      //             [-102.176968, 39.874375],
      //             [-102.574692, 39.982994]
      //           ],
      //         }
      //       },
      //       {
      //         type: 'Feature',
      //         properties: {
      //           altitude: 38000
      //         },
      //         geometry: {
      //           type: 'LineString',
      //           coordinates: [
      //             [-102.574692, 39.982994],
      //             [-102.972348, 40.093696]
      //           ],
      //         }
      //       },
      //       {
      //         type: 'Feature',
      //         properties: {
      //           altitude: 38000
      //         },
      //         geometry: {
      //           type: 'LineString',
      //           coordinates: [
      //             [-102.972348, 40.093696],
      //             [40.2038, -103.374344].reverse()
      //           ],
      //         }
      //       }
      //     ]
      //   }
      // });

      //mapRef.current?.addImage('plane', image, { sdf: true });

      // this is 3d line feature
      mapRef.current?.addSource("track-data", {
        type: "geojson",
        lineMetrics: true,
        data: {
          type: "FeatureCollection",
          features: polyFeature,
        },
      });

      mapRef.current?.addLayer({
        id: "track-layer",
        type: "fill-extrusion",
        source: "track-data",
        paint: {
          "fill-extrusion-color": "red",
          "fill-extrusion-height": ["get", "altitude"],
          "fill-extrusion-opacity": 0.5,
        },
      });

      // This is plane stuff
      mapRef.current?.addSource("plane-data", {
        type: "geojson",
        lineMetrics: true,
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                altitude: 20,
                heading: 285,
              },
              geometry: {
                type: "Point",
                coordinates: [-103.374344, 40.2038],
              },
            },
          ],
        },
      });

      mapRef.current?.addLayer({
        id: "plane-layer",
        type: "symbol",
        source: "plane-data",
        layout: {
          "icon-image": "test1",
          "icon-rotate": ["get", "heading"],
          "icon-pitch-alignment": "map",
        },
        paint: {
          "icon-opacity": 1,
          "icon-translate": [0, -400]
        },
      });

      const updateIconTranslate = () => {
        const features = mapRef.current?.queryRenderedFeatures({
          layers: ["plane-layer"],
        });

        features?.forEach((feature) => {
          const altitude = feature?.properties?.altitude; // Building height from GeoJSON
          const centroid = turf.centroid(feature); // Calculate the centroid of the building
          const screenPosition = mapRef.current?.project(
            centroid.geometry.coordinates as [number, number]
          );

          // Calculate pixel offset for altitude
          const altitudeInPixels = altitudeToPixelOffset(
            altitude,
            screenPosition
          );
          //console.log(altitudeInPixels)
          // Apply icon-translate dynamically
          console.log(altitudeInPixels)
          mapRef.current?.setPaintProperty("plane-layer", "icon-translate", [altitudeInPixels[0], altitudeInPixels[1]]);
        });
      };

      // Utility function: Convert altitude to pixel offset
      const altitudeToPixelOffset = (altitude, coordinates) => {
        const pitch = (mapRef.current?.getPitch() ?? 0) * (Math.PI / 180); // Convert pitch to radians
        //console.log(mapRef.current?.getPitch())
        const bearing = (mapRef.current?.getBearing() ?? 0) * (Math.PI / 180); // Convert bearing to radians
      
        const scalingFactor = 40; // Scale the altitude to an appropriate screen space size

        // Step 1: Calculate the vertical offset based on altitude
        const verticalOffset = altitude * scalingFactor;

        // Step 2: Adjust the vertical offset for the map's pitch (how much it's tilted)
        const adjustedVerticalOffset = verticalOffset * (Math.sin(pitch));

        // Step 3: Account for the bearing to determine the horizontal and vertical screen-space offset
        const offsetX = adjustedVerticalOffset * Math.sin(bearing);
        const offsetY = -adjustedVerticalOffset * Math.cos(bearing);

        return [offsetX, offsetY];
      
      };

      // Call update function initially and on zoom/move
       mapRef.current?.on("zoom", updateIconTranslate);
       mapRef.current?.on("move", updateIconTranslate);
      // updateIconTranslate();
    });

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
      ></div>
    </>
  );
};

export default Map;
