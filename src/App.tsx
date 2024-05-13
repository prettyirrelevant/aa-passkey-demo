import { Container, Flex, Blockquote, Code, Callout, Strong, Button } from '@radix-ui/themes';
import { Toaster, toast } from 'sonner';
import { ConnectedWallet, useMfaEnrollment, usePrivy, useWallets } from '@privy-io/react-auth';
import { Logo } from './components/Logo';
import { Info, KeyRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createWalletClient, custom, parseEther } from 'viem';
import { BaseError, UserOperationCallData, WalletClientSigner, polygonAmoy } from '@alchemy/aa-core';
import { AlchemySmartAccountClient, createModularAccountAlchemyClient } from '@alchemy/aa-alchemy';
import { MultiOwnerModularAccount } from '@alchemy/aa-accounts';

function App() {
  const { ready, authenticated, user } = usePrivy();

  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

  const isMfaEnabled = user?.mfaMethods.length ?? 0 > 0;
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const [isSmartAccountReady, setIsSmartAccountReady] = useState(false);
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [smartAccountClient, setSmartAccountClient] = useState<AlchemySmartAccountClient | null>(null);
  const [smartAccount, setSmartAccount] = useState<MultiOwnerModularAccount<WalletClientSigner> | null>(null);

  const createSmartWallet = async (privyEoa: ConnectedWallet) => {
    const privyProvider = await privyEoa.getEthereumProvider();
    const privyClient = createWalletClient({
      account: privyEoa.address as `0x${string}`,
      transport: custom(privyProvider),
    });
    const privySigner = new WalletClientSigner(privyClient, 'json-rpc');
    const smartAccountClient = await createModularAccountAlchemyClient({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      gasManagerConfig: {
        policyId: 'a2d085f2-1c1c-4c58-bad8-57a9ef0ae56f',
      },
      signer: privySigner,
      chain: polygonAmoy,
    });

    setSmartAccount(smartAccountClient.account);
    setSmartAccountClient(smartAccountClient);
    setIsSmartAccountReady(true);
  };

  const sendSampleTx = async () => {
    if (!smartAccount || !smartAccountClient) {
      toast.error('Cannot send sample transaction at the moment.');
      return;
    }

    setIsSendingTx(true);

    const uoPayload: UserOperationCallData = {
      data: '0x',
      value: parseEther('0.0001'),
      target: '0xDaDC3e4Fa2CF41BC4ea0aD0e627935A5c2DB433d',
    };

    try {
      const uoSimResult = await smartAccountClient.simulateUserOperation({
        uo: uoPayload,
        account: smartAccount,
      });
      if (uoSimResult.error) {
        toast.error(uoSimResult.error.message);
        return;
      }
    } catch (error) {
      toast.error(`An error occurred during simulation: ${(error as BaseError).details}`);
      return;
    } finally {
      setIsSendingTx(false);
    }

    try {
      const uo = await smartAccountClient.sendUserOperation({
        uo: uoPayload,
        account: smartAccount,
      });
      const txHash = await smartAccountClient?.waitForUserOperationTransaction({ hash: uo?.hash as `0x${string}` });
      toast.success(`Transaction successful. Check here https://amoy.polygonscan.com/tx/${txHash}`);
    } catch (error) {
      toast.error(`An error occurred while sending the transaction: ${(error as BaseError).details}`);
      return;
    } finally {
      setIsSendingTx(false);
    }
  };

  useEffect(() => {
    embeddedWallet?.address ? createSmartWallet(embeddedWallet) : null;
  }, [embeddedWallet?.address]);

  return (
    <Container maxWidth="40rem" m={{ initial: '0.5rem', sm: '0' }} pb="5rem">
      <Toaster richColors toastOptions={{ duration: 10000 }} />
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

              <Button size="3" variant="soft" onClick={sendSampleTx} loading={isSendingTx}>
                send 0.0001 matic to 0xDaDC3e4Fa2CF41BC4ea0aD0e627935A5c2DB433d
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
    </Container>
  );
}

export default App;
