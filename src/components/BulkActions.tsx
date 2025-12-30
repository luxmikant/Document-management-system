import { useState } from 'react';
import { Download, Trash2, Tag, Share2, X, Check } from 'lucide-react';
import { useDocumentStore } from '../store';
import { toast } from 'sonner@2.0.3';

export function BulkActions() {
  const { selectedDocuments, clearSelection, deleteDocuments, updateDocument } = useDocumentStore();
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleDelete = () => {
    if (confirm(`Delete ${selectedDocuments.length} document(s)? They will be moved to trash.`)) {
      deleteDocuments(selectedDocuments);
      toast.success(`${selectedDocuments.length} document(s) moved to trash`, {
        action: {
          label: 'Undo',
          onClick: () => {
            // In a real app, implement undo functionality
            toast.success('Restored documents');
          },
        },
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      // In a real app, add tag to all selected documents
      toast.success(`Tag "${newTag}" added to ${selectedDocuments.length} document(s)`);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleDownload = () => {
    toast.success(`Downloading ${selectedDocuments.length} document(s)...`);
    // In a real app, trigger download
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
            {selectedDocuments.length}
          </div>
          <span className="text-slate-900">
            {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!showTagInput ? (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Add tag</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Enter tag name..."
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                aria-label="Add tag"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowTagInput(false);
                  setNewTag('');
                }}
                className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={clearSelection}
            className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
