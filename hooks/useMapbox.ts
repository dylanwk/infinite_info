import { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_STYLE } from "@/lib/constants";
import { DEFAULT, MapStyle } from "@/lib/types";

interface UseMapboxProps {
  containerRef: React.RefObject<HTMLDivElement>;
  initialOptions?: Omit<mapboxgl.MapOptions, "container">;
}

export const useMapbox = ({ containerRef, initialOptions }: UseMapboxProps) => {
  const mapRef = useRef<Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [mapError, setMapError] = useState<Error | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_ETHANS_MAPBOX_TOKEN || "";

    if (!mapboxgl.accessToken) {
      console.error("Mapbox Access Token is not set!");
      setMapError(new Error("Mapbox Access Token is missing."));
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: DEFAULT,
        zoom: 1.8,
        maxZoom: 18,
        renderWorldCopies: false,
        attributionControl: false,
        preserveDrawingBuffer: false,
        ...initialOptions,
      });

      map.on("load", () => {
        mapRef.current = map;
        setIsStyleLoaded(true);
        map.resize();
      });

      map.on("error", (e) => {
        console.error("Mapbox GL Error:", e.error);
        setMapError(e.error as Error);
      });

      mapRef.current = map;

    } catch (error) {
      console.error("Failed to initialize Mapbox map:", error);
      if (error instanceof Error) {
        setMapError(error);
      } else {
        setMapError(new Error("An unknown error occurred during map initialization."));
      }
    }


    // cleanup function
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setIsStyleLoaded(false);
    };
  }, [containerRef, initialOptions]);

  return { map: mapRef.current, isStyleLoaded, setIsStyleLoaded, mapError };
};