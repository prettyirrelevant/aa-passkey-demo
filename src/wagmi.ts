import { createConfig } from '@privy-io/wagmi';
import { polygonAmoy } from 'viem/chains';
import { http } from 'wagmi';

export const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
