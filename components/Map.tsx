"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Airport, Flights, Track } from "@/lib/types";
import client from "@/lib/apolloClient";
import { Feature, Point, LineString, GeoJsonProperties } from "geojson";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Button } from "./ui/button";
import { MapHeader } from "./MapHeader";
import DrawerProvider from "./FlightDrawer/DrawerProvider";
import AirportDrawer from "./AirportDrawer/AirportDrawer";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useAirports } from "@/hooks/useAirports";
import { useMapbox } from "@/hooks/useMapbox";
import { useFlightsData } from "@/hooks/useFlightsData";
import { useFlightPathData } from "@/hooks/useFlightpathData";
import { useTimeout } from "@/hooks/useTimeout";

import { addOrUpdateAirportsLayer, addOrUpdateAircraftLayer, addOrUpdateFlightPathLayer } from "@/lib/mapUtils";
import { AIRCRAFT_ZOOM, AIRPORT_ZOOM } from "@/lib/constants";

import "../styles/globals.css";

const Map = () => {
  // #region Refs and State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  // #endregion

  // #region Custom Hook Usage

  const { map, isStyleLoaded, mapError } = useMapbox({ containerRef: mapContainerRef });
  const listenersAttachedRef = useRef(false);

  // --- Inactivity Timeout ---
  const { isTimedOut, handleContinue: handleTimeoutContinue } = useTimeout();

  // --- Airport Data ---
  const { airports, loading: airportsLoading, error: airportsError, getAirports } = useAirports(client);

  // --- Flights Data ---
  const {
    flights,
    loading: flightsLoading,
    error: flightsError
  } = useFlightsData({
    session: selectedSession,
    isMapReady: isStyleLoaded,
    isPaused: isTimedOut
  });

  // --- Flight Path Data ---
  const {
    flightPath,
    loading: flightPathLoading,
    error: flightPathError
  } = useFlightPathData({
    flightId: selectedFlightId,
    session: selectedSession
  });

  // #endregion

  // #region Event Handlers

  const centerMapOnCoords = useCallback(
    (coords: [number, number], zoom: number) => {
      map?.flyTo({
        center: coords,
        zoom: zoom,
        duration: 1500,
        essential: true
      });
    },
    [map]
  );

  // --- Airport Layer Interactions ---

  const handleAirportClick = useCallback(
    (icao: string) => {
      const clickedAirport = airports.find(a => a.icao === icao);

      if (clickedAirport) {
        setSelectedFlightId(null);
        setDrawerExpanded(false);
        setSelectedAirport(clickedAirport);

        if (typeof clickedAirport.latitude === "number" && typeof clickedAirport.longitude === "number") {
          centerMapOnCoords([clickedAirport.longitude, clickedAirport.latitude], AIRPORT_ZOOM);
        } else {
          console.warn("Invalid coordinates for selected airport:", clickedAirport);
        }
      } else {
        console.warn(`Airport with ICAO ${icao} not found in current data.`);
      }
    },
    [airports, centerMapOnCoords]
  );

  const handleFlightDrawerClose = useCallback(() => {
    setDrawerExpanded(false);
    setSelectedFlightId(null);
  }, []);

  const handleAirportDrawerClose = useCallback(() => {
    setSelectedAirport(null);
  }, []);

  // --- Aircraft Layer Interactions ---
  const handleAircraftClick = useCallback(
    (e: MapMouseEvent & { features?: Feature<Point>[] }) => {
      if (!e.features?.length) return;

      const flightId = e.features[0]?.properties?.id as string | undefined;
      const coords = e.features[0]?.geometry.coordinates as number[] | undefined;

      if (flightId) {
        setSelectedAirport(null);
        setSelectedFlightId(flightId);
        setDrawerExpanded(true);

        if (coords) {
          centerMapOnCoords([coords[0], coords[1]], AIRCRAFT_ZOOM);
        }
      }
    },
    [centerMapOnCoords]
  );

  const handleAircraftHoverEnter = useCallback(() => {
    if (map) map.getCanvas().style.cursor = "pointer";
  }, [map]);

  const handleAircraftHoverExit = useCallback(() => {
    if (map) map.getCanvas().style.cursor = "";
  }, [map]);

  // --- General Map Interactions ---
  const handleMapClick = useCallback(() => {
    setSelectedFlightId(null);
    setSelectedAirport(null);
    setDrawerExpanded(false);
  }, []);

  // #endregion

  // #region Map Layer Updates

  // fetch initial airports when map is ready
  useEffect(() => {
    if (isStyleLoaded && selectedSession) {
      console.log("effect hit with ", selectedSession);

      getAirports({ server: selectedSession });
    } else {
      console.log("No session selected, skipping airport fetch.");
    }
  }, [isStyleLoaded, getAirports, selectedSession]);

  // add/update Airports layer and markers
  useEffect(() => {
    if (map && isStyleLoaded && airports.length >= 0) {
      addOrUpdateAirportsLayer(map, airports, handleAirportClick);
    }
  }, [map, isStyleLoaded, airports, handleAirportClick]);

  // add/update Aircraft layer
  useEffect(() => {
    if (map && isStyleLoaded) {
      console.log("Updating aircraft layer.");
      addOrUpdateAircraftLayer(map, flights);
    }
  }, [map, isStyleLoaded, flights]);

  // add/update Flight Path layer
  useEffect(() => {
    if (map && isStyleLoaded) {
      addOrUpdateFlightPathLayer(map, flightPath);
    }
  }, [map, isStyleLoaded, flightPath]);

  // resize map when drawer state changes
  useEffect(() => {
    map?.resize();
  }, [drawerExpanded, map]);

  // #endregion

  // #region Map Setup

  useEffect(() => {
    if (!map || !isStyleLoaded || listenersAttachedRef.current) return;

    map.on("click", handleMapClick);

    // aircraft layer listeners
    if (map.getLayer("aircraft-layer")) {
      map.on<"click">("click", "aircraft-layer", handleAircraftClick as never);
      map.on("mouseenter", "aircraft-layer", handleAircraftHoverEnter);
      map.on("mouseleave", "aircraft-layer", handleAircraftHoverExit);
    } else {
      console.warn("Aircraft layer not found when attempting to attach listeners.");
    }

    listenersAttachedRef.current = true;
  }, [map, isStyleLoaded, handleMapClick, handleAircraftClick, handleAircraftHoverEnter, handleAircraftHoverExit]); // Re-run if map or handlers change

  // #endregion

  // #region Render Logic

  if (mapError) {
    return <div className="error-message">Error initializing map: {mapError.message}</div>;
  }

  return (
    <>
      <MapHeader selectedSession={selectedSession} onSessionChange={setSelectedSession} />
      {/* Map container */}
      <div id="map-container" ref={mapContainerRef} className={"h-[100vh]"} />
      {!isStyleLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <span className="font-medium">Loading Map...</span>
            </div>
          </div>
        )}

      {/* Inactivity Timeout Modal */}
      <Dialog open={isTimedOut}>
        <DialogContent className="max-w-[425px] mx-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
            <div className="my-1.5">
              <DialogDescription>
                {/* Updated text */}
                You&apos;ve been inactive. Click Continue to keep the map live.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" onClick={handleTimeoutContinue}>
                Continue
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flight Details Drawer */}
      {selectedFlightId && (
        <DrawerProvider
          key={selectedFlightId}
          handleOpen={() => setDrawerExpanded(true)}
          flightId={selectedFlightId}
          currentSession={selectedSession}
          handleClose={handleFlightDrawerClose}
        />
      )}

      {/* Airport Details Drawer */}
      {selectedAirport && (
        <AirportDrawer key={selectedAirport.icao} airport={selectedAirport} handleClose={handleAirportDrawerClose} />
      )}

      {(flightsError || airportsError || flightPathError) && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            left: "10px",
            background: "rgba(255,0,0,0.7)",
            color: "white",
            padding: "5px",
            borderRadius: "4px",
            zIndex: 5
          }}
        >
          {flightsError && <p>Error loading flights: {flightsError.message}</p>}
          {airportsError && <p>Error loading airports: {airportsError.message}</p>}
          {flightPathError && <p>Error loading flight path: {flightPathError.message}</p>}
        </div>
      )}
    </>
  );
  // #endregion
};

export default Map;
