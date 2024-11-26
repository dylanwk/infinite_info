"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

import { useLazyQuery } from "@apollo/client";
import client from "@/lib/apolloClient";
import { SIMPLE_FLIGHT_INFO } from "@/lib/query";
import { SimpleFlightInfo } from "@/lib/types";

import { useState } from "react";

interface FlightDrawerProps {
  trigger?: JSX.Element;
  flightId?: string;
  server?: string;
}

export function FlightDrawer({
  trigger,
  flightId = "648952be-72b8-4516-aab8-bcf7c2093f2f",
  server = "CASUAL",
}: FlightDrawerProps) {


  const [flight, setFlight] = useState<SimpleFlightInfo | null>(null);

  // for now use lazy query because we only want to query when the drawer trigger is 
  // clicked, not when the component is loaded, which is when the page is called
  const [getFlightInfo, { loading, error }] = useLazyQuery(SIMPLE_FLIGHT_INFO, {
    client,
    onCompleted: (data) => {
      if (data?.flight) {
        // for now it only queries simple stuff (floats, and strings)
        const flightData: SimpleFlightInfo = {
          latitude: parseFloat(data.flight.latitude),
          longitude: parseFloat(data.flight.longitude),
          speed: parseFloat(data.flight.speed),
          flightId: data.flight.flightId,
          userId: data.flight.userId,
          landingETA: data.flight.landingETA,
          altitude: parseFloat(data.flight.altitude),
          callsign: data.flight.callsign,
          aircraft: data.flight.aircraft,
          verticalSpeed: parseFloat(data.flight.verticalSpeed),
          username: data.flight.username,
          heading: parseFloat(data.flight.heading),
          org: data.flight.org,
          livery: data.flight.livery,
        };
        setFlight(flightData);
      }
    },
  });

  // on open, call the query
  const handleOpen = () => {
    getFlightInfo({ variables: { server, flightId } });
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger onClick={handleOpen}>{trigger}</DrawerTrigger>
      <DrawerContent className="sm:max-w-[425px]">
        <ScrollArea className="h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              {flight?.callsign ?? "Flight Info"}
            </DrawerTitle>
            <DrawerDescription>
              {flight
                ? `Aircraft: ${flight.aircraft}`
                : "Loading flight data..."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
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
            ) : flight ? (
              <>
                <Card className="mb-4">
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
                        <p className="font-medium truncate">
                          {flight.flightId}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Current Status</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Altitude</p>
                        <p className="font-medium">
                          {flight.altitude.toFixed(0)} ft
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Speed</p>
                        <p className="font-medium">
                          {flight.speed.toFixed(0)} knots
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Heading</p>
                        <p className="font-medium">
                          {flight.heading.toFixed(1)}°
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Vertical Speed</p>
                        <p className="font-medium">
                          {flight.verticalSpeed.toFixed(1)} ft/min
                        </p>
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
                        <p className="font-medium truncate">{flight.userId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Landing ETA</p>
                        <p className="font-medium">
                          {flight.landingETA ?? "Not available"}
                        </p>
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
    </Drawer>
  );
}
