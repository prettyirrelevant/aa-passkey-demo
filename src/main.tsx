import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { Theme } from '@radix-ui/themes';
import ReactDOM from 'react-dom/client';
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
      <PrivyProvider
        appId={`${import.meta.env.VITE_PRIVY_APP_ID}`}
        config={{
          loginMethods: ['email'],
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
            noPromptOnSignature: false,
          },
          captchaEnabled: true,
          mfa: {
            noPromptOnMfaRequired: true,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </Theme>
  </React.StrictMode>,
);
