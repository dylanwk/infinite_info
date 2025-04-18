import React from "react";
import { Button } from "@/components/ui/button";
import { ChartNetwork, Map } from "lucide-react";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FlightIcon from "@mui/icons-material/Flight";
import { DrawerView } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface DrawerHeaderProps {
  username: string;
  aircraft: string;
  altitude: number;
  heading: number;
  vs: number;
  speed: number;
  livery: string;
  handleClick: (value: DrawerView) => void;
  currentView: DrawerView;
  progressRatio: number
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  username,
  aircraft,
  altitude,
  heading,
  vs,
  speed,
  livery,
  handleClick,
  currentView,
  progressRatio
}) => {
  if (!username || username === "") {
    username = "Anonymous";
  }

  return (
    <div className="flex flex-col space-y-3 mt-1">
      {/* User and aircraft info */}
      <div className="flex flex-col space-y-0">
        <div className="flex items-center space-x-1 text-gray-900">
          <PermIdentityIcon fontSize="small" />
          <span>{username}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-900">
          <FlightIcon fontSize="small" />
          <span>
            {aircraft} ({livery})
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="py-0">
        <Progress className="h-[5px]" value={progressRatio || 0} />
      </div>

      {/* Flight stats */}
      <div className="flex flex-row justify-evenly rounded-xl bg-gray-100 p-2.5">
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">Alt. (MSL)</p>
          <div className="font-medium">{Math.floor(altitude)} ft</div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">Heading (T)</p>
          <div className="font-medium">{heading.toFixed(1)}°</div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">VS</p>
          <div className="font-medium">{Math.floor(vs)} fpm</div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">Spd. (GS)</p>
          <div className="font-medium">{Math.floor(speed)} kts</div>
        </div>
      </div>

      {/* View buttons */}
      <div className="flex flex-row gap-2">
        <Button
          onClick={() => handleClick("flight-plan")}
          className={`${currentView === "flight-plan" ? "bg-[hsl(191,95%,33%)]" : ""} flex-1 rounded-xl y-0 mt-0`}
          variant="default"
        >
          <Map className="mr-2 h-2 w-4" />
          Flight Plan
        </Button>
        <Button
          onClick={() => handleClick("graph")}
          className={`${currentView === "graph" ? "bg-[hsl(191,95%,33%)]" : ""} flex-1 rounded-xl`}
          variant="default"
        >
          <ChartNetwork className="mr-2 h-2 w-4" />
          Graphs
        </Button>
      </div>
    </div>
  );
};

export default DrawerHeader;
