"use client";

/**
 * Map Component for displaying flights using Mapbox GL.
 */

import { useRef, useEffect, useState } from "react";
import mapboxgl, { GeoJSONSource, GeoJSONSourceSpecification, MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Flight_Test } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { GET_FLIGHTS } from "@/lib/query";
import client from "@/lib/apolloClient";
import { FlightDrawer } from "./FlightDrawer"; // Ensure this import is correct
import { Feature, GeoJsonProperties, LineString } from "geojson";

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleLoadedRef = useRef<boolean>(false);

  const flightsRef = useRef<Flight_Test[]>([]);
  const [, forceUpdate] = useState(0); // Only used to trigger re-renders

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const aircraftDataSourceRef = useRef<GeoJSONSource | null>(null);

  // Initialize the map
  useEffect(() => {
    if (mapContainerRef.current) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_ETHANS_MAPBOX_TOKEN || "";

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx/draft",
        zoom: 1.8,
      });

      mapRef.current.on('click', handleMapClick);
      mapRef.current.on("click", "aircraft-layer", handleAircraftClick as any);

      mapRef.current.on("style.load", () => {
        styleLoadedRef.current = true;
        mapRef.current?.resize();
        fetchFlights();
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  const handleAircraftClick = (
    e: MapMouseEvent & { features?: Feature<LineString, GeoJsonProperties>[] }
  ) => {
    const flightId = e.features?.[0]?.properties?.id as string | undefined;
    if (flightId) {
      setSelectedFlight(flightId);
      setDrawerOpen(true); // Open the drawer when a flight is selected
    }
  };

  const handleMapClick = () => {
    setSelectedFlight(null);
    setDrawerOpen(false);
  }

  const [fetchFlights] = useLazyQuery(GET_FLIGHTS, {
    client,
    variables: { server: "CASUAL", max: 100 },
    onCompleted: (data: { flights: Flight_Test[] }) => {
      if (data?.flights) {
        flightsRef.current = data.flights;
        updateAircraftLayer(flightsRef.current);
      }
    },
  });

  const updateAircraftLayer = (flights: Flight_Test[]) => {
    if (!mapRef.current || !styleLoadedRef.current) return;

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

    const dataSource = mapRef.current.getSource("aircraft") as GeoJSONSource;
    if (!dataSource) {
      mapRef.current.addSource("aircraft", geoJsonSource);
      aircraftDataSourceRef.current = mapRef.current.getSource("aircraft") as GeoJSONSource;

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
      dataSource.setData(geoJsonSource.data as GeoJSON.FeatureCollection);
    }
  };

  // Effect to resize the map when the drawer state changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [drawerOpen]);

  return (
    <>
      <div
        id="map-container"
        ref={mapContainerRef}
        className={`h-[100vh] ${drawerOpen ? "w-4/5" : "w-full"}`}
      />
      {drawerOpen && selectedFlight && (
        <FlightDrawer flightId={selectedFlight} server="CASUAL" />
      )}
    </>
  );
};

export default Map;
