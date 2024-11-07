import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create the HTTP link with the API URL from environment variables
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
      'x-appattest': 'test', // needed this thing to work
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), 
  cache: new InMemoryCache(),
});

export default client;
