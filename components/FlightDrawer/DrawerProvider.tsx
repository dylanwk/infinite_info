import client from "@/lib/apolloClient";
import { GET_FLIGHT } from "@/lib/query";
import { DrawerView, Flight, GQL_Track_Type } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { GraphContent } from "./GraphContent";
import { FPLContent } from "./FPLContent";
import DefaultContent from "./DefaultContent";
import DesktopDrawer from "./DesktopDrawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import MobileDrawer from "./MobileDrawer";

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
    onCompleted: (data) => {
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
          takeoffTimes: data.flightv2.takeoffTimes,
        };
        setTrack(data.flightv2.track);
        setFlight(flightData);
      }
    },
  });

  return {
    flight,
    track,
    loading,
    error,
    getFlightInfo,
  };
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

  // Handle premium dialog visibility
  useEffect(() => {
    const isPremiumView =
      currentView === "graph" || currentView === "flight-plan";
    setOpenPremiumDialog(isPremiumView && !isVerified);
  }, [currentView, isVerified]);

  const handleClick = useCallback((value: DrawerView) => {
    setCurrentView((prevView) => (prevView === value ? "default" : value));
  }, []);

  const handleDialogClose = useCallback(() => {
    setOpenPremiumDialog(false);
    setIsVerified(true);
    setCurrentView("default");
  }, []);

  return {
    currentView,
    isVerified,
    openPremiumDialog,
    handleClick,
    handleDialogClose,
  };
};

export default function DrawerProvider({
  flightId,
  currentSession,
  handleClose,
  handleOpen,
}: DrawerProviderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Custom hooks for data and state management
  const { flight, track, loading, error, getFlightInfo } = useFlightData(
    flightId,
    currentSession
  );
  const {
    currentView,
    isVerified,
    openPremiumDialog,
    handleClick,
    handleDialogClose,
  } = useDrawerView(flight);

  // Fetch flight data when flightId or session changes
  useEffect(() => {
    if (flightId) {
      setDrawerOpen(true);
      getFlightInfo({
        variables: { input: { id: flightId, session: currentSession } },
      });
      handleOpen();
    } else {
      setDrawerOpen(false);
    }
  }, [flightId, currentSession, getFlightInfo, handleOpen]);

  const getViewContent = useCallback(() => {
    if (!flight) return null;

    switch (currentView) {
      case "graph":
        if (!isVerified) return null;
        return (
          <GraphContent
            tracks={track}
            callsign={flight.callsign || "Anonymous"}
          />
        );

      case "flight-plan":
        if (!isVerified) return null;
        return <FPLContent id={flight.id} />;

      default:
        return (
          <DefaultContent currentSession={currentSession} flight={flight} />
        );
    }
  }, [currentView, flight, isVerified, track, currentSession]);

  // Common props for drawer components
  const drawerProps = {
    drawerOpen,
    openPremiumDialog,
    handleDialogClose,
    flight,
    currentView,
    isVerified,
    handleClick,
    loading,
    error,
    getViewContent,
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
