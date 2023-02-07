import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import Card from "../shared/Card";
import * as yup from "yup";
import { useNewFamilyTree } from "../../api/hooks/useNewFamilyTree";
import { messages, routes } from "../../constants";
import { useNavigate, useParams } from "react-router-dom";

const validationSchema = yup.object({
  name: yup.string().required("Please Enter a Name"),
});

// TODO: refactor component to use formik-chakra-ui bindings
const NewFamilyTree = () => {
  const treeMutation = useNewFamilyTree();

  const toast = useToast();

  const navigator = useNavigate();

  return (
    <Box my="1rem">
      <Card title="Create New Family Tree">
        <Text mb="1rem">Please Enter new Family Tree name</Text>
        <Formik
          validateOnChange={true}
          initialValues={{
            name: "",
            description: "",
          }}
          onSubmit={(data, formikHelpers) => {
            treeMutation.mutate(data, {
              onSuccess: (response) => {
                toast({
                  description: "New Family Tree was created successfully",
                  status: "success",
                });
                formikHelpers.setSubmitting(false);

                const {
                  data: { familyTree },
                } = response;
                navigator(`../${routes.tree}/${familyTree?.id}`);
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
                <FormLabel fontSize="0.9rem" color="gray">
                  Family Tree Name
                </FormLabel>
                <Field as={Input} name="name" placeholder="Family Tree Name" />
                {errors.name && touched.name ? (
                  <FormHelperText color="red.400">{errors.name}</FormHelperText>
                ) : null}
              </FormControl>
              <FormControl my="0.5rem">
                <FormLabel fontSize="0.9rem" color="gray">
                  Description
                </FormLabel>
                <Field
                  as={Textarea}
                  name="description"
                  placeholder="Description"
                />
              </FormControl>
              <Box my="1rem" textAlign="left">
                <Button
                  isLoading={isSubmitting}
                  type="submit"
                  colorScheme="blue"
                >
                  Create
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default NewFamilyTree;
