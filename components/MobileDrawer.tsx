"use client";
import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Flight, GQL_Track_Type } from "@/lib/types";
import { useLazyQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { GET_FLIGHT } from "@/lib/query";
import { DrawerView } from "./PersistentDrawer";
import { GraphContent } from "./GraphContent";
import { FPLContent } from "./FPLContent";
import DefaultContent from "./DefaultContent";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import DrawerHeader from "./DrawerHeader";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

// Styled components for the drawer
const StyledDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "visible",
    transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Improved easing for smoother transitions
  },
}));

const DrawerHandle = styled("div")(({ theme }) => ({
  width: 80,
  height: 5,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.2)",
  borderRadius: 3,
  position: "absolute",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
  cursor: "grab",
  touchAction: "none", // Prevent browser handling of touch events
}));

const DrawerContent = styled(Box)({
  height: "100%",
  overflowY: "auto",
  paddingTop: 24, // Space for the handle
});

// Predefined drawer height breakpoints for snapping
const DRAWER_HEIGHTS = {
  COLLAPSED: 30,
  HALF: 60,
  FULL: 90,
};

interface MobileDrawerProps {
  flightId: string | null;
  currentSession: string;
  handleClose: () => void;
  handleOpen: () => void;
}
export default function MobileDrawer({
  flightId,
  currentSession,
  handleClose,
  handleOpen,
}: MobileDrawerProps) {
  // flight vars
  const [currentView, setCurrentView] = useState<DrawerView>("default");
  const [drawerHeight, setDrawerHeight] = useState(DRAWER_HEIGHTS.COLLAPSED);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [track, setTrack] = useState<GQL_Track_Type[]>([]);

  // mobile / theme vars
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartHeight = useRef<number>(DRAWER_HEIGHTS.COLLAPSED);

  // #region Flight Data
  const [flight, setFlight] = useState<Flight | null>(null);
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
        setFlight(flightData);
        setTrack(data.flightv2.track);
      }
    },
  });

  // Reset view when flight changes
  useEffect(() => {
    setCurrentView("default");
  }, [flight]);

  const handleClick = (value: DrawerView) => {
    if (currentView === value) {
      setCurrentView("default");
    } else {
      setCurrentView(value);
    }
    return;
  };

  // Fetch flight data when flightId or session changes
  useEffect(() => {
    if (flightId) {
      setDrawerOpen(true);
      getFlightInfo({
        variables: { input: { id: flightId, session: currentSession } },
      });
    } else {
      setDrawerOpen(false);
    }
  }, [flightId, currentSession, getFlightInfo]);

  const renderContent = () => {
    if (!flight) return null;

    switch (currentView) {
      case "graph":
        return (
          <GraphContent
            tracks={track}
            callsign={flight.callsign || "Anonymous"}
          />
        );
      case "flight-plan":
        return <FPLContent id={flight.id} />;
      default:
        return (
          <DefaultContent currentSession={currentSession} flight={flight} />
        );
    }
  };

  // #endregion

  // #region Touch Events

  // Function to snap drawer to nearest breakpoint
  const snapToHeight = () => {
    // Get paper element to temporarily disable transitions during drag
    const paperElement = drawerRef.current?.querySelector(
      ".MuiDrawer-paper"
    ) as HTMLElement;

    // Calculate nearest snap point
    let targetHeight;
    if (drawerHeight < 45) {
      targetHeight = DRAWER_HEIGHTS.COLLAPSED;
    } else if (drawerHeight < 75) {
      targetHeight = DRAWER_HEIGHTS.HALF;
    } else {
      targetHeight = DRAWER_HEIGHTS.FULL;
    }

    // Re-enable smooth transitions for the snap animation
    if (paperElement) {
      paperElement.style.transition =
        "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    }

    // Apply the target height
    setDrawerHeight(targetHeight);
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setDrawerOpen(open);
      if (open) {
        setDrawerHeight(DRAWER_HEIGHTS.HALF);
      }
    };

  // Touch event handlers
  const handleTouchStart = (event: React.TouchEvent) => {
    // Get paper element to temporarily disable transitions during drag
    const paperElement = drawerRef.current?.querySelector(
      ".MuiDrawer-paper"
    ) as HTMLElement;

    if (paperElement) {
      paperElement.style.transition = "none"; // Disable transitions during drag
    }

    touchStartY.current = event.touches[0].clientY;
    touchStartHeight.current = drawerHeight;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const touchY = event.touches[0].clientY;
    const deltaY = touchStartY.current - touchY;
    const windowHeight = window.innerHeight;
    const heightChange = (deltaY / windowHeight) * 100;
    const newHeight = Math.min(
      DRAWER_HEIGHTS.FULL,
      Math.max(10, touchStartHeight.current + heightChange)
    );

    setDrawerHeight(newHeight);
    // Remove preventDefault() call that causes the error
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    snapToHeight();
  };

  // Update drawer height when it changes
  // Set up the drawer's touch events and handle paper element height
  useEffect(() => {
    const paperElement = drawerRef.current?.querySelector(
      ".MuiDrawer-paper"
    ) as HTMLElement;

    if (paperElement) {
      paperElement.style.height = `${drawerHeight}vh`;
    }

    // Create a parent-level touchmove handler that can safely prevent default
    const preventDefaultForDrawer = (e: TouchEvent) => {
      // Only prevent default if we're actively dragging the drawer
      if (touchStartY.current !== null) {
        e.preventDefault();
      }
    };

    // Add the event listener with the non-passive option
    document.addEventListener("touchmove", preventDefaultForDrawer, {
      passive: false,
    });

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("touchmove", preventDefaultForDrawer);
    };
  }, [drawerHeight, drawerOpen]);

  // #endregion
  // #region Drawer
  return (
    <StyledDrawer
      anchor="bottom"
      open={drawerOpen}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      disableSwipeToOpen={false}
      swipeAreaWidth={isMobile ? 56 : 0}
      ModalProps={{ keepMounted: true }}
      variant="persistent"
      ref={drawerRef}
      PaperProps={{
        sx: {
          height: `${drawerHeight}vh`,
          maxWidth: "100%",
          margin: "0 auto",
        },
      }}
    >
      <DrawerHandle
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      />
      <DrawerContent>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mt-2">
              <h2 className="text-3xl font-bold">
                {flight?.callsign || "Flight Details"}
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Card className="bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-600">Error: {error.message}</p>
                </CardContent>
              </Card>
            ) : flight ? (
              <>
                <DrawerHeader
                  username={flight.username}
                  aircraft={flight.aircraft}
                  altitude={flight.altitude}
                  heading={flight.heading}
                  speed={flight.speed}
                  vs={flight.verticalSpeed}
                  handleClick={handleClick}
                />

                {renderContent()}
              </>
            ) : (
              <Card className="bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-yellow-600">No flight data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
        <div className="flex w-full p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DrawerContent>
    </StyledDrawer>
  );
}
