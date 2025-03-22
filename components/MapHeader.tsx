import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "@/lib/query";
import client from "@/lib/apolloClient";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useCallback, useEffect, useState } from "react";
import { ChevronsUpDown, Loader2, Map } from "lucide-react";
import {
  DARK,
  DEFAULT,
  MapStyle,
  SATELLITE,
  Session,
  TERRAIN,
} from "@/lib/types";

interface MapHeaderProps {
  selectedSession: string;
  onSessionChange: (value: string) => void;
  mapStyle: MapStyle;
  onMapStyleChange: (value: MapStyle) => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedSession,
  onSessionChange,
  mapStyle,
  onMapStyleChange,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  // Query hook for fetching sessions
  const { loading, error } = useQuery(GET_SESSIONS, {
    client,
    onCompleted: (data: { sessionsv2: Session[] }) => {
      if (data?.sessionsv2) {
        setSessions(data.sessionsv2);
      }
    },
  });

  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      onSessionChange(sessions[0].id);
      console.log(sessions[0].id);
    }
  }, [sessions, selectedSession, onSessionChange]);

  // Memoized handler for session selection changes
  const handleSessionChange = useCallback(
    (value: string) => {
      onSessionChange(value);
    },

    [onSessionChange]
  );

  // Error handling
  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <div className="absolute w-full bg-red-100 p-4 text-center text-red-600">
        Error loading sessions.
      </div>
    );
  }

  return (
    <div className="absolute z-10 mt-2 w-full bg-transparent">
      <Container>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-4">
            {loading ? (
              <Select>
                <SelectTrigger className="w-[162px] bg-gray-100">
                  <Loader2 />
                </SelectTrigger>
              </Select>
            ) : (
              <Select
                value={selectedSession}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger className="w-[162px] bg-gray-50 border-none shadow-lg">
                  <SelectValue placeholder="Select a server" />{" "}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Servers</SelectLabel>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name} ({session.userCount}/{session.maxUsers})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <Select value={mapStyle} onValueChange={onMapStyleChange}>
              <SelectTrigger className="w-[40px] bg-gray-50 border-none shadow-lg flex items-center justify-center">
                <Map size={20} />
              </SelectTrigger>
              <SelectContent className="w-[110px]">
                <SelectGroup>
                  <SelectItem
                    value={DEFAULT}
                    className="flex items-center justify-between"
                  >
                    <div className="ml-auto">Default</div>
                  </SelectItem>
                  <SelectItem
                    value={TERRAIN}
                    className="flex items-center justify-between"
                  >
                    <div className="ml-auto">Terrain</div>
                  </SelectItem>
                  <SelectItem
                    value={SATELLITE}
                    className="flex items-center justify-between"
                  >
                    <div className="ml-auto">Satellite</div>
                  </SelectItem>
                  <SelectItem
                    value={DARK}
                    className="flex items-center justify-between"
                  >
                    <div className="ml-auto">Dark</div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Link className="flex rounded-xl text-xl" href="/">
            <Image
              src="/images/iilogo.svg"
              alt="Logo"
              width={100}
              height={100}
              priority
            />
          </Link>
        </div>
      </Container>
    </div>
  );
};
