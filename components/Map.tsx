"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { MapMouseEvent } from "mapbox-gl";
import { Airport, DEFAULT, MapStyle, IconSize, PROJECTION_TYPE } from "@/lib/types";
import client from "@/lib/apolloClient";
import { Feature, Point } from "geojson";
import { AIRCRAFT_ZOOM, AIRPORT_ZOOM } from "@/lib/constants";

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
import AirportProvider from "./AirportDrawer/AirportProvidor";
import SettingsDialog from "./SettingsDialog";
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useAirports } from "@/hooks/useAirports";
import { useMapbox } from "@/hooks/useMapbox";
import { useFlightsData } from "@/hooks/useFlightsData";
import { useFlightPathData } from "@/hooks/useFlightpathData";
import { useTimeout } from "@/hooks/useTimeout";
import usePersistentState from "@/hooks/usePersistentState";

import { addOrUpdateAirportsLayer, addOrUpdateAircraftLayer, addOrUpdateFlightPathLayer } from "@/lib/mapUtils";

import "../styles/globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

const SETTINGS_KEYS = {
  MAP_STYLE: "mapStyle",
  ICON_SIZE: "mapIconSize",
  PROJECTION: "mapProjection",
  SHOW_TRACK: "mapShowTrack",
  SELECTED_SESSION: "selectedSession"
};

const Map = () => {
  // #region Refs and State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const listenersAttachedRef = useRef(false);
  const isInitialMount = useRef(true);

  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);

  // persistent states
  const [selectedSession, setSelectedSession] = usePersistentState<string>(SETTINGS_KEYS.SELECTED_SESSION, "");
  const [mapStyle, setMapStyle] = usePersistentState<MapStyle>(SETTINGS_KEYS.MAP_STYLE, DEFAULT);
  const [iconSize, setIconSize] = usePersistentState<IconSize>(SETTINGS_KEYS.ICON_SIZE, 0.3);
  const [projection, setProjection] = usePersistentState<PROJECTION_TYPE>(SETTINGS_KEYS.PROJECTION, "globe");
  const [showTrack, setShowTrack] = usePersistentState<boolean>(SETTINGS_KEYS.SHOW_TRACK, true);

  // #endregion

  // #region Custom Hook Usage

  const { map, isStyleLoaded, setIsStyleLoaded, mapError } = useMapbox({
    containerRef: mapContainerRef,
    initialStyle: mapStyle
  });

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

  // --- Aircraft Layer Interactions ---

  const handleAircraftClick = useCallback(
    (e: MapMouseEvent & { features?: Feature<Point>[] }) => {
      if (!e.features?.length) return;

      const flightId = e.features[0]?.properties?.id as string | undefined;
      console.log("\n ", flightId, "\n")
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

  const handleFlightDrawerClose = useCallback(() => {
    setDrawerExpanded(false);
    setSelectedFlightId(null);
  }, []);

  const handleAirportDrawerClose = useCallback(() => {
    setSelectedAirport(null);
  }, []);

  const handleSettingsClose = () => setSettingsModal(false);

  // toggle map projection
  const toggleProjection = useCallback(() => {
    const newProjection = projection === "globe" ? "mercator" : "globe";
    setProjection(newProjection);

    if (map) {
      map.setProjection(newProjection);
      // store current center and zoom
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();

      // give the map a moment to process the projection change, then fly to same location
      setTimeout(() => {
        if (map) {
          map.flyTo({
            center: currentCenter,
            zoom: currentZoom,
            duration: 1000
          });
        }
      }, 50);
    }
  }, [projection, map, setProjection]);

  // #endregion

  // #region Map Layer Updates

  // handle map style changes
  useEffect(() => {
    if (!map || !mapStyle) {
      return;
    }

    // skip this effect logic on first run
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setIsStyleLoaded(false);
    map.setStyle(mapStyle);

    map.once("style.load", () => {
      setIsStyleLoaded(true);
      map.resize();
      listenersAttachedRef.current = false;
    });

  }, [mapStyle, map, setIsStyleLoaded]); 


  // fetch initial airports when map is ready
  useEffect(() => {
    if (isStyleLoaded && selectedSession) {
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
      addOrUpdateAircraftLayer(map, flights, iconSize);
    }
  }, [map, isStyleLoaded, flights, iconSize]);

  // add/update Flight Path layer
  useEffect(() => {
    if (map && isStyleLoaded) {
      addOrUpdateFlightPathLayer(map, flightPath, showTrack);
    }
  }, [map, isStyleLoaded, flightPath, showTrack]);

  // resize map when drawer state changes
  useEffect(() => {
    map?.resize();
  }, [drawerExpanded, map]);

  // updates map layer each iconSize change
  useEffect(() => {
    if (!isStyleLoaded) return;

    if (map && map.getLayer("aircraft-layer")) {
      map.setLayoutProperty("aircraft-layer", "icon-size", iconSize);
    }
  }, [iconSize, isStyleLoaded, map]);

  // handle projection changes
  useEffect(() => {
    if (map && isStyleLoaded) {
      map.setProjection(projection);
    }
  }, [projection, isStyleLoaded, map]);

  // effect for flight path visibility
  useEffect(() => {
    if (!map || !isStyleLoaded) return;

    const layerId = "flight-route";

    if (map.getLayer(layerId)) {
      const visibility = showTrack ? "visible" : "none";
      map.setLayoutProperty(layerId, "visibility", visibility);
    } else {
      console.warn(`Layer ${layerId} not found when trying to set visibility.`);
    }
  }, [map, isStyleLoaded, showTrack]);

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
  }, [map, isStyleLoaded, handleMapClick, handleAircraftClick, handleAircraftHoverEnter, handleAircraftHoverExit]); // run if map or handlers change

  // #endregion

  // #region Render Logic

  if (mapError) {
    return <div className="error-message">Error initializing map: {mapError.message}</div>;
  }

  return (
    <>
      <MapHeader
        selectedSession={selectedSession}
        onSessionChange={setSelectedSession}
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        onSettingsClick={() => setSettingsModal(true)}
      />
      <SettingsDialog
        onIconSizeChange={value => setIconSize(value)}
        iconSize={iconSize}
        open={settingsModal}
        handleClose={handleSettingsClose}
        projection={projection}
        onProjectionChange={toggleProjection}
        showTrack={showTrack}
        onFPLChange={() => setShowTrack(!showTrack)}
      />

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
              <DialogDescription>You&apos;ve been inactive. Click Continue to keep the map live.</DialogDescription>
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
        <AirportProvider key={selectedAirport.icao} airport={selectedAirport} handleClose={handleAirportDrawerClose} />
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
