import React, { useState, useEffect } from 'react';
import type { Property, View, WhatsAppGroup, DoorCode } from './types';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import WhatsAppGroupDetail from './components/WhatsAppGroupDetail';
import DoorCodeList from './components/DoorCodeList';
import { apiClient } from './apiClient';


const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [view, setView] = useState<View>({ page: 'propertyList' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient.getAllData();
        setProperties(data.properties);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        // In development, Supabase might not be accessible (redirect issues in Replit)
        // Start with empty list - properties can still be added via Hospitable API
        console.warn("Starting with empty properties list. You can add properties from Hospitable API.");
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleAddProperty = async (name: string) => {
    const data = await apiClient.addProperty(name);
    setProperties([...properties, data.property]);
  };

  const handleDeleteProperty = async (id: string) => {
    await apiClient.deleteProperty(id);
    setProperties(properties.filter((p) => p.id !== id));
  };
  
  const handleAddGroup = async (propertyId: string, groupName: string) => {
    const data = await apiClient.addGroup(propertyId, groupName);
    setProperties(properties.map(p => 
      p.id === propertyId ? { ...p, whatsAppGroups: [...p.whatsAppGroups, data.group] } : p
    ));
  };
  
  const handleDeleteGroup = async (propertyId: string, groupId: string) => {
    await apiClient.deleteGroup(groupId);
    setProperties(properties.map(p => 
      p.id === propertyId ? { ...p, whatsAppGroups: p.whatsAppGroups.filter(g => g.id !== groupId) } : p
    ));
  };

  const handleUpdateGroup = async (propertyId: string, groupUpdate: Pick<WhatsAppGroup, 'id' | 'template' | 'links'>) => {
    const data = await apiClient.updateGroup(groupUpdate.id, groupUpdate.template, groupUpdate.links);
    setProperties(properties.map(p => {
      if (p.id !== propertyId) return p;
      const updatedGroups = p.whatsAppGroups.map(g => g.id === groupUpdate.id ? data.group : g);
      return { ...p, whatsAppGroups: updatedGroups };
    }));
  };

  const handleUpdateCode = async (propertyId: string, codeUpdate: Pick<DoorCode, 'id' | 'description'>) => {
    const data = await apiClient.updateDoorCode(codeUpdate.id, codeUpdate.description);
    setProperties(properties.map(p => {
      if (p.id !== propertyId) return p;
      const updatedCodes = p.doorCodes.map(c => c.id === codeUpdate.id ? data.doorCode : c);
      return { ...p, doorCodes: updatedCodes };
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-slate-500 dark:text-slate-400">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative max-w-lg" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline whitespace-pre-wrap mt-2">{error}</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view.page) {
      case 'propertyList':
        return <PropertyList properties={properties} onAddProperty={handleAddProperty} onDeleteProperty={handleDeleteProperty} onSelectProperty={(id) => setView({ page: 'propertyDetail', propertyId: id })} />;
      case 'propertyDetail': {
        const property = properties.find((p) => p.id === view.propertyId);
        if (!property) return <p>Property not found</p>;
        return <PropertyDetail property={property} onBack={() => setView({ page: 'propertyList' })} onAddGroup={(name) => handleAddGroup(property.id, name)} onDeleteGroup={(groupId) => handleDeleteGroup(property.id, groupId)} onNavigateToGroup={(groupId) => setView({ page: 'whatsAppGroupDetail', propertyId: property.id, groupId })} onNavigateToDoorCodes={() => setView({ page: 'doorCodeList', propertyId: property.id })} />;
      }
      case 'whatsAppGroupDetail': {
        const property = properties.find((p) => p.id === view.propertyId);
        if (!property) return <p>Property not found</p>;
        return <WhatsAppGroupDetail property={property} groupId={view.groupId} onBack={() => setView({ page: 'propertyDetail', propertyId: property.id })} onUpdateGroup={(groupUpdate) => handleUpdateGroup(property.id, groupUpdate)} />;
      }
      case 'doorCodeList': {
        const property = properties.find((p) => p.id === view.propertyId);
        if (!property) return <p>Property not found</p>;
        return <DoorCodeList property={property} onBack={() => setView({ page: 'propertyDetail', propertyId: property.id })} onUpdateCode={(codeUpdate) => handleUpdateCode(property.id, codeUpdate)} />;
      }
      default:
        return <p>Unknown view</p>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {renderContent()}
    </div>
  );
};

export default App;
