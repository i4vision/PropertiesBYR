import React, { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WhatsAppGroup } from '../types';
import { XIcon, SearchIcon, ChatBubbleLeftRightIcon } from './icons';

interface FindGroupsModalProps {
  supabase: SupabaseClient;
  onClose: () => void;
}

type SearchResult = {
  propertyName: string;
  groups: WhatsAppGroup[];
} | 'notFound' | null;

export const FindGroupsModal: React.FC<FindGroupsModalProps> = ({ supabase, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResult(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('find-groups-by-property', {
        method: 'POST',
        body: { propertyName: searchTerm.trim() },
      });

      if (invokeError) throw invokeError;
      
      if (data.error) {
        if (data.status === 404) {
            setSearchResult('notFound');
        } else {
            throw new Error(data.error);
        }
      } else {
        setSearchResult({
          propertyName: data.propertyName,
          groups: data.groups,
        });
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" 
        aria-modal="true" 
        role="dialog"
        onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Find Groups by Property</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Close modal">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Enter exact property name..."
              className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
              autoFocus
              disabled={isLoading}
            />
            <button type="submit" className="bg-primary hover:bg-indigo-700 text-white font-bold p-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors disabled:bg-indigo-400" disabled={isLoading}>
              {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="to 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                </>
              ) : (
                <>
                    <SearchIcon className="w-5 h-5" />
                    <span>Search</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="px-6 pb-6 min-h-[150px]">
          {error && (
            <div className="text-center py-4 text-red-500 dark:text-red-400">
                <p><strong>Error:</strong> {error}</p>
            </div>
          )}
          {searchResult === 'notFound' && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              <p>Property not found.</p>
              <p className="text-sm">Please check the name and try again.</p>
            </div>
          )}
          {searchResult && typeof searchResult === 'object' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Groups for: <span className="text-primary font-bold">{searchResult.propertyName}</span>
              </h3>
              {searchResult.groups.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {searchResult.groups.map(group => (
                    <li key={group.id} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200">{group.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-slate-500 dark:text-slate-400">This property has no WhatsApp groups.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
