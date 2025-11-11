import React, { useState } from 'react';
import type { Property, DoorCode } from '../types';
import { ArrowLeftIcon } from './icons';

interface DoorCodeListProps {
  property: Property;
  onBack: () => void;
  onUpdateCode: (code: Pick<DoorCode, 'id' | 'description'>) => Promise<void>;
}

const DoorCodeList: React.FC<DoorCodeListProps> = ({ property, onBack, onUpdateCode }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (dateString?: string, neverText = 'Never updated') => {
    if (!dateString) return neverText;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const startEditing = (code: DoorCode) => {
    setEditingId(code.id);
    setEditText(code.description);
  };

  const handleSave = async (id: string) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateCode({ id, description: editText });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save code:", error);
      alert(`Failed to save code description: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="mb-6">
        <button
          onClick={onBack}
          className="text-primary dark:text-indigo-400 hover:underline inline-flex items-center gap-2 mb-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to {property.name}</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Door Codes</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage descriptions for each door code.</p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          {property.doorCodes.sort((a, b) => a.code_number - b.code_number).map((code) => (
            <div key={code.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <div className="font-mono text-lg bg-primary text-white w-10 h-10 flex items-center justify-center rounded-md flex-shrink-0">
                {code.code_number}
              </div>
              <div className="flex-grow w-full">
                {editingId === code.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(code.id)}
                  />
                ) : (
                  <div className="p-2">
                    <p className="text-slate-700 dark:text-slate-200 min-h-[28px] break-words">
                      {code.description || <span className="text-slate-400 italic">No description</span>}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>Last updated: {formatDate(code.updated_at)}</span>
                      <span>Last used: {formatDate(code.last_used, 'Never used')}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                {editingId === code.id ? (
                  <>
                    <button
                      onClick={() => handleSave(code.id)}
                      className="bg-secondary hover:bg-emerald-600 text-white font-bold py-1 px-3 rounded-md transition-colors text-sm disabled:bg-emerald-300"
                      disabled={isSaving}
                    >
                      {isSaving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-1 px-3 rounded-md transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEditing(code)}
                    className="bg-primary/20 hover:bg-primary/30 text-primary dark:text-indigo-400 font-bold py-1 px-3 rounded-md transition-colors text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoorCodeList;
