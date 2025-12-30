import { 
  Star, 
  FileText, 
  Image as ImageIcon, 
  File,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { Document, useDocumentStore, useAuthStore } from '../store';
import { formatBytes, formatDate } from '../utils/format';

interface DocumentTableProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
}

export function DocumentTable({ documents, onDocumentClick }: DocumentTableProps) {
  const { toggleStar, toggleSelectDocument, selectedDocuments, clearSelection, selectAll } = useDocumentStore();
  const { currentUser } = useAuthStore();

  const allSelected = documents.length > 0 && documents.every(doc => selectedDocuments.includes(doc.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(documents.map(d => d.id));
    }
  };

  const getIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'image':
        return ImageIcon;
      default:
        return File;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-12 px-4 py-3">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center"
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                >
                  {allSelected ? (
                    <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-slate-400 rounded" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase tracking-wider">Tags</th>
              <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase tracking-wider">Modified</th>
              <th className="px-4 py-3 text-left text-xs text-slate-600 uppercase tracking-wider">Access</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const Icon = getIcon(doc.type);
              const isSelected = selectedDocuments.includes(doc.id);
              const isOwner = doc.owner === currentUser?.id;
              const userPermission = doc.permissions.find(p => p.userId === currentUser?.id)?.permission;

              return (
                <tr
                  key={doc.id}
                  onClick={() => onDocumentClick(doc)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                    isSelected ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectDocument(doc.id);
                      }}
                      className="flex items-center justify-center"
                      aria-label={isSelected ? 'Deselect' : 'Select'}
                    >
                      {isSelected ? (
                        <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-slate-400 rounded" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 truncate">{doc.name}</p>
                        {doc.category && (
                          <p className="text-slate-500 text-sm truncate">{doc.category}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(doc.id);
                        }}
                        className="flex-shrink-0"
                        aria-label={doc.starred ? 'Unstar' : 'Star'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            doc.starred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                          } transition-colors`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">
                          +{doc.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatBytes(doc.size)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDate(doc.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {isOwner ? (
                      <span className="text-slate-600 text-sm">Owner</span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        {userPermission === 'viewer' ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <Edit className="w-3.5 h-3.5" />
                        )}
                        <span className="capitalize">{userPermission || 'Viewer'}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      aria-label="More actions"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
