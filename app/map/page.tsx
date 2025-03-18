'use client';

import Map from "@/components/Map";
import { useAuth } from "@/components/providers/AuthContext";
import { createApolloClient } from "@/lib/apolloClient";
import { ApolloProvider } from "@apollo/client";
import { ReactNode, useMemo } from "react";

function ApolloWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth();
  console.log("Making wrapper")
  console.log(auth?.token)
  const token =  auth?.token ?? ""
  const client = useMemo(() => createApolloClient(token), [token]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default function map() {
  return (
    <>
      <ApolloWrapper>
        <Map />
      </ApolloWrapper>
    </>
  );
}
