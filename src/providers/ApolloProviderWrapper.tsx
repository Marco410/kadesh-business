'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode, useEffect } from 'react';
import client from './apollo-client';

/**
 * Al volver la red o la pestaña, vuelve a pedir las consultas en pantalla que quedaron en error
 * por un corte (solo esas; las que salieron bien no se tocan). Así una pantalla que cargó sin red
 * se recupera sola, sin recargar.
 */
function useRecoverFailedQueries() {
  useEffect(() => {
    const recover = () => {
      if (document.visibilityState !== 'visible' || navigator.onLine === false) return;
      client.getObservableQueries('active').forEach((query) => {
        if (query.getCurrentResult().error?.networkError) {
          void query.refetch().catch(() => undefined);
        }
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') recover();
    };
    window.addEventListener('online', recover);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('online', recover);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}

export default function ApolloProviderWrapper({ children }: { children: ReactNode }) {
  useRecoverFailedQueries();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
