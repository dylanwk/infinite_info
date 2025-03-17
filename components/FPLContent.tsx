"use client";

import { GET_FLIGHTPLAN } from "@/lib/query";
import { useQuery } from "@apollo/client";
import { FlightPlanItem, FlightPlanResponse } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Plane, MapPin, Info, Navigation, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { processFlightPlanData } from "@/lib/utils";

interface FPLContentProps {
  id: string;
}

// #region UI Helpers
// Helper function to get waypoint type name
const getWaypointTypeName = (type: number): string => {
  const types = {
    0: "Waypoint",
    1: "Airport",
    2: "Navaid",
    3: "Fix",
    // Add more types as needed
  };
  return types[type as keyof typeof types] || "Unknown";
};

// Helper to get appropriate icon for waypoint type
const getWaypointIcon = (type: number) => {
  switch (type) {
    case 1:
      return <Plane className="h-4 w-4" />;
    case 2:
      return <Navigation className="h-4 w-4" />;
    case 3:
      return <MapPin className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

// Helper to determine if this is a departure, arrival, or waypoint
const getWaypointRole = (
  item: FlightPlanItem,
  index: number,
  total: number
): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive" | null;
} => {
  if (index === 0) {
    return { label: "Departure", variant: "default" };
  } else if (index === total - 1) {
    return { label: "Arrival", variant: "destructive" };
  } else {
    return { label: getWaypointTypeName(item.type), variant: "secondary" };
  }
};

// #endregion

// #region FP Item Card
const FlightPlanItemCard = ({
  item,
  index,
  total,
}: {
  item: FlightPlanItem;
  index: number;
  total: number;
}) => {
  const role = getWaypointRole(item, index, total);
  const displayName = item.identifier || item.name || "Unnamed Point";
  const showAltitude = item.location.altitude > 0;
  const showCoordinates =
    item.location.latitude !== 0.0 && item.location.longitude !== 0.0;

  return (
    <div className="flex items-center">
      <Card className="flex-grow bg-card border-primary/10 hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center text-primary">
                {getWaypointIcon(item.type)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={role.variant}>{role.label}</Badge>
                  <span className="font-semibold text-lg">{displayName}</span>
                </div>

                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  {item.identifier && item.name && (
                    <span>
                      {item.name !== item.identifier ? item.name : ""}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {showCoordinates && (
                      <span className="text-xs text-muted-foreground">
                        {item.location.latitude.toFixed(4)}°,{" "}
                        {item.location.longitude.toFixed(4)}°
                      </span>
                    )}

                    {showAltitude && (
                      <span className="ml-2 text-xs font-medium bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm">
                        {item.location.altitude.toLocaleString()} ft
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// #endregion
// #region FPL Drawer
export const FPLContent = ({ id }: FPLContentProps) => {
  const { data, loading, error } = useQuery<FlightPlanResponse>(
    GET_FLIGHTPLAN,
    {
      variables: { flightplanId: id },
      fetchPolicy: "cache-first",
    }
  );

  const flightPlan = useMemo(() => processFlightPlanData(data), [data]);

  // Calculate flight plan stats
  const stats = useMemo(() => {
    if (!flightPlan) return null;

    const items = flightPlan.flightPlanItems;
    const departure = items[0];
    const arrival = items[items.length - 1];

    // Calculate total distance using Haversine formula
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalDistance = 0;
    for (let i = 0; i < items.length - 1; i++) {
      const current = items[i];
      const next = items[i + 1];
      totalDistance += calculateDistance(
        current.location.latitude,
        current.location.longitude,
        next.location.latitude,
        next.location.longitude
      );
    }

    return {
      departureId: departure.identifier || departure.name,
      arrivalId: arrival.identifier || arrival.name,
      waypoints: items.length,
      totalDistance: Math.round(totalDistance) * 0.539, // km to nm
    };
  }, [flightPlan]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-2">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading flight plan</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!flightPlan) {
    return (
      <Alert>
        <AlertTitle>No flight plan found</AlertTitle>
        <AlertDescription>
          The requested flight plan could not be loaded.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-lg border-primary/10">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex flex-col sm:flex-col sm:items-center justify-start gap-3">
          <div>
            <CardTitle className="text-xl font-bold">
              {stats?.departureId} → {stats?.arrivalId}
            </CardTitle>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Plane className="h-3 w-3" />
              <span>{stats?.waypoints} waypoints</span>
            </Badge>

            <Badge variant="outline" className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              <span>{stats?.totalDistance.toLocaleString()} nm</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-3">
        {flightPlan.flightPlanItems.map((item, index) => (
          <FlightPlanItemCard
            key={`${item.identifier || item.name}-${index}`}
            item={item}
            index={index}
            total={flightPlan.flightPlanItems.length}
          />
        ))}
      </CardContent>
    </Card>
  );
};
