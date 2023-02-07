import React from "react";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Text,
  Divider,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { UserPlus } from "react-feather";
import { Person } from "../../types/Types";
import { Formik } from "formik";
import { PersonInviteForm } from "./PersonInvite";
import { useInvitation } from "../../api/hooks/useInvitation";
import { messages } from "../../constants";
import * as yup from "yup";

export const PersonInviteSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Email is invalid"),
});

interface Props {
  person: Person;
  onAddRelativeClick: () => void;
  onEditClick: () => void;
}

export interface InviteFormFields {
  email: string;
  comment: string;
}

export const PersonDetails = ({
  person,
  onAddRelativeClick,
  onEditClick,
}: Props) => {
  const birthDate = person.person_data.birthday;
  // we're using any here because TS is missing some options in its type definitions:
  // https://github.com/microsoft/TypeScript/issues/44632
  const formattedBirthDate = birthDate
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
      } as any).format(new Date(birthDate))
    : "Unknown";

  // FIXME: add this as a required field to the BE (discuss if unknown is a correct state)
  const livingStatus = person.person_data.is_alive ? "Living" : "Deceased";

  const shouldShowDeathDate = !person.person_data.is_alive;
  const deathDate = person.person_data.date_of_death;
  const formattedDeathDate = deathDate
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
      } as any).format(new Date(deathDate))
    : "Unknown";

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();

  const toast = useToast();
  const inviteMutation = useInvitation();

  const initialFormValues: InviteFormFields = {
    email: "",
    comment: "",
  };

  const handleSubmitInvitation = async (values: InviteFormFields) => {
    onClose();
    const data = { email: values.email };

    inviteMutation.mutate(data, {
      onSuccess: () => {
        toast({
          description: "Invitation sent successfully",
          status: "success",
        });
      },
      onError: (error) => {
        // FIXME: depend on backend error message once backend adds proper messages
        toast({
          description: error.response?.data.message ?? messages.genericError,
          status: "error",
        });
      },
    });
  };

  const onConfirmInvitation = () => {
    onConfirmClose();
    onOpen();
  };

  return (
    <>
      <Flex justifyContent="space-between">
        <Button
          marginTop="3"
          leftIcon={<AddIcon />}
          onClick={onAddRelativeClick}
        >
          Add relative
        </Button>
        <Button marginTop="3" leftIcon={<EditIcon />} onClick={onEditClick}>
          Edit info
        </Button>
      </Flex>
      <Box marginTop="3">
        <Text fontSize="md" fontWeight="bold">
          Name
        </Text>
        <Text fontSize="md">{person.person_data.name}</Text>
      </Box>

      <Box marginTop="3">
        <Text fontSize="md" fontWeight="bold">
          Gender
        </Text>
        <Text fontSize="md">{person.person_data.sex}</Text>
      </Box>

      <Box marginTop="3">
        <Text fontSize="md" fontWeight="bold">
          Living status
        </Text>
        <Text fontSize="md">{livingStatus}</Text>
      </Box>

      <Box marginTop="3">
        <Text fontSize="md" fontWeight="bold">
          Date of birth
        </Text>
        <Text fontSize="md">{formattedBirthDate}</Text>
      </Box>

      {shouldShowDeathDate && (
        <Box marginTop="3">
          <Text fontSize="md" fontWeight="bold">
            Date of Death
          </Text>
          <Text fontSize="md">{formattedDeathDate}</Text>
        </Box>
      )}

      <Divider marginY={4} />

      <Box>
        <Button
          leftIcon={<UserPlus />}
          onClick={onConfirmOpen}
          w="100%"
          colorScheme="teal"
        >
          Invite {person.person_data.name}
        </Button>
      </Box>

      <Modal isCentered isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text fontSize="xl" align="center">
              Are you sure to send the invitation?
            </Text>
            <Stack spacing={2} mt={4} direction="row" justify="center">
              <Button
                colorScheme="teal"
                size="sm"
                onClick={onConfirmInvitation}
                width={40}
              >
                Yes
              </Button>
              <Button
                colorScheme="blackAlpha"
                size="sm"
                onClick={onConfirmClose}
                width={40}
              >
                No
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite {person.person_data.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Formik
              initialValues={initialFormValues}
              enableReinitialize={true}
              validationSchema={PersonInviteSchema}
              onSubmit={handleSubmitInvitation}
            >
              <PersonInviteForm />
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
