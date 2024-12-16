"use client";

/**
 * Map Component for displaying flights using Mapbox GL.
 */

import { useRef, useEffect, useState } from "react";
import mapboxgl, {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  MapMouseEvent,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Flight_Test } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { GET_FLIGHTS } from "@/lib/query";
import client from "@/lib/apolloClient";
import { FlightDrawer } from "./FlightDrawer";
import {
  Feature,
  GeoJsonProperties,
  LineString,
  FeatureCollection,
} from "geojson";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const Map = () => {
  // #region State and Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleLoadedRef = useRef<boolean>(false);

  const aircraftDataSourceRef = useRef<GeoJSONSource | null>(null);
  const flightsRef = useRef<Flight_Test[]>([]);

  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const timeoutModalState = useRef(false);
  const [timeoutModal, setTimeoutModal] = useState(false);
  const activityTimerRef = useRef(new Date());

  // #endregion

  // #region Map Initialization
  useEffect(() => {
    if (mapContainerRef.current) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_ETHANS_MAPBOX_TOKEN || "";

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx/draft",
        zoom: 1.8,
      });

      mapRef.current.on("click", handleMapClick);
      mapRef.current.on("click", "aircraft-layer", handleAircraftClick as any); // fails a build command
      mapRef.current.on(
        "mouseenter",
        "aircraft-layer",
        handleAircraftHoverEnter
      );
      mapRef.current.on(
        "mouseleave",
        "aircraft-layer",
        handleAircraftHoverExit
      );

      mapRef.current.on("style.load", () => {
        styleLoadedRef.current = true;
        mapRef.current?.resize();
        fetchFlights();
        trackUserAction();
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);
  // #endregion

  // #region Event Handlers

  const handleDrawerClose = () => setDrawerExpanded(false);
  const handleDrawerOpen = () => setDrawerExpanded(true);

  const handleAircraftClick = (
    e: MapMouseEvent & {
      features?: (Feature<LineString, GeoJsonProperties> | undefined)[];
    }
  ) => {
    const flightId = e.features?.[0]?.properties?.id as string | undefined;
    if (flightId) setSelectedFlight(flightId);
    trackUserAction();
  };

  const handleMapClick = () => {
    setSelectedFlight(null);
    trackUserAction();
  };

  // Change the cursor to a pointer when the mouse is over the aircraft-layer layer.
  const handleAircraftHoverEnter = () => {
    mapRef.current!.getCanvas().style.cursor = "pointer";
  };

  // Change it back to a pointer when it leaves.
  const handleAircraftHoverExit = () => {
    mapRef.current!.getCanvas().style.cursor = "";
  };

  // #endregion

  // #region Timeout Modal Handler

  const trackUserAction = () => {
    activityTimerRef.current = new Date();
  };

  const handleTimeoutModalClose = () => {
    setTimeoutModal(false);
    trackUserAction();
    timeoutModalState.current = false;
  };

  const handleTimeoutModalOpen = () => {
    setTimeoutModal(true);
    timeoutModalState.current = true;
  };

  // use useEffect so it only runs on mounts not renders (5 minute timeout)
  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date().getTime() - activityTimerRef.current.getTime() > 300000) {
        handleTimeoutModalOpen();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // aircraft coordinate refresher
  useEffect(() => {
    const interval = setInterval(() => {
      return new Promise(async (resolve) => {
        if (timeoutModalState.current) {
          resolve("Timeout modal open");
        } else {
          fetchFlights();
          resolve("Updated");
        }
      });
    }, 60000); // 1 min

    return () => clearInterval(interval);
  }, []);

  // #region Apollo Lazy Query

  const [fetchFlights] = useLazyQuery(GET_FLIGHTS, {
    client,
    variables: { server: "CASUAL", max: 100 },
    fetchPolicy: "network-only", // Dont use cache, so query updates coordinates
    onCompleted: (data: { flights: Flight_Test[] }) => {
      if (data?.flights) {
        flightsRef.current = data.flights;
        updateAircraftLayer(data.flights);
      }
    },
  });

  // #endregion

  // #region Map Updates

  const updateAircraftLayer = (flights: Flight_Test[]) => {
    if (!mapRef.current || !styleLoadedRef.current) return;

    // Create the GeoJSON data structure with explicit typing
    const geoJsonData: FeatureCollection = {
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
    };

    const geoJsonSource: GeoJSONSourceSpecification = {
      type: "geojson",
      data: geoJsonData,
    };

    try {
      const dataSource = mapRef.current.getSource("aircraft") as GeoJSONSource;

      if (!dataSource) {
        console.log(`Creating data source with ${flights.length} aircraft`);

        mapRef.current.addSource("aircraft", geoJsonSource);

        aircraftDataSourceRef.current = mapRef.current.getSource(
          "aircraft"
        ) as GeoJSONSource;

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
        console.log(`Updating data source with ${flights.length} aircraft\n`);
        (mapRef.current.getSource("aircraft") as GeoJSONSource).setData(
          geoJsonData
        );
      }
    } catch (error) {
      console.error("Error updating aircraft layer:", error);
    }
  };

  useEffect(() => {
    if (mapRef.current) mapRef.current.resize();
  }, [drawerExpanded]);
  // #endregion

  // #region Render
  return (
    <>
      <div
        id="map-container"
        ref={mapContainerRef}
        className={`h-[100vh] transition duration-1000 ${
          drawerExpanded ? "w-3/4" : "w-full"
        }`}
      />
      <Dialog open={timeoutModal}>
        <DialogContent className="max-w-[425px] mx-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
            <div className="my-1.5">
              <DialogDescription>
                You have been inactive for 15 minutes. To resume where you left
                off, click continue below.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="reset" onClick={handleTimeoutModalClose}>
                Continue
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {selectedFlight && (
        <FlightDrawer
          handleOpen={handleDrawerOpen}
          flightId={selectedFlight}
          server="CASUAL"
          handleClose={handleDrawerClose}
        />
      )}
    </>
  );
  // #endregion
};

export default Map;
