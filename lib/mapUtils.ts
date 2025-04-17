import mapboxgl, { GeoJSONSource, GeoJSONSourceSpecification, Map } from "mapbox-gl";
import { Airport, Flights, Track } from "@/lib/types";
import { Feature, GeoJsonProperties, LineString, FeatureCollection, Point } from "geojson";
import { colourForAltitude, crossesAntiMeridian, feetToMetres } from "@/lib/utils";

const createElement = (tagName: string, className: string): HTMLElement => {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
};

const atcMapping: Record<number, string> = {
  0: "G", 1: "T", 2: "U", 3: "C", 4: "A", 5: "D", 6: "C", 7: "S", 8: "", 9: "R", 10: "", 11: ""
};

// --- Add Airports Layer ---
export const addOrUpdateAirportsLayer = (
  map: Map,
  airports: Airport[],
  onAirportClick: (icao: string) => void
): void => {
  if (!map) return;

  const sourceId = "airports";
  const layerId = "airports-layer";
  const markerLayerId = "airport-markers";

  if (airports.length === 0) {
    const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData({ type: "FeatureCollection", features: [] });
    }

    document.querySelectorAll('.airport-marker-container').forEach(marker => marker.remove());
    return;
  }

  const geoJsonData: FeatureCollection<Point, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: airports.map(airport => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [airport.longitude, airport.latitude]
      },
      properties: {
        // keep only necessary properties for the layer/click handler
        icao: airport.icao,
        name: airport.name, 
      }
    }))
  };

  const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;

  if (!existingSource) {
    map.addSource(sourceId, { type: "geojson", data: geoJsonData, cluster: false });

    map.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,
      paint: {
        "circle-color": "#FF0000",
        "circle-radius": 6.5,
        "circle-opacity": 0.5,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#FFFFFF"
      },
      filter: ['!', ['has', 'isCustomMarker']]
    });

    map.on("click", layerId, (e) => {
      if (!e.features?.length) return;

      const feature = e.features[0];
      const airport_icao = feature?.properties?.icao;

      if (typeof airport_icao === "string") {
        onAirportClick(airport_icao);
      } else {
        console.warn("Airport ICAO not found on feature", feature);
      }
    });

    map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });

  } else {
    existingSource.setData(geoJsonData);
  }

  // --- Handle Custom Markers ---
  document.querySelectorAll('.airport-marker-container').forEach(marker => marker.remove());

  airports.forEach(airport => {
    if (!airport.atc || airport.atc.length === 0 || !airport.longitude || !airport.latitude) return;

    const markerElement = createElement("div", "airport-marker-container");
    const airportBox = createElement("div", "airport-marker");
    const codeElement = createElement("div", "airport-code");
    const servicesElement = createElement("div", "airport-services");

    codeElement.textContent = airport.icao;
    const serviceCode = airport.atc
      .map(service => atcMapping[service.type] || "")
      .filter(code => code !== "")
      .join("");
    servicesElement.textContent = serviceCode;

    airportBox.appendChild(codeElement);
    airportBox.appendChild(servicesElement);
    markerElement.appendChild(airportBox);

    markerElement.addEventListener("click", (e) => {
      e.stopPropagation();
      onAirportClick(airport.icao);
    });

    new mapboxgl.Marker({
      element: markerElement,
      anchor: "bottom",
      offset: [0, 0]
    })
      .setLngLat([airport.longitude, airport.latitude])
      .addTo(map);
  });
};

type IconSize = 0.2 | 0.3 | 0.9;

// --- Add/Update Aircraft Layer ---
export const addOrUpdateAircraftLayer = (map: Map, flights: Flights[], iconSize: IconSize): GeoJSONSource | null => {
  if (!map) return null;

  const sourceId = "aircraft";
  const layerId = "aircraft-layer";

  const geoJsonData: FeatureCollection<Point, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: flights.map(flight => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [flight.longitude, flight.latitude]
      },
      properties: {
        id: flight.id,
        heading: flight.heading,
        icon: "plane-icon", // ensure this icon is loaded. Will change later
      }
    }))
  };

  let dataSource = map.getSource(sourceId) as GeoJSONSource | undefined;

  if (!dataSource) {
    map.addSource(sourceId, { type: "geojson", data: geoJsonData });
    dataSource = map.getSource(sourceId) as GeoJSONSource; 

    map.addLayer({
      id: layerId,
      type: "symbol",
      source: sourceId,
      layout: {
        "icon-image": "test1",
        "icon-size": iconSize,
        "icon-allow-overlap": true,
        "icon-rotate": ["get", "heading"],
        "icon-rotation-alignment": "map"
      }
    });
  } else {
    dataSource.setData(geoJsonData);
  }
  return dataSource;
};

// --- Add/Update Flight Path Layer ---
export const addOrUpdateFlightPathLayer = (map: Map, positions: Track[] | null, showTrack: boolean): void => {
  if (!map || !showTrack) return;

  const sourceId = "flight-route";
  const layerId = "flight-route";

  if (!positions || positions.length < 2) {
    const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (existingSource) {
       existingSource.setData({ type: "FeatureCollection", features: [] });
    }
    return;
  }

  const coordinates: [number, number][] = [];
  coordinates.push([positions[0].longitude!, positions[0].latitude!]);
  const altitudeData: number[] = [positions[0].altitude || 0];

  let hasCrossedMeridian = false;
  for (let i = 0; i < positions.length - 1; i++) {
    const currentCoords = positions[i];
    const nextCoords = { ...positions[i + 1] };

    const startLng = currentCoords.longitude!;
    let endLng = nextCoords.longitude!;

    if (crossesAntiMeridian([[endLng, nextCoords.latitude!], [startLng, currentCoords.latitude!]]) || hasCrossedMeridian) {
       const lngDiff = endLng - startLng;
      if (lngDiff > 180) {
        endLng -= 360;
      } else if (lngDiff < -180) {
         endLng += 360;
      }
      
      hasCrossedMeridian = true;
    }

    coordinates.push([endLng, nextCoords.latitude!]);
    altitudeData.push(nextCoords.altitude || 0);
  }

  const features: Feature<LineString, { color: string }>[] = [];
  for (let i = 0; i < coordinates.length - 1; i++) {
    features.push({
      type: "Feature",
      properties: {
        color: colourForAltitude((feetToMetres(altitudeData[i]) || 0)) || "#8000ff"
      },
      geometry: {
        type: "LineString",
        coordinates: [coordinates[i], coordinates[i + 1]]
      }
    });
  }

  const geoJsonData: FeatureCollection<LineString, { color: string }> = {
    type: "FeatureCollection",
    features: features
  };

  const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;

  if (!existingSource) {
    map.addSource(sourceId, {
      type: "geojson",
      data: geoJsonData,
      tolerance: 0.1,
      lineMetrics: true 
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": ["get", "color"],
        "line-width": 2
      }
    }, 'aircraft-layer');
  } else {
    existingSource.setData(geoJsonData);
  }
};