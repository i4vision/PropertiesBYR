import React, { useState, useEffect } from 'react';
import type { Property } from '../types';
import { HomeIcon, TrashIcon, PlusIcon, ChevronRightIcon, ChatBubbleLeftRightIcon, CodeBracketIcon } from './icons';

interface PropertyListProps {
  properties: Property[];
  onAddProperty: (name: string) => Promise<void>;
  onDeleteProperty: (id: string) => Promise<void>;
  onSelectProperty: (id: string) => void;
}

interface HospitableProperty {
  id: string;
  name: string;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onAddProperty, onDeleteProperty, onSelectProperty }) => {
  const [selectedPropertyName, setSelectedPropertyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitableProperties, setHospitableProperties] = useState<HospitableProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdding) {
      console.log('[PropertyList] Starting to fetch Hospitable properties...');
      setIsLoadingProperties(true);
      setLoadError(null);
      
      const url = '/api/hospitable/properties';
      console.log('[PropertyList] Fetching from URL:', url);
      console.log('[PropertyList] Window location:', window.location.href);
      
      fetch(url)
        .then(response => {
          console.log('[PropertyList] Fetch response:', response.status, response.statusText);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('[PropertyList] Received data:', data);
          if (data && Array.isArray(data.data)) {
            console.log('[PropertyList] Total properties from API:', data.data.length);
            
            // Filter out properties that have already been added
            const existingPropertyNames = new Set(properties.map(p => p.name));
            const availableProperties = data.data.filter(
              (prop: HospitableProperty) => !existingPropertyNames.has(prop.name)
            );
            
            console.log('[PropertyList] Available properties (not yet added):', availableProperties.length);
            setHospitableProperties(availableProperties);
          } else {
            console.error('[PropertyList] Unexpected response format:', data);
            setLoadError('Unexpected response format from Hospitable API');
          }
        })
        .catch((error) => {
          console.error("[PropertyList] Error fetching properties:", error);
          setLoadError(`Failed to load properties: ${error.message}`);
        })
        .finally(() => {
          setIsLoadingProperties(false);
          console.log('[PropertyList] Fetch complete');
        });
    }
  }, [isAdding, properties]);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPropertyName && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddProperty(selectedPropertyName);
        setSelectedPropertyName('');
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
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </header>

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
          {isLoadingProperties ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Loading properties from Hospitable...
            </div>
          ) : loadError ? (
            <div className="text-center py-4">
              <p className="text-red-500 dark:text-red-400 mb-4">{loadError}</p>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddProperty} className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedPropertyName}
                onChange={(e) => setSelectedPropertyName(e.target.value)}
                className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                autoFocus
                disabled={isSubmitting}
              >
                <option value="">Select a property from Hospitable</option>
                {hospitableProperties.map((prop) => (
                  <option key={prop.id} value={prop.name}>
                    {prop.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition-colors w-full sm:w-auto disabled:bg-emerald-300"
                  disabled={isSubmitting || !selectedPropertyName}
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
          )}
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
                      <span className="flex items-center gap-1"><CodeBracketIcon className="w-4 h-4" /> {property.doorCodes.filter(code => code.description && code.description.trim() !== '').length} Codes</span>
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
    </div>
  );
};

export default PropertyList;