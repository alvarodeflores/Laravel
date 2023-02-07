import React from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { Users, Trash2 } from "react-feather";

interface IControlPanel extends React.AllHTMLAttributes<HTMLElement> {
  onAdd: () => void;
  onDelete: () => void;
}

const ControlPanel = ({ onAdd, onDelete, ...props }: IControlPanel) => {
  return (
    <Box className="action-panel">
      <Box w="100%">
        <IconButton
          icon={<Users />}
          colorScheme="teal"
          variant="outline"
          aria-label="Add Relative"
          onClick={onAdd}
        />
      </Box>
      <Box w="100%">
        <IconButton
          icon={<Trash2 />}
          colorScheme="teal"
          variant="outline"
          aria-label="Delete Relative"
          onClick={onDelete}
        />
      </Box>
      <Box w="100%">{props.children}</Box>
    </Box>
  );
};

export default ControlPanel;
