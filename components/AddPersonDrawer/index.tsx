import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { DrawerCloseButton, DrawerContent, useToast } from "@chakra-ui/react";
import "react-datepicker/dist/react-datepicker.css";
import { Form, Formik, FormikHelpers } from "formik";
import { RelationshipDetailsStep } from "./RelationshipDetailsStep";
import { RelationshipSelectionStep } from "./RelationshipSelectionStep";
import { PersonDetailsStep } from "./PersonDetailsStep";
import { SuccessStep } from "./SuccessStep";
import * as yup from "yup";
import { Person, Relationship, Sex } from "../../types/Types";
import { useAddRelative } from "../../api/hooks/useAddRelative";
import { getSpouses } from "../../services/family.service";
import { messages } from "../../constants";

interface Props {
  selectedPerson: Person;
  onClose: () => void;
}

// TODO: other comps are using this definition, move it to shared
export enum FieldName {
  Relationship = "relationship",
  Name = "name",
  IsAlive = "isAlive",
  Sex = "sex",
  BirthDate = "birthDate",
  DeathDate = "deathDate",
  OtherParentId = "otherParentId",
  Photo = "photo",
}

// TODO: other comps are using this definition, move it to shared
export interface FormFields {
  [FieldName.Relationship]: Relationship | null;
  [FieldName.Name]: string; //TODO: see if we should split the name to two fields (first, last)
  [FieldName.IsAlive]: boolean; // TODO: see if we should add 'unknown' status
  [FieldName.Sex]: Sex;
  [FieldName.BirthDate]: Date | null;
  [FieldName.DeathDate]: Date | null;
  [FieldName.OtherParentId]: number | null;
  [FieldName.Photo]: File | null;
  // TODO: see which fields should be added as well (birth place, death place, etc..)
}

const initialFormValues: FormFields = {
  [FieldName.Relationship]: null,
  [FieldName.Name]: "",
  [FieldName.IsAlive]: true,
  [FieldName.Sex]: Sex.Male,
  [FieldName.BirthDate]: null,
  [FieldName.DeathDate]: null,
  [FieldName.OtherParentId]: null,
  [FieldName.Photo]: null,
};

enum FormStep {
  Relationship = 1,
  RelationshipDetails = 2,
  PersonDetails = 3,
  Success = 4,
}

// TODO: other comps are using this definition, move it to shared
export const PersonDetailsSchema = yup.object().shape({
  [FieldName.Name]: yup.string().required("Name is required"),
  [FieldName.IsAlive]: yup.boolean().required("Living status is required"),
  [FieldName.Sex]: yup
    .string()
    .nullable()
    .oneOf(Object.values(Sex))
    .required("Sex is required"),
  // [FieldName.BirthDate]: yup
  //   .date()
  //   .nullable()
  //   .max(new Date(), "Date of birth can't be in the future")
  //   .required("Date of birth is required"),
  [FieldName.DeathDate]: yup
    .date()
    .nullable()
    .max(new Date(), "Date of death can't be in the future")
    .when(
      [FieldName.BirthDate],
      (birthDate: FormFields["birthDate"], schema: any) =>
        birthDate
          ? schema.min(birthDate, "Date of death must be after date of birth")
          : schema
    ),
});

const FormValidationSchemas = {
  [FormStep.Relationship]: yup.object().shape({
    [FieldName.Relationship]: yup
      .string()
      .oneOf(Object.values(Relationship))
      .nullable()
      .required("Relationship is required"),
  }),
  [FormStep.RelationshipDetails]: yup.object().shape({
    [FieldName.OtherParentId]: yup.number().nullable(),
  }),
  [FormStep.PersonDetails]: PersonDetailsSchema,
  [FormStep.Success]: null,
};

// TODO: continue adding busienss logic that handles wether or not to skip the second step
const getNextFormStep = (
  currentStep: FormStep,
  selectedPerson: Person,
  formValues: FormFields
) => {
  switch (currentStep) {
    case FormStep.Relationship:
      if (
        shouldAskForChildOtherParent(
          formValues[FieldName.Relationship] as Relationship,
          selectedPerson
        )
      ) {
        return FormStep.RelationshipDetails;
      } else {
        return FormStep.PersonDetails;
      }

    case FormStep.RelationshipDetails:
      return FormStep.PersonDetails;

    case FormStep.PersonDetails:
      return FormStep.Success;

    case FormStep.Success:
      return FormStep.Success;
  }
};

const isLastFormStep = (currentStep: FormStep) => {
  return currentStep === FormStep.PersonDetails;
};

export const shouldAskForChildOtherParent = (
  selectedRelationship: Relationship,
  selectedPerson: Person
) => {
  const selectedPersonSpouses = getSpouses(selectedPerson);
  return (
    selectedRelationship === Relationship.Child &&
    selectedPersonSpouses.length > 0
  );
};

export const AddPersonDrawer = ({ selectedPerson, onClose }: Props) => {
  const [currentFormStep, setCurrentFormStep] = useState(FormStep.Relationship);
  const renderFormStep = () => {
    switch (currentFormStep) {
      case FormStep.Relationship:
        return <RelationshipSelectionStep selectedPerson={selectedPerson} />;

      case FormStep.RelationshipDetails:
        return <RelationshipDetailsStep selectedPerson={selectedPerson} />;

      case FormStep.PersonDetails:
        return <PersonDetailsStep selectedPerson={selectedPerson} />;

      case FormStep.Success:
        return (
          <SuccessStep
            selectedPerson={selectedPerson}
            newPersonId={addedPersonId!}
            onPersonViewClick={onClose}
          />
        );
    }
  };
  const currentStepValidationSchema = FormValidationSchemas[currentFormStep];

  const addRelativeMutation = useAddRelative();
  const [addedPersonId, setAddedPersonId] = useState<number | null>(null);

  const toast = useToast();

  const { treeId } = useParams();

  const handleSubmit = (
    values: FormFields,
    formikHelpers: FormikHelpers<FormFields>
  ) => {
    const nextStep = getNextFormStep(currentFormStep, selectedPerson, values);

    if (isLastFormStep(currentFormStep)) {
      addRelativeMutation.mutate(
        {
          ...values,
          selectedPersonId: selectedPerson.person_data.person_id,
          familyTreeId: treeId!,
        },
        {
          onSuccess: (data) => {
            setCurrentFormStep(nextStep);
            setAddedPersonId(data.id);
            formikHelpers.setSubmitting(false);
          },
          onError: (error) => {
            // FIXME: use proper errors only BE starts handling it properly
            toast({
              status: "error",
              description:
                error.response?.data.message.join(". ") ??
                messages.genericError,
            });
            formikHelpers.setSubmitting(false);
          },
        }
      );
    } else {
      formikHelpers.setTouched({});
      formikHelpers.setSubmitting(false);
      setCurrentFormStep(nextStep);
    }
  };

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={currentStepValidationSchema}
      onSubmit={handleSubmit}
    >
      {() => (
        <DrawerContent>
          <DrawerCloseButton onClick={onClose} />
          {/* TODO: moving styling to a CSS file */}
          <Form style={{ height: "100%" }}>{renderFormStep()}</Form>
        </DrawerContent>
      )}
    </Formik>
  );
};
