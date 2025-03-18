'use client';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getUserToken } from './firebase/auth';


// Create the HTTP link with the API URL from environment variables
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
});

export function createApolloClient(idToken) {
  const authLinkWithToken = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        'x-appattest': 'test',
      }
    }
  })

  return new ApolloClient({
    link: authLinkWithToken.concat(httpLink),
    cache: new InMemoryCache(),
  });
}
