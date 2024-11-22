import { bearing, destination } from "@turf/turf";

export function createPolyTrackFeature(track) {
    const trackSegments = [];

    track.forEach((point, index) => {
        if (index === track.length - 1) {
            return; // Skip the last point
        }

        const next = track[index + 1];
        const lat1 = point.latitude;
        const long1 = point.longitude;
        const lat2 = next.latitude;
        let long2 = next.longitude;

        // Adjust longitude for crossing the 180th meridian
        if (Math.abs(long1 - long2) > 180) {
            if (long2 < long1) {
                long2 += 360;
            } else {
                long2 -= 360;
            }
        }

        const firstCoord = [ long1, lat1 ];
        const lastCoord =  [ long2, lat2 ];

        const bearing = calculateBearing(firstCoord, lastCoord); // Implement calculateBearing

        const firstCalcPoint = calculateCoordinate(firstCoord, 1, bearing - 90); // Implement calculateCoordinate
        const lastCalcPoint = calculateCoordinate(lastCoord, 1, bearing - 90);

        const coords = [firstCoord, firstCalcPoint, lastCalcPoint, lastCoord, firstCoord];

        const bigPoly = createPolygonFromCoordinates(coords); // Implement createPolygonFromCoordinates

        const feature = {
            type: 'Feature',
            geometry: bigPoly,
            properties: {
                altitude: Math.round(next.altitude),
            },
        };

        trackSegments.push(feature);
    });

    console.log(trackSegments)
    return trackSegments;
}

function calculateBearing(coord1, coord2) {
    const result = bearing(coord1, coord2);

    return result;
    // Calculate the bearing from coord1 to coord2
}

function calculateCoordinate(coord, distance, bearing) {
    const result = destination(coord, distance, bearing)
    return result.geometry.coordinates;
    // Calculate a new coordinate from the given point, distance, and bearing
}

function createPolygonFromCoordinates(coords) {
    return {
        type: 'Polygon',
        coordinates: [coords.map(coord => [coord[0], coord[1]])],
    };
    // Create a polygon geometry from a list of coordinates
}
