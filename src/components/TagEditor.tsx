import { useState, useRef, useEffect } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { Document, useDocumentStore } from '../store';
import { toast } from 'sonner@2.0.3';

interface TagEditorProps {
  document: Document;
  canEdit: boolean;
}

const POPULAR_TAGS = [
  'finance', 'report', 'design', 'marketing', 'product', 
  'engineering', 'legal', 'hr', 'quarterly', 'annual',
  'proposal', 'contract', 'presentation', 'research', 'analysis'
];

export function TagEditor({ document, canEdit }: TagEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { updateDocument } = useDocumentStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const filteredSuggestions = POPULAR_TAGS.filter(
    tag => 
      !document.tags.includes(tag) && 
      tag.toLowerCase().includes(newTag.toLowerCase())
  );

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;

    if (document.tags.includes(trimmedTag)) {
      toast.error('Tag already exists');
      return;
    }

    updateDocument(document.id, {
      tags: [...document.tags, trimmedTag]
    });
    toast.success(`Tag "${trimmedTag}" added`);
    setNewTag('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    updateDocument(document.id, {
      tags: document.tags.filter(t => t !== tag)
    });
    toast.success(`Tag "${tag}" removed`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(newTag);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  return (
    <div>
      {/* Existing Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {document.tags.length === 0 && !isEditing && (
          <p className="text-slate-500 text-sm">No tags yet</p>
        )}
        
        {document.tags.map((tag) => (
          <span
            key={tag}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
          >
            <Hash className="w-3 h-3" />
            {tag}
            {canEdit && (
              <button
                onClick={() => handleRemoveTag(tag)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100 rounded p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Add Tag Input */}
      {canEdit && (
        <div>
          {isEditing ? (
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={newTag}
                onChange={(e) => {
                  setNewTag(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  setTimeout(() => {
                    setIsEditing(false);
                    setShowSuggestions(false);
                  }, 200);
                }}
                placeholder="Type tag name..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />

              {/* Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && newTag && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  <div className="p-2">
                    <p className="px-2 py-1 text-xs text-slate-500 uppercase tracking-wider">
                      Suggested tags
                    </p>
                    {filteredSuggestions.slice(0, 5).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded transition-colors flex items-center gap-2"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add tag
            </button>
          )}

          {/* Popular Tags Quick Add */}
          {!isEditing && document.tags.length < 5 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.filter(tag => !document.tags.includes(tag))
                  .slice(0, 4)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!canEdit && document.tags.length === 0 && (
        <p className="text-slate-400 text-sm italic">No tags assigned</p>
      )}
    </div>
  );
}
