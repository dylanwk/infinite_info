"use client";

import Drawer from "@mui/material/Drawer";
import { Loader2, Map, ChartNetwork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLazyQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { GET_FLIGHT } from "@/lib/query";
import { Flight, GQL_Track_Type } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { FPLContent } from "./FPLContent";
import { GraphContent } from "./GraphContent";
import DrawerHeader from "./DrawerHeader";
import DefaultContent from "./DefaultContent";

export type DrawerView = "default" | "graph" | "flight-plan";

interface PersistentProps {
  flightId: string | null;
  currentSession: string;
  handleClose: () => void;
  handleOpen: () => void;
}

export default function PersistentDrawer({
  flightId,
  currentSession,
  handleClose,
  handleOpen,
}: PersistentProps) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [track, setTrack] = useState<GQL_Track_Type[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DrawerView>("default");

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
        console.log(flightData);
        handleOpen();
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

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: "90%", sm: 450 },
          boxSizing: "border-box",
          overflow: "hidden",
          borderRadius: "16px", // rounded corners
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // shadow
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
    </Drawer>
  );
}
