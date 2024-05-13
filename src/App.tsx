import { Container, Flex, Blockquote, Code, Callout, Strong, Button } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import { ConnectedWallet, useMfaEnrollment, usePrivy, useWallets } from '@privy-io/react-auth';
import { Logo } from './components/Logo';
import { Info, KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { WalletClientSigner, polygonAmoy } from '@alchemy/aa-core';
import { AlchemySmartAccountClient, createModularAccountAlchemyClient } from '@alchemy/aa-alchemy';

function App() {
  const { ready, authenticated, user } = usePrivy();

  const { wallets } = useWallets();
  const isMfaEnabled = user?.mfaMethods.length ?? 0 > 0;
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  const [isSmartAccountReady, setIsSmartAccountReady] = useState(false);
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const [smartAccountClient, setSmartAccountClient] = useState<AlchemySmartAccountClient | null>(null);

  const createSmartWallet = async (privyEoa: ConnectedWallet) => {
    const privyProvider = await privyEoa.getEthereumProvider();
    const privyClient = createWalletClient({
      account: privyEoa.address as `0x${string}`,
      transport: custom(privyProvider),
    });
    const privySigner = new WalletClientSigner(privyClient, 'json-rpc');
    const smartAccountClient = await createModularAccountAlchemyClient({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      signer: privySigner,
      chain: polygonAmoy,
    });
    setSmartAccountClient(smartAccountClient);
    setIsSmartAccountReady(true);
  };

  useEffect(() => {
    embeddedWallet?.address ? createSmartWallet(embeddedWallet) : null;
  }, [embeddedWallet?.address]);

  return (
    <Container maxWidth="40rem" m={{ initial: '0.5rem', sm: '0' }} pb="5rem">
      <Flex direction="column" gap="4" className="">
        <Logo />

        {ready && authenticated ? (
          isSmartAccountReady ? (
            <>
              <Blockquote>
                Privy EOA Address: <Code>{embeddedWallet?.address}</Code>
              </Blockquote>
              <Blockquote>
                Alchemy AA Address: <Code>{smartAccountClient?.account?.address}</Code>
              </Blockquote>

              <Button size="3" variant="soft" onClick={showMfaEnrollmentModal}>
                <KeyRound /> {isMfaEnabled ? 'manage' : 'link'} passkey(or totp)
              </Button>
            </>
          ) : (
            <Callout.Root color="blue">
              <Callout.Icon>
                <Info />
              </Callout.Icon>
              <Callout.Text>Creating smart account ...</Callout.Text>
            </Callout.Root>
          )
        ) : (
          <Callout.Root color="red">
            <Callout.Icon>
              <Info />
            </Callout.Icon>
            <Callout.Text>
              You need to <Strong>log in</Strong> to use this application -- click the button above.
            </Callout.Text>
          </Callout.Root>
        )}
      </Flex>
      <Toaster richColors toastOptions={{ duration: 10000 }} />
    </Container>
  );
}

export default App;
