import axios from 'axios';

// URL du backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Service JWT via notre backend
export const jwtApiService = {
  // Décoder un JWT
  async decodeToken(token) {
    const response = await axios.post(`${API_BASE_URL}/api/jwt/decode`, { token });
    return response.data;
  },
  loginWithPhone: async (phoneNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  // Modifier un JWT
  async modifyToken(token, modifications) {
    const response = await axios.post(`${API_BASE_URL}/api/jwt/modify`, { 
      token, 
      modifications 
    });
    return response.data;
  },
  
  // Générer un nouveau JWT
  async generateToken(customValues = {}) {
    const response = await axios.post(`${API_BASE_URL}/api/jwt/generate`, { customValues });
    return response.data;
  },
  
  // Générer des valeurs aléatoires
  async getRandomValues() {
    const response = await axios.get(`${API_BASE_URL}/api/jwt/random-values`);
    return response.data;
  },
};