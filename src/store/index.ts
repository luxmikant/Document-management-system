import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'viewer' | 'editor' | 'admin';
export type DocumentPermission = 'viewer' | 'editor';
export type ViewMode = 'grid' | 'table';
export type CurrentView = 'dashboard' | 'document-details' | 'upload' | 'permissions' | 'admin';
export type DashboardFilter = 'all' | 'shared' | 'my-uploads' | 'starred' | 'trash';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
}

export interface DocumentVersion {
  id: string;
  version: number;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  changes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: number;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category?: string;
  description?: string;
  starred: boolean;
  trashed: boolean;
  versions: DocumentVersion[];
  permissions: { userId: string; permission: DocumentPermission }[];
  currentVersion: number;
  thumbnailUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

interface DocumentState {
  documents: Document[];
  selectedDocuments: string[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'currentVersion'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocuments: (ids: string[]) => void;
  toggleStar: (id: string) => void;
  addVersion: (id: string, uploadedBy: string, size: number, changes?: string) => void;
  restoreVersion: (docId: string, versionId: string) => void;
  toggleSelectDocument: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
}

interface UIState {
  currentView: CurrentView;
  selectedDocumentId: string | null;
  viewMode: ViewMode;
  dashboardFilter: DashboardFilter;
  searchQuery: string;
  searchFilters: {
    types: string[];
    tags: string[];
    owners: string[];
    dateRange: { from?: Date; to?: Date };
  };
  sidebarCollapsed: boolean;
  uploadModalOpen: boolean;
  setCurrentView: (view: CurrentView) => void;
  setSelectedDocument: (id: string | null) => void;
  toggleViewMode: () => void;
  setDashboardFilter: (filter: DashboardFilter) => void;
  setSearchQuery: (query: string) => void;
  updateSearchFilters: (filters: Partial<UIState['searchFilters']>) => void;
  toggleSidebar: () => void;
  setUploadModalOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      currentUser: null,
      login: async (email: string, password: string) => {
        // Mock login - in production, call your auth API
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUser: User = {
          id: '1',
          name: 'Alex Morgan',
          email,
          role: email.includes('admin') ? 'admin' : 'editor',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          status: 'active'
        };
        set({ isAuthenticated: true, currentUser: mockUser });
      },
      logout: () => {
        set({ isAuthenticated: false, currentUser: null });
      },
      register: async (name: string, email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role: 'editor',
          status: 'active'
        };
        set({ isAuthenticated: true, currentUser: mockUser });
      },
    }),
    { name: 'auth-storage' }
  )
);

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      selectedDocuments: [],
      addDocument: (doc) => {
        const newDoc: Document = {
          ...doc,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
          currentVersion: 1,
          versions: [{
            id: Math.random().toString(36).substr(2, 9),
            version: 1,
            uploadedBy: doc.owner,
            uploadedAt: new Date(),
            size: doc.size,
          }],
        };
        set(state => ({ documents: [...state.documents, newDoc] }));
      },
      updateDocument: (id, updates) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
          )
        }));
      },
      deleteDocuments: (ids) => {
        set(state => ({
          documents: state.documents.map(doc =>
            ids.includes(doc.id) ? { ...doc, trashed: true } : doc
          ),
          selectedDocuments: []
        }));
      },
      toggleStar: (id) => {
        set(state => ({
          documents: state.documents.map(doc =>
            doc.id === id ? { ...doc, starred: !doc.starred } : doc
          )
        }));
      },
      addVersion: (id, uploadedBy, size, changes) => {
        const doc = get().documents.find(d => d.id === id);
        if (!doc) return;
        
        const newVersion: DocumentVersion = {
          id: Math.random().toString(36).substr(2, 9),
          version: doc.currentVersion + 1,
          uploadedBy,
          uploadedAt: new Date(),
          size,
          changes,
        };
        
        set(state => ({
          documents: state.documents.map(d =>
            d.id === id
              ? {
                  ...d,
                  versions: [...d.versions, newVersion],
                  currentVersion: newVersion.version,
                  updatedAt: new Date(),
                  size,
                }
              : d
          )
        }));
      },
      restoreVersion: (docId, versionId) => {
        const doc = get().documents.find(d => d.id === docId);
        if (!doc) return;
        
        const version = doc.versions.find(v => v.id === versionId);
        if (!version) return;
        
        set(state => ({
          documents: state.documents.map(d =>
            d.id === docId
              ? { ...d, currentVersion: version.version, size: version.size, updatedAt: new Date() }
              : d
          )
        }));
      },
      toggleSelectDocument: (id) => {
        set(state => ({
          selectedDocuments: state.selectedDocuments.includes(id)
            ? state.selectedDocuments.filter(docId => docId !== id)
            : [...state.selectedDocuments, id]
        }));
      },
      clearSelection: () => set({ selectedDocuments: [] }),
      selectAll: (ids) => set({ selectedDocuments: ids }),
    }),
    { name: 'document-storage' }
  )
);

export const useUIStore = create<UIState>()((set) => ({
  currentView: 'dashboard',
  selectedDocumentId: null,
  viewMode: 'grid',
  dashboardFilter: 'all',
  searchQuery: '',
  searchFilters: {
    types: [],
    tags: [],
    owners: [],
    dateRange: {},
  },
  sidebarCollapsed: false,
  uploadModalOpen: false,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedDocument: (id) => set({ selectedDocumentId: id }),
  toggleViewMode: () => set(state => ({ viewMode: state.viewMode === 'grid' ? 'table' : 'grid' })),
  setDashboardFilter: (filter) => set({ dashboardFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  updateSearchFilters: (filters) => set(state => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
}));

// Mock data initialization
export const initializeMockData = (userId: string) => {
  const { documents, addDocument } = useDocumentStore.getState();
  
  if (documents.length > 0) return; // Already initialized
  
  const mockDocs: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'versions' | 'currentVersion'>[] = [
    {
      name: 'Q4 2024 Financial Report.pdf',
      type: 'pdf',
      size: 2457600,
      owner: userId,
      tags: ['finance', 'q4', 'report'],
      category: 'Reports',
      description: 'Quarterly financial analysis and projections',
      starred: true,
      trashed: false,
      permissions: [],
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224311-beee2091d292?w=400&h=300&fit=crop',
    },
    {
      name: 'Product Roadmap 2025.pdf',
      type: 'pdf',
      size: 1843200,
      owner: userId,
      tags: ['product', 'roadmap', 'strategy'],
      category: 'Planning',
      starred: false,
      trashed: false,
      permissions: [{ userId: '2', permission: 'editor' }],
      thumbnailUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=400&h=300&fit=crop',
    },
    {
      name: 'Design System Guidelines.pdf',
      type: 'pdf',
      size: 3276800,
      owner: userId,
      tags: ['design', 'guidelines', 'ui'],
      category: 'Design',
      description: 'Complete design system documentation',
      starred: true,
      trashed: false,
      permissions: [],
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    },
    {
      name: 'Marketing Campaign Assets.pdf',
      type: 'pdf',
      size: 4194304,
      owner: '2',
      tags: ['marketing', 'campaign', 'assets'],
      category: 'Marketing',
      starred: false,
      trashed: false,
      permissions: [{ userId, permission: 'viewer' }],
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    },
    {
      name: 'Team Photo 2024.jpg',
      type: 'image',
      size: 1536000,
      owner: userId,
      tags: ['team', 'photo'],
      category: 'Photos',
      starred: false,
      trashed: false,
      permissions: [],
      thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    },
  ];
  
  mockDocs.forEach(doc => addDocument(doc));
};
