import { useState, useEffect, useCallback } from 'react';
import { mtnApiService } from '../services/mtnApi';
import { toast } from 'react-toastify';

export const useMtnAccount = (jwtToken) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [data, setData] = useState({
    profile: null,
    balance: null,
    catalogue: null,
    services: [],
    history: [],
  });

  const fetchAll = useCallback(async () => {
    if (!jwtToken) {
      setError('Token JWT requis');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // D'abord vérifier le JWT
      const jwtInfo = await mtnApiService.verifyJWT(jwtToken);
      const userPhone = jwtInfo.data.phone;
      setPhoneNumber(userPhone);
      
      if (jwtInfo.data.isExpired) {
        toast.warning('⚠️ Le JWT a expiré! Utilisez un token valide');
      }
      
      // Ensuite récupérer toutes les données
      const [balanceResult, catalogueResult, profileResult] = await Promise.all([
        mtnApiService.getBalance(jwtToken),
        mtnApiService.getCatalogue(jwtToken),
        mtnApiService.getProfile(jwtToken),
      ]);
      
      setData({
        profile: profileResult.data,
        balance: balanceResult.data,
        catalogue: catalogueResult.data,
        services: [
          {
            name: 'Internet Mobile',
            status: 'active',
            activationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Service internet mobile MTN'
          }
        ],
        history: [
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'data',
            description: 'Achat forfait 100U',
            amount: -100,
            currency: 'U',
            status: 'completed'
          }
        ]
      });
      
      toast.success(`✅ Données chargées pour ${userPhone}`);
    } catch (err) {
      console.error('❌ Erreur récupération données MTN:', err);
      setError(err.response?.data?.message || err.message);
      toast.error(`❌ Erreur: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [jwtToken]);

  const subscribeToBundle = useCallback(async (bundleData, beneficiaryPhone = null) => {
    try {
      setLoading(true);
      
      // Préparer les données de souscription
      const subscriptionData = {
        product_id: bundleData.id,
        product_name: bundleData.name,
        product_price: bundleData.cost?.value || 0,
        product_type: bundleData.type?.toLowerCase() || 'bundle',
        subscription_provider_id: bundleData.subscription_provider_id || 'MORPH',
        subscription_name: bundleData.subscription_name || 'mobilesurf',
        product_id_for_other: bundleData.nact_code_for_other || bundleData.id,
        product_id_for_momo: bundleData.nact_code_for_momo || bundleData.id,
      };
      
      const isGift = !!beneficiaryPhone && beneficiaryPhone !== phoneNumber;
      
      console.log('\n🎯 ======== DÉBUT SOUSCRIPTION ========');
      console.log('📦 Forfait:', bundleData.name);
      console.log('💰 Prix:', bundleData.cost?.display_name || bundleData.cost?.value);
      console.log('👤 Destinataire:', beneficiaryPhone || 'Moi-même');
      console.log('🎁 Type:', isGift ? 'OFFRE' : 'ACHAT POUR SOI');
      console.log('====================================\n');
      
      const result = await mtnApiService.subscribe(jwtToken, subscriptionData, beneficiaryPhone, isGift);
      
      toast.success(result.message || '✅ Souscription réussie!');
      return result;
    } catch (err) {
      console.error('❌ Erreur souscription:', err);
      toast.error(`❌ Erreur: ${err.response?.data?.message || err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [jwtToken, phoneNumber]);

  useEffect(() => {
    if (jwtToken) {
      fetchAll();
    }
  }, [jwtToken, fetchAll]);

  return {
    data,
    phoneNumber,
    loading,
    error,
    refresh: fetchAll,
    subscribeToBundle,
  };
};