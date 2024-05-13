import { Box, Button, Flex, Text } from '@radix-ui/themes';
import { Fingerprint } from 'lucide-react';
import { useLogin, usePrivy } from '@privy-io/react-auth';

export const Logo = () => {
  const { login } = useLogin();
  const { ready, authenticated, user, logout } = usePrivy();

  return (
    <Flex gap="2" className="items-baseline">
      <Box className="translate-y-[2px]">
        <Flex gap="1" className="items-baseline">
          <Fingerprint className="h-[32px] translate-y-[10px] inline-block relative" />
          <Text size="4" as="span">
            smart account
          </Text>
        </Flex>
      </Box>
      <Flex gap="2">
        {ready && authenticated ? (
          <>
            <Button variant="soft" size="1" onClick={() => logout()}>
              log out
            </Button>
          </>
        ) : (
          <>
            <Button variant="soft" size="1" onClick={() => login()}>
              log in
            </Button>
          </>
        )}
      </Flex>
      <Box flexGrow="1" />
      <Text size="1" truncate>
        {user?.wallet?.address}
      </Text>
    </Flex>
  );
};
