import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PrivyProvider } from '@privy-io/react-auth';

import { Theme } from '@radix-ui/themes';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { Buffer } from 'buffer';
import React from 'react';

import App from './App.tsx';
import { config } from './wagmi.ts';

import '@radix-ui/themes/styles.css';

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme>
      <WagmiProvider config={config}>
        <PrivyProvider
          appId={`${import.meta.env.VITE_PRIVY_APP_ID}`}
          config={{
            loginMethods: ['email'],
            appearance: {
              theme: 'light',
              accentColor: '#676FFF',
              logo: 'https://your-logo-url',
            },
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
              noPromptOnSignature: false,
            },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </PrivyProvider>
      </WagmiProvider>
    </Theme>
  </React.StrictMode>,
);
