import { Airport } from "@/lib/types";
import { useEffect, useState } from "react";
import { ChartNetwork, X, Map, Route, Info, RadioTower } from "lucide-react";
import Drawer from "@mui/material/Drawer";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";

interface AirportDrawerProps {
  airport: Airport | null;
  handleClose: () => void;
}

const AirportDrawer: React.FC<AirportDrawerProps> = ({ airport, handleClose }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!airport) {
      setDrawerOpen(false);
      return;
    }
    setDrawerOpen(true);
  }, [airport]);

  if (!airport) return null;

  const inboundCount = airport.inbounds?.length || 0;
  const outboundCount = airport.outbounds?.length || 0;

  // Map ATC types to readable strings
  const atcTypes = ["Ground", "Tower", "Unicom", "Clearance", "Approach", "Departure", "Center", "ATIS"];

  return (
    <Drawer
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: "90%", sm: 450 },
          boxSizing: "border-box",
          overflow: "hidden",
          borderRadius: "16px", // rounded corners
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // shadow
          zIndex: 40
        }
      }}
      variant="persistent"
      anchor={"right"}
      open={drawerOpen}
    >
      <div className="sm:max-w-md p-0 overflow-y-auto">
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

        <div className="flex flex-col gap-2 md:flex-row px-6">
          <Button className="w-full md:w-1/2 bg-gray-200" variant="secondary">
            <Info size={64} className="mr-2 h-4 w-4" />
          </Button>
          <Button className="w-full md:w-1/2" variant="secondary">
            <RadioTower className="mr-2 h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <h3 className="text-sm text-slate-600 tracking-wide font-medium mb-2 uppercase">MAP FILTERS</h3>

          <Card className="bg-gray-100 border-0 shadow-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg">Inbounds</span>
                <Switch />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg">Outbounds</span>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Airport Section */}
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

        {/* Editor Work Section */}
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
    </Drawer>
  );
};

export default AirportDrawer;
