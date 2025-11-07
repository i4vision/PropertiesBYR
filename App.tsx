import React, { useState, useEffect } from 'react';
import { createSupabaseClient } from './supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Property, View, WhatsAppGroup, DoorCode } from './types';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import WhatsAppGroupDetail from './components/WhatsAppGroupDetail';
import DoorCodeList from './components/DoorCodeList';

const CredentialsForm: React.FC<{ onConnect: (url: string, key: string) => void }> = ({ onConnect }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && key.trim()) {
      onConnect(url.trim(), key.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">Connect to Supabase</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project URL</label>
            <input
              id="supabase-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="supabase-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Public Anon Key</label>
            <input
              id="supabase-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your anon key"
              required
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [view, setView] = useState<View>({ page: 'propertyList' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check local storage for credentials on initial load
  useEffect(() => {
    const url = localStorage.getItem('supabaseUrl');
    const key = localStorage.getItem('supabaseKey');
    if (url && key) {
      setSupabaseClient(createSupabaseClient(url, key));
    } else {
      setLoading(false);
    }
  }, []);
  
  // Fetch data when the supabase client is available
  useEffect(() => {
    const fetchProperties = async () => {
      if (!supabaseClient) return;
      
      setLoading(true);
      setError(null);

      try {
        const { data: propertiesData, error: propertiesError } = await supabaseClient
          .from('properties')
          .select('id, name');
        
        if (propertiesError) throw propertiesError;

        const propertyIds = propertiesData.map(p => p.id);
        if (propertyIds.length === 0) {
          setProperties([]);
          return;
        }
        
        const { data: groupsData, error: groupsError } = await supabaseClient
          .from('whatsapp_groups')
          .select('*')
          .in('property_id', propertyIds);

        if (groupsError) throw groupsError;

        const { data: codesData, error: codesError } = await supabaseClient
          .from('door_codes')
          .select('*')
          .in('property_id', propertyIds);
        
        if (codesError) throw codesError;

        const combinedProperties: Property[] = propertiesData.map(p => ({
          ...p,
          whatsAppGroups: groupsData.filter(g => g.property_id === p.id).map(g => ({ ...g, links: g.links || [] })),
          doorCodes: codesData.filter(c => c.property_id === p.id),
        }));

        setProperties(combinedProperties);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        const detailedMessage = (err && typeof err === 'object' && 'message' in err) ? (err as {message: string}).message : String(err);
        setError(`Failed to fetch properties:\n${detailedMessage}\nPlease check your Supabase credentials, RLS policies, and network connection.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [supabaseClient]);

  // --- Connection Handlers ---

  const handleConnect = (url: string, key: string) => {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);
    setSupabaseClient(createSupabaseClient(url, key));
  };
  
  const handleDisconnect = () => {
    localStorage.removeItem('supabaseUrl');
    localStorage.removeItem('supabaseKey');
    setSupabaseClient(null); 
  };

  // --- Data Mutation Handlers ---

  const handleAddProperty = async (name: string) => {
    if (!supabaseClient) throw new Error("Supabase client not initialized");
    const { data, error } = await supabaseClient.from('properties').insert({ name }).select().single();
    if (error) throw error;
    
    const codesToInsert = Array.from({length: 11}, (_, i) => ({ property_id: data.id, code_number: i, description: '' }));
    const { data: newCodes, error: codesError } = await supabaseClient.from('door_codes').insert(codesToInsert).select();
    if (codesError) throw codesError;

    setProperties([...properties, { ...data, whatsAppGroups: [], doorCodes: newCodes || [] }]);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!supabaseClient) throw new Error("Supabase client not initialized");
    const { error } = await supabaseClient.from('properties').delete().eq('id', id);
    if (error) throw error;
    setProperties(properties.filter((p) => p.id !== id));
  };
  
  const handleAddGroup = async (propertyId: string, groupName: string) => {
    if (!supabaseClient) throw new Error("Supabase client not initialized");
    const { data, error } = await supabaseClient.from('whatsapp_groups').insert({ property_id: propertyId, name: groupName, template: '', links: [] }).select().single();
    if (error) throw error;
    
    setProperties(properties.map(p => 
      p.id === propertyId ? { ...p, whatsAppGroups: [...p.whatsAppGroups, { ...data, links: data.links || [] }] } : p
    ));
  };
  
  const handleDeleteGroup = async (propertyId: string, groupId: string) => {
      if (!supabaseClient) throw new Error("Supabase client not initialized");
      const { error } = await supabaseClient.from('whatsapp_groups').delete().eq('id', groupId);
      if (error) throw error;
      
      setProperties(properties.map(p => 
        p.id === propertyId ? { ...p, whatsAppGroups: p.whatsAppGroups.filter(g => g.id !== groupId) } : p
      ));
  };

  const handleUpdateGroup = async (propertyId: string, groupUpdate: Pick<WhatsAppGroup, 'id' | 'template' | 'links'>) => {
      if (!supabaseClient) throw new Error("Supabase client not initialized");
      const { data, error } = await supabaseClient.from('whatsapp_groups').update({ template: groupUpdate.template, links: groupUpdate.links }).eq('id', groupUpdate.id).select().single();
      if (error) throw error;

      setProperties(properties.map(p => {
          if (p.id !== propertyId) return p;
          const updatedGroups = p.whatsAppGroups.map(g => g.id === groupUpdate.id ? { ...g, template: data.template, links: data.links || [] } : g);
          return { ...p, whatsAppGroups: updatedGroups };
      }));
  };

  const handleUpdateCode = async (propertyId: string, codeUpdate: Pick<DoorCode, 'id' | 'description'>) => {
    if (!supabaseClient) throw new Error("Supabase client not initialized");
    const { data, error } = await supabaseClient.from('door_codes').update({ description: codeUpdate.description }).eq('id', codeUpdate.id).select().single();
    if (error) throw error;

    setProperties(properties.map(p => {
        if (p.id !== propertyId) return p;
        const updatedCodes = p.doorCodes.map(c => c.id === codeUpdate.id ? { ...c, description: data.description } : c);
        return { ...p, doorCodes: updatedCodes };
    }));
  };

  // --- Render Logic ---

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-slate-500 dark:text-slate-400">Loading...</div>;
  }
  
  if (!supabaseClient) {
    return <CredentialsForm onConnect={handleConnect} />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative max-w-lg" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline whitespace-pre-wrap mt-2">{error}</span>
        </div>
        <button onClick={handleDisconnect} className="mt-6 bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          Try different credentials
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (view.page) {
      case 'propertyList':
        return <PropertyList supabase={supabaseClient} properties={properties} onAddProperty={handleAddProperty} onDeleteProperty={handleDeleteProperty} onSelectProperty={(id) => setView({ page: 'propertyDetail', propertyId: id })} />;
      case 'propertyDetail': {
        const property = properties.find((p) => p.id === view.propertyId);
        if (!property) return <p>Property not found</p>;
        return <PropertyDetail property={property} onBack={() => setView({ page: 'propertyList' })} onAddGroup={(groupName) => handleAddGroup(property.id, groupName)} onDeleteGroup={(groupId) => handleDeleteGroup(property.id, groupId)} onNavigateToGroup={(groupId) => setView({ page: 'whatsAppGroupDetail', propertyId: property.id, groupId })} onNavigateToDoorCodes={() => setView({ page: 'doorCodeList', propertyId: property.id })} />;
      }
      case 'whatsAppGroupDetail': {
        const property = properties.find((p) => p.id === view.propertyId);
        if (!property) return <p>Property not found</p>;
        return <WhatsAppGroupDetail property={property} groupId={view.groupId} onBack={() => setView({ page: 'propertyDetail', propertyId: view.propertyId })} onUpdateGroup={(groupUpdate) => handleUpdateGroup(view.propertyId, groupUpdate)} />;
      }
      case 'doorCodeList': {
        const property = properties.find((p) => p.id === view.propertyId);
        if (!property) return <p>Property not found</p>;
        return <DoorCodeList property={property} onBack={() => setView({ page: 'propertyDetail', propertyId: view.propertyId })} onUpdateCode={(codeUpdate) => handleUpdateCode(view.propertyId, codeUpdate)} />;
      }
      default:
        return <p>Invalid view</p>;
    }
  };

  return <div className="min-h-screen bg-slate-100 dark:bg-slate-900">{renderContent()}</div>;
};

export default App;
