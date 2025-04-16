import React, { useMemo } from "react";
import { Plane, ArrowUp, ArrowDown } from "lucide-react";
import { GQL_Track_Type } from "@/lib/types";

// A more readable version of the track point for our component
type ProcessedTrackPoint = {
  altitude: number;
  speed: number;
  verticalSpeed: number;
  reportedTime: Date;
  phase: FlightPhase;
  position: number; // Position in the journey (0-100%)
};

// Flight phases
enum FlightPhase {
  GROUND = "ground",
  TAKEOFF = "takeoff",
  CLIMB = "climb",
  CRUISE = "cruise",
  DESCENT = "descent",
  APPROACH = "approach",
  LANDING = "landing"
}

interface FlightProgressBarProps {
  track: GQL_Track_Type[];
  callsign: string;
}

export function FlightProgressBar({ track, callsign }: FlightProgressBarProps) {
  // Process the track data to determine flight phases and progress
  const { processedTrack, currentPoint, totalDuration, elapsedTime, completionPercentage } = useMemo(() => {
    if (!track || track.length === 0) {
      return {
        processedTrack: [],
        currentPoint: null,
        totalDuration: 0,
        elapsedTime: 0,
        completionPercentage: 0
      };
    }

    // Sort track by time
    const sortedTrack = [...track].sort((a, b) => {
      return new Date(a.r).getTime() - new Date(b.r).getTime();
    });

    // Determine flight phases
    const processed: ProcessedTrackPoint[] = sortedTrack.map((point, index) => {
      // Determine flight phase based on altitude, speed, and vertical speed
      let phase: FlightPhase;

      if (point.s < 30) {
        // On ground if speed is very low
        phase = FlightPhase.GROUND;
      } else if (point.a < 1000 && point.v > 500) {
        // Taking off if low altitude but climbing rapidly
        phase = FlightPhase.TAKEOFF;
      } else if (point.v > 200) {
        // Climbing if vertical speed is positive
        phase = FlightPhase.CLIMB;
      } else if (point.v < -200) {
        // Descending if vertical speed is negative
        if (point.a < 3000) {
          // Approaching if at low altitude and descending
          phase = FlightPhase.APPROACH;
        } else {
          phase = FlightPhase.DESCENT;
        }
      } else {
        // Cruising otherwise
        phase = FlightPhase.CRUISE;
      }

      // If it's the last point and on ground, it's landed
      if (index === sortedTrack.length - 1 && phase === FlightPhase.GROUND) {
        phase = FlightPhase.LANDING;
      }

      return {
        altitude: point.a,
        speed: point.s,
        verticalSpeed: point.v,
        reportedTime: new Date(point.r),
        phase,
        position: 0 // Will calculate later
      };
    });

    // Calculate total flight time
    const startTime = processed[0].reportedTime.getTime();
    const endTime = processed[processed.length - 1].reportedTime.getTime();
    const totalDuration = endTime - startTime;

    // Calculate position for each point (0-100%)
    processed.forEach((point, index) => {
      const elapsed = point.reportedTime.getTime() - startTime;
      point.position = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
    });

    // Get the most recent point
    const currentPoint = processed[processed.length - 1];

    // Calculate elapsed time and completion percentage
    const now = new Date().getTime();
    const elapsedTime = Math.min(now - startTime, totalDuration);
    const completionPercentage = totalDuration > 0 ? (elapsedTime / totalDuration) * 100 : 0;

    return {
      processedTrack: processed,
      currentPoint,
      totalDuration,
      elapsedTime,
      completionPercentage: Math.min(completionPercentage, 100)
    };
  }, [track]);

  // Format time
  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // If no track data, show loading or error state
  if (!track || track.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded-xl">
        <div className="text-center text-gray-500">No flight data available</div>
      </div>
    );
  }

  // Get phase name for display
  const getPhaseLabel = (phase: FlightPhase) => {
    switch (phase) {
      case FlightPhase.GROUND:
        return "On Ground";
      case FlightPhase.TAKEOFF:
        return "Takeoff";
      case FlightPhase.CLIMB:
        return "Climbing";
      case FlightPhase.CRUISE:
        return "Cruising";
      case FlightPhase.DESCENT:
        return "Descending";
      case FlightPhase.APPROACH:
        return "Approach";
      case FlightPhase.LANDING:
        return "Landing";
      default:
        return "In Flight";
    }
  };

  // Get phase icon
  const getPhaseIcon = (phase: FlightPhase) => {
    switch (phase) {
      case FlightPhase.CLIMB:
        return <ArrowUp size={16} className="text-blue-500" />;
      case FlightPhase.DESCENT:
      case FlightPhase.APPROACH:
        return <ArrowDown size={16} className="text-blue-500" />;
      default:
        return <Plane size={16} className="text-blue-500" />;
    }
  };

  // Get color based on flight phase
  const getProgressColor = (phase: FlightPhase) => {
    switch (phase) {
      case FlightPhase.GROUND:
        return "bg-gray-500";
      case FlightPhase.TAKEOFF:
        return "bg-green-500";
      case FlightPhase.CLIMB:
        return "bg-blue-400";
      case FlightPhase.CRUISE:
        return "bg-blue-600";
      case FlightPhase.DESCENT:
        return "bg-purple-500";
      case FlightPhase.APPROACH:
        return "bg-orange-500";
      case FlightPhase.LANDING:
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl mt-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-semibold">Flight Progress</div>
        <div className="text-sm text-gray-600">
          {formatDuration(elapsedTime)} / {formatDuration(totalDuration)}
        </div>
      </div>

      {/* Progress bar container */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
        {/* Background segments showing different flight phases */}
        {processedTrack.map((point, index) => {
          // Skip the first point as it has no width
          if (index === 0) return null;

          const prevPoint = processedTrack[index - 1];
          const width = point.position - prevPoint.position;

          return (
            <div
              key={index}
              className={`absolute h-full ${getProgressColor(prevPoint.phase)}`}
              style={{
                left: `${prevPoint.position}%`,
                width: `${width}%`
              }}
            />
          );
        })}

        {/* Progress indicator */}
        <div
          className="h-full bg-white bg-opacity-30"
          style={{ width: `${100 - completionPercentage}%`, marginLeft: `${completionPercentage}%` }}
        />

        {/* Airplane indicator */}
        <div className="absolute top-1/2 transform -translate-y-1/2" style={{ left: `${completionPercentage}%` }}>
          <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center -ml-3">
            <Plane
              size={14}
              className="text-blue-600"
              style={{
                transform: `rotate(${
                  currentPoint?.phase === FlightPhase.DESCENT || currentPoint?.phase === FlightPhase.APPROACH ? 315 : 45
                }deg)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Current status */}
      <div className="flex items-center mt-3 justify-between">
        <div className="flex items-center">
          {currentPoint && getPhaseIcon(currentPoint.phase)}
          <span className="ml-1 text-sm font-medium">
            {currentPoint ? getPhaseLabel(currentPoint.phase) : "Unknown"}
          </span>
        </div>
        <div className="text-sm text-gray-600">{Math.round(completionPercentage)}% Complete</div>
      </div>

      {/* Origin and destination */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <div>{processedTrack[0]?.reportedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        <div>
          {processedTrack[processedTrack.length - 1]?.reportedTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
      </div>

      {/* Airport codes */}
      <div className="flex justify-between text-xs font-semibold">
        <div>{track[0]?.i?.split(":")[0] || "N/A"}</div>
        <div>{track[track.length - 1]?.i?.split(":")[0] || "N/A"}</div>
      </div>
    </div>
  );
}
