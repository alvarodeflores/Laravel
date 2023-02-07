import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Flex,
  Heading,
  useToast,
} from "@chakra-ui/react";
import {
  FieldName,
  FormFields as AddPersonFormFields,
  PersonDetailsSchema,
} from "../AddPersonDrawer";
import { Formik } from "formik";
import { EditPersonDetails } from "./EditPersonDetails";
import { PersonDetails } from "./PersonDetails";
import { Person } from "../../types/Types";
import { useEditPerson } from "../../api/hooks/useEditPerson";

interface Props {
  person: Person;
  onAddRelativeClick: () => void;
}

export type FormFields = Omit<
  AddPersonFormFields,
  "otherParentId" | "relationship"
>;

export const PersonDrawer = ({ person, onAddRelativeClick }: Props) => {
  const { treeId } = useParams();

  const birthDate = person.person_data.birthday;
  const deathDate = person.person_data.date_of_death;

  const initialFormValues: FormFields = {
    [FieldName.Name]: person.person_data.name,
    [FieldName.IsAlive]: person.person_data.is_alive,
    [FieldName.Sex]: person.person_data.sex,
    [FieldName.BirthDate]: birthDate ? new Date(birthDate) : null,
    [FieldName.DeathDate]: deathDate ? new Date(deathDate) : null,
    [FieldName.Photo]: null,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const showEditingForm = () => {
    setIsEditing(true);
  };

  const toast = useToast();

  const editPersonMutation = useEditPerson();

  const handlePhoto = (photoFile: File | null) => {
    if (photoFile) {
      setPhotoFile(photoFile);
    }
  };

  const handleSubmit = async (values: FormFields) => {
    if (!treeId) return;

    await editPersonMutation.mutateAsync({
      ...values,
      selectedPersonId: person.person_data.person_id,
      photo: photoFile,
      familyTreeId: treeId,
    });
    setIsEditing(false);
    toast({
      description: "Successfully updated person information",
      status: "success",
    });
  };

  return (
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader>
        <Flex alignItems="center" justifyContent="center" direction="column">
          <Avatar
            name={person?.person_data.name}
            src={person?.person_data.photo!}
            size="lg"
          />
          <Heading size="md" marginTop="1" textAlign="center">
            {person?.person_data.name}
          </Heading>
        </Flex>
      </DrawerHeader>

      <DrawerBody>
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true}
          validationSchema={PersonDetailsSchema}
          onSubmit={handleSubmit}
        >
          {isEditing ? (
            <EditPersonDetails onPhotoChange={handlePhoto} />
          ) : (
            <PersonDetails
              person={person}
              onAddRelativeClick={onAddRelativeClick}
              onEditClick={showEditingForm}
            />
          )}
        </Formik>
      </DrawerBody>
      <DrawerFooter></DrawerFooter>
    </DrawerContent>
  );
};
