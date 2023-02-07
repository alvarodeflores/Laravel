import React from "react";
import { Radio } from "@chakra-ui/react";
import { RadioGroupControl } from "formik-chakra-ui";
import { FieldName } from ".";
import { Person } from "../../types/Types";

interface OtherParentSelectionProps {
  spouses: Person["person_data"][];
}

export const OtherParentSelection = ({
  spouses,
}: OtherParentSelectionProps) => {
  return (
    <RadioGroupControl
      name={FieldName.OtherParentId}
      label="Select the Child's other parent"
      stackProps={{ marginTop: "3", direction: "column" }}
    >
      {spouses.map((spouse) => (
        <Radio
          key={spouse.person_id}
          value={String(spouse.person_id)}
          size="lg"
        >
          {spouse.name}
        </Radio>
      ))}
      <Radio value={""} size="lg">
        Unknown
      </Radio>
    </RadioGroupControl>
  );
};
