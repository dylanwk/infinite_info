import { GET_AIRPORTS } from "@/lib/query";
import { Airport, AirportQueryInput, AirportsQueryResponse } from "@/lib/types";
import { ApolloClient, NormalizedCacheObject, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export const useAirports = (client: ApolloClient<NormalizedCacheObject>) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [fetchAirports, { data, loading: queryLoading, error: queryError }] = useLazyQuery(GET_AIRPORTS, {
    client,
    onCompleted: (data: AirportsQueryResponse["data"]) => {
      if (data?.airportsv2) {
        setAirports(data.airportsv2);
        console.log("Airports:", data.airportsv2);
      }
    },
    onError: error => {
      setError(error);
      console.error("Error fetching airports:", error);
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

  const getAirports = (input: AirportQueryInput) => {
    setLoading(true);
    fetchAirports({
      variables: { input }
    });
  };

  return {
    airports,
    loading,
    error,
    getAirports
  };
};
