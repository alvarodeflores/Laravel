import { queryClient } from "../app";
import { Family, Person, PersonsMap } from "../types/Types";

export const initializeFamilies = (persons: Person[]) => {
  let families: { [id: string]: Family } = {};

  persons.forEach((person) => {
    person.child_of_family_id.forEach((familyId) => {
      const family = families[familyId];
      if (!family) {
        families[familyId] = {
          parents: [],
          children: [person.person_data],
          id: familyId,
        };
      } else {
        families[familyId].children.push(person.person_data);
      }
    });

    person.parent_of_family_id.forEach((familyId) => {
      const family = families[familyId];
      if (!family) {
        families[familyId] = {
          parents: [person.person_data],
          children: [],
          id: familyId,
        };
      } else {
        families[familyId].parents.push(person.person_data);
      }
    });
  });

  return Object.values(families);
};

export const sortFamilies = (a: Family, b: Family) => {
  a.children.forEach((c) => {
    if (b.parents.includes(c)) {
      return 1;
    }
  });
  return a.id - b.id;
};

export const getParents = (focusedPerson: Person, families?: Family[]) => {
  const universePersons = queryClient.getQueryData<PersonsMap>("universe")!;

  const actualFamilies =
    families ??
    initializeFamilies(Object.values(universePersons)).sort(sortFamilies);

  let focusedPersonParents: Family["parents"] = [];

  focusedPerson.child_of_family_id.forEach((familyId) => {
    // the parents of families which the focused person is a child of
    const family = actualFamilies.find((fam) => fam.id === familyId);
    focusedPersonParents = [
      ...focusedPersonParents,
      ...(family as Family).parents,
    ];
  });

  return focusedPersonParents;
};

export const getSiblings = (focusedPerson: Person, families?: Family[]) => {
  const universePersons = queryClient.getQueryData<PersonsMap>("universe")!;
  const actualFamilies =
    families ??
    initializeFamilies(Object.values(universePersons)).sort(sortFamilies);

  let focusedPersonSiblings: Family["children"] = [];

  focusedPerson.child_of_family_id.forEach((familyId) => {
    const family = actualFamilies.find((fam) => fam.id === familyId);
    focusedPersonSiblings = [
      ...focusedPersonSiblings,
      ...(family as Family).children,
    ];
  });
  // the focused person himself is in the array, we need to remove him
  focusedPersonSiblings = focusedPersonSiblings.filter(
    (person) => person.person_id !== focusedPerson.person_data.person_id
  );

  return focusedPersonSiblings;
};

export const getSpouses = (focusedPerson: Person, families?: Family[]) => {
  const universePersons = queryClient.getQueryData<PersonsMap>("universe")!;
  const actualFamilies =
    families ??
    initializeFamilies(Object.values(universePersons)).sort(sortFamilies);
  let focusedPersonSpouses: Family["parents"] = [];

  focusedPerson.parent_of_family_id.forEach((familyId) => {
    const family = actualFamilies.find((fam) => fam.id === familyId);
    focusedPersonSpouses = [
      ...focusedPersonSpouses,
      ...(family as Family).parents,
    ];
  });
  // the focused person himself is in the array, we need to remove him
  focusedPersonSpouses = focusedPersonSpouses.filter(
    (person) => person.person_id !== focusedPerson.person_data.person_id
  );

  return focusedPersonSpouses;
};
