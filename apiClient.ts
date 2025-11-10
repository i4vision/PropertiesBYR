// In Replit dev environment, frontend is on port 5000 and backend is on 8085
// In Docker deployment, nginx proxies /api requests to backend
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8085'  // Development: direct backend connection
  : window.location.origin;   // Production: nginx proxy

export const apiClient = {
  async getHospitableProperties() {
    const response = await fetch(`${API_BASE}/api/hospitable/properties`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to fetch Hospitable properties');
    }
    return response.json();
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

  async addGroup(propertyId: string, name: string) {
    const response = await fetch(`${API_BASE}/api/properties/${propertyId}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
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
