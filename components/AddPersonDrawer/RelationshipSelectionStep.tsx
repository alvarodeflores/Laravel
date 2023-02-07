import React from "react";
import {
  Avatar,
  DrawerBody,
  DrawerHeader,
  Flex,
  Heading,
  Radio,
  Text,
} from "@chakra-ui/react";
import { RadioGroupControl, SubmitButton } from "formik-chakra-ui";
import { FieldName } from ".";
import { Person, Relationship } from "../../types/Types";
import { getParents } from "../../services/family.service";

interface RelationshipSelectionStepProps {
  selectedPerson: Person;
}

export const RelationshipSelectionStep = ({
  selectedPerson,
}: RelationshipSelectionStepProps) => {
  const selectedPersonParents = getParents(selectedPerson);

  // assuming that a person can only belong to a single family with two parents only
  const hasBothParentsDefined = selectedPersonParents.length === 2;

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
              Add a new relative
            </Heading>
            <Text fontSize="sm">For {selectedPerson?.person_data.name}</Text>
          </Flex>
        </Flex>
      </DrawerHeader>

      <DrawerBody>
        <RadioGroupControl
          name={FieldName.Relationship}
          label="Which relative are you adding?"
          stackProps={{ marginTop: "3", direction: "column" }}
        >
          {Object.values(Relationship).map((value) => (
            <Radio
              key={value}
              value={value}
              size="lg"
              isDisabled={
                value === Relationship.Parent && hasBothParentsDefined
              }
            >
              {value}
            </Radio>
          ))}
        </RadioGroupControl>
        <SubmitButton type="submit" width="100%" marginTop="3">
          Continue
        </SubmitButton>
      </DrawerBody>
    </>
  );
};
