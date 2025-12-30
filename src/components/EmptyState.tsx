import { FileText, Upload, Search, Trash2, Star, Share2, FolderOpen } from 'lucide-react';
import { DashboardFilter, useUIStore } from '../store';

interface EmptyStateProps {
  filter: DashboardFilter;
  hasSearch: boolean;
}

export function EmptyState({ filter, hasSearch }: EmptyStateProps) {
  const { setUploadModalOpen, setSearchQuery } = useUIStore();

  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-slate-900 mb-2">No results found</h2>
        <p className="text-slate-600 text-center max-w-md mb-6">
          We couldn't find any documents matching your search. Try different keywords or filters.
        </p>
        <button
          onClick={() => setSearchQuery('')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Clear search
        </button>
      </div>
    );
  }

  const getEmptyStateContent = () => {
    switch (filter) {
      case 'trash':
        return {
          icon: Trash2,
          title: 'Trash is empty',
          description: 'Deleted documents will appear here. Files in trash are automatically removed after 30 days.',
          action: null,
        };
      case 'starred':
        return {
          icon: Star,
          title: 'No starred documents',
          description: 'Star your important documents for quick access. Click the star icon on any document to add it here.',
          action: null,
        };
      case 'shared':
        return {
          icon: Share2,
          title: 'No shared documents',
          description: 'Documents that others share with you will appear here. Ask your teammates to share files with you.',
          action: null,
        };
      case 'my-uploads':
        return {
          icon: FolderOpen,
          title: 'No uploads yet',
          description: 'Upload your first document to get started. All your uploaded files will appear here.',
          action: {
            label: 'Upload document',
            onClick: () => setUploadModalOpen(true),
          },
        };
      default:
        return {
          icon: FileText,
          title: 'No documents yet',
          description: 'Get started by uploading your first document. Drag and drop or click the upload button to begin.',
          action: {
            label: 'Upload your first document',
            onClick: () => setUploadModalOpen(true),
          },
        };
    }
  };

  const content = getEmptyStateContent();
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>
      <h2 className="text-slate-900 mb-2">{content.title}</h2>
      <p className="text-slate-600 text-center max-w-md mb-6">{content.description}</p>
      {content.action && (
        <button
          onClick={content.action.onClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md"
        >
          <Upload className="w-4 h-4" />
          {content.action.label}
        </button>
      )}
    </div>
  );
}
