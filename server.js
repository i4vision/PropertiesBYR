import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to only allow requests from the Vite dev server
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // OR from localhost (Vite proxy)
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('replit.dev')) {
      callback(null, true);
    } else {
      callback(null, true); // For now, allow all - we'll restrict in production
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || 'no origin'}`);
  next();
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory storage fallback for when Supabase is unreachable (Replit dev environment)
let memoryStore = {
  properties: [],
  groups: [],
  doorCodes: [],
  nextId: 1
};
let usingMemoryStorage = false;

// Test Supabase connectivity on startup
(async () => {
  try {
    const { data, error } = await supabase.from('properties').select('id').limit(1);
    if (error && error.message.includes('fetch failed')) {
      console.warn('⚠️  Supabase unreachable - using in-memory storage for development');
      console.warn('⚠️  Data will be lost on server restart');
      console.warn('⚠️  Production deployment will use real Supabase database');
      usingMemoryStorage = true;
    } else {
      console.log('✓ Connected to Supabase database');
    }
  } catch (err) {
    console.warn('⚠️  Supabase unreachable - using in-memory storage for development');
    usingMemoryStorage = true;
  }
})();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    storage: usingMemoryStorage ? 'in-memory' : 'supabase'
  });
});

app.get('/api/hospitable/properties', async (req, res) => {
  try {
    const token = process.env.HOSPITABLE_API_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'Hospitable API token not configured' });
    }

    const response = await fetch('https://public.api.hospitable.com/v2/properties', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Hospitable API returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Hospitable properties:', error);
    res.status(500).json({ error: 'Failed to fetch Hospitable properties', details: error.message });
  }
});

app.get('/api/whatsapp/groups', async (req, res) => {
  try {
    const apiKey = process.env.WHATSAPP_API_KEY;
    let apiUrl = process.env.WHATSAPP_API_URL || 'https://evo01.i4vision.us';
    const instance = process.env.WHATSAPP_INSTANCE || 'MC';
    
    if (!apiKey) {
      return res.status(500).json({ error: 'WhatsApp API key not configured' });
    }

    if (apiUrl.includes('/group/fetchAllGroups')) {
      apiUrl = apiUrl.split('/group/')[0];
    }

    const url = `${apiUrl}/group/fetchAllGroups/${instance}?getParticipants=false`;
    console.log(`Fetching WhatsApp groups from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'apiKey': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`WhatsApp API error (${response.status}):`, errorText);
      throw new Error(`WhatsApp API returned ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching WhatsApp groups:', error);
    res.status(500).json({ error: 'Failed to fetch WhatsApp groups', details: error.message });
  }
});

app.get('/api/data', async (req, res) => {
  try {
    if (usingMemoryStorage) {
      // Use in-memory storage
      const combinedProperties = memoryStore.properties.map(p => ({
        ...p,
        whatsAppGroups: memoryStore.groups.filter(g => g.property_id === p.id).map(g => ({ ...g, links: g.links || [] })),
        doorCodes: memoryStore.doorCodes.filter(c => c.property_id === p.id),
      }));
      return res.json({ properties: combinedProperties });
    }

    console.log('Fetching properties from Supabase...');
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name');
    
    console.log('Properties result:', { data: propertiesData, error: propertiesError });
    
    if (propertiesError) throw propertiesError;

    const propertyIds = propertiesData.map(p => p.id);
    if (propertyIds.length === 0) {
      return res.json({ properties: [] });
    }
    
    const { data: groupsData, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .in('property_id', propertyIds);

    if (groupsError) throw groupsError;

    const { data: codesData, error: codesError} = await supabase
      .from('door_codes')
      .select('*')
      .in('property_id', propertyIds);
    
    if (codesError) throw codesError;

    const combinedProperties = propertiesData.map(p => ({
      ...p,
      whatsAppGroups: groupsData.filter(g => g.property_id === p.id).map(g => ({ ...g, links: g.links || [] })),
      doorCodes: codesData.filter(c => c.property_id === p.id),
    }));

    res.json({ properties: combinedProperties });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Property name is required' });
    }

    if (usingMemoryStorage) {
      // Use in-memory storage
      const newProperty = {
        id: `mem-${memoryStore.nextId++}`,
        name
      };
      memoryStore.properties.push(newProperty);
      
      const newCodes = Array.from({length: 11}, (_, i) => ({
        id: `mem-code-${memoryStore.nextId++}`,
        property_id: newProperty.id,
        code_number: i,
        description: '',
        updated_at: new Date().toISOString()
      }));
      memoryStore.doorCodes.push(...newCodes);
      
      return res.json({
        property: {
          ...newProperty,
          whatsAppGroups: [],
          doorCodes: newCodes
        }
      });
    }

    const { data, error } = await supabase
      .from('properties')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;

    const codesToInsert = Array.from({length: 11}, (_, i) => ({
      property_id: data.id,
      code_number: i,
      description: '',
      updated_at: new Date().toISOString()
    }));
    
    const { data: newCodes, error: codesError } = await supabase
      .from('door_codes')
      .insert(codesToInsert)
      .select();
    
    if (codesError) throw codesError;

    res.json({
      property: {
        ...data,
        whatsAppGroups: [],
        doorCodes: newCodes || []
      }
    });
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ error: 'Failed to add property', details: error.message });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (usingMemoryStorage) {
      memoryStore.properties = memoryStore.properties.filter(p => p.id !== id);
      memoryStore.groups = memoryStore.groups.filter(g => g.property_id !== id);
      memoryStore.doorCodes = memoryStore.doorCodes.filter(c => c.property_id !== id);
      return res.json({ success: true });
    }
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property', details: error.message });
  }
});

app.post('/api/properties/:propertyId/groups', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { name, evolution_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (usingMemoryStorage) {
      const newGroup = {
        id: `mem-group-${memoryStore.nextId++}`,
        property_id: propertyId,
        name,
        template: '',
        links: [],
        evolution_id: evolution_id || null
      };
      memoryStore.groups.push(newGroup);
      return res.json({ group: { ...newGroup, links: newGroup.links || [] } });
    }

    const { data, error } = await supabase
      .from('whatsapp_groups')
      .insert({
        property_id: propertyId,
        name,
        template: '',
        links: [],
        evolution_id: evolution_id || null
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ group: { ...data, links: data.links || [] } });
  } catch (error) {
    console.error('Error adding group:', error);
    res.status(500).json({ error: 'Failed to add group', details: error.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (usingMemoryStorage) {
      memoryStore.groups = memoryStore.groups.filter(g => g.id !== id);
      return res.json({ success: true });
    }
    
    const { error } = await supabase
      .from('whatsapp_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group', details: error.message });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { template, links } = req.body;
    
    if (usingMemoryStorage) {
      const group = memoryStore.groups.find(g => g.id === id);
      if (group) {
        group.template = template;
        group.links = links;
        return res.json({ group: { ...group, links: group.links || [] } });
      }
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const { data, error } = await supabase
      .from('whatsapp_groups')
      .update({ template, links })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ group: { ...data, links: data.links || [] } });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group', details: error.message });
  }
});

app.put('/api/door-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    if (usingMemoryStorage) {
      const doorCode = memoryStore.doorCodes.find(c => c.id === id);
      if (doorCode) {
        doorCode.description = description;
        doorCode.updated_at = new Date().toISOString();
        return res.json({ doorCode });
      }
      return res.status(404).json({ error: 'Door code not found' });
    }
    
    const { data, error } = await supabase
      .from('door_codes')
      .update({ 
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ doorCode: data });
  } catch (error) {
    console.error('Error updating door code:', error);
    res.status(500).json({ error: 'Failed to update door code', details: error.message });
  }
});

app.get('/api/properties/:propertyId/door-codes', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (usingMemoryStorage) {
      const doorCodes = memoryStore.doorCodes.filter(c => c.property_id === propertyId);
      return res.json({ doorCodes });
    }
    
    const { data, error } = await supabase
      .from('door_codes')
      .select('*')
      .eq('property_id', propertyId)
      .order('code_number', { ascending: true });
    
    if (error) throw error;
    res.json({ doorCodes: data || [] });
  } catch (error) {
    console.error('Error fetching door codes:', error);
    res.status(500).json({ error: 'Failed to fetch door codes', details: error.message });
  }
});

app.get('/api/properties/:propertyName/door-codes', async (req, res) => {
  try {
    const { propertyName } = req.params;
    
    if (usingMemoryStorage) {
      const property = memoryStore.properties.find(p => p.name === propertyName);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      const doorCodes = memoryStore.doorCodes
        .filter(c => c.property_id === property.id)
        .sort((a, b) => a.code_number - b.code_number);
      return res.json({ 
        propertyName, 
        propertyId: property.id,
        doorCodes 
      });
    }
    
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('name', propertyName)
      .single();
    
    if (propertyError) {
      if (propertyError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      throw propertyError;
    }
    
    const { data: doorCodes, error: codesError } = await supabase
      .from('door_codes')
      .select('*')
      .eq('property_id', property.id)
      .order('code_number', { ascending: true });
    
    if (codesError) throw codesError;
    
    res.json({ 
      propertyName,
      propertyId: property.id,
      doorCodes: doorCodes || [] 
    });
  } catch (error) {
    console.error('Error fetching door codes:', error);
    res.status(500).json({ error: 'Failed to fetch door codes', details: error.message });
  }
});

app.get('/api/properties/:propertyName/groups', async (req, res) => {
  try {
    const { propertyName } = req.params;
    
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('name', propertyName)
      .single();
    
    if (propertyError) {
      if (propertyError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      throw propertyError;
    }
    
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('property_id', property.id);
    
    if (groupsError) throw groupsError;
    
    res.json({ 
      propertyName, 
      propertyId: property.id,
      groups: groups || [] 
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

app.get('/api/groups/:groupName/template', async (req, res) => {
  try {
    const { groupName } = req.params;
    
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, template, property_id')
      .eq('name', groupName)
      .single();
    
    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Group not found' });
      }
      throw groupError;
    }
    
    res.json({ 
      groupName: group.name,
      groupId: group.id,
      propertyId: group.property_id,
      template: group.template 
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template', details: error.message });
  }
});

// Serve React app for all other routes (must be last)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API server running on http://0.0.0.0:${PORT}`);
});
