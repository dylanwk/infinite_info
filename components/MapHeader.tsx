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
import { useCallback, useState } from "react";
import { Loader } from "lucide-react";

// Define type for session data
interface SessionType {
  maxUsers: number;
  worldType: number;
  userCount: number;
  type: number;
  name: string;
  minimumGradeLevel: number;
  id: string;
}

interface MapHeaderProps {
  selectedSession: string;
  onSessionChange: (value: string) => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedSession,
  onSessionChange,
}) => {
  const [sessions, setSessions] = useState<SessionType[]>([]);

  // Query hook for fetching sessions
  const { loading, error } = useQuery(GET_SESSIONS, {
    client,
    onCompleted: (data: { sessionsv2: SessionType[] }) => {
      if (data?.sessionsv2) {
        setSessions(data.sessionsv2);
      }
    },
  });

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
        <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
          {loading ? (
            <Select>
              <SelectTrigger className="w-[180px] bg-transparent backdrop-blur-lg backdrop-filter">
                <Loader /> loading...
              </SelectTrigger>
            </Select>
          ) : (
            <Select value={selectedSession} onValueChange={handleSessionChange}>
              <SelectTrigger className="w-[180px] bg-transparent border-2 border-white  backdrop-blur-lg backdrop-filter">
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
