/**
 * Flight Distance Utilities
 * Typescript implementation of flight plan distance calculations
 */

/**
 * Represents a geographic coordinate with latitude and longitude
 */
export interface Coordinate {
    latitude: number;
    longitude: number;
  }
  
  /**
   * Represents a location with coordinates and methods to calculate distance
   */
  export class Location {
    latitude: number;
    longitude: number;
  
    constructor(latitude: number, longitude: number) {
      this.latitude = latitude;
      this.longitude = longitude;
    }
  
    /**
     * Calculate distance from this location to another location in meters
     * Using the Haversine formula to calculate great-circle distance between two points
     */
    distanceFrom(other: Location): number {
      const R = 6371000; // Earth radius in meters
      const dLat = this.toRadians(other.latitude - this.latitude);
      const dLon = this.toRadians(other.longitude - this.longitude);
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.toRadians(this.latitude)) * Math.cos(this.toRadians(other.latitude)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance;
    }
  
    private toRadians(degrees: number): number {
      return degrees * Math.PI / 180;
    }
  }
  
  /**
   * Calculate the total flight plan distance from a series of coordinates
   * @param coords Array of geographic coordinates
   * @returns Total distance in nautical miles
   */
  export function calculateTotalFPLDistance(coords: Coordinate[]): number {
    // Convert coordinates to locations
    const locations: Location[] = coords.map(coord => 
      new Location(coord.latitude, coord.longitude)
    );
    
    let totalDistanceMeters = 0;
    
    // Sum distances between consecutive points
    for (let i = 0; i < locations.length - 1; i++) {
      totalDistanceMeters += locations[i].distanceFrom(locations[i + 1]);
    }
    
    // Convert meters to nautical miles
    return totalDistanceMeters / 1852;
  }
  
  /**
   * Calculate the distance remaining in the flight plan from the current position
   * @param trackCoords The flight plan coordinates
   * @param planeCoords The current plane position
   * @returns Distance remaining in nautical miles
   */
  export function distanceLeft(trackCoords: Coordinate[], planeCoords: Coordinate): number {
    const planeLocation = new Location(planeCoords.latitude, planeCoords.longitude);
    
    // Convert track coordinates to locations
    let locations: Location[] = trackCoords.map(coord =>
      new Location(coord.latitude, coord.longitude)
    );
    
    // Find the closest point in the flight plan to the plane's current position
    let closestMeters = Infinity;
    let closestLocation = new Location(0, 0);
    
    for (let i = 0; i < locations.length; i++) {
      const dist = locations[i].distanceFrom(planeLocation);
      
      if (i === 0 || dist < closestMeters) {
        closestMeters = dist;
        closestLocation = locations[i];
      }
    }
    
    // Remove all points that have been passed
    for (const fix of trackCoords) {
      if (locations.length === 1) {
        // For single fix calculations (typically airports)
        break;
      }
      
      if (fix.latitude === closestLocation.latitude && fix.longitude === closestLocation.longitude) {
        locations = locations.filter(loc => 
          !(loc.longitude === fix.longitude && loc.latitude === fix.latitude)
        );
        break;
      }
      
      locations = locations.filter(loc => 
        !(loc.longitude === fix.longitude && loc.latitude === fix.latitude)
      );
    }
    
    // Calculate remaining distance
    const finalCoords: Coordinate[] = [planeCoords];
    
    locations.forEach(loc => {
      finalCoords.push({ latitude: loc.latitude, longitude: loc.longitude });
    });
    
    const distanceRemaining = calculateTotalFPLDistance(finalCoords);
    
    // Check if we're close to the destination
    if (trackCoords.length > 0) {
      const lastPoint = trackCoords[trackCoords.length - 1];
      const lastLocation = new Location(lastPoint.latitude, lastPoint.longitude);
      const distanceDifferent = lastLocation.distanceFrom(planeLocation);
      
      if (distanceDifferent <= 2000) {
        return 0;
      }
    }
    
    return distanceRemaining;
  }
  
  /**
   * Calculate flight progress metrics
   * @param fplCoordinates Flight plan coordinates
   * @param planeCoords Current plane coordinates
   * @returns Object containing distance metrics and progress percentage
   */
  export function calculateFlightProgress(fplCoordinates: Coordinate[], planeCoords: Coordinate): {
    totalDistance: number;
    distanceToGo: number;
    distanceFlown: number;
    flightProgress: number;
  } {
    const totalDistance = calculateTotalFPLDistance(fplCoordinates);
    const distanceToGo = distanceLeft(fplCoordinates, planeCoords);
    const distanceFlown = totalDistance - distanceToGo;
    const flightProgress = distanceFlown / totalDistance;
    
    return {
      totalDistance,
      distanceToGo,
      distanceFlown,
      flightProgress
    };
  }