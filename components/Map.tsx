"use client";

/**
 * Map Component for displaying flights using Mapbox GL.
 *
 * Possible Optimizations:
 * - Use lazy loading for Mapbox and styles.
 * - Debounce or throttle network requests.
 * - Configure Mapbox workers to optimze worker threads
 */

import { useRef, useEffect, useState } from "react";
import mapboxgl, {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  Map as Mapbox,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Flight_Test } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { GET_FLIGHTS } from "@/lib/query";
import client from "@/lib/apolloClient";

const Map = () => {
  // Mapbox instance
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleLoadedRef = useRef<boolean>(false);

  // Ref for flight data
  const flightsRef = useRef<Flight_Test[]>([]);
  const [, forceUpdate] = useState(0); // Use this only to trigger re-renders

  // Tracks active aircraft data source
  const aircraftDataSourceRef = useRef<GeoJSONSource | null>(null);

  // Effect: Initialize the map
  useEffect(() => {
    if (mapContainerRef.current) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_ETHANS_MAPBOX_TOKEN || "";

      // Initialize Mapbox
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx/draft",
        zoom: 1.8,
      });

      // Once the map style loads, fetch flights and load images
      mapRef.current.on("style.load", () => {
        styleLoadedRef.current = true;
        mapRef.current?.resize();
        loadPlaneIcon();
        fetchFlights();
      });
    }

    // Cleanup map instance on component unmount
    return () => {
      mapRef.current?.remove();
    };
  }, []);


  /**
   * Load the plane icon into Mapbox using the imported image.
   */
  const loadPlaneIcon = () => {
    if (!mapRef.current?.hasImage("plane-icon")) {
      const img = new Image();
      img.src = "/images/757.svg" // Use the imported image's `src` property.
      img.onload = () => {
        mapRef.current?.addImage("plane-icon", img, { sdf: true });
      };
      img.onerror = (error) => {
        console.error("Failed to load plane icon:", error);
      };
    }
  };


  /**
   * Fetch flights from the GraphQL API and update state.
   */
  const [fetchFlights] = useLazyQuery(GET_FLIGHTS, {
    client,
    variables: { server: "CASUAL", max: 100 },
    onCompleted: (data: { flights: Flight_Test[] }) => {
      if (data?.flights) {
        flightsRef.current = data.flights;
        updateAircraftLayer(flightsRef.current);
        // forceUpdate((prev) => prev + 1) // Trigger UI updates (e.g., for flight count)
      }
    },
  });

  /**
   * Add or update the aircraft layer on the map.
   * @param flights - Array of flight data to display
   */
  const updateAircraftLayer = (flights: Flight_Test[]) => {
    if (!mapRef.current || !styleLoadedRef.current) return;

    // Create GeoJSON source from flight data
    const geoJsonSource: GeoJSONSourceSpecification = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: flights.map((flight) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [flight.longitude, flight.latitude],
          },
          properties: {
            id: flight.flightId,
            heading: flight.heading,
            speed: flight.speed,
            aircraftName: flight.aircraft,
            icon: "plane-icon",
            callsign: flight.callsign,
            altitude: flight.altitude,
          },
        })),
      },
    };

    // Add or update GeoJSON source
    const dataSource = mapRef.current.getSource("aircraft") as GeoJSONSource;
    if (!dataSource) {
      console.log(`Adding aircraft source with ${flights.length} flights`);
      mapRef.current.addSource("aircraft", geoJsonSource);
      aircraftDataSourceRef.current = mapRef.current.getSource(
        "aircraft"
      ) as GeoJSONSource;

      // Add layer for aircraft if it doesn't exist
      mapRef.current.addLayer({
        id: "aircraft-layer",
        type: "symbol",
        source: "aircraft",
        layout: {
          "icon-image": "test1",
          "icon-size": 0.5,
          "icon-allow-overlap": true,
          "icon-rotate": ["get", "heading"],
          "icon-rotation-alignment": "map",
        },
      });
    } else {
      console.log(`Updating aircraft source with ${flights.length} flights`);
      dataSource.setData(geoJsonSource.data as GeoJSON.FeatureCollection);
    }
  };

  // Render the map container
  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      className="h-[100vh] w-full"
    />
  );
};

export default Map;
