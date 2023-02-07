import React, { useEffect, useState, memo } from "react";
import { Handle, Position, Node } from "react-flow-renderer";
import {
  Avatar,
  Box,
  Button,
  Flex,
  useToast,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import "./familyTreeNode.css";
import { client } from "../../api/httpClient";
import { PersonsMap, Relationship } from "../../types/Types";
import { pluralizeRelation } from "../../services/helper";

type IExpanedStatus = {
  child: boolean;
  parent: boolean;
  spouse: boolean;
  sibling: boolean;
};

export interface IFamilyTreeNode extends Node {
  onNodeExpand: (
    props: IFamilyTreeNode,
    newMembers: PersonsMap | null,
    relation: string,
    isRightSibling?: boolean,
    isExpanded?: boolean
  ) => void;
  onAddRelative: (personId: string, relation: string) => void;
  selectedPersonId: string | number;
  xPos?: number;
  yPos?: number;
}

export const FamilyTreeNode = memo((props: IFamilyTreeNode) => {
  const [expandedRelations, setExpandedRelations] = useState<IExpanedStatus>({
    child: false,
    parent: false,
    spouse: false,
    sibling: false,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRelation, setSelectedRelation] = useState<string>("");

  const [isRightSibling, setIsRightSibling] = useState<boolean>(false);

  // const universePersons = queryClient.getQueryData<PersonsMap>("universe")!;

  const toast = useToast();

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    relation: string
  ) => {
    event.preventDefault();
    // event.stopPropagation();

    if (expandedRelations[relation as keyof IExpanedStatus]) {
      // Allow collapsing for parent and child
      if (relation === Relationship.Child || relation === Relationship.Parent) {
        props.onNodeExpand(props, null, relation, isRightSibling, true);
        setExpandedRelations((prevStatus) => {
          return { ...prevStatus, [relation]: false };
        });
      }
    } else {
      setLoading(true);
      setSelectedRelation(relation);

      client
        .get(`/api/persons/relatives`, {
          params: { person_id: props.id, relation },
        })
        .then((response) => response.data)
        .then((data) => {
          // queryClient.setQueryData(['universe'], (prev: PersonsMap) => ({
          //   ...prev,
          //   ...data
          // }));

          props.onNodeExpand(props, data, relation, isRightSibling);
        })
        .catch((error) => {
          const pluraledRelation = pluralizeRelation(relation);
          toast({
            status: "info",
            duration: null,
            description: (
              <DescriptionContent
                relation={pluraledRelation}
                personName={props.data.personName}
                onClose={() => {
                  toast.closeAll();
                }}
                onAddRelative={() => {
                  toast.closeAll();
                  props.onAddRelative(props.id, relation);
                }}
              />
            ),
          });
        })
        .finally(() => {
          setExpandedRelations((prevStatus) => {
            return { ...prevStatus, [relation]: true };
          });
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    // TODO: This should be refactored
    const currentRelation =
      props.data.label?.props?.children[1]?.props?.children;
    if (props.targetPosition === "left") {
      if (currentRelation?.toLowerCase() === Relationship.Sibling) {
        setIsRightSibling(false);
      } else if (currentRelation?.toLowerCase() === Relationship.Spouse) {
        setIsRightSibling(true);
      }
    } else if (props.targetPosition === "right") {
      if (currentRelation?.toLowerCase() === Relationship.Sibling) {
        setIsRightSibling(true);
      } else if (currentRelation?.toLowerCase() === Relationship.Spouse) {
        setIsRightSibling(false);
      }
    }
  }, []);

  return (
    <>
      <div
        className={`familyTreeNode ${
          props.selectedPersonId == props.id ? "selectedNode" : ""
        }`}
      >
        <Handle
          type="source"
          position={Position.Top}
          id={`node_${props.id}_top`}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Left}
          id={`node_${props.id}_left`}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Right}
          id={`node_${props.id}_right`}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id={`node_${props.id}_bottom`}
          isConnectable={true}
        />
        <div className="expand-action">
          <Tooltip label="Parents">
            <Button
              aria-label="Expand parents"
              className="btn-expand btn-expand--vet top"
              onClick={(e) => handleClick(e, Relationship.Parent)}
              isLoading={loading && selectedRelation === Relationship.Parent}
            >
              <span>P</span>
            </Button>
          </Tooltip>
        </div>
        <div className="familyTreeNode__middle">
          {isRightSibling ? (
            <Tooltip label="Spouse">
              <Button
                aria-label="Expand Spouse"
                className="btn-expand btn-expand--hoz left"
                onClick={(e) => handleClick(e, Relationship.Spouse)}
                isLoading={loading && selectedRelation === Relationship.Spouse}
                disabled={
                  expandedRelations[Relationship.Spouse] ||
                  (props.targetPosition === "left" && isRightSibling)
                }
              >
                <span>Sp</span>
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Siblings">
              <Button
                aria-label="Expand Siblings"
                className="btn-expand btn-expand--hoz left"
                onClick={(e) => handleClick(e, Relationship.Sibling)}
                isLoading={loading && selectedRelation === Relationship.Sibling}
                disabled={
                  expandedRelations[Relationship.Sibling] ||
                  (props.targetPosition === "left" && !isRightSibling)
                }
              >
                <span>Sb</span>
              </Button>
            </Tooltip>
          )}
          <div className="persona">
            <Flex justifyContent="center">
              <Avatar
                name={props.data.personName}
                src={props.data.photo!}
                size="md"
              />
            </Flex>
            <div className="persona__detail">{props.data.label}</div>
          </div>
          {isRightSibling ? (
            <Tooltip label="Siblings">
              <Button
                aria-label="Expand Siblings"
                className="btn-expand btn-expand--hoz right"
                onClick={(e) => handleClick(e, Relationship.Sibling)}
                isLoading={loading && selectedRelation === Relationship.Sibling}
                disabled={
                  expandedRelations[Relationship.Sibling] ||
                  (props.targetPosition === "right" && isRightSibling)
                }
              >
                <span>Sb</span>
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label="Spouse">
              <Button
                aria-label="Expand Spouse"
                className="btn-expand btn-expand--hoz right"
                onClick={(e) => handleClick(e, Relationship.Spouse)}
                isLoading={loading && selectedRelation === Relationship.Spouse}
                disabled={
                  expandedRelations[Relationship.Spouse] ||
                  (props.targetPosition === "right" && !isRightSibling)
                }
              >
                <span>Sp</span>
              </Button>
            </Tooltip>
          )}
        </div>
        <div className="expand-action">
          <Tooltip label="Children">
            <Button
              aria-label="Expand children"
              className="btn-expand btn-expand--vet bottom"
              onClick={(e) => handleClick(e, Relationship.Child)}
              isLoading={loading && selectedRelation === Relationship.Child}
            >
              <span>C</span>
            </Button>
          </Tooltip>
        </div>
      </div>
    </>
  );
});

const DescriptionContent = ({
  relation,
  personName,
  onAddRelative,
  onClose,
}: {
  relation: string;
  personName: string;
  onAddRelative: () => void;
  onClose: () => void;
}) => {
  return (
    <Box w="100%">
      <Text>
        There is no {relation} for {personName}. Would you like to enter that
        now?
      </Text>
      <Box w="100%" display="flex" alignItems="center">
        <Box>
          <Text>Would you like to enter that now?</Text>
        </Box>
        <Box ml="4">
          <Button
            colorScheme="whiteAlpha"
            size="xs"
            mr="2"
            onClick={onAddRelative}
          >
            Yes
          </Button>
          <Button colorScheme="blackAlpha" size="xs" onClick={onClose}>
            No
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
