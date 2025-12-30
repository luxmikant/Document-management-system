import { useMemo, useState } from 'react';
import { 
  Grid3x3, 
  List, 
  Download, 
  Trash2, 
  Tag, 
  Share2,
  MoreVertical,
  CheckSquare,
  Square,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { useDocumentStore, useUIStore, useAuthStore, Document } from '../store';
import { DocumentCard } from './DocumentCard';
import { DocumentTable } from './DocumentTable';
import { BulkActions } from './BulkActions';
import { EmptyState } from './EmptyState';

export function DocumentsDashboard() {
  const { documents, selectedDocuments } = useDocumentStore();
  const { viewMode, toggleViewMode, dashboardFilter, searchQuery, setSelectedDocument, setCurrentView } = useUIStore();
  const { currentUser } = useAuthStore();

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      // Apply dashboard filter
      if (dashboardFilter === 'my-uploads' && doc.owner !== currentUser?.id) return false;
      if (dashboardFilter === 'shared' && doc.owner === currentUser?.id) return false;
      if (dashboardFilter === 'starred' && !doc.starred) return false;
      if (dashboardFilter === 'trash' && !doc.trashed) return false;
      if (dashboardFilter !== 'trash' && doc.trashed) return false;

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
          doc.category?.toLowerCase().includes(query)
        );
      }

      return true;
    });

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [documents, dashboardFilter, searchQuery, currentUser]);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc.id);
    setCurrentView('document-details');
  };

  const getFilterTitle = () => {
    switch (dashboardFilter) {
      case 'all': return 'All Documents';
      case 'shared': return 'Shared with me';
      case 'my-uploads': return 'My uploads';
      case 'starred': return 'Starred';
      case 'trash': return 'Trash';
      default: return 'Documents';
    }
  };

  const getFilterDescription = () => {
    switch (dashboardFilter) {
      case 'all': return 'Browse and manage all your documents';
      case 'shared': return 'Documents others have shared with you';
      case 'my-uploads': return 'Documents you\'ve uploaded';
      case 'starred': return 'Your starred documents for quick access';
      case 'trash': return 'Recently deleted documents';
      default: return '';
    }
  };

  if (filteredDocuments.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-slate-900 mb-2">{getFilterTitle()}</h1>
          <p className="text-slate-600">{getFilterDescription()}</p>
        </div>
        <EmptyState filter={dashboardFilter} hasSearch={!!searchQuery} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-slate-900 mb-2">{getFilterTitle()}</h1>
          <p className="text-slate-600">{getFilterDescription()}</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Grid view"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleViewMode}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && <BulkActions />}

      {/* Documents Grid/Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => handleDocumentClick(doc)}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onDocumentClick={handleDocumentClick}
        />
      )}

      {/* Results Count */}
      <div className="mt-6 text-center">
        <p className="text-slate-600">
          Showing {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
        </p>
      </div>
    </div>
  );
}