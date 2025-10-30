import React, { useState } from "react";
import { Box, Text } from "ink";
import { useInput } from "ink";

export const StartView: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useInput((input, key) => {
    if (key.return) {
      console.log("Proceeding...");
      setIsReady(true);
      process.exit(0);
    }
  });

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width={80}
      height={24}
      borderStyle="round"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
    >
      <Box marginBottom={1}>
        <Text bold color="green">
          Maven CLI Prototype
        </Text>
      </Box>
      <Text color="yellow">Press Enter to continue</Text>
    </Box>
  );
};
