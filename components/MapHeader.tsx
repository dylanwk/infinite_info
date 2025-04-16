import { useQuery } from "@apollo/client";
import { GET_SESSIONS } from "@/lib/query";
import client from "@/lib/apolloClient";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Session } from "@/lib/types";

interface MapHeaderProps {
  selectedSession: string;
  onSessionChange: (value: string) => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({ selectedSession, onSessionChange }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const { loading, error, data } = useQuery<{ sessionsv2: Session[] }>(GET_SESSIONS, {
    client,
  });

  // update sessions state when data is fetched successfully
  useEffect(() => {
    if (data?.sessionsv2) {
      setSessions(data.sessionsv2);
    }
  }, [data]);

  // handle the initial session selection
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession && onSessionChange) {
      onSessionChange(sessions[0].id);
    }
  }, [sessions, selectedSession, onSessionChange]);

  // memoized handler for session selection changes
  const handleSessionChange = useCallback(
    (value: string) => {
      onSessionChange(value);
    },
    [onSessionChange] 
  );

  // Error handling
  if (error) {
    console.error("GraphQL Error:", error);
    return <div className="absolute z-10 mt-2 w-full bg-red-100 p-4 text-center text-red-600">Error loading sessions. Please try again later.</div>;
  }

  return (
    <div className="absolute z-10 mt-2 w-full bg-transparent">
      <Container>
        <div className="flex flex-row items-center justify-between">
          <Select
            value={selectedSession}
            onValueChange={handleSessionChange}
            disabled={loading || sessions.length === 0} // disabled while loading or if no sessions
          >
            <SelectTrigger className="w-[180px] bg-gray-50 border-none shadow-lg disabled:opacity-50">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <SelectValue placeholder="Select a server" />
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
                !loading && <SelectItem value="no-servers" disabled>No servers available</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Link className="flex rounded-xl text-xl" href="/">
            <Image src="/images/iilogo.svg" alt="Company Logo - Link to Homepage" width={100} height={100} priority />
          </Link>
        </div>
      </Container>
    </div>
  );
};