import React, { useState } from 'react';
import type { Property } from '../types';
import { TrashIcon, PlusIcon, ChevronRightIcon, ArrowLeftIcon, ChatBubbleLeftRightIcon, CodeBracketIcon } from './icons';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onAddGroup: (groupName: string) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onNavigateToGroup: (groupId: string) => void;
  onNavigateToDoorCodes: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack, onAddGroup, onDeleteGroup, onNavigateToGroup, onNavigateToDoorCodes }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddGroup(newGroupName.trim());
        setNewGroupName('');
        setIsAdding(false);
      } catch (error) {
        console.error("Failed to add group:", error);
        alert(`Failed to add group: ${(error as Error).message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${groupName}"?\n\nThis will permanently delete the WhatsApp group, its template, and all associated links.`
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
        await onDeleteGroup(groupId);
    } catch (error) {
        console.error("Failed to delete group:", error);
        alert(`Failed to delete group: ${(error as Error).message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="mb-6">
        <button
          onClick={onBack}
          className="text-primary dark:text-indigo-400 hover:underline inline-flex items-center gap-2 mb-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Properties</span>
        </button>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{property.name}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Groups Section */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-secondary" />
                WhatsApp Groups
            </h2>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-lg inline-flex items-center gap-1 transition-colors text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {isAdding && (
            <form onSubmit={handleAddGroup} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New group name"
                className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-secondary focus:outline-none"
                autoFocus
                disabled={isSubmitting}
              />
              <button type="submit" className="bg-secondary hover:bg-emerald-600 text-white font-bold p-2 rounded-md transition-colors disabled:bg-emerald-300" disabled={isSubmitting}>{isSubmitting ? '...' : 'Save'}</button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold p-2 rounded-md transition-colors" disabled={isSubmitting}>X</button>
            </form>
          )}

          <div className="space-y-3">
            {property.whatsAppGroups.length > 0 ? (
                property.whatsAppGroups.map((group) => (
                    <div key={group.id} className="group bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md flex justify-between items-center">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{group.name}</span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDeleteGroup(group.id, group.name)} className="p-1 text-slate-500 hover:text-danger"><TrashIcon className="w-4 h-4" /></button>
                            <button onClick={() => onNavigateToGroup(group.id)} className="p-1 text-slate-500 hover:text-primary"><ChevronRightIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No groups added yet.</p>
            )}
          </div>
        </div>

        {/* Door Codes Section */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md flex flex-col justify-center items-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
             onClick={onNavigateToDoorCodes}>
          <CodeBracketIcon className="w-12 h-12 text-primary mb-3" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Door Codes</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage door codes</p>
          <div className="mt-4 text-primary dark:text-indigo-400 font-semibold flex items-center gap-1">
            <span>Manage Codes</span>
            <ChevronRightIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
