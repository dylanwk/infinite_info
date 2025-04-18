import client from "@/lib/apolloClient";
import { GET_FLIGHT, GET_FPL_DISTANCE } from "@/lib/query";
import { DrawerView, Flight, FPLDistanceResponse, GQL_Track_Type } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GraphContent } from "./content/GraphContent";
import { FPLContent } from "./content/FPLContent";
import DefaultContent from "./content/DefaultContent";
import DesktopDrawer from "./DesktopDrawer";
import MobileDrawer from "./MobileDrawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Coordinate, calculateTotalFPLDistance, distanceLeft } from "@/lib/fplUtils";

interface DrawerProviderProps {
  flightId: string | null;
  currentSession: string;
  handleClose: () => void;
  handleOpen: () => void;
}

/**
 * Custom hook to manage flight data fetching and state
 */
const useFlightData = (flightId: string | null, currentSession: string) => {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [track, setTrack] = useState<GQL_Track_Type[]>([]);

  const [getFlightInfo, { loading, error }] = useLazyQuery(GET_FLIGHT, {
    client,
    onCompleted: data => {
      if (data?.flightv2) {
        const flightData: Flight = {
          latitude: parseFloat(data.flightv2.latitude),
          longitude: parseFloat(data.flightv2.longitude),
          speed: parseFloat(data.flightv2.speed),
          id: data.flightv2.id,
          userId: data.flightv2.userId,
          altitude: parseFloat(data.flightv2.altitude),
          callsign: data.flightv2.callsign,
          aircraft: data.flightv2.aircraft,
          verticalSpeed: parseFloat(data.flightv2.verticalSpeed),
          username: data.flightv2.username,
          heading: parseFloat(data.flightv2.heading),
          org: data.flightv2.org,
          livery: data.flightv2.livery,
          landingTimes: data.flightv2.landingTimes,
          takeoffTimes: data.flightv2.takeoffTimes
        };
        setTrack(data.flightv2.track);
        setFlight(flightData);
      }
    }
  });

  useEffect(() => {
    if (flightId) {
      getFlightInfo({
        variables: { input: { id: flightId, session: currentSession } }
      });
    }
  }, [flightId, currentSession, getFlightInfo]);

  return {
    flight,
    track,
    loading,
    error
  };
};

/**
 * Custom hook to fetch and process flight plan data
 */
const useFPLData = (flightId: string | null) => {
  const [coords, setCoords] = useState<Coordinate[]>([]);

  const [getFPLDistance, { loading, error }] = useLazyQuery<FPLDistanceResponse>(GET_FPL_DISTANCE, {
    client,
    fetchPolicy: "cache-first",
    onCompleted: data => {
      if (data?.flightplan?.flightPlan?.flightPlanItems) {
        // flatten all valid coordinates from flight plan items
        const validCoordinates: Coordinate[] = [];

        data.flightplan.flightPlan.flightPlanItems.forEach(item => {
          // check valid coordinates
          if (item.location && item.location.latitude !== 0 && item.location.longitude !== 0) {
            validCoordinates.push({
              latitude: item.location.latitude,
              longitude: item.location.longitude
            });
          }

          if (item.children && Array.isArray(item.children)) {
            item.children.forEach(child => {
              if (child.location && child.location.latitude !== 0 && child.location.longitude !== 0) {
                validCoordinates.push({
                  latitude: child.location.latitude,
                  longitude: child.location.longitude
                });
              }
            });
          }
        });

        setCoords(validCoordinates);
      }
    }
  });

  useEffect(() => {
    if (flightId) {
      getFPLDistance({
        variables: { flightplanId: flightId }
      });
    }
  }, [flightId, getFPLDistance]);

  return {
    coords,
    loading,
    error
  };
};

/**
 * Custom hook to calculate flight progress metrics
 */
const useFlightProgress = (coords: Coordinate[], flight: Flight | null) => {
  return useMemo(() => {
    if (!flight || coords.length < 2) {
      return {
        totalDistance: 0,
        distanceToGo: 0,
        distanceFlown: 0,
        progressRatio: 0
      };
    }

    const planeCoords: Coordinate = {
      latitude: flight.latitude,
      longitude: flight.longitude
    };

    const totalDistance = calculateTotalFPLDistance(coords);
    const distanceToGo = distanceLeft(coords, planeCoords);
    const distanceFlown = totalDistance - distanceToGo;

    // Fix: Ensure we don't divide by zero and convert to percentage properly
    const progressRatio = totalDistance > 0 ? Math.floor((distanceFlown / totalDistance) * 100) : 0;

    return {
      totalDistance,
      distanceToGo,
      distanceFlown,
      progressRatio
    };
  }, [coords, flight]);
};

/**
 * Custom hook to manage drawer view state and premium status
 */
const useDrawerView = (flight: Flight | null) => {
  const [currentView, setCurrentView] = useState<DrawerView>("default");
  const [isVerified, setIsVerified] = useState(false);
  const [openPremiumDialog, setOpenPremiumDialog] = useState(false);

  // Reset view when flight changes
  useEffect(() => {
    setCurrentView("default");
  }, [flight]);

  const handleClick = useCallback((value: DrawerView) => {
    setCurrentView(prevView => (prevView === value ? "default" : value));
  }, []);

  const handleDialogClose = useCallback(() => {
    setOpenPremiumDialog(false);
    setIsVerified(true);
    setCurrentView("default");
  }, []);

  return {
    currentView,
    openPremiumDialog,
    handleClick,
    handleDialogClose
  };
};

/**
 * Main DrawerProvider component that orchestrates all the hooks and UI rendering
 */
export default function DrawerProvider({ flightId, currentSession, handleClose, handleOpen }: DrawerProviderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Custom hooks for data and state management
  const { flight, track, loading: flightLoading, error: flightError } = useFlightData(flightId, currentSession);
  const { coords, loading: coordsLoading, error: coordsError } = useFPLData(flightId);
  const { currentView, handleClick, openPremiumDialog, handleDialogClose } = useDrawerView(flight);
  const flightProgress = useFlightProgress(coords, flight);
  const progressRatio = flightProgress.progressRatio;

  // Handle drawer opening/closing
  useEffect(() => {
    if (flightId) {
      setDrawerOpen(true);
      handleOpen();
    } else {
      setDrawerOpen(false);
    }
  }, [flightId, handleOpen]);

  // generate content based on current view
  const getViewContent = useCallback(() => {
    if (!flight) return null;

    switch (currentView) {
      case "graph":
        return <GraphContent tracks={track} callsign={flight.callsign || "Anonymous"} />;

      case "flight-plan":
        return <FPLContent id={flight.id} />;

      default:
        return <DefaultContent currentSession={currentSession} flight={flight} flightProgress={flightProgress} />;
    }
  }, [currentView, flight, track, currentSession, flightProgress]);

  const isLoading = flightLoading || coordsLoading;
  const hasError = flightError || coordsError;

  // common props for drawer components
  const drawerProps = {
    drawerOpen,
    openPremiumDialog,
    handleDialogClose,
    flight,
    currentView,
    handleClick,
    loading: isLoading,
    error: hasError,
    getViewContent,
    progressRatio
  };

  return isMobile ? (
    <MobileDrawer
      {...drawerProps}
      handleDrawerClose={handleClose}
      currentSession={currentSession}
      handleDrawerOpen={handleOpen}
      setDrawerOpen={setDrawerOpen}
    />
  ) : (
    <DesktopDrawer {...drawerProps} handleDrawerClose={handleClose} />
  );
}
