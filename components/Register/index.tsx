import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import * as yup from "yup";
import Card from "../shared/Card";
import { Field, Form, Formik } from "formik";
import { useSearchParams } from "react-router-dom";
import { useInviteToken } from "../../api/hooks/useInviteToken";
import { useRegister } from "../../api/hooks/useRegister";
import { messages } from "../../constants";

// TODO: refactor to use formik-chakra-ui bindings
const RegisterCard = () => {
  const [params] = useSearchParams();

  const invikeToken = params.get("invitation_token") ?? "";
  const isUsingInviteToken = Boolean(invikeToken);

  const tokenDataQuery = useInviteToken(invikeToken, {
    enabled: isUsingInviteToken,
  });
  const registerMutation = useRegister();

  const toast = useToast();

  const validationSchema = yup.object({
    name: yup.string().required("Please enter your name"),
    password: yup.string().required("Please enter your password"),
    passwordConfirmation: yup
      .string()
      .required("Please confirm password")
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  });

  if (tokenDataQuery.isIdle || tokenDataQuery.isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        Missing or invalid invite token, please ask for a new invite
      </Alert>
    );
  }

  if (tokenDataQuery.isLoading) {
    return <Spinner size="lg" />;
  }

  if (tokenDataQuery.isSuccess) {
    return (
      <Box my="1rem">
        <Card title="Register">
          <Formik
            validateOnChange={true}
            initialValues={{
              name: "",
              password: "",
              passwordConfirmation: "",
            }}
            onSubmit={(data, formikHelpers) => {
              registerMutation.mutate(
                {
                  ...data,
                  email: tokenDataQuery.data.email,
                },
                {
                  onSuccess: () => {
                    location.reload();
                    formikHelpers.setSubmitting(false);
                  },
                  onError: (error) => {
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
            validationSchema={validationSchema}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <FormControl my="0.5rem">
                  <FormLabel>Name</FormLabel>
                  <Field
                    as={Input}
                    name="name"
                    type="text"
                    placeholder="name"
                  />
                  {errors.name && touched.name ? (
                    <FormHelperText color="red.400">
                      {errors.name}
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl my="0.5rem">
                  <FormLabel>Password</FormLabel>

                  <Field
                    as={Input}
                    type="password"
                    name="password"
                    placeholder="Password"
                  />
                  {errors.password && touched.password ? (
                    <FormHelperText color="red.400">
                      {errors.password}
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl my="0.5rem">
                  <FormLabel>Confirm Password</FormLabel>

                  <Field
                    as={Input}
                    type="password"
                    name="passwordConfirmation"
                    placeholder="Confirm Password"
                  />
                  {errors.passwordConfirmation &&
                  touched.passwordConfirmation ? (
                    <FormHelperText color="red.400">
                      {errors.passwordConfirmation}
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <Box my="1rem" textAlign="left">
                  <Button
                    isLoading={isSubmitting}
                    colorScheme="blue"
                    type="submit"
                  >
                    Register
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Card>
      </Box>
    );
  }

  return null;
};

export default RegisterCard;
