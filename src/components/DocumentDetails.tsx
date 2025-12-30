import { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Trash2, 
  Star,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  File,
  Calendar,
  User,
  HardDrive,
  Tag as TagIcon,
  Clock,
  Edit,
  Eye,
  Shield,
  Upload
} from 'lucide-react';
import { useDocumentStore, useUIStore, useAuthStore } from '../store';
import { formatBytes, formatDateTime } from '../utils/format';
import { VersionHistory } from './VersionHistory';
import { TagEditor } from './TagEditor';
import { toast } from 'sonner@2.0.3';

export function DocumentDetails() {
  const { selectedDocumentId, setCurrentView, setSelectedDocument } = useUIStore();
  const { documents, toggleStar, addVersion } = useDocumentStore();
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'activity'>('preview');
  
  const document = documents.find(d => d.id === selectedDocumentId);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-slate-600">Document not found</p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

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

  const handleBack = () => {
    setSelectedDocument(null);
    setCurrentView('dashboard');
  };

  const handleShare = () => {
    setSelectedDocument(document.id);
    setCurrentView('permissions');
  };

  const handleUploadNewVersion = () => {
    if (!canEdit) {
      toast.error('You don\'t have permission to upload new versions', {
        description: 'Contact the document owner to request editor access.'
      });
      return;
    }
    
    // Simulate upload
    addVersion(document.id, currentUser!.id, document.size * 1.1, 'Updated content');
    toast.success('New version uploaded successfully');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to documents
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-indigo-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-slate-900 truncate">{document.name}</h1>
                <p className="text-slate-600">Version {document.currentVersion}</p>
              </div>
            </div>

            {document.description && (
              <p className="text-slate-600 mt-2">{document.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => toggleStar(document.id)}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              aria-label={document.starred ? 'Unstar' : 'Star'}
            >
              <Star
                className={`w-5 h-5 ${
                  document.starred ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
              />
            </button>
            <button
              onClick={() => toast.success('Download started')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            {canEdit && (
              <button
                onClick={handleUploadNewVersion}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">New version</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 px-4 py-3 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`flex-1 px-4 py-3 transition-colors ${
                  activeTab === 'versions'
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Versions ({document.versions.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 px-4 py-3 transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Activity
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'preview' && (
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden">
                  {document.thumbnailUrl ? (
                    <img
                      src={document.thumbnailUrl}
                      alt={document.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Icon className="w-24 h-24 text-slate-300 mb-4" />
                      <p className="text-slate-500">Preview not available</p>
                      <p className="text-slate-400 text-sm mt-1">Download to view this file</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'versions' && <VersionHistory document={document} canEdit={canEdit} />}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="flex gap-3 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Upload className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900">Document uploaded</p>
                      <p className="text-slate-500 text-sm">{formatDateTime(document.createdAt)}</p>
                    </div>
                  </div>
                  {document.versions.slice(1).reverse().map((version, index) => (
                    <div key={version.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900">New version uploaded (v{version.version})</p>
                        {version.changes && (
                          <p className="text-slate-600 text-sm mt-1">{version.changes}</p>
                        )}
                        <p className="text-slate-500 text-sm mt-1">{formatDateTime(version.uploadedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Metadata */}
        <div className="space-y-6">
          {/* Permission Badge */}
          {!isOwner && (
            <div className={`p-4 rounded-xl border ${
              userPermission === 'editor'
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {userPermission === 'editor' ? (
                  <Edit className="w-4 h-4 text-green-700" />
                ) : (
                  <Eye className="w-4 h-4 text-blue-700" />
                )}
                <span className={`capitalize ${
                  userPermission === 'editor' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {userPermission || 'Viewer'} access
                </span>
              </div>
              <p className={`text-sm ${
                userPermission === 'editor' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {userPermission === 'editor'
                  ? 'You can edit this document and upload new versions'
                  : 'You can view and download this document'}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                Tags
              </h3>
            </div>
            <TagEditor document={document} canEdit={canEdit} />
          </div>

          {/* Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-slate-900">Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-sm">Owner</p>
                  <p className="text-slate-900 truncate">
                    {isOwner ? 'You' : 'Team member'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-sm">Created</p>
                  <p className="text-slate-900">{formatDateTime(document.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-sm">Modified</p>
                  <p className="text-slate-900">{formatDateTime(document.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HardDrive className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-sm">Size</p>
                  <p className="text-slate-900">{formatBytes(document.size)}</p>
                </div>
              </div>

              {document.category && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-500 text-sm">Category</p>
                    <p className="text-slate-900">{document.category}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-sm">Sharing</p>
                  <p className="text-slate-900">
                    {document.permissions.length === 0
                      ? 'Private'
                      : `${document.permissions.length} ${document.permissions.length === 1 ? 'person' : 'people'}`}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="w-full mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Manage access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
