import Drawer from "@mui/material/Drawer";
import React from "react";
import PremiumDialog from "../PremiumDialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { CircleX, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import DrawerHeader from "./content/DrawerHeader";
import { DrawerView, Flight } from "@/lib/types";
import { ApolloError } from "@apollo/client";
import { Coordinate } from "@/lib/fplUtils";

interface DesktopDrawerProps {
  drawerOpen: boolean;
  openPremiumDialog: boolean;
  handleDialogClose: () => void;
  flight: Flight | null;
  loading: boolean;
  error: ApolloError | undefined;
  handleClick: (value: DrawerView) => void;
  currentView: DrawerView;
  handleDrawerClose: () => void;
  getViewContent: () => JSX.Element | null;
  progressRatio: number;
}

const DesktopDrawer: React.FC<DesktopDrawerProps> = ({
  drawerOpen,
  openPremiumDialog,
  handleDialogClose,
  flight,
  loading,
  error,
  handleClick,
  currentView,
  handleDrawerClose,
  getViewContent,
  progressRatio
}) => {
  return (
    <>
      {/* Premium dialog backdrop */}
      {openPremiumDialog && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" aria-hidden="true" />}

      {/* Premium dialog with higher z-index */}
      <div className="relative z-[60]">
        <PremiumDialog open={openPremiumDialog} onClose={handleDialogClose} />
      </div>

      <Drawer
        sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "90%", sm: 450 },
            boxSizing: "border-box",
            borderRadius: "16px", // rounded corners
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // shadow
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden" // Prevent drawer itself from scrolling
          }
        }}
        variant="persistent"
        anchor={"right"}
        open={drawerOpen}
      >
        {/* Fixed header section */}
        <div className="p-4 pb-1">
          <div className="flex justify-between items-center mt-2">
            <h2 className="text-3xl font-bold">{flight?.callsign || "Flight Details"}</h2>
            <Button variant={"ghost"} className="rounded-full" onClick={handleDrawerClose}>
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
            <div className="p-4 pt-1">
              {getViewContent()}
              <Button variant="outline" size="sm" onClick={handleDrawerClose} className="w-full mt-4">
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
      </Drawer>
    </>
  );
};

export default DesktopDrawer;
