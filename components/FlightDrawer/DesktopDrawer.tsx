import Drawer from "@mui/material/Drawer";
import React from "react";
import PremiumDialog from "../PremiumDialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { CircleX, Loader2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import DrawerHeader from "./DrawerHeader";
import { DrawerView, Flight } from "@/lib/types";
import { ApolloError } from "@apollo/client";

interface DesktopDrawerProps {
  drawerOpen: boolean;
  openPremiumDialog: boolean;
  handleDialogClose: () => void;
  flight: Flight | null;
  loading: boolean;
  error: ApolloError | undefined;
  handleClick: (value: DrawerView) => void;
  currentView: DrawerView;
  isVerified: boolean;
  handleDrawerClose: () => void;
  getViewContent: () => JSX.Element | null;
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
  isVerified,
  handleDrawerClose,
  getViewContent,
}) => {
  return (
    <>
      {openPremiumDialog && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          aria-hidden="true"
        />
      )}

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
            overflow: "hidden",
            borderRadius: "16px", // rounded corners
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // shadow
            zIndex: 40,
          },
        }}
        variant="persistent"
        anchor={"right"}
        open={drawerOpen}
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mt-2">
              <h2 className="text-3xl font-bold">
                {flight?.callsign || "Flight Details"}
              </h2>
              <Button
                variant={"ghost"}
                className="rounded-full"
                onClick={handleDrawerClose}
              >
                <CircleX />
              </Button>
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
                  livery={flight.livery}
                  handleClick={handleClick}
                  currentView={currentView}
                  isVerified={isVerified}
                />

                {getViewContent()}
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
            onClick={handleDrawerClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default DesktopDrawer;
