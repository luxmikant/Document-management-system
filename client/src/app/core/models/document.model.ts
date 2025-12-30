export interface Permission {
  userId: string | { _id: string; email: string; firstName: string; lastName: string };
  access: 'viewer' | 'editor';
}

export interface Document {
  id: string;
  _id?: string;
  title: string;
  description: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  ownerId: string | { _id: string; email: string; firstName: string; lastName: string };
  tags: string[];
  currentVersionNumber: number;
  acl: Permission[];
  isOwner?: boolean;
  canEdit?: boolean;
  access?: 'owner' | 'viewer' | 'editor';
  createdAt: string;
  updatedAt: string;
}

export interface Version {
  _id: string;
  documentId: string;
  versionNumber: number;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  uploadedBy: string | { _id: string; email: string; firstName: string; lastName: string };
  changeLog: string;
  createdAt: string;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DocumentDetailResponse {
  document: Document;
  versions: Version[];
}

export interface UploadResponse {
  message: string;
  document: Document;
}
