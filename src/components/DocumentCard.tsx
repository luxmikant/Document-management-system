import { useState } from 'react';
import { 
  Star, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  FileText,
  Image as ImageIcon,
  File,
  Eye,
  Edit,
  Clock
} from 'lucide-react';
import { Document, useDocumentStore, useAuthStore } from '../store';
import { formatBytes, formatDate } from '../utils/format';

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
}

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { toggleStar, toggleSelectDocument, selectedDocuments } = useDocumentStore();
  const { currentUser } = useAuthStore();
  
  const isSelected = selectedDocuments.includes(document.id);
  const isOwner = document.owner === currentUser?.id;
  const userPermission = document.permissions.find(p => p.userId === currentUser?.id)?.permission;
  const canEdit = isOwner || userPermission === 'editor';

  const getIcon = () => {
    switch (document.type) {
      case 'pdf':
        return FileText;
      case 'image':
        return ImageIcon;
      default:
        return File;
    }
  };

  const Icon = getIcon();

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar(document.id);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelectDocument(document.id);
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white border rounded-xl overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 ${
        isSelected
          ? 'border-indigo-300 ring-2 ring-indigo-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {document.thumbnailUrl ? (
          <img
            src={document.thumbnailUrl}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-slate-300" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <button
              onClick={handleSelectClick}
              className="p-1.5 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
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
            <div className="flex-1" />
            <button
              onClick={handleStarClick}
              className="p-1.5 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
              aria-label={document.starred ? 'Unstar' : 'Star'}
            >
              <Star
                className={`w-4 h-4 ${
                  document.starred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Version Badge */}
        {document.currentVersion > 1 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-xs text-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            v{document.currentVersion}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-slate-900 truncate mb-2 group-hover:text-indigo-600 transition-colors">
          {document.name}
        </h3>
        
        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {document.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">
                +{document.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formatBytes(document.size)}</span>
          <span>{formatDate(document.updatedAt)}</span>
        </div>

        {/* Permission Badge */}
        {!isOwner && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              {userPermission === 'viewer' ? (
                <Eye className="w-3 h-3" />
              ) : (
                <Edit className="w-3 h-3" />
              )}
              <span className="capitalize">{userPermission || 'Viewer'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
