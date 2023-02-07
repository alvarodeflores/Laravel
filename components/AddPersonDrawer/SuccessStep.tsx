import React from "react";
import { Button, DrawerBody, Text } from "@chakra-ui/react";
import { useFormikContext } from "formik";
import { FormFields } from ".";
import { Link } from "react-router-dom";
import { routes } from "../../constants";
import { Person } from "../../types/Types";

interface SuccessStep {
  selectedPerson: Person;
  newPersonId: number;
  onPersonViewClick: () => void;
}

export const SuccessStep = ({
  selectedPerson,
  newPersonId,
  onPersonViewClick,
}: SuccessStep) => {
  const {
    values: { relationship, name },
  } = useFormikContext<FormFields>();

  // TODO: add link to newly created person
  return (
    <DrawerBody textAlign="center" marginTop="28">
      <Text fontSize="lg">
        {"You've added "}
        <Text fontWeight="bold" as="span">
          {name}
        </Text>
        {" as "}
        <Text fontWeight="bold" as="span">
          {selectedPerson.person_data.name}'s
        </Text>{" "}
        {relationship}.
      </Text>
      <Link to={`/${routes.tree}/${newPersonId}`} onClick={onPersonViewClick}>
        <Button marginTop="3" width="100%">
          View {name}
        </Button>
      </Link>
      <Link
        to={`/${routes.tree}/${selectedPerson.person_data.person_id}`}
        onClick={onPersonViewClick}
      >
        <Button marginTop="3" width="100%">
          View {selectedPerson.person_data.name}
        </Button>
      </Link>
    </DrawerBody>
  );
};
