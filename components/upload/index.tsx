import React, { useCallback, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import Card from "../shared/Card";
import { useDropzone } from "react-dropzone";
import { useGedomImport } from "../../api/hooks/useGedcomImport";
import { useNavigate } from "react-router";
import { routes } from "../../constants";

// TODO: refactor to use formik-chakra-ui bindings
const Upload: React.FC<any> = () => {
  const navigate = useNavigate();

  const importMutation = useGedomImport();

  const [loading, setLoading] = useState(false);
  const [file, setfile] = useState<File | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setfile(acceptedFiles[0]);
  }, []);
  const uploadFile = () => {
    setLoading(true);
    importMutation.mutate(
      { file: file as File },
      {
        onSuccess: () => {
          setLoading(false);
          navigate(`/${routes.tree}`);
        },
      }
    );
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Box my="1rem">
      <Card title="Upload Gedcom">
        <Box {...getRootProps()}>
          <input {...getInputProps()} />
          {file ? (
            <Box
              p="4rem"
              backgroundColor="gray.200"
              rounded="0.5rem"
              cursor="pointer"
            >
              {JSON.stringify(file.name)}
            </Box>
          ) : (
            <Box
              p="4rem"
              backgroundColor="gray.200"
              rounded="0.5rem"
              cursor="pointer"
            >
              Drag 'n' drop a Gedcom file here, or click to select file
            </Box>
          )}
        </Box>
        <Box my="1rem" textAlign="center">
          <Button
            isLoading={loading}
            colorScheme="blue"
            type="submit"
            onClick={() => uploadFile()}
            disabled={!Boolean(file)}
          >
            Upload
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Upload;
