import { useState, useEffect, useRef } from "react";
import { useLazyQuery, ApolloError } from "@apollo/client";
import { GET_FLIGHTS } from "@/lib/query";
import client from "@/lib/apolloClient";
import { Flights } from "@/lib/types";
import { REFRESH_INTERVAL_MS } from "@/lib/constants";

interface UseFlightsDataProps {
  session: string;
  isMapReady: boolean;
  isPaused: boolean;
}

export const useFlightsData = ({ session, isMapReady, isPaused }: UseFlightsDataProps) => {
  const [flights, setFlights] = useState<Flights[]>([]);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [fetchFlightsQuery, { loading, error, data }] = useLazyQuery<{ flightsv2: Flights[] }>(
    GET_FLIGHTS,
    {
      client,
      fetchPolicy: "network-only", // no cache so coords are constantly updated
    }
  );

  // fetch flights when session changes or map becomes ready
  useEffect(() => {
    if (session && isMapReady) {
      fetchFlightsQuery({ variables: { input: { session } } });
    }
  }, [session, isMapReady, fetchFlightsQuery]);

  useEffect(() => {
    if (data?.flightsv2) {
      setFlights(data.flightsv2);
    }
  }, [data]);

  // periodic refresh
  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (session && isMapReady && !isPaused) {

      refreshIntervalRef.current = setInterval(() => {
        fetchFlightsQuery({ variables: { input: { session } } });
      }, REFRESH_INTERVAL_MS);

    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [session, isMapReady, isPaused, fetchFlightsQuery]);


  return { flights, loading, error };
};