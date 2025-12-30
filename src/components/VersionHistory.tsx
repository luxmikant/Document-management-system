import { Download, RotateCcw, Eye } from 'lucide-react';
import { Document, useDocumentStore, useAuthStore } from '../store';
import { formatBytes, formatDateTime } from '../utils/format';
import { toast } from 'sonner@2.0.3';

interface VersionHistoryProps {
  document: Document;
  canEdit: boolean;
}

export function VersionHistory({ document, canEdit }: VersionHistoryProps) {
  const { restoreVersion } = useDocumentStore();
  const { currentUser } = useAuthStore();

  const handleRestore = (versionId: string, versionNumber: number) => {
    if (!canEdit) {
      toast.error('You don\'t have permission to restore versions', {
        description: 'Contact the document owner to request editor access.'
      });
      return;
    }

    if (versionNumber === document.currentVersion) {
      toast.info('This is already the current version');
      return;
    }

    if (confirm(`Restore to version ${versionNumber}? This will create a new version.`)) {
      restoreVersion(document.id, versionId);
      toast.success(`Restored to version ${versionNumber}`, {
        description: 'A new version has been created with this content.'
      });
    }
  };

  const sortedVersions = [...document.versions].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-1">
      {sortedVersions.map((version) => {
        const isCurrent = version.version === document.currentVersion;
        const uploadedByCurrentUser = version.uploadedBy === currentUser?.id;

        return (
          <div
            key={version.id}
            className={`p-4 rounded-xl border transition-all ${
              isCurrent
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`${isCurrent ? 'text-indigo-900' : 'text-slate-900'}`}>
                    Version {version.version}
                  </h4>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-xs">
                      Current
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mb-2 ${isCurrent ? 'text-indigo-700' : 'text-slate-600'}`}>
                  Uploaded by {uploadedByCurrentUser ? 'you' : 'team member'} on {formatDateTime(version.uploadedAt)}
                </p>

                {version.changes && (
                  <p className={`text-sm italic ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                    "{version.changes}"
                  </p>
                )}

                <p className={`text-sm mt-2 ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {formatBytes(version.size)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toast.success('Download started')}
                  className={`p-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Download this version"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                {!isCurrent && (
                  <button
                    onClick={() => handleRestore(version.id, version.version)}
                    className={`p-2 rounded-lg transition-colors ${
                      canEdit
                        ? 'bg-white text-slate-600 hover:bg-slate-100'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title={canEdit ? 'Restore this version' : 'You don\'t have permission to restore'}
                    disabled={!canEdit}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Version Timeline Visualization */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="text-slate-700 mb-4">Version Timeline</h4>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-slate-200" />
          {sortedVersions.map((version, index) => {
            const isCurrent = version.version === document.currentVersion;
            return (
              <div key={version.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                    isCurrent
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200'
                      : 'bg-white border-2 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>v{version.version}</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className={`text-sm ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>
                    {formatDateTime(version.uploadedAt)}
                  </p>
                  {version.changes && (
                    <p className="text-sm text-slate-500 mt-1">{version.changes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
