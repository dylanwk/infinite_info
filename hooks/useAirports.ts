import { GET_AIRPORTS } from "@/lib/query";
import { Airport, AirportQueryInput, AirportsQueryResponse } from "@/lib/types";
import { ApolloClient, NormalizedCacheObject, useLazyQuery } from "@apollo/client";
import { useEffect, useState, useCallback } from "react";

export const useAirports = (client: ApolloClient<NormalizedCacheObject>) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [fetchAirports, { data, loading: queryLoading, error: queryError }] = useLazyQuery(GET_AIRPORTS, {
    client,
    fetchPolicy: "cache-and-network",
    onCompleted: (data: AirportsQueryResponse["data"]) => {
      if (data?.airportsv2) {
        setAirports(data.airportsv2);
      } else {
        setAirports([])
      }
    },
    onError: error => {
      setError(error);
    }
  });

  useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading]);

  useEffect(() => {
    if (queryError) {
      setError(queryError);
    }
  }, [queryError]);

  const getAirports = useCallback((input: AirportQueryInput) => {

    if (!input?.server) {
      return;
    }

    try {
      fetchAirports({ variables: { input } });
    } catch (e) {
      console.error("useAirports: Error trying to execute fetchAirportsQuery:", e);
    }

  }, [fetchAirports]);

  return {
    airports,
    loading,
    error,
    getAirports
  };
};
