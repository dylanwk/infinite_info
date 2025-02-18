"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Map, ChartNetwork } from "lucide-react";

import { useLazyQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { GET_FLIGHT } from "@/lib/query";
import { Flight } from "@/lib/types";

import { useEffect, useState } from "react";

import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FlightIcon from "@mui/icons-material/Flight";

interface FlightDrawerProps {
  flightId: string | null;
  currentSession: string;
  handleClose: () => void;
  handleOpen: () => void;
}

export function FlightDrawer({
  flightId,
  currentSession,
  handleClose,
  handleOpen,
}: FlightDrawerProps) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [getFlightInfo, { loading, error }] = useLazyQuery(GET_FLIGHT, {
    client,
    onCompleted: (data) => {
      console.log(data);
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

  // Effect to handle flightId changes
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
      open={drawerOpen}
      onClose={handleClose}
      onOpenChange={setDrawerOpen}
      direction="right"
    >
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error.message}</p>
          </CardContent>
        </Card>
      ) : (
        <DrawerContent className="sm:max-w-[425px] z-[100]">
          <ScrollArea className="h-[90vh]">
            <DrawerHeader className="mt-2">
              <DrawerTitle className="text-3xl font-bold">
                {flight?.callsign ?? "Flight Info"}
              </DrawerTitle>
              {flight ? (
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
              ) : (
                "Loading flight data..."
              )}
            </DrawerHeader>
            <div className="p-4 pb-0">
              {flight ? (
                <>
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

                  <div className="flex flex-row gap-2 justify-center mt-4">
                    <Button className="flex-1">
                      <Map fontSize="large" />
                      Flight Plan
                    </Button>
                    <Button className="flex-1">
                      <ChartNetwork fontSize="large" /> Graphs
                    </Button>
                  </div>

                  <Card className="my-4">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Flight Details</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Callsign</p>
                          <p className="font-medium">{flight.callsign}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aircraft</p>
                          <p className="font-medium">{flight.aircraft}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Livery</p>
                          <p className="font-medium">{flight.livery}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Flight ID</p>
                          <p className="font-medium truncate">{flight.id}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Latitude</p>
                          <p className="font-medium">
                            {flight.latitude.toFixed(4)}°
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Longitude</p>
                          <p className="font-medium">
                            {flight.longitude.toFixed(4)}°
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Additional Info</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">User ID</p>
                          <p className="font-medium truncate">
                            {flight.userId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Landing ETA</p>
                          <p className="font-medium"></p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Username</p>
                          <p className="font-medium">
                            {flight.username ?? "Not available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Organization</p>
                          <p className="font-medium">
                            {flight.org ?? "Not available"}
                          </p>
                        </div>
                      </div>
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
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      )}
    </Drawer>
  );
}
