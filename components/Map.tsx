"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl, { GeoJSONSource, GeoJSONSourceSpecification, MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Airport, Flights, GQL_Track_Type, Track } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { GET_FLIGHTS, GET_FLIGHTPATH } from "@/lib/query";
import client from "@/lib/apolloClient";
import { Feature, GeoJsonProperties, LineString, FeatureCollection, Point } from "geojson";
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
import { colourForAltitude, crossesAntiMeridian, feetToMetres } from "@/lib/utils";
import DrawerProvider from "./FlightDrawer/DrawerProvider";
import { useAirports } from "@/hooks/useAirports";
import "../styles/globals.css";
import AirportDrawer from "./AirportDrawer/AirportDrawer";

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

  const { airports, loading, error, getAirports } = useAirports(client);
  const selectedAirportRef = useRef<Airport | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  const [fetchFlights] = useLazyQuery(GET_FLIGHTS, {
    client,
    fetchPolicy: "network-only",
    onCompleted: (data: { flightsv2: Flights[] }) => {
      if (data?.flightsv2) {
        flightsRef.current = data.flightsv2;
        updateAircraftLayer(data.flightsv2);
      }
    }
  });

  const [fetchFlightPath] = useLazyQuery(GET_FLIGHTPATH, {
    client,
    onCompleted: (data: { flightv2: { track: GQL_Track_Type[] } }) => {
      if (data?.flightv2) {
        // must hard convert type to change attribute names. ex: b -> longitude
        const convertAttributeNames = (track: GQL_Track_Type[]): Track[] => {
          return track.map(item => ({
            altitude: item.a,
            latitude: item.b,
            longitude: item.c,
            heading: item.h,
            nearestAirport: item.i,
            reportedTime: item.r,
            speed: item.s,
            verticalSpeed: item.v,
            aircraftState: item.z
          }));
        };

        const convertedFlightPath = convertAttributeNames(data.flightv2.track);

        flightPathRef.current = convertedFlightPath;
        setFlightPath(convertedFlightPath);
      }
    }
  });

  // #endregion

  // #region Event Handlers

  const handleFlightDrawerClose = () => {
    setDrawerExpanded(false);
    setSelectedFlight(null);
    setFlightPath(null);
  };

  const handleAirportDrawerClose = () => {
    setSelectedAirport(null);
  };

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

  const centerMapOnSelectedFlight = (flightId: string | null) => {
    if (!flightId || !mapRef.current) return;

    const flight = flightsRef.current.find(f => f.id === flightId);

    if (flight) {
      mapRef.current.flyTo({
        center: [flight.longitude, flight.latitude],
        zoom: AIRCRAFT_ZOOM,
        duration: 1500,
        essential: true
      });
    }
  };

  // helper function to convert MapEvent to type-safe icao
  const airportClickProcessor = (
    e: MapMouseEvent & {
      features?: Feature<Point, GeoJsonProperties>[];
    }
  ) => {
    if (!mapRef.current || !e.features?.length) return;

    const feature = e.features[0];
    const airport_icao = feature?.properties?.icao;

    if (typeof airport_icao !== "string") {
      console.log("Airport ICAO not found");
      return;
    }

    handleAirportClick(airport_icao);
  };

  const handleAirportClick = (icao: string) => {
    if (!mapRef.current) return;

    const current_airport = airports.find(a => a.icao === icao);

    if (!current_airport) {
      console.log("Airport not found");
      return;
    }

    const { latitude, longitude } = current_airport;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      console.warn("Invalid airport coordinates");
      return;
    }

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 4,
      duration: 1500,
      essential: true
    });

    setSelectedAirport(current_airport);
    setSelectedFlight(null);
    selectedAirportRef.current = current_airport;
  };

  const handleAircraftClick = useCallback(
    (
      e: MapMouseEvent & {
        features: (Feature<LineString, GeoJsonProperties> | undefined)[];
      }
    ) => {
      setSelectedAirport(null);
      const flightId = e.features?.[0]?.properties?.id as string | undefined;
      if (flightId) {
        setSelectedFlight(flightId);
        selectedFlightRef.current = flightId;
      }
      centerMapOnSelectedFlight(selectedFlightRef.current);
      fetchFlightPath({
        variables: {
          input: { id: flightId, session: selectedSessionRef.current }
        }
      });
      trackUserAction();
    },
    [fetchFlightPath]
  );

  /** Handles clicking on the map (deselects aircraft) */
  const handleMapClick = useCallback(() => {
    setSelectedFlight(null);
    setSelectedAirport(null);
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
        preserveDrawingBuffer: false // don't preserve drawing buffer
      });

      // Event listeners
      mapRef.current.on("click", handleMapClick);
      mapRef.current.on<"click">("click", "aircraft-layer", handleAircraftClick as never);
      mapRef.current.on("mouseenter", "aircraft-layer", handleAircraftHoverEnter);
      mapRef.current.on("mouseleave", "aircraft-layer", handleAircraftHoverExit);

      mapRef.current.on("style.load", () => {
        styleLoadedRef.current = true;
        mapRef.current?.resize();
        fetchFlights({
          variables: { input: { session: selectedSessionRef.current } }
        });
        // get airports without inputs for now
        getAirports({});
        addAirports(airports);

        trackUserAction();
      });
    }

    return () => {
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFlights, handleAircraftClick, handleMapClick]);

  // new effect to add airports
  useEffect(() => {
    if (airports.length > 0 && styleLoadedRef.current && mapRef.current) {
      addAirports(airports);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airports]);

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
        variables: { input: { session: selectedSessionRef.current } }
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
      if (new Date().getTime() - activityTimerRef.current.getTime() > INACTIVITY_TIMEOUT_MS) {
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
          variables: { input: { session: selectedSessionRef.current } }
        });
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchFlights]);

  // #endregion

  // #region Drawing

  const addAirports = (airports: Airport[]): void => {
    if (!mapRef.current || !styleLoadedRef.current || !airports.length) return;

    // create GeoJSON data structure for airports
    const geoJsonData: FeatureCollection = {
      type: "FeatureCollection",
      features: airports.map(airport => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [airport.longitude, airport.latitude]
        },
        properties: {
          id: airport.icao,
          name: airport.name,
          city: airport.city,
          hasATC: airport.atc && airport.atc.length > 0,
          has3dBuildings: airport.has3dBuildings,
          class: airport.class,
          iata: airport.iata,
          icao: airport.icao
        }
      }))
    };

    const geoJsonSource: GeoJSONSourceSpecification = {
      type: "geojson",
      data: geoJsonData,
      cluster: false
    };

    try {
      const existingSource = mapRef.current.getSource("airports") as GeoJSONSource | undefined;

      if (!existingSource) {
        mapRef.current.addSource("airports", geoJsonSource);

        mapRef.current.addLayer({
          id: "airports-layer",
          type: "circle",
          source: "airports",
          paint: {
            "circle-color": "#FF0000",
            "circle-radius": 6.5,
            "circle-opacity": 0.5,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });

        mapRef.current.on("click", "airports-layer", airportClickProcessor as never);
        mapRef.current.on("mouseenter", "airports-layer", () => {
          if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "airports-layer", () => {
          if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
        });
      } else {
        existingSource.setData(geoJsonData);
      }

      const existingMarkers = document.querySelectorAll(".airport-marker-container");
      existingMarkers.forEach(marker => marker.remove());

      const createElement = (tagName: string, className: string): HTMLElement => {
        const element = document.createElement(tagName);
        element.className = className;
        return element;
      };

      // atc type mapping
      const atcMapping: Record<number, string> = {
        0: "G", // Ground
        1: "T", // Tower
        2: "U", // Unicom
        3: "C", // Clearance
        4: "A", // Approach
        5: "D", // Departure
        6: "C", // Center
        7: "S", // ATIS
        8: "", // Aircraft
        9: "R", // Recorded
        10: "", // Unknown
        11: "" // Unused
      };

      airports.forEach(airport => {
        if (!airport.atc || airport.atc.length === 0) return;

        // create custom elements for airport marker
        const markerElement = createElement("div", "airport-marker-container");
        const airportBox = createElement("div", "airport-marker");
        const codeElement = createElement("div", "airport-code");
        const servicesElement = createElement("div", "airport-services");

        codeElement.textContent = airport.icao;

        // build yellow service code string
        const serviceCode = airport.atc
          .map(service => atcMapping[service.type] || "")
          .filter(code => code !== "")
          .join("");

        servicesElement.textContent = serviceCode;

        airportBox.appendChild(codeElement);
        airportBox.appendChild(servicesElement);
        markerElement.appendChild(airportBox);

        markerElement.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          handleAirportClick(airport.icao);
        });

        if (mapRef.current) {
          new mapboxgl.Marker({
            element: markerElement,
            anchor: "bottom",
            offset: [0, 0]
          })
            .setLngLat([airport.longitude, airport.latitude])
            .addTo(mapRef.current);
        }
      });
    } catch (error) {
      console.error("Error adding airports layer:", error);
    }
  };

  /** Updates aircraft layer with fetched flight data */
  const updateAircraftLayer = (flights: Flights[]) => {
    if (!mapRef.current || !styleLoadedRef.current) return;

    const geoJsonData: FeatureCollection = {
      type: "FeatureCollection",
      features: flights.map(flight => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [flight.longitude, flight.latitude]
        },
        properties: {
          id: flight.id,
          heading: flight.heading,
          icon: "plane-icon"
        }
      }))
    };

    const geoJsonSource: GeoJSONSourceSpecification = {
      type: "geojson",
      data: geoJsonData
    };

    try {
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
            "icon-size": 0.3,
            "icon-allow-overlap": true,
            "icon-rotate": ["get", "heading"],
            "icon-rotation-alignment": "map"
          }
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
          [currentCoords.longitude || 0, currentCoords.latitude || 0]
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

    coordinates = simplifiedLine.map(point => [point.x, point.y]);
    const simplifiedPositions = positions.filter(p =>
      simplifiedLine.some(l => l.x == p.longitude && l.y == p.latitude)
    );

    const features: Feature[] = [];
    for (let x = 0; x < coordinates.length - 1; x++) {
      features.push({
        type: "Feature",
        properties: {
          color: colourForAltitude(feetToMetres(simplifiedPositions[x].altitude || 0))
        },
        geometry: {
          type: "LineString",
          coordinates: [coordinates[x], coordinates[x + 1]]!
        }
      });
    }

    const geoJsonData: GeoJSONSourceSpecification = {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features
      } as FeatureCollection<LineString, GeoJsonProperties>,
      tolerance: 0.1
    };

    if (mapRef.current) {
      const existingRouteLine = mapRef.current.getSource("flight-route") as GeoJSONSource | undefined;

      if (!existingRouteLine) {
        mapRef.current.addSource("flight-route", geoJsonData as GeoJSONSourceSpecification);
      } else {
        existingRouteLine.setData(geoJsonData.data as FeatureCollection<LineString, GeoJsonProperties>);
      }

      if (!mapRef.current.getLayer("flight-route")) {
        mapRef.current.addLayer({
          id: "flight-route",
          type: "line",
          source: "flight-route",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2
          }
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
      <MapHeader selectedSession={selectedSession} onSessionChange={e => setSelectedSession(e)} />
      <div id="map-container" ref={mapContainerRef} className={"h-[100vh]"} />
      <Dialog open={timeoutModal}>
        <DialogContent className="max-w-[425px] mx-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
            <div className="my-1.5">
              <DialogDescription>
                You have been inactive for 15 minutes. To resume where you left off, click continue below.
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
            handleOpen={() => setDrawerExpanded(true)}
            flightId={selectedFlight}
            currentSession={selectedSession}
            handleClose={handleFlightDrawerClose}
          />
        </>
      )}

      {selectedAirport && <AirportDrawer airport={selectedAirport} handleClose={handleAirportDrawerClose} />}
    </>
  );
  // #endregion
};

export default Map;
