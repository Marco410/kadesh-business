import { gql } from "@apollo/client";

export const TECH_FILES_QUERY = gql`
  query TechFiles($where: TechFileWhereInput!) {
    techFiles(where: $where) {
      id
      title
      description
      category
      createdAt
      updatedAt
      file {
        url
      }
      company {
        id
        name
      }
    }
  }
`;

export interface TechFileWhereInput {
  company?: { id?: { equals: string } };
}

export interface TechFilesQueryVariables {
  where: TechFileWhereInput;
}

export interface TechFileItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
  file: { url: string } | null;
  company: { id: string; name: string } | null;
}

export interface TechFilesQueryResponse {
  techFiles: TechFileItem[];
}

export const CREATE_TECH_FILE_MUTATION = gql`
  mutation CreateTechFile($data: TechFileCreateInput!) {
    createTechFile(data: $data) {
      id
      title
      description
      category
      createdAt
      updatedAt
      file {
        url
      }
      company {
        id
      }
    }
  }
`;

export interface TechFileCreateInput {
  title: string;
  description?: string | null;
  category?: string | null;
  file: { upload: File };
  company?: { connect: { id: string } } | null;
}

export interface CreateTechFileVariables {
  data: TechFileCreateInput;
}

export interface CreateTechFileResponse {
  createTechFile: TechFileItem;
}

export const DELETE_TECH_FILE_MUTATION = gql`
  mutation DeleteTechFile($where: TechFileWhereUniqueInput!) {
    deleteTechFile(where: $where) {
      id
    }
  }
`;

export interface DeleteTechFileVariables {
  where: { id: string };
}

export interface DeleteTechFileResponse {
  deleteTechFile: { id: string };
}

export const TECH_FILE_CATEGORIES = [
  { value: "purchase_process", label: "Proceso de venta" },
  { value: "sales_technique", label: "Técnica de venta" },
  { value: "closing", label: "Cierres" },
  { value: "speech_script", label: "Speech / Guion" },
  { value: "other", label: "Otro" },
] as const;
