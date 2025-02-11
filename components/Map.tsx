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

  const [fetchFlights] = useLazyQuery(FlightsV2, {
    client,
    fetchPolicy: "network-only",
    onCompleted: (data: { flightsv2: FlightsV2_Type[] }) => {
      if (data?.flightsv2) {
        flightsRef.current = data.flightsv2;
        updateAircraftLayer(data.flightsv2);
      }
    },
  });

  // #endregion

  // #region Event Handlers

  /** Handles closing of flight drawer */
  const handleDrawerClose = () => {
    setDrawerExpanded(false);
    setSelectedFlight(null);
  };

  /** Handles opening of flight drawer */
  const handleDrawerOpen = () => setDrawerExpanded(true);

  /** Changes cursor to pointer on aircraft hover */
  const handleAircraftHoverEnter = () => {
    mapRef.current!.getCanvas().style.cursor = "pointer";
  };

  /** Resets cursor when leaving aircraft */
  const handleAircraftHoverExit = () => {
    mapRef.current!.getCanvas().style.cursor = "";
  };

  const handleAircraftClick = useCallback(
    (
      e: MapMouseEvent & {
        features: (Feature<LineString, GeoJsonProperties> | undefined)[];
      }
    ) => {
      const flightId = e.features?.[0]?.properties?.id as string | undefined;
      if (flightId) setSelectedFlight(flightId);
      trackUserAction();
    },
    []
  );

  /** Handles clicking on the map (deselects aircraft) */
  const handleMapClick = useCallback(() => {
    setSelectedFlight(null);
    trackUserAction();
  }, []);

  // #region Effects

  // Update selected session ref when session changes
  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  // Fetch flights when session changes
  useEffect(() => {
    if (styleLoadedRef.current && selectedSession) {
      fetchFlights({ variables: { input: { session: selectedSession } } });
    }
  }, [selectedSession, fetchFlights]);

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
      mapRef.current.on(
        "click",
        "aircraft-layer",
        handleAircraftClick as never
      ); // Type assertion required
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
        fetchFlights({
          variables: { input: { session: selectedSessionRef.current } },
        });
        trackUserAction();
      });
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [fetchFlights, handleAircraftClick, handleMapClick]);

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
        fetchFlights({
          variables: { input: { session: selectedSessionRef.current } },
        });
      }
    }, 60000); // 1 min

    return () => clearInterval(interval);
  }, [fetchFlights]);

  // #endregion

  // #region Drawing

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
