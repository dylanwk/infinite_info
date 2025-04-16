import { Flight } from "@/lib/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DefaultContentProps {
  flight: Flight;
  currentSession: string;
}

export default function DefaultContent({ flight, currentSession }: DefaultContentProps) {
  return (
    <div className="space-y-4">
      {/* Flight Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <DetailItem label="Callsign" value={flight.callsign} />
            <DetailItem label="Aircraft" value={flight.aircraft} />
            <DetailItem label="Livery" value={flight.livery || "N/A"} />
            <DetailItem label="Flight ID" value={flight.id} truncate />
          </div>
        </CardContent>
      </Card>

      {/* Pilot Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pilot Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <DetailItem label="User ID" value={flight.userId} truncate />
            <DetailItem label="Username" value={flight.username || "N/A"} />
            <DetailItem label="Organization" value={flight.org || "N/A"} />
          </div>
        </CardContent>
      </Card>

      {/* Takeoff Times */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Takeoff Times</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          {flight.takeoffTimes.length > 0 ? (
            <ScrollArea className="max-h-64">
              <div className="p-4 pt-0">
                {flight.takeoffTimes.map((takeoff, index) => (
                  <React.Fragment key={index}>
                    <div className="py-3">
                      <div className="mb-1 font-medium">Takeoff {index + 1}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heading</span>
                          <span>{Math.round(takeoff.a)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordinates</span>
                          <span>
                            {takeoff.b.toFixed(4)}°, {takeoff.c.toFixed(4)}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time</span>
                          <span>{new Date(takeoff.r).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {index < flight.takeoffTimes.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No takeoff times available</div>
          )}
        </CardContent>
      </Card>

      {/* Landing Times */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Landing Times</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          {flight.landingTimes.length > 0 ? (
            <ScrollArea className="max-h-64">
              <div className="p-4 pt-0">
                {flight.landingTimes.map((landing, index) => (
                  <React.Fragment key={index}>
                    <div className="py-3">
                      <div className="mb-1 font-medium">Landing {index + 1}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heading</span>
                          <span>{Math.round(landing.a)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordinates</span>
                          <span>
                            {landing.b.toFixed(4)}°, {landing.c.toFixed(4)}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time</span>
                          <span>{new Date(landing.r).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {index < flight.landingTimes.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No landing times available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value, truncate = false }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${truncate ? "truncate max-w-[150px]" : ""}`}>{value}</span>
    </div>
  );
}
