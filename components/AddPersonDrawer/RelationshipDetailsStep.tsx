import React from "react";
import {
  Avatar,
  DrawerBody,
  DrawerHeader,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useFormikContext } from "formik";
import { SubmitButton } from "formik-chakra-ui";
import { FormFields, shouldAskForChildOtherParent } from ".";
import { OtherParentSelection } from "./OtherParentSelection";
import { Person, Relationship } from "../../types/Types";
import { getSpouses } from "../../services/family.service";

interface RelationshipDetailsStepProps {
  selectedPerson: Person;
}

export const RelationshipDetailsStep = ({
  selectedPerson,
}: RelationshipDetailsStepProps) => {
  // TODO: investigate adding parent relationship details
  const {
    values: { relationship },
  } = useFormikContext<FormFields>();

  /*   
  right now we're doing these checks and separating the OtherParentSelection 
  component is because we might add different kinds of details for different relationships 
  */
  const shouldShowOtherParentSelection = shouldAskForChildOtherParent(
    relationship as Relationship,
    selectedPerson
  );
  const selectedPersonSpouses = getSpouses(selectedPerson);

  return (
    <>
      <DrawerHeader>
        <Flex alignItems="center">
          <Avatar
            name={selectedPerson?.person_data.name}
            src={selectedPerson?.person_data.photo!}
            size="md"
          />
          <Flex direction="column" marginLeft="2">
            <Heading size="sm" marginTop="1">
              Add a {relationship}
            </Heading>
            <Text fontSize="sm">For {selectedPerson?.person_data.name}</Text>
          </Flex>
        </Flex>
      </DrawerHeader>

      <DrawerBody>
        {shouldShowOtherParentSelection && (
          <OtherParentSelection spouses={selectedPersonSpouses} />
        )}
        <SubmitButton type="submit" width="100%" marginTop="3">
          Continue
        </SubmitButton>
      </DrawerBody>
    </>
  );
};
