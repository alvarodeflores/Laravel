import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  Button,
  Flex,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { UserPlus, Upload, Home, PlusSquare } from "react-feather";
import { Link } from "react-router-dom";
import { routes } from "../../constants";
import { FamilyTree, UserData } from "../../types/Types";
import { isUserAuthenticated } from "../../services/auth.service";
import { fetchCurrentUser, fetchFamilyTrees } from "../../api/actions";

interface LayoutProps {
  children: any;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { treeId } = useParams();

  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<string | undefined>();
  const [currentUser, setCurrentUser] = useState<UserData | undefined>(
    undefined
  );

  const navigator = useNavigate();

  const handleChangeTree = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const _selectedTree = e.target.value;
    navigator(`../${routes.tree}/${_selectedTree}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const trees = await fetchFamilyTrees();
      setFamilyTrees(trees);

      if (!treeId && trees?.length) {
        const _selectedTree = trees[0].id.toString();
        setSelectedTree(_selectedTree);
        navigator(`../${routes.tree}/${_selectedTree}`);
      } else {
        setSelectedTree(treeId);
      }

      const user = await fetchCurrentUser();
      setCurrentUser(user);
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Flex paddingY="1.5rem" paddingX="10rem" shadow="md">
        <Heading as="h1" color="gray.500">
          <Box as="span" color="green.500">
            Kin
          </Box>
          Kinect
        </Heading>
        {isUserAuthenticated() ? (
          <HStack spacing={5} marginLeft="auto">
            <Select
              variant="flushed"
              onChange={handleChangeTree}
              defaultValue={selectedTree}
            >
              {familyTrees.map((t, i) => (
                <option key={`tree_${i}`} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Box position="relative">
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  backgroundColor="transparent"
                  minWidth="unset"
                >
                  {currentUser?.name}
                </MenuButton>
                <MenuList right={0} zIndex={100} transformOrigin="top right">
                  <MenuItem>
                    <Link to="/">
                      <HStack spacing={4}>
                        <Box>
                          <Home />
                        </Box>
                        <Box>Home</Box>
                      </HStack>
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to={routes.newTree}>
                      <HStack spacing={4}>
                        <Box>
                          <PlusSquare />
                        </Box>
                        <Box>New Family Tree</Box>
                      </HStack>
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to={routes.invite}>
                      <HStack spacing={4}>
                        <Box>
                          <UserPlus />
                        </Box>
                        <Box>Invite User</Box>
                      </HStack>
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to={routes.upload}>
                      <HStack spacing={4}>
                        <Box>
                          <Upload />
                        </Box>
                        <Box>Upload Gedcom</Box>
                      </HStack>
                    </Link>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </HStack>
        ) : null}
      </Flex>
      {children}
    </Box>
  );
};

export default Layout;
