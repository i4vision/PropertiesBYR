import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Property } from '../types';
import { HomeIcon, TrashIcon, PlusIcon, ChevronRightIcon, ChatBubbleLeftRightIcon, CodeBracketIcon, SearchIcon, DocumentTextIcon } from './icons';
import { FindGroupsModal } from './FindGroupsModal';
import { GetTemplateModal } from './GetTemplateModal';

interface PropertyListProps {
  properties: Property[];
  supabase: SupabaseClient | null;
  onAddProperty: (name: string) => Promise<void>;
  onDeleteProperty: (id: string) => Promise<void>;
  onSelectProperty: (id: string) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, supabase, onAddProperty, onDeleteProperty, onSelectProperty }) => {
  const [newPropertyName, setNewPropertyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isGetTemplateModalOpen, setIsGetTemplateModalOpen] = useState(false);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPropertyName.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddProperty(newPropertyName.trim());
        setNewPropertyName('');
        setIsAdding(false);
      } catch (error) {
        console.error("Failed to add property", error);
        alert(`Error: Could not add property. ${(error as Error).message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleDeleteProperty = async (id: string, propertyName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyName}"?\n\nThis will permanently delete the property and all its WhatsApp groups and door codes.`
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      await onDeleteProperty(id);
    } catch (error) {
      console.error("Failed to delete property", error);
      alert(`Error: Could not delete property. ${(error as Error).message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <header className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <HomeIcon className="w-8 h-8 text-primary" />
          <span>My Properties</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => setIsGetTemplateModalOpen(true)}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Get Template</span>
            </button>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <SearchIcon className="w-5 h-5" />
              <span>Find Groups</span>
            </button>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Property</span>
            </button>
        </div>
      </header>

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
          <form onSubmit={handleAddProperty} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newPropertyName}
              onChange={(e) => setNewPropertyName(e.target.value)}
              placeholder="Enter new property name"
              className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition-colors w-full sm:w-auto disabled:bg-emerald-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-md transition-colors w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {properties.length === 0 && !isAdding ? (
        <div className="text-center py-10 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <HomeIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
          <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">No properties yet</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Click "Add Property" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] "
            >
              <div className="p-4 sm:p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{property.name}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><ChatBubbleLeftRightIcon className="w-4 h-4" /> {property.whatsAppGroups.length} Groups</span>
                      <span className="flex items-center gap-1"><CodeBracketIcon className="w-4 h-4" /> {property.doorCodes.length} Codes</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteProperty(property.id, property.name)}
                    className="p-2 text-slate-500 hover:text-danger hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                    aria-label={`Delete ${property.name}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onSelectProperty(property.id)}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors"
                     aria-label={`View ${property.name}`}
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isSearchModalOpen && supabase && (
        <FindGroupsModal
          supabase={supabase}
          onClose={() => setIsSearchModalOpen(false)}
        />
      )}
      {isGetTemplateModalOpen && supabase && (
        <GetTemplateModal
          supabase={supabase}
          onClose={() => setIsGetTemplateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PropertyList;