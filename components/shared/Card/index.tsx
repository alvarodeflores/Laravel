import { Box, Heading } from "@chakra-ui/react";
import React from "react";

interface CardProps {
  title: string;
  maxW?: string;
  children: any;
}

const Card: React.FC<CardProps> = ({ title, maxW = "md", children }) => {
  return (
    <Box
      maxW={maxW}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      mx="auto"
    >
      <Box>
        <Heading
          as="h4"
          padding="1rem"
          size="md"
          textAlign="left"
          color="green.500"
          background="gray.100"
          borderWidth="1px"
        >
          {title}
        </Heading>
        <Box paddingX="2rem" paddingY="1rem">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Card;
