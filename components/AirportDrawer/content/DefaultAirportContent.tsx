import { Airport } from "@/lib/types";
import { Route } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";

interface AirportDefaultContent {
  airport: Airport;
}

const AirportDefaultContent: React.FC<AirportDefaultContent> = ({ airport }) => {
  const inboundCount = airport.inbounds?.length || 0;
  const outboundCount = airport.outbounds?.length || 0;

  return (
    <div className="sm:max-w-md p-0 overflow-y-auto mt-4 mb-4">
      <div className="p-6 pt-0">
        <h3 className="text-sm text-slate-600 tracking-wide font-medium mb-2 uppercase">AIRPORT</h3>

        <Card className="bg-gray-100 border-0 shadow-none">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div>
                <span className="text-lg font-bold">{airport.icao}</span>
                <span className="text-gray-500 ml-2">
                  ({airport.iata}) ({airport.elevation}ft)
                </span>
              </div>
              <div>
                <span className="text-md">{airport.name}</span>
              </div>
              <div className="flex gap-3 mt-3">
                <Badge className="bg-amber-400 hover:bg-amber-400 text-black rounded-full px-4 py-1 font-semibold">
                  {inboundCount} Inbounds
                </Badge>
                <Badge className="bg-green-400 hover:bg-green-400 text-black rounded-full px-4 py-1 font-semibold">
                  {outboundCount} Outbounds
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 pt-0">
        <h3 className="text-sm text-slate-600 tracking-wide font-medium mb-2 uppercase">EDITOR WORK</h3>

        <Card className="bg-gray-100 border-0 shadow-none">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-green-400 hover:bg-green-400 text-black px-2 py-1 h-8 w-8 flex items-center justify-center font-bold rounded-md">
                3D
              </Badge>
              <span className="text-md">3D Buildings</span>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-white hover:bg-white text-black px-2 py-1 h-8 w-8 flex items-center justify-center font-bold rounded-full border-2 border-green-400">
                P
              </Badge>
              <span className="text-md">Jet Bridges</span>
            </div>

            <div className="flex items-center gap-4">
              <Badge className="bg-white hover:bg-white text-black px-2 py-1 h-8 w-8 flex items-center justify-center font-bold rounded-md border-2 border-green-400">
                50
              </Badge>
              <span className="text-md">Stand Guidance</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-8 w-8 flex items-center justify-center">
                <Route color="green" />
              </div>
              <span className="text-md">Taxiway Routing</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirportDefaultContent;
