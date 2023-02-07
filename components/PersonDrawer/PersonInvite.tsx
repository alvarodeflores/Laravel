import React from "react";
import { Form, useFormikContext } from "formik";
import { Box } from "@chakra-ui/react";
import { InputControl, TextareaControl, SubmitButton } from "formik-chakra-ui";
import { InviteFormFields } from "./PersonDetails";
import { Send } from "react-feather";

export const PersonInviteForm = () => {
  const {
    values: { email, comment },
  } = useFormikContext<InviteFormFields>();

  return (
    <Form>
      <Box marginBottom="4">
        <InputControl name="email" label="Email" />
      </Box>

      <Box marginBottom="4">
        <TextareaControl name="comment" label="Comment" />
      </Box>

      <SubmitButton type="submit" width="100%">
        <Send />
        &nbsp;&nbsp;Send Invite
      </SubmitButton>
    </Form>
  );
};
