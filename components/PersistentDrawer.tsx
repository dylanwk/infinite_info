"use client";

import Drawer from "@mui/material/Drawer";
import { Loader2, Map, ChartNetwork } from "lucide-react";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FlightIcon from "@mui/icons-material/Flight";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLazyQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { GET_FLIGHT } from "@/lib/query";
import { Flight } from "@/lib/types";
import { useEffect, useState } from "react";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  //const isMobile = useMediaQuery("(max-width: 768px)");

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
          track: data.flightv2.track,
        };
        setFlight(flightData);
        handleOpen();
      }
    },
  });

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

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: "90%", sm: 400 },
          boxSizing: "border-box",
          overflow: "hidden",
          borderRadius: "16px", 
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
              <div className="flex flex-col gap-1 -mb-4">
                <div className="flex-row flex font-light text-gray-900 gap-1.5">
                  <PermIdentityIcon fontSize="small" />
                  <div className="-mt-0.5 -ml-0.5">
                    {flight.username ? flight.username : "Anonymous"}
                  </div>
                </div>
                <div className="flex-row flex font-light text-gray-900 gap-1.5">
                  <FlightIcon fontSize="small" />
                  <div className="-mt-0.5 -ml-0.5">
                    {flight.aircraft ? flight.aircraft : "Unknown"}
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-evenly rounded-xl gap-2 bg-gray-100 p-4">
                <div className="flex flex-col items-center">
                  <p className="text-xs text-neutral-700 font-light tracking-tight">
                    Alt. (MSL)
                  </p>
                  <div>{Math.floor(flight.altitude)} ft</div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-neutral-700 font-light tracking-tight">
                    Heading (T)
                  </p>
                  <div>{flight.heading.toFixed(1)}°</div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-neutral-700 font-light tracking-tight">
                    VS
                  </p>
                  <div>{Math.floor(flight.verticalSpeed)} fpm</div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-neutral-700 font-light tracking-tight">
                    Spd. (GS)
                  </p>
                  <div>{Math.floor(flight.speed)} kts</div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Button className="flex-1" variant="default">
                  <Map className="mr-2 h-4 w-4" />
                  Flight Plan
                </Button>
                <Button className="flex-1" variant="default">
                  <ChartNetwork className="mr-2 h-4 w-4" />
                  Graphs
                </Button>
              </div>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <DetailSection title="Flight Information">
                    <DetailItem label="Callsign" value={flight.callsign} />
                    <DetailItem label="Aircraft" value={flight.aircraft} />
                    <DetailItem label="Livery" value={flight.livery} />
                    <DetailItem label="Flight ID" value={flight.id} truncate />
                  </DetailSection>

                  <DetailSection title="Additional Details">
                    <DetailItem
                      label="User ID"
                      value={flight.userId}
                      truncate
                    />
                    <DetailItem
                      label="Username"
                      value={flight.username || "N/A"}
                    />
                    <DetailItem
                      label="Organization"
                      value={flight.org || "N/A"}
                    />
                  </DetailSection>
                </CardContent>
              </Card>
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

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  truncate = false,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${truncate ? "truncate max-w-[150px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
