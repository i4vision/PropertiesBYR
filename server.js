import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API server running on http://0.0.0.0:${PORT}`);
});
