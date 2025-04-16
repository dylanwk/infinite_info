"use client";
import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Airport } from "@/lib/types";
import AirportHeader from "./content/AirportHeader";
import { AirportViewType } from "./AirportProvidor";

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

interface MobileAirportDrawerProps {
  airport: Airport;
  handleClose: () => void;
  handleViewClick: (view: AirportViewType) => void;
  setDrawerOpen: (value: boolean) => void;
  drawerOpen: boolean;
  getViewContent: () => JSX.Element | null;
}

const MobileAirportDrawer: React.FC<MobileAirportDrawerProps> = ({
  setDrawerOpen,
  drawerOpen,
  airport,
  handleClose,
  handleViewClick,
  getViewContent
}) => {
  const [drawerHeight, setDrawerHeight] = useState(DRAWER_HEIGHTS.COLLAPSED);

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

  // drawer's touch events and handle paper element height
  useEffect(() => {
    const paperElement = drawerRef.current?.querySelector(".MuiDrawer-paper") as HTMLElement;

    if (paperElement) {
      paperElement.style.height = `${drawerHeight}vh`;
    }

    const preventDefaultForDrawer = (e: TouchEvent) => {
      if (touchStartY.current !== null) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefaultForDrawer, {
      passive: false
    });

    return () => {
      document.removeEventListener("touchmove", preventDefaultForDrawer);
    };
  }, [drawerHeight, drawerOpen]);

  return (
    <div>
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
            zIndex: 40
          }
        }}
      >
        <DrawerHandle
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "none" }}
        />
        <DrawerContent className="flex flex-col h-full -mt-3">
          <AirportHeader airport={airport} handleClose={handleClose} handleViewClick={handleViewClick} />
          <div className="flex-1 overflow-y-auto mt-3">{getViewContent()}</div>
        </DrawerContent>
      </StyledDrawer>
    </div>
  );
};

export default MobileAirportDrawer;
