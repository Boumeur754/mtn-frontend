import axios from 'axios';

// URL du backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Service MTN via notre backend
export const mtnApiService = {
  // Vérifier un JWT
  async verifyJWT(jwtToken) {
    console.log('🔍 Vérification du JWT...');
    const response = await axios.post(`${API_BASE_URL}/api/mtn/verify-jwt`, { jwtToken });
    console.log('✅ JWT vérifié:', response.data.data.phone);
    return response.data;
  },
  
  // Récupérer le solde
  async getBalance(jwtToken) {
    console.log('💰 Récupération du solde...');
    const response = await axios.post(`${API_BASE_URL}/api/mtn/balances`, { jwtToken });
    console.log('✅ Solde récupéré');
    return response.data;
  },
  
  // Récupérer le catalogue
  async getCatalogue(jwtToken) {
    console.log('📦 Récupération du catalogue...');
    const response = await axios.post(`${API_BASE_URL}/api/mtn/catalogue`, { jwtToken });
    console.log('✅ Catalogue récupéré');
    return response.data;
  },
  
  // Récupérer le profil
  async getProfile(jwtToken) {
    console.log('👤 Récupération du profil...');
    const response = await axios.post(`${API_BASE_URL}/api/mtn/profile`, { jwtToken });
    console.log('✅ Profil récupéré');
    return response.data;
  },
  
  // Souscrire à un forfait
  async subscribe(jwtToken, subscriptionData, beneficiaryPhone, isGift = false) {
    console.log('🎯 Préparation de la souscription...');
    console.log('📋 Données:', {
      product_id: subscriptionData.product_id,
      product_name: subscriptionData.product_name,
      beneficiary: beneficiaryPhone || 'Moi-même',
      isGift
    });
    
    const response = await axios.post(`${API_BASE_URL}/api/mtn/subscribe`, {
      jwtToken,
      subscriptionData,
      beneficiaryPhone,
      isGift
    });
    
    console.log('✅ Souscription envoyée au backend');
    return response.data;
  },
  
  // Tester la connexion
  async ping() {
    const response = await axios.get(`${API_BASE_URL}/api/mtn/ping`);
    return response.data;
  }
};