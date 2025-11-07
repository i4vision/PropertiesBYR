import React, { useState } from 'react';
import type { Property, WhatsAppGroup } from '../types';
import { TrashIcon, PlusIcon, ArrowLeftIcon, LinkIcon } from './icons';

interface WhatsAppGroupDetailProps {
  property: Property;
  groupId: string;
  onBack: () => void;
  onUpdateGroup: (group: Pick<WhatsAppGroup, 'id' | 'template' | 'links'>) => Promise<void>;
}

const WhatsAppGroupDetail: React.FC<WhatsAppGroupDetailProps> = ({ property, groupId, onBack, onUpdateGroup }) => {
  const group = property.whatsAppGroups.find((g) => g.id === groupId);

  const [template, setTemplate] = useState(group?.template || '');
  const [newLink, setNewLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!group) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Group not found.</p>
        <button onClick={onBack} className="mt-4 text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  const handleTemplateSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onUpdateGroup({ id: group.id, template, links: group.links });
      alert('Template saved!');
    } catch (error) {
        console.error("Failed to save template:", error);
        alert(`Failed to save template: ${(error as Error).message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleLinkUpdate = async (newLinks: string[]) => {
      try {
        await onUpdateGroup({ id: group.id, template: group.template, links: newLinks });
      } catch (error) {
        console.error("Failed to update links:", error);
        alert(`Failed to update links: ${(error as Error).message}`);
      }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.trim() && !group.links.includes(newLink.trim())) {
      const newLinks = [...group.links, newLink.trim()];
      handleLinkUpdate(newLinks);
      setNewLink('');
    }
  };

  const handleDeleteLink = (linkToDelete: string) => {
    const newLinks = group.links.filter(link => link !== linkToDelete);
    handleLinkUpdate(newLinks);
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
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{group.name}</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage templates and links for this group.</p>
      </header>

      <div className="space-y-8">
        {/* Template Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Message Template</h2>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={8}
            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Enter your customizable message template here..."
          />
          <button
            onClick={handleTemplateSave}
            className="mt-4 bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:bg-indigo-400"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>

        {/* Links Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <LinkIcon className="w-6 h-6 text-secondary"/>
                Photo & Video Links
            </h2>
            <form onSubmit={handleAddLink} className="flex gap-2 mb-4">
                <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-secondary focus:outline-none"
                />
                <button
                    type="submit"
                    className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-1 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add</span>
                </button>
            </form>
            <div className="space-y-2">
                {group.links.length > 0 ? (
                    group.links.map((link, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate dark:text-indigo-400">
                                {link}
                            </a>
                            <button
                                onClick={() => handleDeleteLink(link)}
                                className="p-1 text-slate-500 hover:text-danger ml-2 flex-shrink-0"
                                aria-label="Delete link"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">No links added yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppGroupDetail;
