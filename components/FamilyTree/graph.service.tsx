import { Position, Node, Edge, XYPosition } from "react-flow-renderer";
import {
  getParents,
  getSiblings,
  getSpouses,
  initializeFamilies,
  sortFamilies,
} from "../../services/family.service";
import { Family, Person, PersonsMap, PersonData, Sex } from "../../types/Types";

export const NODES_SPACING = 200;

export const makeNode = (
  personId: string,
  label: ReturnType<typeof makeLabel>,
  position: XYPosition,
  targetPosition: Position,
  person: PersonData,
  type = "selectorNode"
): Node<{
  label: ReturnType<typeof makeLabel>;
  personName: string;
  photo: string | null;
}> => {
  return {
    id: personId,
    data: { label, personName: person.name, photo: person.photo },
    position,
    type,
    targetPosition,
  };
};

const makeEdge = (
  personId: string,
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string
): Edge => {
  return {
    id: `edge_${personId}`,
    type: "smoothstep",
    source,
    target,
    sourceHandle,
    targetHandle,
  };
};

export const makeLabel = (name: string, relation: string) => {
  return (
    <>
      <h3 style={{ fontSize: "1rem" }}>{name}</h3>
      <p style={{ color: "gray" }}>{relation}</p>
    </>
  );
};

export const generateChildrenNodes = (
  focusedPerson: Person,
  families: Family[],
  centerPos: XYPosition
) => {
  let focusedPersonChildren: Family["children"] = [];

  focusedPerson.parent_of_family_id.forEach((familyId) => {
    // the children of families that the focused person is a parent of
    const family = families.find((fam) => fam.id === familyId);
    focusedPersonChildren = [
      ...focusedPersonChildren,
      ...(family as Family).children,
    ];
  });

  const startY = centerPos.y + NODES_SPACING;
  const startX =
    centerPos.x - (NODES_SPACING * focusedPersonChildren.length) / 2;

  const nodes = focusedPersonChildren.map((child, i) =>
    makeNode(
      String(child.person_id),
      makeLabel(child.name, "Child"),
      { x: startX + i * NODES_SPACING, y: startY },
      Position.Bottom,
      child
    )
  );

  const edges = focusedPersonChildren.map((child) =>
    makeEdge(
      `${focusedPerson.person_data.person_id}-${child.person_id}`,
      String(focusedPerson.person_data.person_id),
      String(child.person_id),
      `node_${focusedPerson.person_data.person_id}_bottom`,
      `node_${child.person_id}_top`
    )
  );

  return [...nodes, ...edges];
};

export const generateParentsNodes = (
  focusedPerson: Person,
  families: Family[],
  centerPos: XYPosition
) => {
  const focusedPersonParents = getParents(focusedPerson);

  // const startY = centerPos.y + NODES_SPACING;
  // const startX =
  //   centerPos.x - (NODES_SPACING * focusedPersonParents.length) / 2;

  const startY = centerPos.y - NODES_SPACING;
  const startX =
    centerPos.x - (NODES_SPACING * focusedPersonParents.length) / 2;

  const nodes = focusedPersonParents.map((parent, i) =>
    makeNode(
      String(parent.person_id),
      makeLabel(parent.name, "Parent"),
      { x: startX + i * 200, y: startY },
      Position.Top,
      parent
    )
  );

  const edges = focusedPersonParents.map((parent) =>
    makeEdge(
      `${focusedPerson.person_data.person_id}-${parent.person_id}`,
      String(focusedPerson.person_data.person_id),
      String(parent.person_id),
      `node_${focusedPerson.person_data.person_id}_top`,
      `node_${parent.person_id}_bottom`
    )
  );

  return [...nodes, ...edges];
};

export const generateSiblingsNodes = (
  focusedPerson: Person,
  families: Family[],
  centerPos: XYPosition,
  isRightSibling?: boolean
) => {
  const focusedPersonSiblings = getSiblings(focusedPerson, families);

  const startY = centerPos.y;
  const startX = isRightSibling
    ? centerPos.x + NODES_SPACING * focusedPersonSiblings.length
    : centerPos.x - NODES_SPACING * focusedPersonSiblings.length;

  const nodes = focusedPersonSiblings.map((sibling, i) =>
    makeNode(
      String(sibling.person_id),
      makeLabel(sibling.name, "Sibling"),
      {
        x: isRightSibling
          ? startX - i * NODES_SPACING
          : startX + i * NODES_SPACING,
        y: startY,
      },
      Position.Right,
      sibling
    )
  );

  let sourceHandleApx: string, targetHandlApx: string;
  if (isRightSibling) {
    sourceHandleApx = `right`;
    targetHandlApx = `left`;
  } else {
    sourceHandleApx = `left`;
    targetHandlApx = `right`;
  }

  const edges = focusedPersonSiblings.map((sibling) =>
    makeEdge(
      `${focusedPerson.person_data.person_id}-${sibling.person_id}`,
      String(focusedPerson.person_data.person_id),
      String(sibling.person_id),
      `node_${focusedPerson.person_data.person_id}_${sourceHandleApx}`,
      `node_${sibling.person_id}_${targetHandlApx}`
    )
  );

  return [...nodes, ...edges];
};

export const generateSpousesNodes = (
  focusedPerson: Person,
  families: Family[],
  centerPos: XYPosition,
  isRightSibling?: boolean
) => {
  const focusedPersonSpouses = getSpouses(focusedPerson, families);

  const startY = centerPos.y;
  const startX = isRightSibling
    ? centerPos.x - NODES_SPACING * focusedPersonSpouses.length
    : centerPos.x + NODES_SPACING * focusedPersonSpouses.length;

  const nodes = focusedPersonSpouses.map((spouse, i) =>
    makeNode(
      String(spouse.person_id),
      makeLabel(spouse.name, "Spouse"),
      {
        x: isRightSibling
          ? startX + i * NODES_SPACING
          : startX - i * NODES_SPACING,
        y: startY,
      },
      Position.Left,
      spouse
    )
  );

  let sourceHandleApx: string, targetHandlApx: string;
  if (isRightSibling) {
    sourceHandleApx = `left`;
    targetHandlApx = `right`;
  } else {
    sourceHandleApx = `right`;
    targetHandlApx = `left`;
  }

  const edges = focusedPersonSpouses.map((spouse) =>
    makeEdge(
      `${focusedPerson.person_data.person_id}-${spouse.person_id}`,
      String(focusedPerson.person_data.person_id),
      String(spouse.person_id),
      `node_${focusedPerson.person_data.person_id}_${sourceHandleApx}`,
      `node_${spouse.person_id}_${targetHandlApx}`
    )
  );

  return [...nodes, ...edges];
};

export const initializeNodes = (
  focusedPerson: Person | null,
  universePersons: PersonsMap,
  startPosition: XYPosition
) => {
  if (!focusedPerson) return [];

  const focusedPersonNode = makeNode(
    String(focusedPerson.person_data.person_id),
    makeLabel(focusedPerson.person_data.name, ""),
    startPosition,
    Position.Top,
    focusedPerson.person_data
    // "default"
  );

  const universePersonsArray = Object.values(universePersons);
  const families = initializeFamilies(universePersonsArray).sort(sortFamilies);

  const focusedPersonChildrenNodes = generateChildrenNodes(
    focusedPerson,
    families,
    startPosition
  );
  const focusedPersonParentsNodes = generateParentsNodes(
    focusedPerson,
    families,
    startPosition
  );
  const focusedPersonSiblingsNodes = generateSiblingsNodes(
    focusedPerson,
    families,
    startPosition
  );
  const focusedPersonSpousesNodes = generateSpousesNodes(
    focusedPerson,
    families,
    startPosition
  );

  return [
    ...focusedPersonChildrenNodes,
    ...focusedPersonParentsNodes,
    ...focusedPersonSiblingsNodes,
    ...focusedPersonSpousesNodes,
    focusedPersonNode,
  ];
};
