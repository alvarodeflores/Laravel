import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
} from "@chakra-ui/react";
import { useField, useFormikContext } from "formik";
import React from "react";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import "./datepicker.css";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerFieldProps extends FormControlProps {
  name: string;
  label?: string;
  datePickerProps?: Omit<ReactDatePickerProps, "onChange">;
}

export function DatePickerField({
  name,
  label,
  datePickerProps,
  ...otherProps
}: DatePickerFieldProps) {
  const { setFieldValue } = useFormikContext();
  const [field, { error, touched }] = useField(name as string);

  return (
    <FormControl
      name={name}
      label={label}
      isInvalid={Boolean(error) && touched}
      {...otherProps}
    >
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <DatePicker
        {...field}
        id={name}
        selected={field.value}
        onChange={(value) => setFieldValue(name as string, value)}
        {...datePickerProps}
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
}
