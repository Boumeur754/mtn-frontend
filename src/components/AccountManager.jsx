import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, CreditCard, Package, History, Gift, 
  RefreshCw, Phone, CheckCircle, AlertCircle,
  Wifi, MessageSquare, PhoneCall, ChevronRight,
  Filter, Search, DollarSign, Clock, Globe,
  X, AlertTriangle, Loader2, Send, Database,
  Shield, Download, Mail, Calendar, Users,
  Battery, BatteryCharging, Zap, Activity,
  Bell, Settings, LogOut, Home, BarChart,
  TrendingUp, Tag, Star, Award, Crown,
  Eye, EyeOff, Lock, Unlock, Radio,
  MapPin, Flag, Heart, ShoppingCart, Truck,Code
} from 'lucide-react';
import { useMtnAccount } from '../hooks/useMtnAccount';
import { toast } from 'react-toastify';

const AccountManager = () => {
  // États principauxCode 
  const [jwtToken, setJwtToken] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la modal de souscription
  const [subscriptionModal, setSubscriptionModal] = useState({
    isOpen: false,
    bundle: null,
    beneficiaryPhone: '',
    subscriptionType: 'self',
    isLoading: false,
    showConfirmation: false
  });

  // États pour la modal de confirmation
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null
  });

  // États pour les préférences
  const [showBalance, setShowBalance] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // secondes

  // Charger le token depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('mtn_jwt_token');
    if (savedToken) {
      setJwtToken(savedToken);
      toast.success('Configuration terminée avec succès');
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !jwtToken) return;
    
    const interval = setInterval(() => {
      refresh();
      toast.info('🔄 Données actualisées automatiquement');
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, jwtToken]);

  // Hook personnalisé pour les données MTN
  const {
    data,
    phoneNumber,
    loading,
    error,
    refresh,
    subscribeToBundle
  } = useMtnAccount(jwtToken);

  // Gestion du formulaire JWT
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!jwtToken || jwtToken.trim().length < 50) {
      toast.warning('Veuillez entrer un token JWT valide (min 50 caractères)');
      return;
    }
    
    localStorage.setItem('mtn_jwt_token', jwtToken);
    
    // Vérifier le format du token
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      toast.warning('Format JWT invalide. Il doit avoir 3 parties séparées par des points.');
      return;
    }
    
    toast.success('✅ Token JWT enregistré avec succès');
    
    // Décoder et afficher les infos du token
    try {
      const payload = JSON.parse(atob(parts[1]));
      const phone = payload['https://mymtn.com/phone_number'] || payload.phone_number;
      const exp = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Inconnue';
      
      console.log('🔍 Token décodé:', {
        téléphone: phone,
        expiration: exp,
        pays: payload['https://mymtn.com/country'] || payload.country,
        algorithm: parts[0] ? JSON.parse(atob(parts[0])).alg : 'Inconnu'
      });
    } catch (err) {
      console.warn('⚠️ Impossible de décoder le JWT:', err.message);
    }
  };

  // Effacer les données
  const handleClearData = () => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment effacer le token JWT et toutes les données de session ?',
      action: () => {
        localStorage.removeItem('mtn_jwt_token');
        setJwtToken('');
        toast.info('🔓 Token effacé. Session terminée.');
        setConfirmationModal({ isOpen: false, title: '', message: '', action: null });
      }
    });
  };

  // Exporter les données
  const exportData = () => {
    const exportObj = {
      timestamp: new Date().toISOString(),
      phoneNumber,
      data
    };
    
    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mtn-account-${phoneNumber || 'data'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('📁 Données exportées avec succès');
  };

  // Ouvrir la modal de souscription
  const openSubscriptionModal = (bundle) => {
    if (!bundle) return;
    
    setSubscriptionModal({
      isOpen: true,
      bundle,
      beneficiaryPhone: '',
      subscriptionType: bundle.can_buy_for_self ? 'self' : 'gift',
      isLoading: false,
      showConfirmation: false
    });
  };

  // Fermer la modal
  const closeSubscriptionModal = () => {
    setSubscriptionModal({
      isOpen: false,
      bundle: null,
      beneficiaryPhone: '',
      subscriptionType: 'self',
      isLoading: false,
      showConfirmation: false
    });
  };

  // Valider et exécuter la souscription
  const executeSubscription = async () => {
    const { bundle, beneficiaryPhone, subscriptionType } = subscriptionModal;
    
    if (!bundle) return;
    
    // Validation
    if (subscriptionType === 'gift') {
      if (!beneficiaryPhone) {
        toast.error('❌ Veuillez entrer un numéro de bénéficiaire');
        return;
      }
      
      // Normaliser le numéro
      let normalizedPhone = beneficiaryPhone;
      if (!beneficiaryPhone.startsWith('+') && !beneficiaryPhone.startsWith('237')) {
        normalizedPhone = '+237' + beneficiaryPhone;
      } else if (beneficiaryPhone.startsWith('237')) {
        normalizedPhone = '+' + beneficiaryPhone;
      }
      
      // Validation du format
      const phoneRegex = /^(\+237|237)[0-9]{9}$/;
      if (!phoneRegex.test(normalizedPhone)) {
        toast.error('❌ Format de numéro invalide. Exemple: +237612345678');
        return;
      }
      
      // Vérifier que ce n'est pas le même numéro
      if (normalizedPhone === phoneNumber) {
        toast.warning('⚠️ Vous ne pouvez pas vous offrir un forfait à vous-même');
        return;
      }
      
      // Mettre à jour avec le numéro normalisé
      setSubscriptionModal(prev => ({ ...prev, beneficiaryPhone: normalizedPhone }));
    }
    
    // Afficher la confirmation
    setSubscriptionModal(prev => ({ ...prev, showConfirmation: true }));
  };

  // Confirmer et envoyer la souscription
  const confirmSubscription = async () => {
    const { bundle, beneficiaryPhone, subscriptionType } = subscriptionModal;
    
    setSubscriptionModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('\n🎯 ======== DÉBUT DE LA REQUÊTE MTN ========');
      console.log('📦 Forfait:', bundle.name);
      console.log('💰 Prix:', bundle.cost?.display_name || bundle.cost?.value);
      console.log('👤 Acheteur (JWT):', phoneNumber);
      console.log('🎁 Destinataire:', subscriptionType === 'gift' ? beneficiaryPhone : 'Moi-même');
      console.log('🔗 Product ID:', bundle.id);
      console.log('🏷️ NACT Code:', bundle.nact_code);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('==========================================\n');
      
      const beneficiary = subscriptionType === 'gift' ? beneficiaryPhone : null;
      const result = await subscribeToBundle(bundle, beneficiary);
      
      console.log('✅ Réponse de l\'API MTN:', result);
      
      toast.success(
        subscriptionType === 'gift' 
          ? `🎁 Forfait offert à ${beneficiaryPhone} !` 
          : `✅ Souscription à ${bundle.name} réussie !`
      );
      
      closeSubscriptionModal();
      
      // Rafraîchir les données après un délai
      setTimeout(() => {
        refresh();
        toast.info('🔄 Données actualisées');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erreur lors de la souscription:', error);
      setSubscriptionModal(prev => ({ ...prev, isLoading: false, showConfirmation: false }));
    }
  };

  // Formater le prix
  const formatPrice = (cost) => {
    if (!cost) return 'N/A';
    if (cost.display_name) return cost.display_name;
    return `${cost.value || 0} ${cost.currency || 'FCFA'}`;
  };

  // Formater la taille
  const formatSize = (size) => {
    if (!size) return 'N/A';
    if (size.display_name) {
      if (size.display_name === 'UNLIMITED') return 'Illimité';
      return size.display_name;
    }
    return `${size.value || 0} ${size.unit || 'MB'}`;
  };

  // Extraire tous les forfaits du catalogue
  const getAllBundles = useCallback(() => {
    if (!data.catalogue || !Array.isArray(data.catalogue)) return [];
    
    const allBundles = [];
    
    // Parcourir tous les produits du catalogue
    data.catalogue.forEach(product => {
      if (product.categories && Array.isArray(product.categories)) {
        product.categories.forEach(category => {
          if (category.bundles && Array.isArray(category.bundles)) {
            category.bundles.forEach(bundle => {
              allBundles.push({
                ...bundle,
                productName: product.name,
                categoryName: category.name,
                productId: product.id,
                categoryId: category.id
              });
            });
          }
        });
      }
    });
    
    return allBundles;
  }, [data.catalogue]);

  // Filtrer les forfaits
  const getFilteredBundles = useMemo(() => {
    let bundles = getAllBundles();
    
    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      bundles = bundles.filter(bundle => {
        if (filterCategory === 'data') return bundle.type === 'Data';
        if (filterCategory === 'voice') return bundle.type === 'Voice';
        if (filterCategory === 'sms') return bundle.type === 'SMS';
        if (filterCategory === 'combo') return bundle.combo;
        if (filterCategory === 'cheap') return (bundle.cost?.value || 0) <= 500;
        if (filterCategory === 'unlimited') return bundle.unlimited || bundle.size?.display_name === 'UNLIMITED';
        if (filterCategory === 'night') return bundle.name?.toLowerCase().includes('night');
        if (filterCategory === 'social') return bundle.name?.toLowerCase().includes('whatsapp') || 
                                             bundle.name?.toLowerCase().includes('tiktok') || 
                                             bundle.name?.toLowerCase().includes('social');
        return true;
      });
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      bundles = bundles.filter(bundle => 
        bundle.name?.toLowerCase().includes(term) ||
        bundle.description?.toLowerCase().includes(term) ||
        bundle.type?.toLowerCase().includes(term) ||
        bundle.productName?.toLowerCase().includes(term)
      );
    }
    
    return bundles;
  }, [getAllBundles, filterCategory, searchTerm]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const bundles = getAllBundles();
    return {
      totalBundles: bundles.length,
      dataBundles: bundles.filter(b => b.type === 'Data').length,
      voiceBundles: bundles.filter(b => b.type === 'Voice').length,
      cheapBundles: bundles.filter(b => (b.cost?.value || 0) <= 500).length,
      unlimitedBundles: bundles.filter(b => b.unlimited || b.size?.display_name === 'UNLIMITED').length
    };
  }, [getAllBundles]);

  // Si pas de token JWT, afficher le formulaire d'entrée
  if (!jwtToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mtn-gray-light to-gray-100 flex items-center justify-center p-4">
        <div className="mtn-card p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="bg-mtn-yellow w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-mtn-black" />
            </div>
            <h1 className="text-3xl font-bold text-mtn-gray-dark mb-2">
              Connexion MTN Account
            </h1>
            <p className="text-mtn-gray">
              Entrez votre token JWT pour accéder à votre compte MTN
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mtn-label">
                <Lock className="w-4 h-4 inline mr-2" />
                Token JWT MTN
              </label>
              <textarea
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjR2MC1ONUlKalZ2blp0M1pjV21tXyJ9.eyJodHRwczovL215bXRuLmNvbS9sb2dpbkNvdW50Ijo0LCJodHRwczovL215bXRuLmNvbS9waG9uZV9udW1iZXIiOiIrMjM3NjEyMzQ1Njc4IiwiaHR0cHM6Ly9teW10bi5jb20vY291bnRyeSI6IkNNUiIsIm5pY2tuYW1lIjoiKzIzNzYxMjM0NTY3OCIsIm5hbWUiOiIrMjM3NjEyMzQ1Njc4IiwicGljdHVyZSI6Imh0dHBzOi8vY2RuLmF1dGgwLmNvbS9hdmF0YXJzLzIucG5nIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMjlUMDQ6MDY6MjYuMjE2WiIsImlzcyI6Imh0dHBzOi8vbXRuY20tcHJvZC5tdG4uYXV0aDAuY29tLyIsImF1ZCI6IkZUbEk1aFpOS2NpWVRRaG0zR05HbVdUTFl0WkphYXg4Iiwic3ViIjoic21zfDY5NDhmZjc4N2E2ZmY0NjM0MDdkYTMzOCIsImlhdCI6MTc2Njk4MTE4OCwiZXhwIjoxNzY3MDE3MTg4LCJzaWQiOiIyWGd6QVNQQWhndHhKZ2NxTGc3Vmd0SmQxNHFTWUIyOCIsImF1dGhfdGltZSI6MTc2Njk4MTE4Nn0.uOWjUZ2Ii1xSvvc0cwY7US6JdCVo5J7swjuaqsQU7oovIikTSRmfsVr4BGNVfTeHaSLpS8t8KiRQFVoXYBOHtkEtud4ipWdVFsO8LIw84Gx4C2dzudSDjW9ptpG32Cp1Hhu1NT-3rnbNsWuhVEy7g5a5eg3VUDN88a-yKrQlB5priNMtC-zAjZykVyARJpGLRB-oZUHpTeWAx-iS_DhVbtMZbSDs7vKPaAFjDBv_efQXrGP4Mo27UGr8uuDBMAeQuw3yNOYvnfVC9emVCXeTSGvPmXztm6iZ4zOQbiDp6y16ksab9I5VKplOSttgDu7bO3joMTyIj2_II1yjrFhAng"
                rows={6}
                className="mtn-input font-mono text-sm"
                required
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-mtn-gray">
                  Obtenez ce token depuis l'onglet <strong>Décodage</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setJwtToken(localStorage.getItem('last_jwt_token') || '')}
                  className="text-xs text-mtn-blue hover:text-mtn-blue-dark"
                >
                  Charger le dernier token
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                className="w-full mtn-btn-primary"
              >
                <CheckCircle className="w-5 h-5" />
                Se connecter
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const sampleToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjR2MC1ONUlKalZ2blp0M1pjV21tXyJ9.eyJodHRwczovL215bXRuLmNvbS9sb2dpbkNvdW50Ijo0LCJodHRwczovL215bXRuLmNvbS9waG9uZV9udW1iZXIiOiIrMjM3NjEyMzQ1Njc4IiwiaHR0cHM6Ly9teW10bi5jb20vY291bnRyeSI6IkNNUiIsIm5pY2tuYW1lIjoiKzIzNzYxMjM0NTY3OCIsIm5hbWUiOiIrMjM3NjEyMzQ1Njc4IiwicGljdHVyZSI6Imh0dHBzOi8vY2RuLmF1dGgwLmNvbS9hdmF0YXJzLzIucG5nIiwidXBkYXRlZF9hdCI6IjIwMjUtMTItMjlUMDQ6MDY6MjYuMjE2WiIsImlzcyI6Imh0dHBzOi8vbXRuY20tcHJvZC5tdG4uYXV0aDAuY29tLyIsImF1ZCI6IkZUbEk1aFpOS2NpWVRRaG0zR05HbVdUTFl0WkphYXg4Iiwic3ViIjoic21zfDY5NDhmZjc4N2E2ZmY0NjM0MDdkYTMzOCIsImlhdCI6MTc2Njk4MTE4OCwiZXhwIjoxNzY3MDE3MTg4LCJzaWQiOiIyWGd6QVNQQWhndHhKZ2NxTGc3Vmd0SmQxNHFTWUIyOCIsImF1dGhfdGltZSI6MTc2Njk4MTE4Nn0.uOWjUZ2Ii1xSvvc0cwY7US6JdCVo5J7swjuaqsQU7oovIikTSRmfsVr4BGNVfTeHaSLpS8t8KiRQFVoXYBOHtkEtud4ipWdVFsO8LIw84Gx4C2dzudSDjW9ptpG32Cp1Hhu1NT-3rnbNsWuhVEy7g5a5eg3VUDN88a-yKrQlB5priNMtC-zAjZykVyARJpGLRB-oZUHpTeWAx-iS_DhVbtMZbSDs7vKPaAFjDBv_efQXrGP4Mo27UGr8uuDBMAeQuw3yNOYvnfVC9emVCXeTSGvPmXztm6iZ4zOQbiDp6y16ksab9I5VKplOSttgDu7bO3joMTyIj2_II1yjrFhAng";
                  setJwtToken(sampleToken);
                  toast.info('Token exemple chargé (modifiez le numéro)');
                }}
                className="w-full mtn-btn-secondary"
              >
                <Database className="w-5 h-5" />
                Charger un exemple
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-mtn-gray">
                En vous connectant, vous acceptez que votre token JWT soit stocké localement
                <br />
                pour la durée de votre session.
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Affichage principal avec données
  return (
    <div className="min-h-screen bg-gradient-to-br from-mtn-gray-light to-gray-100">
      {/* Header principal */}
      <header className="bg-gradient-to-r from-mtn-black to-mtn-gray-dark text-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-mtn-yellow w-14 h-14 rounded-full flex items-center justify-center">
                <Shield className="w-7 h-7 text-mtn-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  MTN Account Manager
                </h1>
                <p className="text-mtn-gray-light text-sm">
                  {phoneNumber || 'Chargement...'} • Gestion complète de compte
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-mtn-gray-light">Statut API</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">En ligne</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-600"></div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="px-4 py-2 bg-mtn-yellow text-mtn-black font-semibold rounded-lg hover:bg-mtn-yellow-dark transition flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                
                <div className="relative group">
                  <button className="px-4 py-2 bg-mtn-gray-dark border border-gray-700 rounded-lg hover:bg-gray-800 transition flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Options
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="p-2">
                      <button
                        onClick={exportData}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Exporter les données
                      </button>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showBalance ? 'Cacher solde' : 'Afficher solde'}
                      </button>
                      <div className="px-3 py-2 border-t border-gray-200">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded"
                          />
                          Auto-refresh
                        </label>
                        {autoRefresh && (
                          <div className="mt-2">
                            <input
                              type="range"
                              min="10"
                              max="120"
                              value={refreshInterval}
                              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {refreshInterval}s
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-mtn-red text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par sections */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto py-2">
            {[
              { id: 'profile', label: 'Profil', icon: User, color: 'text-blue-600' },
              { id: 'balance', label: 'Crédit', icon: CreditCard, color: 'text-green-600' },
              { id: 'bundles', label: 'Forfaits', icon: Package, color: 'text-purple-600' },
              { id: 'services', label: 'Services', icon: Wifi, color: 'text-orange-600' },
              { id: 'history', label: 'Historique', icon: History, color: 'text-indigo-600' },
              { id: 'gift', label: 'Offrir', icon: Gift, color: 'text-pink-600' },
              { id: 'analytics', label: 'Analytics', icon: BarChart, color: 'text-teal-600' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap
                  transition-all duration-200 border-b-4
                  ${activeSection === tab.id
                    ? 'border-mtn-yellow text-mtn-gray-dark bg-gradient-to-b from-yellow-50/50 to-transparent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <tab.icon className={`w-5 h-5 ${activeSection === tab.id ? 'text-mtn-yellow' : tab.color}`} />
                {tab.label}
                {tab.id === 'bundles' && data.catalogue && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-mtn-yellow/20 text-mtn-yellow-dark rounded-full">
                    {getFilteredBundles.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h4 className="font-semibold">Erreur de chargement</h4>
            </div>
            <p className="mb-4">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Indicateur de chargement */}
        {loading && activeSection !== 'bundles' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-mtn-yellow border-t-transparent"></div>
            <p className="mt-4 text-mtn-gray">Chargement des données...</p>
          </div>
        )}

        {/* Section Profil */}
        {activeSection === 'profile' && data.profile && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-3xl font-bold text-mtn-gray-dark">
                <User className="w-8 h-8 inline mr-3 align-middle" />
                Profil Utilisateur
              </h2>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-mtn-blue text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contacter le support
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Carte principale */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-mtn-blue to-blue-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <User className="w-12 h-12" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{data.profile.fullName}</h3>
                        <p className="opacity-90">{phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-mtn-gray block mb-1">Email</span>
                          <p className="text-lg font-semibold">{data.profile.email}</p>
                        </div>
                        <div>
                          <span className="text-sm text-mtn-gray block mb-1">Type de compte</span>
                          <p className="text-lg font-semibold">{data.profile.accountType}</p>
                        </div>
                        <div>
                          <span className="text-sm text-mtn-gray block mb-1">Segment</span>
                          <p className="text-lg font-semibold">{data.profile.segment}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-mtn-gray block mb-1">Date d'activation</span>
                          <p className="text-lg font-semibold">
                            {new Date(data.profile.activationDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-mtn-gray block mb-1">Dernière activité</span>
                          <p className="text-lg font-semibold">
                            {new Date(data.profile.lastActivity).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-mtn-gray block mb-1">Statut</span>
                          <p className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Compte actif
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cartes secondaires */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-mtn-gray-dark mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-mtn-blue" />
                    Sécurité
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-mtn-gray">Authentification</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        JWT Actif
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-mtn-gray">Session</span>
                      <span className="text-sm font-semibold">Active</span>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-mtn-gray-light text-mtn-gray-dark rounded-lg hover:bg-gray-200 transition">
                      Gérer la sécurité
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-mtn-gray-dark mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-mtn-yellow-dark" />
                    Notifications
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Alertes de solde</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Promotions MTN</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Newsletter</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Crédit */}
        {activeSection === 'balance' && data.balance && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-3xl font-bold text-mtn-gray-dark">
                <CreditCard className="w-8 h-8 inline mr-3 align-middle" />
                Solde et Crédit
              </h2>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-mtn-yellow text-mtn-black font-semibold rounded-lg hover:bg-mtn-yellow-dark transition flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Recharger
                </button>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="px-4 py-2 bg-mtn-gray-light text-mtn-gray-dark rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showBalance ? 'Cacher' : 'Afficher'}
                </button>
              </div>
            </div>

            {/* Cartes de solde principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.balance.map((balance, index) => (
                <div key={index} className={`
                  bg-white rounded-xl shadow-lg border border-gray-200 p-6
                  hover:shadow-xl transition-shadow duration-300
                  ${balance.name === 'AIRTIME' ? 'border-l-4 border-l-mtn-yellow' : ''}
                  ${balance.name === 'DATA' ? 'border-l-4 border-l-mtn-blue' : ''}
                  ${balance.name === 'VOICE' ? 'border-l-4 border-l-mtn-green' : ''}
                  ${balance.name === 'MOMO' ? 'border-l-4 border-l-green-500' : ''}
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {balance.name === 'DATA' && <Wifi className="w-8 h-8 text-mtn-blue" />}
                      {balance.name === 'AIRTIME' && <CreditCard className="w-8 h-8 text-mtn-yellow-dark" />}
                      {balance.name === 'VOICE' && <PhoneCall className="w-8 h-8 text-mtn-green" />}
                      {balance.name === 'SMS' && <MessageSquare className="w-8 h-8 text-purple-500" />}
                      {balance.name === 'MOMO' && <DollarSign className="w-8 h-8 text-green-500" />}
                      <div>
                        <h3 className="font-semibold text-mtn-gray-dark">{balance.name}</h3>
                        <p className="text-sm text-mtn-gray">{balance.label}</p>
                      </div>
                    </div>
                    {balance.expiry && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {balance.expiry.includes('2036') ? 'Illimité' : 'Expire'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-mtn-gray-dark">
                        {showBalance ? balance.display_name || balance.display_value : '•••••'}
                      </p>
                      <p className="text-sm text-mtn-gray">{balance.unit}</p>
                    </div>
                    
                    {balance.detailed_balances && balance.detailed_balances.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-mtn-gray mb-2">Détails:</p>
                        {balance.detailed_balances.map((detail, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-mtn-gray">{detail.display_name}</span>
                            <span className="font-medium">{detail.display_value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="font-semibold text-mtn-gray-dark mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-mtn-blue" />
                Statistiques d'utilisation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-mtn-blue">82%</div>
                  <div className="text-sm text-mtn-gray mt-1">Data utilisée</div>
                  <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-mtn-blue rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-mtn-green">45%</div>
                  <div className="text-sm text-mtn-gray mt-1">Crédit utilisé</div>
                  <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full bg-mtn-green rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">7</div>
                  <div className="text-sm text-mtn-gray mt-1">Forfaits actifs</div>
                  <div className="mt-2 text-xs text-purple-600">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +2 ce mois-ci
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Forfaits */}
        {activeSection === 'bundles' && data.catalogue && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-mtn-gray-dark">
                  <Package className="w-8 h-8 inline mr-3 align-middle" />
                  Catalogue des Forfaits
                </h2>
                <p className="text-mtn-gray mt-1">
                  {stats.totalBundles} forfaits disponibles • {stats.dataBundles} Data • {stats.voiceBundles} Voice
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mtn-gray" />
                  <input
                    type="text"
                    placeholder="Rechercher un forfait..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtn-yellow focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtn-yellow focus:border-transparent"
                >
                  <option value="all">Tous les forfaits</option>
                  <option value="data">Forfaits Data</option>
                  <option value="voice">Forfaits Appel</option>
                  <option value="sms">Forfaits SMS</option>
                  <option value="cheap">Moins de 500F</option>
                  <option value="unlimited">Illimités</option>
                  <option value="night">Forfaits Nuit</option>
                  <option value="social">Réseaux sociaux</option>
                  <option value="combo">Forfaits Combo</option>
                </select>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                  }}
                  className="px-4 py-3 bg-mtn-gray-light text-mtn-gray-dark rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-mtn-yellow border-t-transparent"></div>
                <p className="mt-4 text-mtn-gray">Chargement des forfaits...</p>
              </div>
            ) : (
              <>
                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-mtn-gray">Total</div>
                    <div className="text-xl font-bold">{stats.totalBundles}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-mtn-gray">Data</div>
                    <div className="text-xl font-bold text-mtn-blue">{stats.dataBundles}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-mtn-gray">Voice</div>
                    <div className="text-xl font-bold text-mtn-green">{stats.voiceBundles}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-mtn-gray">Moins de 500F</div>
                    <div className="text-xl font-bold text-mtn-yellow-dark">{stats.cheapBundles}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-mtn-gray">Illimités</div>
                    <div className="text-xl font-bold text-purple-600">{stats.unlimitedBundles}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-mtn-gray">Filtrés</div>
                    <div className="text-xl font-bold">{getFilteredBundles.length}</div>
                  </div>
                </div>

                {/* Liste des forfaits */}
                {getFilteredBundles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredBundles.map((bundle, index) => (
                      <div
                        key={`${bundle.id}-${index}`}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                      >
                        {/* En-tête avec badge */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  bundle.type === 'Data' ? 'bg-blue-100 text-blue-800' :
                                  bundle.type === 'Voice' ? 'bg-green-100 text-green-800' :
                                  bundle.type === 'SMS' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {bundle.type || 'Bundle'}
                                </span>
                                {bundle.unlimited && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Illimité
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-mtn-gray-dark group-hover:text-mtn-blue transition-colors">
                                {bundle.name}
                              </h3>
                              {bundle.categoryName && (
                                <p className="text-sm text-mtn-gray mt-1">
                                  <Globe className="w-3 h-3 inline mr-1" />
                                  {bundle.categoryName}
                                </p>
                              )}
                            </div>
                            {bundle.status?.name === 'active' && (
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          
                          {/* Description */}
                          {bundle.description && (
                            <p className="text-sm text-mtn-gray line-clamp-2">
                              {bundle.description}
                            </p>
                          )}
                        </div>

                        {/* Détails */}
                        <div className="p-6 space-y-4">
                          {/* Volume */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-mtn-gray">
                              <Database className="w-4 h-4" />
                              <span>Volume</span>
                            </div>
                            <span className="font-bold text-lg">
                              {formatSize(bundle.size || bundle.value)}
                            </span>
                          </div>
                          
                          {/* Validité */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-mtn-gray">
                              <Clock className="w-4 h-4" />
                              <span>Validité</span>
                            </div>
                            <span className="font-semibold">
                              {bundle.validity?.display_name || bundle.validity?.unit || '24h'}
                            </span>
                          </div>
                          
                          {/* Prix */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-mtn-gray">
                              <DollarSign className="w-4 h-4" />
                              <span>Prix</span>
                            </div>
                            <span className="text-2xl font-bold text-mtn-yellow-dark">
                              {formatPrice(bundle.cost)}
                            </span>
                          </div>
                          
                          {/* Bonus */}
                          {bundle.freebies && Array.isArray(bundle.freebies) && bundle.freebies.length > 0 && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Bonus inclus
                              </p>
                              <ul className="text-xs text-green-700 space-y-1">
                                {bundle.freebies.slice(0, 2).map((freebie, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                    <span>{freebie.display_name || freebie.bundle_type}</span>
                                  </li>
                                ))}
                                {bundle.freebies.length > 2 && (
                                  <li className="text-green-600 text-xs">
                                    +{bundle.freebies.length - 2} bonus supplémentaires
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {/* Méthodes de paiement */}
                          {bundle.payment_methods && (
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-mtn-gray mb-2">Paiement accepté:</p>
                              <div className="flex gap-2">
                                {bundle.payment_methods.slice(0, 3).map((method, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {method.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => openSubscriptionModal(bundle)}
                            disabled={!bundle.can_buy_for_self && !bundle.can_buy_for_other}
                            className={`
                              w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300
                              flex items-center justify-center gap-2
                              ${(bundle.can_buy_for_self || bundle.can_buy_for_other)
                                ? 'bg-mtn-yellow text-mtn-black hover:bg-mtn-yellow-dark hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }
                            `}
                          >
                            <ShoppingCart className="w-5 h-5" />
                            {bundle.can_buy_for_self ? 'Souscrire' : 'Offrir'}
                          </button>
                          
                          <div className="flex justify-between items-center mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              {bundle.can_buy_for_self && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Pour soi</span>
                                </span>
                              )}
                              {bundle.can_buy_for_other && (
                                <span className="flex items-center gap-1 text-blue-600">
                                  <Gift className="w-3 h-3" />
                                  <span>Offrir</span>
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-mtn-gray flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {bundle.subscription_provider_id || 'MTN'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Package className="w-16 h-16 text-mtn-gray mx-auto mb-4" />
                    <h5 className="text-lg font-semibold text-mtn-gray-dark mb-2">
                      Aucun forfait trouvé
                    </h5>
                    <p className="text-mtn-gray mb-6">
                      Essayez de modifier vos critères de recherche
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('all');
                      }}
                      className="px-6 py-3 bg-mtn-yellow text-mtn-black font-semibold rounded-lg hover:bg-mtn-yellow-dark transition"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {getFilteredBundles.length > 0 && (
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <p className="text-mtn-gray">
                      Affichage de {Math.min(getFilteredBundles.length, 9)} sur {getFilteredBundles.length} forfaits
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Précédent
                      </button>
                      <button className="px-4 py-2 bg-mtn-yellow text-mtn-black font-semibold rounded-lg hover:bg-mtn-yellow-dark">
                        Suivant
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Autres sections (simplifiées) */}
        {activeSection === 'services' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <Wifi className="w-16 h-16 text-mtn-gray mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-mtn-gray-dark mb-2">
              Services Actifs
            </h3>
            <p className="text-mtn-gray mb-6">
              Cette section est en cours de développement
            </p>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <History className="w-16 h-16 text-mtn-gray mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-mtn-gray-dark mb-2">
              Historique des Transactions
            </h3>
            <p className="text-mtn-gray mb-6">
              Cette section est en cours de développement
            </p>
          </div>
        )}

        {activeSection === 'gift' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <Gift className="w-16 h-16 text-mtn-gray mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-mtn-gray-dark mb-2">
              Offrir un Forfait
            </h3>
            <p className="text-mtn-gray mb-6">
              Cette section est en cours de développement
            </p>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <BarChart className="w-16 h-16 text-mtn-gray mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-mtn-gray-dark mb-2">
              Analytics
            </h3>
            <p className="text-mtn-gray mb-6">
              Cette section est en cours de développement
            </p>
          </div>
        )}
      </main>

      {/* Modal de souscription */}
      {subscriptionModal.isOpen && subscriptionModal.bundle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* En-tête */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-mtn-gray-dark">
                  {subscriptionModal.subscriptionType === 'gift' ? '🎁 Offrir un forfait' : '🛒 Souscrire à un forfait'}
                </h3>
                <p className="text-mtn-gray mt-1">Confirmez les détails de votre commande</p>
              </div>
              <button
                onClick={closeSubscriptionModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                disabled={subscriptionModal.isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Résumé du forfait */}
            <div className="mb-8 p-6 bg-gradient-to-r from-mtn-yellow/10 to-yellow-50 rounded-xl border border-mtn-yellow/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-mtn-gray-dark mb-2">
                    {subscriptionModal.bundle.name}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-mtn-blue" />
                      <span className="font-medium">{formatSize(subscriptionModal.bundle.size || subscriptionModal.bundle.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-mtn-green" />
                      <span className="font-medium">{subscriptionModal.bundle.validity?.display_name || '24h'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">{subscriptionModal.bundle.type}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-mtn-yellow-dark">
                    {formatPrice(subscriptionModal.bundle.cost)}
                  </div>
                  <div className="text-sm text-mtn-gray">Prix TTC</div>
                </div>
              </div>
            </div>

            {!subscriptionModal.showConfirmation ? (
              <>
                {/* Sélection du type */}
                {subscriptionModal.bundle.can_buy_for_other && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-mtn-gray-dark mb-4">
                      Pour qui souhaitez-vous souscrire ?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setSubscriptionModal(prev => ({ 
                          ...prev, 
                          subscriptionType: 'self',
                          beneficiaryPhone: ''
                        }))}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          subscriptionModal.subscriptionType === 'self'
                            ? 'border-mtn-yellow bg-mtn-yellow/10 shadow-md'
                            : 'border-gray-200 hover:border-mtn-yellow hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            subscriptionModal.subscriptionType === 'self'
                              ? 'bg-mtn-yellow text-mtn-black'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <User className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Pour moi-même</div>
                            <div className="text-sm text-mtn-gray mt-1">
                              Votre numéro: {phoneNumber}
                            </div>
                          </div>
                          {subscriptionModal.subscriptionType === 'self' && (
                            <CheckCircle className="w-6 h-6 text-mtn-green ml-auto" />
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => setSubscriptionModal(prev => ({ 
                          ...prev, 
                          subscriptionType: 'gift',
                          beneficiaryPhone: ''
                        }))}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          subscriptionModal.subscriptionType === 'gift'
                            ? 'border-mtn-yellow bg-mtn-yellow/10 shadow-md'
                            : 'border-gray-200 hover:border-mtn-yellow hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            subscriptionModal.subscriptionType === 'gift'
                              ? 'bg-mtn-yellow text-mtn-black'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Gift className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">Offrir à un ami</div>
                            <div className="text-sm text-mtn-gray mt-1">
                              À un autre numéro MTN
                            </div>
                          </div>
                          {subscriptionModal.subscriptionType === 'gift' && (
                            <CheckCircle className="w-6 h-6 text-mtn-green ml-auto" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Champ pour le bénéficiaire */}
                {subscriptionModal.subscriptionType === 'gift' && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-mtn-gray-dark mb-3">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Numéro du bénéficiaire
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mtn-gray">
                        +237
                      </div>
                      <input
                        type="tel"
                        value={subscriptionModal.beneficiaryPhone.replace('+237', '')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                          setSubscriptionModal(prev => ({ 
                            ...prev, 
                            beneficiaryPhone: '+237' + value 
                          }));
                        }}
                        placeholder="XXXXXXXXX"
                        className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtn-yellow focus:border-transparent"
                        maxLength={9}
                      />
                    </div>
                    <p className="text-xs text-mtn-gray mt-2">
                      Format: 9 chiffres après +237 (ex: 612345678)
                    </p>
                    
                    {/* Validation */}
                    {subscriptionModal.beneficiaryPhone && subscriptionModal.beneficiaryPhone.length === 13 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Numéro valide:</span>
                          <span>{subscriptionModal.beneficiaryPhone}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-4">
                  <button
                    onClick={executeSubscription}
                    disabled={
                      subscriptionModal.isLoading || 
                      (subscriptionModal.subscriptionType === 'gift' && 
                       subscriptionModal.beneficiaryPhone.length !== 13)
                    }
                    className="flex-1 py-4 bg-mtn-yellow text-mtn-black font-bold rounded-lg hover:bg-mtn-yellow-dark transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    {subscriptionModal.subscriptionType === 'gift' ? 'Offrir le forfait' : 'Souscrire maintenant'}
                  </button>
                  
                  <button
                    onClick={closeSubscriptionModal}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                    disabled={subscriptionModal.isLoading}
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Écran de confirmation */}
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-mtn-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-mtn-yellow-dark" />
                    </div>
                    <h4 className="text-xl font-bold text-mtn-gray-dark mb-2">
                      Confirmation requise
                    </h4>
                    <p className="text-mtn-gray">
                      Vous êtes sur le point d'envoyer une requête réelle à l'API MTN.
                      Cette action ne peut pas être annulée.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-red-700">Type:</span>
                        <span className="font-semibold">
                          {subscriptionModal.subscriptionType === 'gift' ? 'OFFRE' : 'ACHAT POUR SOI'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Forfait:</span>
                        <span className="font-semibold">{subscriptionModal.bundle.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Prix:</span>
                        <span className="font-semibold">{formatPrice(subscriptionModal.bundle.cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">Destinataire:</span>
                        <span className="font-semibold">
                          {subscriptionModal.subscriptionType === 'gift' 
                            ? subscriptionModal.beneficiaryPhone 
                            : phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700">JWT utilisé:</span>
                        <span className="font-semibold">{phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={confirmSubscription}
                      disabled={subscriptionModal.isLoading}
                      className="flex-1 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {subscriptionModal.isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Confirmer et envoyer
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setSubscriptionModal(prev => ({ 
                        ...prev, 
                        showConfirmation: false 
                      }))}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                      disabled={subscriptionModal.isLoading}
                    >
                      Retour
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Informations de débogage */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="cursor-pointer text-sm text-mtn-gray hover:text-mtn-gray-dark flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Détails techniques de la requête
                </summary>
                <div className="mt-3 p-4 bg-gray-900 rounded-lg font-mono text-xs text-gray-300 overflow-x-auto">
                  <div className="space-y-2">
                    <div>
                      <span className="text-green-400">POST</span>{' '}
                      <span className="text-blue-400">https://subscription-prd-mmn.mtn.com/api/v1/subscription</span>
                    </div>
                    <div>Headers:</div>
                    <div className="pl-4 space-y-1">
                      <div>Authorization: Bearer [JWT pour {phoneNumber}]</div>
                      <div>x-api-key: ********</div>
                      <div>x-country-code: cmr</div>
                      <div>Content-Type: application/json</div>
                    </div>
                    <div>Body:</div>
                    <div className="pl-4">
                      {JSON.stringify({
                        origin: "Catalogue",
                        product_id: subscriptionModal.bundle.id,
                        product_name: subscriptionModal.bundle.name,
                        product_price: subscriptionModal.bundle.cost?.value || 0,
                        beneficiary_id: subscriptionModal.subscriptionType === 'gift' 
                          ? subscriptionModal.beneficiaryPhone.replace('+', '')
                          : phoneNumber.replace('+', ''),
                        payment_method: "momo",
                        amount: subscriptionModal.bundle.cost?.value || 0
                      }, null, 2)}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation générale */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h4 className="text-xl font-bold text-mtn-gray-dark mb-4">
              {confirmationModal.title}
            </h4>
            <p className="text-mtn-gray mb-6">
              {confirmationModal.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmationModal.action) confirmationModal.action();
                }}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmationModal({ isOpen: false, title: '', message: '', action: null })}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-8 pb-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="text-lg font-bold text-mtn-gray-dark">MTN Account Manager</div>
              <div className="text-sm text-mtn-gray">
                Interface professionnelle pour la gestion de compte MTN Cameroun
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-mtn-gray">
              <span>© 2024 MTN CM</span>
              <span>•</span>
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>{phoneNumber ? `Connecté: ${phoneNumber}` : 'Non connecté'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AccountManager;