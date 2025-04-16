import { Airport } from "@/lib/types";
import { X, Info, RadioTower } from "lucide-react";

import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import React from "react";
import { AirportViewType } from "../AirportProvidor";

interface AirportHeaderProps {
  airport: Airport;
  handleClose: () => void;
  handleViewClick: (value: AirportViewType) => void;
}
const AirportHeader: React.FC<AirportHeaderProps> = ({ airport, handleClose, handleViewClick }) => {
  return (
    <>
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{airport.icao}</span>
            {airport.has3dBuildings && (
              <Badge variant="outline" className="bg-green-500 text-white border-0">
                3D
              </Badge>
            )}
            <span className="text-gray-800">
              ({airport.iata}) ({airport.elevation}ft)
            </span>
          </div>
          <h3 className="text-lg font-light text-gray-800 mt-1">{airport.name}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex gap-2 flex-row px-4">
        <Button className="w-full md:w-1/2" variant="secondary" onClick={() => handleViewClick("default")}>
          <Info size={64} className="mr-2 h-4 w-4" />
        </Button>
        <Button className="w-full md:w-1/2" variant="secondary" onClick={() => handleViewClick("ATC")}>
          <RadioTower className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default AirportHeader;
