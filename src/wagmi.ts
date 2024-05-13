import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
