import React from "react";
import { useParams } from "react-router-dom";

import {
  Avatar,
  Heading,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { Formik } from "formik";

import { FieldName, FormFields, PersonDetailsSchema } from "../AddPersonDrawer";
import { Relationship, Sex, Person } from "../../types/Types";
import { useAddRelative } from "../../api/hooks/useAddRelative";
import { PersonForm } from "./FamilyTreeStarter";

import { setTreeDataToStore } from "../../services/storage";
import { messages } from "../../constants";

interface Props {
  selectedPerson: Person;
  relation: Relationship | null;
  onClose: () => void;
}

export const RelativeDrawer = ({
  selectedPerson,
  relation,
  onClose,
}: Props) => {
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

  return (
    <DrawerContent>
      <DrawerCloseButton onClick={onClose} />
      <DrawerHeader>
        <Flex alignItems="center" justifyContent="center" direction="column">
          <Avatar
            name={selectedPerson?.person_data.name}
            src={selectedPerson?.person_data.photo!}
            size="lg"
          />
          <Heading size="md" marginTop="1" textAlign="center">
            {selectedPerson?.person_data.name}'s {relation}
          </Heading>
        </Flex>
      </DrawerHeader>
      <DrawerBody>
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true}
          validationSchema={PersonDetailsSchema}
          onSubmit={(data, formikHelpers) => {
            personMutation.mutate(
              {
                ...data,
                selectedPersonId: selectedPerson.person_data.person_id,
                relationship: relation,
                familyTreeId: treeId!,
              },
              {
                onSuccess: (response) => {
                  toast({
                    description: "New Family Tree was created successfully",
                    status: "success",
                  });
                  formikHelpers.setSubmitting(false);

                  setTreeDataToStore({
                    source: selectedPerson.person_data.person_id,
                    target: response.id,
                    relation,
                  });

                  toast({
                    description: "Successfully created a person",
                    status: "success",
                  });
                },
                onError: (error) => {
                  // FIXME: depend on backend error message once backend adds proper messages
                  toast({
                    description:
                      error.response?.data.message ?? messages.genericError,
                    status: "error",
                  });
                  formikHelpers.setSubmitting(false);
                },
              }
            );
          }}
        >
          <PersonForm />
        </Formik>
      </DrawerBody>
    </DrawerContent>
  );
};
