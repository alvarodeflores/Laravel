import { Relationship } from "../types/Types";

export const pluralizeRelation = (relation: string) => {
  let pluraled: string = "";
  if (relation === Relationship.Parent) {
    pluraled = "parents";
  } else if (relation === Relationship.Child) {
    pluraled = "children";
  } else if (relation === Relationship.Sibling) {
    pluraled = "siblings";
  } else if (relation === Relationship.Spouse) {
    pluraled = "spouse";
  }

  return pluraled;
};
