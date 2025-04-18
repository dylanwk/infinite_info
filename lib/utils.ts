import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FlightPlan, FlightPlanItem, FlightPlanResponse } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate total distance using Haversine formula
export const calculateDistance = (
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

export const processFlightPlanData = (data: FlightPlanResponse): FlightPlan | null => {
  if (!data?.flightplan) return null;

  const mapFlightPlanItem = (item: FlightPlanItem): FlightPlanItem => ({
    identifier: item.identifier,
    name: item.name,
    type: item.type,
    location: {
      altitude: item.location.altitude,
      latitude: item.location.latitude,
      longitude: item.location.longitude
    },
    children: item.children ? item.children.map(mapFlightPlanItem) : null,
    distanceFromPrevious: -1
  });

  return {
    code: data.flightplan.code,
    flightPlanItems: data.flightplan.flightPlan.flightPlanItems.map(mapFlightPlanItem)
  };
};

/* these functions came from Cameron Carmichael Alonso */
export function feetToMetres(feet: number) {
  return feet * 0.3048;
}
export function colourForAltitude(altitude: number) {
  if (13e3 < altitude) return "#ff0002";
  if (12500 < altitude) return "#ff01e5";
  if (12e3 < altitude) return "#d901ff";
  if (11500 < altitude) return "#ae02ff";
  if (11e3 < altitude) return "#9800ff";
  if (10500 < altitude) return "#8000ff";
  if (1e4 < altitude) return "#6200ff";
  if (9500 < altitude) return "#4e01ff";
  if (9e3 < altitude) return "#3800ff";
  if (8500 < altitude) return "#2600ff";
  if (8500 < altitude) return "#1400ff";
  if (7500 < altitude) return "#0200ff";
  if (7e3 < altitude) return "#021eff";
  if (6500 < altitude) return "#0230ff";
  if (6e3 < altitude) return "#0254ff";
  if (5500 < altitude) return "#0278ff";
  if (5e3 < altitude) return "#0296ff";
  if (4500 < altitude) return "#02a8ff";
  if (4e3 < altitude) return "#02c0ff";
  if (3500 < altitude) return "#02eaff";
  if (3e3 < altitude) return "#02ffe4";
  if (2500 < altitude) return "#02ffd2";
  if (2e3 < altitude) return "#02ff9c";
  if (1500 < altitude) return "#02ff72";
  if (1200 < altitude) return "#02ff36";
  if (1e3 < altitude) return "#02ff0c";
  if (800 < altitude) return "#1eff02";
  if (600 < altitude) return "#44ff00";
  if (400 < altitude) return "#ccff02";
  if (300 < altitude) return "#f0ff02";
  if (200 < altitude) return "#ffea02";
  if (100 < altitude) return "#ffe064";
  if (100 > altitude) return "#ffffff";
}

export function crossesAntiMeridian(positions: [number, number][]) {
  return (
    Math.sign(positions[0][0]) * Math.sign(positions[1][0]) < 0 && Math.abs(parseInt(positions[0][0].toFixed(0))) > 1
  );
}
