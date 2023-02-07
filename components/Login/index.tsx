import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
} from "@chakra-ui/react";
import * as yup from "yup";
import Card from "../shared/Card";
import { Field, Form, Formik } from "formik";
import { useUserAuth } from "../../api/hooks/useAuth";

const validationSchema = yup.object({
  username: yup.string().required("Please Enter your Username"),
  password: yup.string().required("Please Enter your Password"),
});

const LoginCard = () => {
  const authMutation = useUserAuth();

  return (
    <Box my="1rem">
      <Card title="Login">
        <Formik
          validateOnChange={true}
          initialValues={{
            username: "",
            password: "",
          }}
          onSubmit={async (values) => {
            authMutation.mutate({
              username: values.username,
              password: values.password,
            });
          }}
          validationSchema={validationSchema}
        >
          {({ errors, touched, values }) => (
            <Form>
              <FormControl my="0.5rem">
                <FormLabel>UserName</FormLabel>
                <Field
                  as={Input}
                  name="username"
                  type="text"
                  placeholder="Username"
                />
                {errors.username && touched.username ? (
                  <FormHelperText color="red.400">
                    {errors.username}
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
              <Box my="1rem" textAlign="left">
                <Button isLoading={false} colorScheme="blue" type="submit">
                  Login
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default LoginCard;
