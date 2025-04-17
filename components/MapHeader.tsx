import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "@/lib/query";
import client from "@/lib/apolloClient";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Map, ChevronsUpDown, Settings } from "lucide-react";
import { DARK, DEFAULT, MapStyle, SATELLITE, TERRAIN, Session } from "@/lib/types";
import { Button } from "./ui/button";

interface MapHeaderProps {
  selectedSession: string;
  onSessionChange: (value: string) => void;
  mapStyle: MapStyle;
  onMapStyleChange: (value: MapStyle) => void;
  onSettingsClick: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedSession,
  onSessionChange,
  mapStyle,
  onMapStyleChange,
  onSettingsClick
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isClient, setIsClient] = useState(false);

  // wait for component to mount before calling session change
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { loading, error, data } = useQuery<{ sessionsv2: Session[] }>(GET_SESSIONS, {
    client
  });

  useEffect(() => {
    if (data?.sessionsv2) {
      setSessions(data.sessionsv2);
      console.log(data.sessionsv2[0].id)
    }
  }, [data]);

  useEffect(() => {
    if (isClient && sessions.length > 0 && !selectedSession && onSessionChange) {
      onSessionChange(sessions[0].id);
    }
  }, [sessions, selectedSession, onSessionChange, isClient]);

  const handleSessionChange = useCallback(
    (value: string) => {
      onSessionChange(value);
    },
    [onSessionChange]
  );

  const handleMapStyleChange = useCallback(
    (value: string) => {
      onMapStyleChange(value as MapStyle);
    },
    [onMapStyleChange]
  );

  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <div className="absolute z-10 mt-2 w-full bg-red-100 p-4 text-center text-red-600">
        Error loading sessions. Please try again later.
      </div>
    );
  }

  return (
    <div className="absolute z-10 mt-2 w-full bg-transparent">
      <Container>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-3">
            {!isClient ? (
              <Select disabled>
                <SelectTrigger className="w-[180px] bg-gray-200 border-none shadow-inner">
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </SelectTrigger>
              </Select>
            ) : (
              <Select
                value={selectedSession}
                onValueChange={handleSessionChange}
                disabled={loading || sessions.length === 0}
              >
                <SelectTrigger className="w-[180px] bg-gray-50 border-none shadow-lg disabled:opacity-50">
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      <SelectValue placeholder="Select a server" />
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {!loading && sessions.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>Servers</SelectLabel>
                      {sessions.map(session => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name} ({session.userCount}/{session.maxUsers})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : (
                    !loading && (
                      <SelectItem value="no-servers" disabled>
                        No servers available
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={onSettingsClick}
              variant={"secondary"}
              disabled={!isClient}
              className="w-[40px] h-[40px] bg-gray-50 hover:bg-gray-50 border-none shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              <Settings color="black" size={20} />
            </Button>

            {!isClient ? (
              <Select disabled>
                <SelectTrigger className="w-[40px] h-[40px] bg-gray-200 border-none shadow-inner flex items-center justify-center">
                  <Map size={20} />
                </SelectTrigger>
              </Select>
            ) : (
              <Select
                value={mapStyle}
                onValueChange={handleMapStyleChange}
              >
                <SelectTrigger className="w-[40px] h-[40px] bg-gray-50 border-none shadow-lg flex items-center justify-center">
                  <Map size={20} />
                </SelectTrigger>
                <SelectContent className="min-w-[110px]">
                  <SelectGroup>
                    <SelectItem value={DEFAULT}>Default</SelectItem>
                    <SelectItem value={TERRAIN}>Terrain</SelectItem>
                    <SelectItem value={SATELLITE}>Satellite</SelectItem>
                    <SelectItem value={DARK}>Dark</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
          <Link className="flex rounded-xl text-xl" href="/">
            <Image src="/images/iilogo.svg" alt="Company Logo - Link to Homepage" width={100} height={100} priority />
          </Link>
        </div>
      </Container>
    </div>
  );
};
