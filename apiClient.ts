// API base URL configuration
// Both dev and production use relative URLs:
// - Development (Replit): Vite proxy routes /api -> localhost:8085
// - Production (Docker): nginx routes /api -> backend container
const API_BASE = '';
console.log('[apiClient] Using API_BASE:', API_BASE, '(relative URLs)');

export const apiClient = {
  async getHospitableProperties() {
    try {
      console.log('Fetching from:', `${API_BASE}/api/hospitable/properties`);
      const response = await fetch(`${API_BASE}/api/hospitable/properties`);
      console.log('Response status:', response.status, response.statusText);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ details: 'Unknown error' }));
        console.error('API error response:', error);
        throw new Error(error.details || 'Failed to fetch Hospitable properties');
      }
      const data = await response.json();
      console.log('Received data:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },

  async getWhatsAppGroups() {
    try {
      console.log('Fetching WhatsApp groups from:', `${API_BASE}/api/whatsapp/groups`);
      const response = await fetch(`${API_BASE}/api/whatsapp/groups`);
      console.log('WhatsApp groups response status:', response.status, response.statusText);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ details: 'Unknown error' }));
        console.error('WhatsApp API error response:', error);
        throw new Error(error.details || 'Failed to fetch WhatsApp groups');
      }
      const data = await response.json();
      console.log('Received WhatsApp groups:', data);
      return data;
    } catch (error) {
      console.error('WhatsApp fetch error:', error);
      throw error;
    }
  },

  async getAllData() {
    try {
      const response = await fetch(`${API_BASE}/api/data`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ details: `HTTP ${response.status}` }));
        throw new Error(error.details || error.error || 'Failed to fetch data');
      }
      return response.json();
    } catch (error) {
      console.error('getAllData error:', error);
      throw error;
    }
  },

  async addProperty(name: string) {
    const response = await fetch(`${API_BASE}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to add property');
    }
    return response.json();
  },

  async deleteProperty(id: string) {
    const response = await fetch(`${API_BASE}/api/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to delete property');
    }
    return response.json();
  },

  async addGroup(propertyId: string, name: string, evolution_id?: string) {
    const response = await fetch(`${API_BASE}/api/properties/${propertyId}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, evolution_id }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to add group');
    }
    return response.json();
  },

  async deleteGroup(id: string) {
    const response = await fetch(`${API_BASE}/api/groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to delete group');
    }
    return response.json();
  },

  async updateGroup(id: string, template: string, links: string[]) {
    const response = await fetch(`${API_BASE}/api/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, links }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to update group');
    }
    return response.json();
  },

  async updateDoorCode(id: string, description: string) {
    const response = await fetch(`${API_BASE}/api/door-codes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to update door code');
    }
    return response.json();
  },
};
