"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null); 
    const mapRef = useRef<mapboxgl.Map | null>(null);
  
    useEffect(() => {
      
      // Dylan's access token
      //mapboxgl.accessToken = "pk.eyJ1IjoiZHlsYW53ayIsImEiOiJjbTJ3Y2dvNnAwNWE2MmpxMndlcGNmdnV2In0.jJTZ-WlDOdKqez58HYGmCA";

      // Ethan's access token
      mapboxgl.accessToken = "pk.eyJ1IjoiZXRoYWFhbiIsImEiOiJja3AzN2JuNTIxcHpwMnBxcWNmNnc2bXJvIn0.FNggbSkQ3ULC55kwLEJZJg";
      
      if (mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current as HTMLElement,
          //style: "mapbox://styles/mapbox/navigation-night-v1",
          style: "mapbox://styles/ethaaan/cldfgnal3000201nyv4534tvx", // this one only works with my access token
          zoom: 3
        });
      }
  
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
    }, []);

  return (
    <>
      <div
        id="map-container"
        className="h-[100vh] w-full"
        ref={mapContainerRef}
      >
        Map
      </div>
    </>
  );
};

export default Map;
