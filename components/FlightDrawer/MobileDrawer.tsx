"use client";
import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DrawerView, Flight } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import DrawerHeader from "./content/DrawerHeader";
import { CircleX, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import PremiumDialog from "../PremiumDialog";
import { ApolloError } from "@apollo/client";
import { Coordinate } from "@/lib/fplUtils";

// Styled components for the drawer
const StyledDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "visible",
    transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  }
}));

const DrawerHandle = styled("div")(({ theme }) => ({
  width: 80,
  height: 5,
  backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
  borderRadius: 3,
  position: "absolute",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,
  cursor: "grab",
  touchAction: "none",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100vw",
    height: "30px",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: -1 // Behind the visual element
  }
}));

const DrawerContent = styled(Box)({
  height: "100%",
  overflowY: "auto",
  paddingTop: 24
});

// Predefined drawer height breakpoints for snapping
const DRAWER_HEIGHTS = {
  COLLAPSED: 30,
  HALF: 60,
  FULL: 90
};

interface MobileDrawerProps {
  currentSession: string;
  handleDrawerClose: () => void;
  handleDrawerOpen: () => void;
  flight: Flight | null;
  loading: boolean;
  error: ApolloError | undefined;
  currentView: DrawerView;
  openPremiumDialog: boolean;
  handleClick: (value: DrawerView) => void;
  getViewContent: () => JSX.Element | null;
  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  handleDialogClose: () => void;
  progressRatio: number;
}

export default function MobileDrawer({
  handleDrawerClose: handleClose,
  handleDialogClose,
  flight,
  loading,
  error,
  currentView,
  openPremiumDialog,
  handleClick,
  getViewContent,
  drawerOpen,
  setDrawerOpen,
  progressRatio
}: MobileDrawerProps) {
  const [drawerHeight, setDrawerHeight] = useState(DRAWER_HEIGHTS.COLLAPSED);

  // mobile / theme vars
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartHeight = useRef<number>(DRAWER_HEIGHTS.COLLAPSED);

  // Function to snap drawer to nearest breakpoint
  const snapToHeight = () => {
    const paperElement = drawerRef.current?.querySelector(".MuiDrawer-paper") as HTMLElement;

    // Calculate nearest snap point
    let targetHeight;
    if (drawerHeight < 45) {
      targetHeight = DRAWER_HEIGHTS.COLLAPSED;
    } else if (drawerHeight < 75) {
      targetHeight = DRAWER_HEIGHTS.HALF;
    } else {
      targetHeight = DRAWER_HEIGHTS.FULL;
    }

    if (paperElement) {
      paperElement.style.transition = "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    }

    setDrawerHeight(targetHeight);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setDrawerOpen(open);
    if (open) {
      setDrawerHeight(DRAWER_HEIGHTS.HALF);
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const paperElement = drawerRef.current?.querySelector(".MuiDrawer-paper") as HTMLElement;

    if (paperElement) {
      paperElement.style.transition = "none";
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
    const newHeight = Math.min(DRAWER_HEIGHTS.FULL, Math.max(10, touchStartHeight.current + heightChange));

    setDrawerHeight(newHeight);
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    snapToHeight();
  };

  // Set up the drawer's touch events and handle paper element height
  useEffect(() => {
    const paperElement = drawerRef.current?.querySelector(".MuiDrawer-paper") as HTMLElement;

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
      passive: false
    });

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("touchmove", preventDefaultForDrawer);
    };
  }, [drawerHeight, drawerOpen]);

  return (
    <>
      {/* Premium dialog backdrop */}
      {openPremiumDialog && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" aria-hidden="true" />}

      {/* Premium dialog with higher z-index */}
      <div className="relative z-[60]">
        <PremiumDialog open={openPremiumDialog} onClose={handleDialogClose} />
      </div>

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
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden" // Prevent drawer itself from scrolling
          }
        }}
      >
        {/* Drag handle for mobile drawer */}
        <DrawerHandle
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        />
        
        <DrawerContent className="flex flex-col h-full overflow-hidden">
          {/* Fixed header section */}
          <div className="p-4">
            <div className="flex justify-between items-center mt-2">
              <h2 className="text-3xl font-bold">{flight?.callsign || "Flight Details"}</h2>
              <Button variant="ghost" className="rounded-full" onClick={handleClose}>
                <CircleX />
              </Button>
            </div>

            {/* Flight header with important info - always visible */}
            {!loading && !error && flight && (
              <DrawerHeader
                username={flight.username}
                aircraft={flight.aircraft}
                altitude={flight.altitude}
                heading={flight.heading}
                speed={flight.speed}
                vs={flight.verticalSpeed}
                livery={flight.livery}
                handleClick={handleClick}
                currentView={currentView}
                progressRatio={progressRatio}
              />
            )}
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4">
                <Card className="bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-red-600">Error: {error.message}</p>
                  </CardContent>
                </Card>
              </div>
            ) : flight ? (
              <div className="p-2">
                {getViewContent()}
                <Button variant="outline" size="sm" onClick={handleClose} className="w-full my-4">
              Close
            </Button>
              </div>
            ) : (
              <div className="p-4">
                <Card className="bg-yellow-50">
                  <CardContent className="p-4">
                    <p className="text-yellow-600">No flight data available</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DrawerContent>
      </StyledDrawer>
    </>
  );
}
