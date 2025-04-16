import React from "react";
import { Button } from "@/components/ui/button";
import { ChartNetwork, Map } from "lucide-react";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import FlightIcon from "@mui/icons-material/Flight";
import { DrawerView } from "@/lib/types";

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
  isVerified: boolean;
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
  isVerified
}) => {
  if (!username || username === "") {
    username = "Anonymous";
  }

  return (
    <>
      <div className="flex flex-col gap-1 -mb-4">
        <div className="flex-row flex font-light text-gray-900 gap-1.5">
          <PermIdentityIcon fontSize="small" />
          <div className="-mt-0.5 -ml-0.5">{username}</div>
        </div>
        <div className="flex-row flex font-light text-gray-900 gap-1.5">
          <FlightIcon fontSize="small" />
          <div className="-mt-0.5 -ml-0.5">
            {aircraft} ({livery})
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-evenly rounded-xl gap-2 bg-gray-100 p-4">
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">Alt. (MSL)</p>
          <div>{Math.floor(altitude)} ft</div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">Heading (T)</p>
          <div>{heading.toFixed(1)}°</div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">VS</p>
          <div>{Math.floor(vs)} fpm</div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-xs text-neutral-700 font-light tracking-tight">Spd. (GS)</p>
          <div>{Math.floor(speed)} kts</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <Button
          onClick={() => handleClick("flight-plan")}
          className={`${currentView === "flight-plan" && isVerified ? "bg-[hsl(191,95%,33%)]" : ""} flex-1`}
          variant="default"
        >
          <Map className="mr-2 h-4 w-4" />
          Flight Plan
        </Button>
        <Button
          onClick={() => handleClick("graph")}
          className={`${currentView === "graph" && isVerified ? "bg-[hsl(191,95%,33%)]" : ""} flex-1`}
          variant="default"
        >
          <ChartNetwork className="mr-2 h-4 w-4" />
          Graphs
        </Button>
      </div>
    </>
  );
};

export default DrawerHeader;
