import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import { ReactNode } from 'react';


export default function ApolloProviderWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
} 