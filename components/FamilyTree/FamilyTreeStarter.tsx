import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Radio,
  useToast,
} from "@chakra-ui/react";
import { Formik, Form, useFormikContext } from "formik";
import {
  CheckboxSingleControl,
  InputControl,
  RadioGroupControl,
  SubmitButton,
} from "formik-chakra-ui";

import { FieldName, FormFields, PersonDetailsSchema } from "../AddPersonDrawer";
import { DatePickerField } from "../shared/DatePickerField";
import { Sex, Relationship } from "../../types/Types";
import { useAddRelative } from "../../api/hooks/useAddRelative";

// export type FormFields = Omit<
//   PersonFormFields,
//   "otherParentId"
// >;

export const FamilyTreeStarter = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const personMutation = useAddRelative();

  const { treeId } = useParams();

  const initialFormValues: FormFields = {
    [FieldName.Name]: "",
    [FieldName.IsAlive]: true,
    [FieldName.Sex]: Sex.Male,
    [FieldName.BirthDate]: null,
    [FieldName.DeathDate]: null,
    [FieldName.Photo]: null,
    [FieldName.Relationship]: null,
    [FieldName.OtherParentId]: null,
  };

  useEffect(() => {
    onOpen();
  }, []);

  const handleSubmit = async (values: FormFields) => {
    await personMutation.mutateAsync({
      ...values,
      familyTreeId: treeId!,
    });

    toast({
      description: "Successfully created a person",
      status: "success",
    });
  };

  return (
    <div className="body-wrap">
      <Button
        onClick={onOpen}
        colorScheme="gray"
        className="page-center"
        height={"auto"}
        px={8}
        py={8}
      >
        Add First Person
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add First Person</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Formik
              initialValues={initialFormValues}
              enableReinitialize={true}
              validationSchema={PersonDetailsSchema}
              onSubmit={handleSubmit}
            >
              <PersonForm />
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export const PersonForm = () => {
  const {
    values: { isAlive, birthDate },
  } = useFormikContext<FormFields>();

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

      <SubmitButton type="submit" width="100%" marginTop="3">
        Save
      </SubmitButton>
    </Form>
  );
};
