import React, { useRef } from "react";
import { Box, Input, Radio, Text } from "@chakra-ui/react";
import { Form, useFormikContext } from "formik";
import {
  CheckboxSingleControl,
  InputControl,
  RadioGroupControl,
  SubmitButton,
} from "formik-chakra-ui";
import { FieldName, FormFields } from "../AddPersonDrawer";
import { DatePickerField } from "../shared/DatePickerField";
import { Sex } from "../../types/Types";

interface EditPersonDetailsProps {
  onPhotoChange: (photo: File | null) => void;
}

export const EditPersonDetails = ({
  onPhotoChange,
}: EditPersonDetailsProps) => {
  const {
    values: { isAlive, birthDate },
  } = useFormikContext<FormFields>();

  const photoRef = useRef(null);

  const shouldAskForDeathDate = !isAlive;

  return (
    <Form>
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

      <Box w="100%" py={2}>
        <Text pb={2}>Photo</Text>
        <Input
          name={FieldName.Photo}
          type="file"
          accept="image/*"
          ref={photoRef}
          border={0}
          p={0}
          onChange={(event) => {
            const photo = event?.target?.files ? event.target.files[0] : null;
            onPhotoChange(photo);
          }}
        />
      </Box>

      <SubmitButton type="submit" width="100%" marginTop="3">
        Save
      </SubmitButton>
    </Form>
  );
};
