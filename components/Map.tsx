"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl, {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  MapMouseEvent,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FlightsV2_Type } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { FlightsV2 } from "@/lib/query";
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
import { MapHeader } from "./MapHeader";

const Map = () => {
  // #region State and Refs

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleLoadedRef = useRef<boolean>(false);
  const aircraftDataSourceRef = useRef<GeoJSONSource | null>(null);
  const flightsRef = useRef<FlightsV2_Type[]>([]);

  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const timeoutModalState = useRef(false);
  const [timeoutModal, setTimeoutModal] = useState(false);
  const activityTimerRef = useRef(new Date());

  const [selectedSession, setSelectedSession] = useState<string>("");
  const selectedSessionRef = useRef(selectedSession);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  // Fetch flights when session changes
  useEffect(() => {
    if (styleLoadedRef.current && selectedSession) {
      fetchFlights(selectedSession);
    }
  }, [selectedSession]);

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

      // Event listeners
      mapRef.current.on("click", handleMapClick);
      mapRef.current.on("click", "aircraft-layer", handleAircraftClick as any); // Type assertion required
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
        fetchFlights(selectedSession);
        trackUserAction();
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  // #endregion

  // #region Event Handlers

  /** Handles closing of flight drawer */
  const handleDrawerClose = () => {
    setDrawerExpanded(false);
    setSelectedFlight(null);
  };

  /** Handles opening of flight drawer */
  const handleDrawerOpen = () => setDrawerExpanded(true);

  /** Handles clicking on an aircraft */
  const handleAircraftClick = (
    e: MapMouseEvent & {
      features?: (Feature<LineString, GeoJsonProperties> | undefined)[];
    }
  ) => {
    const flightId = e.features?.[0]?.properties?.id as string | undefined;
    if (flightId) setSelectedFlight(flightId);
    trackUserAction();
  };

  /** Handles clicking on the map (deselects aircraft) */
  const handleMapClick = () => {
    setSelectedFlight(null);
    trackUserAction();
  };

  /** Changes cursor to pointer on aircraft hover */
  const handleAircraftHoverEnter = () => {
    mapRef.current!.getCanvas().style.cursor = "pointer";
  };

  /** Resets cursor when leaving aircraft */
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

  // Monitor inactivity and trigger timeout modal after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date().getTime() - activityTimerRef.current.getTime() > 300000) {
        handleTimeoutModalOpen();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh aircraft data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timeoutModalState.current && selectedSessionRef.current) {
        fetchFlights(selectedSession);
      }
    }, 60000); // 1 min

    return () => clearInterval(interval);
  }, []);

  // #endregion

  // #region Apollo Lazy Query

  const [fetchFlightsQuery] = useLazyQuery(FlightsV2, {
    client,
    fetchPolicy: "network-only",
    onCompleted: (data: { flightsv2: FlightsV2_Type[] }) => {
      if (data?.flightsv2) {
        flightsRef.current = data.flightsv2;
        updateAircraftLayer(data.flightsv2);
      }
    },
  });

  /** Fetches flights for a given session */
  const fetchFlights = useCallback(
    (session: string) => {
      fetchFlightsQuery({ variables: { input: { session } } });
    },
    [fetchFlightsQuery]
  );

  // #endregion

  // #region Map Updates

  /** Updates aircraft layer with fetched flight data */
  const updateAircraftLayer = (flights: FlightsV2_Type[]) => {
    if (!mapRef.current || !styleLoadedRef.current) return;

    const geoJsonData: FeatureCollection = {
      type: "FeatureCollection",
      features: flights.map((flight) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [flight.longitude, flight.latitude],
        },
        properties: {
          id: flight.id,
          heading: flight.heading,
          icon: "plane-icon",
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
            "icon-size": 0.3,
            "icon-allow-overlap": true,
            "icon-rotate": ["get", "heading"],
            "icon-rotation-alignment": "map",
          },
        });
      } else {
        dataSource.setData(geoJsonData);
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
      <MapHeader
        selectedSession={selectedSession}
        onSessionChange={(e) => setSelectedSession(e)}
      />
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
          currentSession={selectedSession}
          handleClose={handleDrawerClose}
        />
      )}
    </>
  );
  // #endregion
};

export default Map;
