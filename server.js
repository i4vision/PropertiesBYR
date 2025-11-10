import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 8085;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
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

app.get('/api/data', async (req, res) => {
  try {
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

    const { data, error } = await supabase
      .from('properties')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;

    const codesToInsert = Array.from({length: 11}, (_, i) => ({
      property_id: data.id,
      code_number: i,
      description: ''
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
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const { data, error } = await supabase
      .from('whatsapp_groups')
      .insert({
        property_id: propertyId,
        name,
        template: '',
        links: []
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
    
    const { data, error } = await supabase
      .from('door_codes')
      .update({ description })
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API server running on http://0.0.0.0:${PORT}`);
});
