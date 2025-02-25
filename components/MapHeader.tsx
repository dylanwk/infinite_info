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
import { Loader2 } from "lucide-react";
import { Session } from "@/lib/types";



interface MapHeaderProps {
  selectedSession: string;
  onSessionChange: (value: string) => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedSession,
  onSessionChange,
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
    }
  }
  , [sessions, selectedSession, onSessionChange]);

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
          {loading ? (
            <Select>
              <SelectTrigger className="w-[180px] bg-gray-100">
                <Loader2 /> 
              </SelectTrigger>
            </Select>
          ) : (
            <Select value={selectedSession} onValueChange={handleSessionChange}>
              <SelectTrigger className="w-[180px] bg-gray-50 border-none shadow-lg">
                <SelectValue placeholder="Select a server" />
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
