import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getUserToken } from "./firebase/auth";

// Create the HTTP link with the API URL from environment variables
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getUserToken();
  console.log(token);
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
      "x-appattest": "test"
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;
