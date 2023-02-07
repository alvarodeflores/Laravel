import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import Card from "../shared/Card";
import * as yup from "yup";
import { useInvitation } from "../../api/hooks/useInvitation";
import { messages } from "../../constants";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please Enter a vaild Email")
    .required("Please Enter your Email"),
});

// TODO: refactor component to use formik-chakra-ui bindings
const InviteCard = () => {
  const inviteMutation = useInvitation();

  const toast = useToast();

  return (
    <Box my="1rem">
      <Card title="Invite User">
        <Text>
          Please Enter an Email address below to invite a new user to register
        </Text>
        <Formik
          validateOnChange={true}
          initialValues={{
            email: "",
          }}
          onSubmit={(data, formikHelpers) => {
            inviteMutation.mutate(data, {
              onSuccess: () => {
                toast({
                  description: "Invitation sent successfully",
                  status: "success",
                });
                formikHelpers.setSubmitting(false);
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
            });
          }}
          validationSchema={validationSchema}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <FormControl my="0.5rem">
                <FormLabel>Email</FormLabel>
                <Field as={Input} name="email" placeholder="Email" />
                {errors.email && touched.email ? (
                  <FormHelperText color="red.400">
                    {errors.email}
                  </FormHelperText>
                ) : null}
              </FormControl>
              <Box my="1rem" textAlign="left">
                <Button
                  isLoading={isSubmitting}
                  type="submit"
                  colorScheme="blue"
                >
                  Send invite
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default InviteCard;
