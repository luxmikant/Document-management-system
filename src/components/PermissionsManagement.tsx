import { useState } from 'react';
import { ArrowLeft, UserPlus, Mail, Shield, Eye, Edit, X, Check } from 'lucide-react';
import { useUIStore, useDocumentStore, useAuthStore, DocumentPermission } from '../store';
import { toast } from 'sonner@2.0.3';

export function PermissionsManagement() {
  const { selectedDocumentId, setCurrentView, setSelectedDocument } = useUIStore();
  const { documents, updateDocument } = useDocumentStore();
  const { currentUser } = useAuthStore();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<DocumentPermission>('viewer');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const document = documents.find(d => d.id === selectedDocumentId);

  if (!document) {
    return null;
  }

  const isOwner = document.owner === currentUser?.id;

  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentView('document-details')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to document
        </button>
        
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-slate-900 mb-2">Permission denied</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            You don't have permission to manage access for this document. Only the owner can modify sharing settings.
          </p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedDocument(document.id);
    setCurrentView('document-details');
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (inviteEmail === currentUser?.email) {
      toast.error('You cannot share with yourself');
      return;
    }

    // Mock: In a real app, validate email and check if user exists
    const mockUserId = Math.random().toString(36).substr(2, 9);
    
    const existingPermission = document.permissions.find(p => p.userId === mockUserId);
    if (existingPermission) {
      toast.error('This user already has access');
      return;
    }

    updateDocument(document.id, {
      permissions: [...document.permissions, { userId: mockUserId, permission: invitePermission }]
    });

    toast.success(`Invited ${inviteEmail} as ${invitePermission}`);
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const handleChangePermission = (userId: string, newPermission: DocumentPermission) => {
    updateDocument(document.id, {
      permissions: document.permissions.map(p =>
        p.userId === userId ? { ...p, permission: newPermission } : p
      )
    });
    toast.success('Permission updated');
  };

  const handleRemoveAccess = (userId: string) => {
    if (confirm('Remove access for this user?')) {
      updateDocument(document.id, {
        permissions: document.permissions.filter(p => p.userId !== userId)
      });
      toast.success('Access removed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to document
      </button>

      <div className="mb-6">
        <h1 className="text-slate-900 mb-2">Manage Access</h1>
        <p className="text-slate-600">Control who can view and edit {document.name}</p>
      </div>

      <div className="space-y-6">
        {/* Invite Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite collaborators
            </h2>
            {!showInviteForm && (
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Add people
              </button>
            )}
          </div>

          {showInviteForm && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-2">
                  Permission level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInvitePermission('viewer')}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      invitePermission === 'viewer'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className={`w-5 h-5 ${invitePermission === 'viewer' ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <span className={invitePermission === 'viewer' ? 'text-indigo-900' : 'text-slate-900'}>
                        Viewer
                      </span>
                    </div>
                    <p className={`text-sm ${invitePermission === 'viewer' ? 'text-indigo-700' : 'text-slate-600'}`}>
                      Can view and download
                    </p>
                  </button>

                  <button
                    onClick={() => setInvitePermission('editor')}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      invitePermission === 'editor'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className={`w-5 h-5 ${invitePermission === 'editor' ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <span className={invitePermission === 'editor' ? 'text-indigo-900' : 'text-slate-900'}>
                        Editor
                      </span>
                    </div>
                    <p className={`text-sm ${invitePermission === 'editor' ? 'text-indigo-700' : 'text-slate-600'}`}>
                      Can edit and upload versions
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleInvite}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Send invite
                </button>
                <button
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail('');
                  }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showInviteForm && document.permissions.length === 0 && (
            <p className="text-slate-500 text-center py-4">
              No collaborators yet. Click "Add people" to invite someone.
            </p>
          )}
        </div>

        {/* Current Access */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-slate-900 mb-4">Who has access</h2>

          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                  alt={currentUser?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-slate-900">{currentUser?.name} (You)</p>
                  <p className="text-slate-600 text-sm">{currentUser?.email}</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Owner
              </span>
            </div>

            {/* Collaborators */}
            {document.permissions.map((permission, index) => (
              <div
                key={permission.userId}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-600">
                      {String.fromCharCode(65 + (index % 26))}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-900">Team Member {index + 1}</p>
                    <p className="text-slate-600 text-sm">member{index + 1}@example.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={permission.permission}
                    onChange={(e) => handleChangePermission(permission.userId, e.target.value as DocumentPermission)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={() => handleRemoveAccess(permission.userId)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                    aria-label="Remove access"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link Sharing (Future Feature) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-slate-900 mb-1">Link sharing</h3>
              <p className="text-slate-600 text-sm mb-3">
                Allow anyone with the link to access this document
              </p>
              <button
                className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm cursor-not-allowed"
                disabled
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
