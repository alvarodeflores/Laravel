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
import { useFormikContext } from "formik";
import {
  CheckboxSingleControl,
  InputControl,
  RadioGroupControl,
  SubmitButton,
} from "formik-chakra-ui";
import { FieldName, FormFields } from ".";
import { DatePickerField } from "../shared/DatePickerField";
import { Person, Sex } from "../../types/Types";

interface PersonDetailsStepProps {
  selectedPerson: Person;
}

export const PersonDetailsStep = ({
  selectedPerson,
}: PersonDetailsStepProps) => {
  const {
    values: { relationship, isAlive, birthDate },
  } = useFormikContext<FormFields>();

  const shouldAskForDeathDate = !isAlive;

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

      <DrawerBody height="100%">
        <InputControl name={FieldName.Name} label="Name" />

        <RadioGroupControl name={FieldName.Sex} label="Sex" marginTop="3">
          {Object.values(Sex).map((value) => (
            <Radio key={value} value={value} size="lg">
              {value}
            </Radio>
          ))}
        </RadioGroupControl>

        <CheckboxSingleControl
          checkBoxProps={{ marginTop: 3 }}
          name={FieldName.IsAlive}
        >
          Is alive
        </CheckboxSingleControl>

        <DatePickerField
          name={FieldName.BirthDate}
          label="Date of birth"
          marginTop="3"
          datePickerProps={{
            maxDate: new Date(),
            showYearDropdown: true,
            showMonthDropdown: true,
            dropdownMode: "select",
          }}
        />

        {shouldAskForDeathDate && (
          <DatePickerField
            name={FieldName.DeathDate}
            label="Date of death"
            marginTop="3"
            datePickerProps={{
              minDate: birthDate,
              maxDate: new Date(),
              showYearDropdown: true,
              showMonthDropdown: true,
              dropdownMode: "select",
            }}
          />
        )}
        <SubmitButton type="submit" width="100%" marginTop="3">
          Continue
        </SubmitButton>
      </DrawerBody>
    </>
  );
};
