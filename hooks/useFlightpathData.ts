import { useState, useEffect } from "react";
import { useLazyQuery, ApolloError } from "@apollo/client";
import { GET_FLIGHTPATH } from "@/lib/query";
import client from "@/lib/apolloClient";
import { GQL_Track_Type, Track } from "@/lib/types";

const convertAttributeNames = (track: GQL_Track_Type[]): Track[] => {
    return track.map(item => ({
        altitude: item.a,
        latitude: item.b,
        longitude: item.c,
        heading: item.h,
        nearestAirport: item.i,
        reportedTime: item.r,
        speed: item.s,
        verticalSpeed: item.v,
        aircraftState: item.z
    }));
};


interface UseFlightPathDataProps {
    flightId: string | null;
    session: string;
}

export const useFlightPathData = ({ flightId, session }: UseFlightPathDataProps) => {
    const [flightPath, setFlightPath] = useState<Track[] | null>(null);

    const [fetchFlightPathQuery, { loading, error, data }] = useLazyQuery<{
        flightv2: { track: GQL_Track_Type[] }
    }>(GET_FLIGHTPATH, {
        client,
        fetchPolicy: "cache-first", // or network-only if always fresh path needed?
        onCompleted: (responseData) => {
            if (responseData?.flightv2?.track) {
                const convertedPath = convertAttributeNames(responseData.flightv2.track);
                setFlightPath(convertedPath);
            } else {
                setFlightPath(null); // clear path if no track data
            }
        },
        onError: (fetchError) => {
            console.error("Error fetching flight path:", fetchError);
            setFlightPath(null);
        }
    });

    // fetch path when flightId or session changes
    useEffect(() => {
        if (flightId && session) {
            fetchFlightPathQuery({
                variables: { input: { id: flightId, session } }
            });
        } else {
            setFlightPath(null);
        }
    }, [flightId, session, fetchFlightPathQuery]);


    return { flightPath, loading, error };
};