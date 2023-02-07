import React from "react";
import {
  Flex,
  Spinner,
} from "@chakra-ui/react";

const PageLoader = () => {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 100px)"
    >
      <Spinner
        size="xl"
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="green.500"
      />
    </Flex>
  );
}

export default PageLoader;
