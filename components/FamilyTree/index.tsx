import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Alert,
  AlertIcon,
  Drawer,
  DrawerOverlay,
  IconButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import ReactFlow, {
  isEdge,
  Edge,
  Node,
  NodeTypesType,
  Position,
  ReactFlowProvider,
  useZoomPanHelper,
  XYPosition,
  Controls,
} from "react-flow-renderer";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { usePersonUniverse } from "../../api/hooks/usePersonUniverse";
import { validatePersonRelation } from "../../api/actions";
import { messages, routes } from "../../constants";
import { AddPersonDrawer } from "../AddPersonDrawer";
import { RelativeDrawer } from "./RelativeDrawer";
import { PersonDrawer } from "../PersonDrawer";
import { FamilyTreeStarter } from "./FamilyTreeStarter";
import { Person, PersonsMap, Relationship } from "../../types/Types";
import {
  initializeNodes,
  generateChildrenNodes,
  generateParentsNodes,
  generateSiblingsNodes,
  generateSpousesNodes,
  makeNode,
  makeLabel,
  NODES_SPACING,
} from "./graph.service";
import { debounce } from "lodash";
import PageLoader from "../PageLoader";
import { FamilyTreeNode, IFamilyTreeNode } from "./familyTreeNode";
import ControlPanel from "./ControlPanel";
import {
  initializeFamilies,
  sortFamilies,
} from "../../services/family.service";

import {
  setTreeDataToStore,
  getTreeDataFromStore,
} from "../../services/storage";

export const FamilyTreeWrapper = () => {
  const { treeId } = useParams();
  if (!treeId) {
    return <PageLoader />;
  }

  const universeQuery = usePersonUniverse(treeId);

  useEffect(() => {
    console.log(`Refetching Family Tree...${treeId}`);
    universeQuery.refetch();
  }, [treeId, universeQuery.refetch]);

  if (universeQuery.isLoading) {
    return <PageLoader />;
  }

  if (universeQuery.isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        {messages.genericError}
      </Alert>
    );
  }

  if (universeQuery.isSuccess) {
    if (Array.isArray(universeQuery.data) && universeQuery.data?.length === 0) {
      return <FamilyTreeStarter />;
    } else {
      return (
        <ReactFlowProvider>
          <FamilyTree universeData={universeQuery.data} />
        </ReactFlowProvider>
      );
    }
  }

  return null;
};

interface IFamilyTree {
  universeData?: PersonsMap;
}

const FamilyTree = ({ universeData }: IFamilyTree) => {
  if (!universeData) {
    return <PageLoader />;
  }

  const toast = useToast();

  const { treeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const personId = searchParams.get("person");
  const centerPos: XYPosition = {
    x: 800,
    y: 200,
  };

  const treeRef = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef(null);
  const tempNodeId = useRef("");

  const { setCenter } = useZoomPanHelper();

  console.log("Loading Family Tree...");

  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [isAddingRelative, setIsAddingRelative] = useState(false);

  const [relativeData, setRelativeData] = useState<{
    relatedPerson?: Person;
    relation?: Relationship;
  }>({});

  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const navigator = useNavigate();

  const {
    isOpen: isDrawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();

  // const nodes = useMemo(
  //   () =>
  //     initializeNodes(selectedPerson ?? randomPerson, universeData, centerPos),
  //   [selectedPerson, universeData, centerPos]
  // );

  useEffect(() => {
    const _randomPerson = universeData[Object.keys(universeData)[0]];
    const _selectedPerson = personId ? universeData[personId] : null;
    const newCenterPos = getCenterPos();

    const _nodes = initializeNodes(
      _selectedPerson ?? _randomPerson,
      universeData,
      newCenterPos
    );
    console.log("Rearrange the nodes...");
    setNodes(_nodes);

    const extraRelations = getTreeDataFromStore();
    if (extraRelations?.length === 0) {
      return;
    }

    setNodes((els) => {
      let extraNodes: any[] = [];

      const nodeIds = els.map((e) => e.id);
      const filteredExtraRelations = extraRelations.filter((er: any) =>
        nodeIds.includes(er.target)
      );

      filteredExtraRelations.forEach((er: any) => {
        const newMember = universeData[er.target];
        const focusedPerson = universeData[er.source];
        const focusedPersonNode = els.find((e) => e.id == er.source);

        if (newMember && focusedPerson && focusedPersonNode) {
          const universePersonsArray = Object.values([newMember]);
          const families =
            initializeFamilies(universePersonsArray).sort(sortFamilies);
          const targetPosition = focusedPersonNode.position;
          const isRightSibling = false;

          let newNodes: any[] = [];
          if (er.relation == Relationship.Child) {
            newNodes = generateChildrenNodes(
              focusedPerson,
              families,
              targetPosition
            );
          } else if (er.relation == Relationship.Parent) {
            newNodes = generateParentsNodes(
              focusedPerson,
              families,
              targetPosition
            );
          } else if (er.relation == Relationship.Sibling) {
            newNodes = generateSiblingsNodes(
              focusedPerson,
              families,
              targetPosition,
              isRightSibling
            );
          } else if (er.relation == Relationship.Spouse) {
            newNodes = generateSpousesNodes(
              focusedPerson,
              families,
              targetPosition,
              isRightSibling
            );
          }

          if (newNodes.length > 0) {
            extraNodes.push(...newNodes);
          }
        }
      });

      return [...els, ...extraNodes];
    });
  }, [universeData]);

  useEffect(() => {
    const _selectedPerson = personId ? universeData[personId] : null;
    setSelectedPerson(_selectedPerson);
  }, [personId]);

  const getCenterPos = (): XYPosition => {
    let centerPosX = centerPos.x,
      centerPosY = centerPos.y;

    if (treeRef.current) {
      const treeBoxSize = treeRef.current.getBoundingClientRect();
      centerPosX =
        treeBoxSize.width > window.innerWidth
          ? window.innerWidth / 2
          : treeBoxSize.width / 2;
      centerPosY =
        treeBoxSize.height > window.innerHeight - 100
          ? (window.innerHeight - 100) / 2
          : treeBoxSize.height / 2;
    }

    return { x: centerPosX - 100, y: centerPosY - 100 };

    // handleWindowResize();
    // const debounceResize = debounce(handleWindowResize, 50);
    // window.addEventListener("resize", debounceResize);
    // return () => window.removeEventListener("resize", debounceResize);
  };

  const getRelationOfDirection = (sourceId: string, direction: string) => {
    if (direction === "top") {
      return Relationship.Parent;
    } else if (direction === "bottom") {
      return Relationship.Child;
    }

    const sourceNode = document.querySelector(`[data-id="${sourceId}"]`);
    const sourceHandle = sourceNode?.querySelector(`button.${direction}`);

    if (sourceHandle?.innerHTML.includes("Sb")) {
      return Relationship.Sibling;
    } else {
      return Relationship.Spouse;
    }
  };

  const onElementClick = useCallback(
    (event, element: Node | Edge) => {
      if (isEdge(element)) return;

      // bubbling error handler when clicking expand button
      if (
        event.target.nodeName === "SPAN" ||
        event.target.nodeName === "BUTTON"
      ) {
        return;
      }

      if (element.id.includes("node_temp_")) {
        tempNodeId.current = element.id;

        const nodeData = element.data;
        const direction = nodeData?.relatedNodeHandle?.replace(/node_\d_/, "");
        const relationWithOrigin = getRelationOfDirection(
          nodeData?.relatedNode,
          direction
        );

        const relatedPerson = universeData[nodeData.relatedNode];
        if (relationWithOrigin) {
          setRelativeData({ relatedPerson, relation: relationWithOrigin });
          setIsAddingRelative(true);

          if (!isDrawerOpen) return openDrawer();
        } else {
          return;
        }
      } else {
        const clickedPersonId = element.id;

        if (clickedPersonId) {
          navigator(`../${routes.tree}/${treeId}?person=${clickedPersonId}`);
          const { x, y } = element.position;
          const width = 100;
          const height = 100;
          setCenter(x + width / 2, y + height / 2 + 90, 1);

          if (!isDrawerOpen) return openDrawer();
        }
      }
    },
    [setCenter]
  );

  const _collapseNodes = (
    sourceNode: IFamilyTreeNode,
    currentNodes: any[],
    direction?: string
  ) => {
    const sourceId = sourceNode.id;
    const relatedEdges = currentNodes.filter((n) => {
      if (direction) {
        return (
          n.id.includes("edge_") &&
          n.source === sourceId &&
          n.targetHandle.includes(direction)
        );
      } else {
        return n.id.includes("edge_") && n.source === sourceId;
      }
    });

    if (!relatedEdges?.length) {
      return;
    }

    relatedEdges.forEach((re) => {
      // re.isHidden = !re.isHidden;
      re.animated = true;
      const relatedNode = currentNodes.find((n) => {
        return n.id === re.target;
      });
      if (relatedNode) {
        // relatedNode.isHidden = !relatedNode.isHidden;
        relatedNode.isHidden = true;
        _collapseNodes(relatedNode, currentNodes, direction);
      }
    });
  };

  const deepParentNodes = (sourceNodes: any[], relation: string) => {
    let parentNodes: any[] = [];
    for (let sourceNode of sourceNodes) {
      if (sourceNode.id.includes("edge_")) {
        continue;
      }

      const focusedPerson = universeData[sourceNode.id];
      if (focusedPerson) {
        const targetPosition = {
          x: sourceNode.xPos || centerPos.x,
          y: sourceNode.yPos || centerPos.y,
        };

        const universePersonsArray = Object.values(universeData);
        const families =
          initializeFamilies(universePersonsArray).sort(sortFamilies);

        let _nodes_p;
        if (relation === Relationship.Parent) {
          _nodes_p = generateParentsNodes(
            focusedPerson,
            families,
            targetPosition
          );
        } else {
          _nodes_p = generateChildrenNodes(
            focusedPerson,
            families,
            targetPosition
          );
        }

        if (_nodes_p?.length > 0) {
          parentNodes.push(..._nodes_p);
        }

        deepParentNodes(_nodes_p, relation);
      }
    }

    return parentNodes;
  };

  const collapseNodes = (
    sourceNode: IFamilyTreeNode,
    relation?: string,
    isRightSibling: boolean = false
  ) => {
    const focusedPerson = universeData[sourceNode.id];

    if (focusedPerson) {
      const targetPosition = {
        x: sourceNode.xPos || centerPos.x,
        y: sourceNode.yPos || centerPos.y,
      };

      const universePersonsArray = Object.values(universeData);
      const families =
        initializeFamilies(universePersonsArray).sort(sortFamilies);

      const _nodes_sb = generateSiblingsNodes(
        focusedPerson,
        families,
        targetPosition,
        isRightSibling
      );
      const _nodes_sp = generateSpousesNodes(
        focusedPerson,
        families,
        targetPosition,
        isRightSibling
      );

      const focusedPersonNode = makeNode(
        String(focusedPerson.person_data.person_id),
        makeLabel(focusedPerson.person_data.name, ""),
        targetPosition,
        Position.Top,
        focusedPerson.person_data
        // "default"
      );

      if (relation === Relationship.Child) {
        const _nodes_p = generateParentsNodes(
          focusedPerson,
          families,
          targetPosition
        );
        const _nodes_gp = deepParentNodes(_nodes_p, Relationship.Parent);
        const totalNodes = [
          ..._nodes_p,
          ..._nodes_gp,
          ..._nodes_sb,
          ..._nodes_sp,
          focusedPersonNode,
        ];
        setNodes(totalNodes);
      } else if (relation === Relationship.Parent) {
        const _nodes_c = generateChildrenNodes(
          focusedPerson,
          families,
          targetPosition
        );
        setNodes([..._nodes_c, ..._nodes_sb, ..._nodes_sp, focusedPersonNode]);
      }
    }
  };

  const onNodeExpand = (
    treeNode: IFamilyTreeNode,
    newMembers: PersonsMap | null,
    relation: string,
    isRightSibling: boolean = false,
    isExpanded: boolean = false
  ) => {
    const focusedPerson = universeData[treeNode.id];
    if (focusedPerson) {
      const targetPosition = {
        x: treeNode.xPos || centerPos.x,
        y: treeNode.yPos || centerPos.y,
      };

      // Handling Nodes collapsing
      if (newMembers == null) {
        if (isExpanded) {
          collapseNodes(treeNode, relation, isRightSibling);
        }

        return;
      }
      // End Handling Nodes collapsing

      const universePersonsArray = Object.values(newMembers);

      if (!universePersonsArray?.length) {
        return;
      }

      const families =
        initializeFamilies(universePersonsArray).sort(sortFamilies);

      let _nodes: any[] = [];
      if (relation == Relationship.Child) {
        _nodes = generateChildrenNodes(focusedPerson, families, targetPosition);
      } else if (relation == Relationship.Parent) {
        _nodes = generateParentsNodes(focusedPerson, families, targetPosition);
      } else if (relation == Relationship.Sibling) {
        _nodes = generateSiblingsNodes(
          focusedPerson,
          families,
          targetPosition,
          isRightSibling
        );
      } else if (relation == Relationship.Spouse) {
        _nodes = generateSpousesNodes(
          focusedPerson,
          families,
          targetPosition,
          isRightSibling
        );
      }

      if (_nodes) {
        setNodes((prevNodes) => {
          let nodeIds: string[] = [],
            nodesCleaned: any[] = [];

          [...prevNodes, ..._nodes].forEach((n) => {
            if (!nodeIds.includes(n.id)) {
              nodesCleaned.push(n);
              nodeIds.push(n.id);
            }
          });

          return [...nodesCleaned];
        });
      }
    }
  };

  const onAddRelativeFromToast = (
    clickedPersonId: string,
    relation: Relationship
  ) => {
    const relatedPerson = universeData[clickedPersonId];
    if (relatedPerson && relation) {
      setRelativeData({ relatedPerson, relation });
      setIsAddingRelative(true);

      navigator(`../${routes.tree}/${treeId}?person=${clickedPersonId}`);

      if (!isDrawerOpen) return openDrawer();
    } else {
      return;
    }
  };

  const addNode = useCallback(() => {
    let nodePosX: number = 100,
      nodePosY: number = 100;
    if (treeRef.current) {
      const treeBoxSize = treeRef.current.getBoundingClientRect();
      nodePosX =
        treeBoxSize.width > window.innerWidth
          ? window.innerWidth / 2
          : treeBoxSize.width / 2;
      nodePosY =
        treeBoxSize.height > window.innerHeight - 100
          ? window.innerHeight - 100
          : treeBoxSize.height;
    }

    setNodes((els) => {
      return [
        ...els,
        {
          id: `node_temp_${Date.now()}`,
          position: { x: nodePosX, y: nodePosY },
          data: { label: "Click me!" },
        },
      ];
    });
  }, []);

  const deleteNode = useCallback(() => {
    if (!tempNodeId.current) {
      toast({
        description: "Please select a person to remove",
        status: "error",
      });

      return false;
    }

    const stamp = tempNodeId.current.replace("node_temp_", "");

    setNodes((els) => {
      const _nodes = els;
      let _nodeIds = _nodes.map((n) => n.id);

      // Remove selected Node
      const selectedNodeIdx = _nodeIds.indexOf(tempNodeId.current, 0);
      _nodes.splice(selectedNodeIdx, 1);
      _nodeIds.splice(selectedNodeIdx, 1);

      // Remove selected Edge
      const selectedEdgeIdx = _nodeIds.indexOf(`edge_temp_${stamp}`, 0);
      _nodes.splice(selectedEdgeIdx, 1);

      return [..._nodes];
    });
  }, []);

  const onZoom = useCallback((value: number[]) => {
    console.log(value);
  }, []);

  const onConnect = useCallback(async (params) => {
    const target = params.target;
    const stamp = target.replace("node_temp_", "");

    const edgeId = `edge_temp_${stamp}`;
    const sourceHandle = params.sourceHandle;

    let targetHandleDir = "top";
    if (sourceHandle.includes("_bottom")) {
      targetHandleDir = "top";
    } else if (sourceHandle.includes("_top")) {
      targetHandleDir = "bottom";
    } else if (sourceHandle.includes("_left")) {
      targetHandleDir = "right";
    } else if (sourceHandle.includes("_right")) {
      targetHandleDir = "left";
    }

    if (targetHandleDir === "bottom" || targetHandleDir === "left") {
      const relation =
        targetHandleDir === "bottom"
          ? Relationship.Parent
          : Relationship.Spouse;

      const isValid = await validatePersonRelation({
        person_id: params?.source,
        type: relation,
      });

      if (!isValid) {
        toast({
          description:
            "The relation could not be added, please expand the node to see the relations.",
          status: "error",
        });

        return false;
      }
    }

    const newEdge: Edge = {
      id: edgeId,
      source: params?.source,
      target: params?.target,
      sourceHandle: params?.sourceHandle,
      targetHandle: `${params?.source}_${targetHandleDir}`,
    };

    setNodes((nds) => {
      const sourceNode = nds.find((n) => n.id === target);
      sourceNode.data.relatedNode = params?.source;
      sourceNode.data.relatedNodeHandle = params?.sourceHandle;

      return [...nds, newEdge];
    });
  }, []);

  const onConnectStart = useCallback((_, params) => {
    if (params?.nodeId.includes("node_temp_")) {
      return;
    }

    connectingNodeId.current = params;
  }, []);

  const onConnectEnd = useCallback(async (event) => {
    const targetIsPane = event.target.classList.contains("react-flow__pane");
    if (targetIsPane) {
      const stamp = Date.now();
      const nodeId = `node_temp_${stamp}`;
      const edgeId = `edge_temp_${stamp}`;

      const currentNodeParams: any = connectingNodeId.current;
      const sourceHandle = currentNodeParams?.handleId;

      const newNode: Node = {
        id: nodeId,
        position: { x: event.clientX, y: event.clientY },
        data: {
          label: `Click me!`,
          relatedNode: currentNodeParams?.nodeId,
          relatedNodeHandle: sourceHandle,
        },
      };

      let targetHandleDir = "top";
      if (sourceHandle.includes("_bottom")) {
        targetHandleDir = "top";
      } else if (sourceHandle.includes("_top")) {
        targetHandleDir = "bottom";
      } else if (sourceHandle.includes("_left")) {
        targetHandleDir = "right";
      } else if (sourceHandle.includes("_right")) {
        targetHandleDir = "left";
      }

      if (targetHandleDir === "bottom" || targetHandleDir === "left") {
        const relation =
          targetHandleDir === "bottom"
            ? Relationship.Parent
            : Relationship.Spouse;

        const isValid = await validatePersonRelation({
          person_id: currentNodeParams?.nodeId,
          type: relation,
        });

        if (!isValid) {
          toast({
            description:
              "The relation could not be added, please expand the node to see the relations.",
            status: "error",
          });

          return false;
        }
      }

      const newEdge: Edge = {
        id: edgeId,
        source: currentNodeParams?.nodeId,
        target: nodeId,
        sourceHandle,
        targetHandle: `${nodeId}_${targetHandleDir}`,
      };

      setNodes((nds) => {
        const sourceNode = nds.find(
          (nd) => nd.id === currentNodeParams?.nodeId
        );
        const { x, y } = sourceNode.position;

        let newX = x,
          newY = y;

        if (targetHandleDir === "top") {
          newY += NODES_SPACING;
        } else if (targetHandleDir === "bottom") {
          newY -= NODES_SPACING;
        } else if (targetHandleDir === "left") {
          newX += NODES_SPACING;
        } else if (targetHandleDir === "right") {
          newX -= NODES_SPACING;
        }

        newNode.position = { x: newX, y: newY };

        return [...nds, newNode, newEdge];
      });
    }
  }, []);

  const onCloseDrawer = () => {
    setIsAddingRelative(false);
    closeDrawer();
  };

  const nodeTypes: NodeTypesType = {
    selectorNode: (props: Node) => (
      <FamilyTreeNode
        {...props}
        onNodeExpand={onNodeExpand}
        onAddRelative={onAddRelativeFromToast}
        selectedPersonId={
          personId
            ? personId
            : universeData[Object.keys(universeData)[0]].person_data.person_id
        }
      />
    ),
  };

  return (
    <div style={{ height: 1000 }} ref={treeRef}>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        trapFocus={true}
        placement="left"
        size="xs"
      >
        <DrawerOverlay />
        {isAddingRelative ? (
          <RelativeDrawer
            selectedPerson={relativeData?.relatedPerson as Person}
            relation={relativeData?.relation || null}
            onClose={() => setIsAddingRelative(false)}
          />
        ) : !isAddingPerson ? (
          <PersonDrawer
            person={selectedPerson as Person}
            onAddRelativeClick={() => setIsAddingPerson(true)}
          />
        ) : (
          <AddPersonDrawer
            selectedPerson={selectedPerson as Person}
            onClose={() => setIsAddingPerson(false)}
          />
        )}
      </Drawer>
      {nodes && (
        <ReactFlow
          elements={nodes}
          nodesDraggable={true}
          nodeTypes={nodeTypes}
          onElementClick={(e, element) => {
            onElementClick(e, element);
          }}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
        >
          <ControlPanel onAdd={addNode} onDelete={deleteNode}>
            <Controls />
          </ControlPanel>
        </ReactFlow>
      )}
    </div>
  );
};
