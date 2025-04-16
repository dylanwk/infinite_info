"use client"

import { ATC } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Headphones, Volume2 } from "lucide-react";

interface ATCContentProps {
  atis: string | null;
  atc: ATC[];
}

// Index of ATC type that controls ATIS
const ATIS_CONTROLLER_TYPE = 7;
const atcTypes = ["Ground", "Tower", "Unicom", "Clearance", "Approach", "Departure", "Center", "ATIS"];

const ATCContent: React.FC<ATCContentProps> = ({ atis, atc = [] }) => {
  const atisController = atc.find(a => a.type === ATIS_CONTROLLER_TYPE);

  const timeConverter = (timeString: string) => {
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(timeString).getTime()) / 60000));
    return isNaN(elapsedMinutes) ? "0m" : `${elapsedMinutes}m`;
  };

  return (
    <div className="w-full space-y-6 p-6 bg-white dark:bg-slate-950 overflow-y-auto pb-10 mb-4 rounded-lg pt-2 mt-2">
      <div>
        <h2 className="text-sm text-slate-600 tracking-wide font-medium mb-2 uppercase">D-ATIS</h2>

        {atis ? (
          <Card className="bg-gray-100 border-0 shadow-none rounded-xl">
            <CardContent className="p-0">
              <div className="p-4 space-y-3">
                {/* ATIS Header with 30m Badge */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 px-2.5 py-1">
                    <Volume2 className="h-4 w-4" />
                    <span>{atisController ? timeConverter(atisController.startTime) : "0m"}</span>
                  </Badge>
                  <h3 className="font-semibold">{atisController ? atisController.username : "Anonymous"}</h3>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{atis}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gray-100 border-0 shadow-none rounded-xl">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">No ATIS information available</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-sm text-slate-600 tracking-wide font-medium mb-2 uppercase">ATC FREQUENCIES</h2>

        <div className="space-y-4">
          {atc.length > 0 ? (
            atc.map((freq, index) => (
              <Card key={index} className="bg-gray-100 border-0 shadow-none rounded-xl">
                <CardContent className="p-0">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 px-2.5 py-1">
                        <Headphones className="h-4 w-4" />
                        <span>{timeConverter(freq.startTime)}</span>
                      </Badge>
                      <h3 className="font-semibold">{freq.type !== undefined ? atcTypes[freq.type] : "Unknown"}</h3>
                    </div>

                    <p className="text-sm text-black dark:text-gray-300">
                      Operated by <span className="font-semibold">{freq.username}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-gray-100 border-0 shadow-none rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">No ATC frequencies available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATCContent;
