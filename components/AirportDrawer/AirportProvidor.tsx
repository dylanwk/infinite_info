"use client";
import { useEffect, useState, useCallback } from "react";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";

import AirportDefaultContent from "./content/DefaultAirportContent";
import ATCContent from "./content/ATCContent";
import AirportHeader from "./content/AirportHeader";
import MobileAirportDrawer from "./MobileAirportDrawer";

import { Airport } from "@/lib/types";

export type AirportViewType = "default" | "ATC";

interface AirportDrawerProps {
  airport: Airport | null;
  handleClose: () => void;
}

const AirportProvider: React.FC<AirportDrawerProps> = ({ airport, handleClose }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<AirportViewType>("default");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleViewClick = useCallback((value: AirportViewType) => {
    setCurrentView(prevView => (prevView === value ? "default" : value));
  }, []);

  // Content renderer, use verification logic here
  const getViewContent = useCallback(() => {
    if (!airport) return null;

    switch (currentView) {
      case "ATC":
        return <ATCContent atis={airport.atis} atc={airport.atc} />;
      default:
        return <AirportDefaultContent airport={airport} />;
    }
  }, [currentView, airport]);

  useEffect(() => {
    // open drawer when airport changes
    setDrawerOpen(!!airport);
  }, [airport]);

  if (!airport) return null;

  // props for both mobile and desktop
  const commonProps = {
    airport,
    getViewContent,
    handleClose,
    handleViewClick,
    drawerOpen,
    setDrawerOpen
  };

  if (!airport) return null;

  if (isMobile) {
    return <MobileAirportDrawer {...commonProps} />;
  }

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: "90%", sm: 450 },
          boxSizing: "border-box",
          overflow: "hidden",
          borderRadius: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          zIndex: 40
        }
      }}
      variant="persistent"
      anchor="right"
      open={drawerOpen}
    >
      <AirportHeader airport={airport} handleClose={handleClose} handleViewClick={handleViewClick} />
      {getViewContent()}
    </Drawer>
  );
};

export default AirportProvider;
