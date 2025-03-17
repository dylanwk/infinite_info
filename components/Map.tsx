"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl, {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  MapMouseEvent,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Flights, GQL_Track_Type, Track } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { GET_FLIGHTS, GET_FLIGHTPATH } from "@/lib/query";
import client from "@/lib/apolloClient";
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
import {
  colourForAltitude,
  crossesAntiMeridian,
  feetToMetres,
} from "@/lib/utils";
import useMediaQuery from "@mui/material/useMediaQuery";
import DrawerProvider from "./FlightDrawer/DrawerProvider";

const INACTIVITY_TIMEOUT_MS = 300000; // 5 minutes
const REFRESH_INTERVAL_MS = 60000; // 1 minute
const MAPBOX_STYLE = "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx/draft";
const AIRCRAFT_ZOOM = 5; // Zoom level when centering on aircraft

const Map = () => {
  // #region State and Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const styleLoadedRef = useRef<boolean>(false);
  const aircraftDataSourceRef = useRef<GeoJSONSource | null>(null);
  const flightsRef = useRef<Flights[]>([]);

  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const selectedFlightRef = useRef<string | null>(null);

  const flightPathRef = useRef<Track[] | null>(null);
  const [flightPath, setFlightPath] = useState<Track[] | null>(null);

  const timeoutModalState = useRef(false);
  const [timeoutModal, setTimeoutModal] = useState(false);
  const activityTimerRef = useRef(new Date());

  const [selectedSession, setSelectedSession] = useState<string>("");
  const selectedSessionRef = useRef(selectedSession);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [fetchFlights] = useLazyQuery(GET_FLIGHTS, {
    client,
    fetchPolicy: "network-only",
    onCompleted: (data: { flightsv2: Flights[] }) => {
      if (data?.flightsv2) {
        flightsRef.current = data.flightsv2;
        updateAircraftLayer(data.flightsv2);
      }
    },
  });

  const [fetchFlightPath] = useLazyQuery(GET_FLIGHTPATH, {
    client,
    onCompleted: (data: { flightv2: { track: GQL_Track_Type[] } }) => {
      if (data?.flightv2) {
        // must hard convert type to change attribute names. ex: b -> longitude
        const convertAttributeNames = (track: GQL_Track_Type[]): Track[] => {
          return track.map((item) => ({
            altitude: item.a,
            latitude: item.b,
            longitude: item.c,
            heading: item.h,
            nearestAirport: item.i,
            reportedTime: item.r,
            speed: item.s,
            verticalSpeed: item.v,
            aircraftState: item.z,
          }));
        };

        const convertedFlightPath = convertAttributeNames(data.flightv2.track);

        flightPathRef.current = convertedFlightPath;
        setFlightPath(convertedFlightPath);
      }
    },
  });

  // #endregion

  // #region Event Handlers

  const handleDrawerClose = () => {
    setDrawerExpanded(false);
    setSelectedFlight(null);
    setFlightPath(null);
  };

  const handleDrawerOpen = () => setDrawerExpanded(true);

  const handleAircraftHoverEnter = () => {
    mapRef.current!.getCanvas().style.cursor = "pointer";
  };

  const handleAircraftHoverExit = () => {
    mapRef.current!.getCanvas().style.cursor = "";
  };

  useEffect(() => {
    if (!selectedFlight || !flightPath) {
      addFlightPositions([]);
    }

    addFlightPositions(flightPath || []);
  }, [flightPath, selectedFlight]);

  // Function to center map on the selected flight
  const centerMapOnSelectedFlight = (flightId: string | null) => {
    if (!flightId || !mapRef.current) return;

    // Find the flight in the current flights data
    const flight = flightsRef.current.find((f) => f.id === flightId);

    if (flight) {
      // Fly to the aircraft position with animation
      mapRef.current.flyTo({
        center: [flight.longitude, flight.latitude],
        zoom: AIRCRAFT_ZOOM,
        duration: 1500,
        essential: true,
      });
    }
  };

  const handleAircraftClick = useCallback(
    (
      e: MapMouseEvent & {
        features: (Feature<LineString, GeoJsonProperties> | undefined)[];
      }
    ) => {
      const flightId = e.features?.[0]?.properties?.id as string | undefined;
      if (flightId) {
        setSelectedFlight(flightId);
        selectedFlightRef.current = flightId;
      }
      centerMapOnSelectedFlight(selectedFlightRef.current);
      fetchFlightPath({
        variables: {
          input: { id: flightId, session: selectedSessionRef.current },
        },
      });
      trackUserAction();
    },
    [fetchFlightPath]
  );

  /** Handles clicking on the map (deselects aircraft) */
  const handleMapClick = useCallback(() => {
    setSelectedFlight(null);
    flightPathRef.current = null;
    setDrawerExpanded(false);
    setFlightPath(null);
    trackUserAction();
  }, []);

  // #region Effects

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

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
        style: MAPBOX_STYLE,
        zoom: 1.8,
        maxZoom: 18,
        renderWorldCopies: false, // don't render multiple world copies
        attributionControl: false, // Removed Mapbox attribution
        preserveDrawingBuffer: false, // don't preserve drawing buffer
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
    if (selectedSessionRef.current) {
      fetchFlights({
        variables: { input: { session: selectedSessionRef.current } },
      });
    }
  };

  const handleTimeoutModalOpen = () => {
    setTimeoutModal(true);
    timeoutModalState.current = true;
  };

  // Monitor inactivity and trigger timeout modal
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        new Date().getTime() - activityTimerRef.current.getTime() >
        INACTIVITY_TIMEOUT_MS
      ) {
        handleTimeoutModalOpen();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh aircraft data
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timeoutModalState.current && selectedSessionRef.current) {
        fetchFlights({
          variables: { input: { session: selectedSessionRef.current } },
        });
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchFlights]);

  // #endregion

  // #region Drawing

  /** Updates aircraft layer with fetched flight data */
  const updateAircraftLayer = (flights: Flights[]) => {
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

  /* This entire function was made by Cameron Alonso, the creator of liveflight.app */
  const addFlightPositions = (positions: Track[]) => {
    if (mapRef.current == null || !styleLoadedRef.current) return;

    let coordinates: [number, number][] = [];
    if (positions.length > 0) {
      coordinates.push([positions[0].longitude!, positions[0].latitude!]);
    }
    let hasCrossedMeridian = false;
    for (let i = 0; i < positions.length - 1; i++) {
      const currentCoords = positions[i];
      const nextCoords = positions[i + 1];

      const startLng = currentCoords.longitude!;
      const endLng = nextCoords.longitude!;

      if (
        crossesAntiMeridian([
          [nextCoords.longitude || 0, nextCoords.latitude || 0],
          [currentCoords.longitude || 0, currentCoords.latitude || 0],
        ]) ||
        hasCrossedMeridian
      ) {
        if (endLng - startLng >= 180) {
          nextCoords.longitude! -= 360;
        } else if (endLng - startLng < 180) {
          nextCoords.longitude! += 360;
        }
        hasCrossedMeridian = true;
      }

      coordinates.push([nextCoords.longitude!, nextCoords.latitude!]);
    }

    // cancelled the simplify function, this is still needed to convert type from arr to obj
    const simplifiedLine = coordinates.map(([x, y]) => ({ x, y }));

    coordinates = simplifiedLine.map((point) => [point.x, point.y]);
    const simplifiedPositions = positions.filter((p) =>
      simplifiedLine.some((l) => l.x == p.longitude && l.y == p.latitude)
    );

    const features: Feature[] = [];
    for (let x = 0; x < coordinates.length - 1; x++) {
      features.push({
        type: "Feature",
        properties: {
          color: colourForAltitude(
            feetToMetres(simplifiedPositions[x].altitude || 0)
          ),
        },
        geometry: {
          type: "LineString",
          coordinates: [coordinates[x], coordinates[x + 1]]!,
        },
      });
    }

    const geoJsonData: GeoJSONSourceSpecification = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features,
      } as FeatureCollection<LineString, GeoJsonProperties>,
      tolerance: 0.1,
    };

    if (mapRef.current) {
      const existingRouteLine = mapRef.current.getSource("flight-route") as
        | GeoJSONSource
        | undefined;

      if (!existingRouteLine) {
        mapRef.current.addSource(
          "flight-route",
          geoJsonData as GeoJSONSourceSpecification
        );
      } else {
        existingRouteLine.setData(
          geoJsonData.data as FeatureCollection<LineString, GeoJsonProperties>
        );
      }

      if (!mapRef.current.getLayer("flight-route")) {
        mapRef.current.addLayer({
          id: "flight-route",
          type: "line",
          source: "flight-route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
          },
        });
      }
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
      <div id="map-container" ref={mapContainerRef} className={"h-[100vh]"} />
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
        <>
          <DrawerProvider
            handleOpen={handleDrawerOpen}
            flightId={selectedFlight}
            currentSession={selectedSession}
            handleClose={handleDrawerClose}
          />
        </>
      )}
    </>
  );
  // #endregion
};

export default Map;
