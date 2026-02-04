import React, { useState } from 'react';
import { 
  Edit2, RefreshCw, Save, Trash2, Link, Unlink, Hash,
  Copy, Download, CheckCircle, Plus, Key, Server,
  AlertCircle, Shield, Clock, User, Globe
} from 'lucide-react';
import { jwtApiService } from '../services/jwtApi';
import { toast } from 'react-toastify';

const TokenEditor = () => {
  const [fields, setFields] = useState([]);
  const [modifiedToken, setModifiedToken] = useState('');
  const [originalToken, setOriginalToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialiser avec des champs par défaut
  const initializeDefaultFields = () => {
    const defaultFields = [
      { key: 'https://mymtn.com/phone_number', value: '+237612345678', type: 'string', linked: true },
      { key: 'nickname', value: '+237612345678', type: 'string', linked: true },
      { key: 'name', value: '+237612345678', type: 'string', linked: true },
      { key: 'https://mymtn.com/country', value: 'CMR', type: 'string', linked: false },
      { key: 'https://mymtn.com/loginCount', value: '4', type: 'number', linked: false },
      { key: 'iss', value: 'https://mtncm-prod.mtn.auth0.com/', type: 'string', linked: false },
      { key: 'aud', value: 'FTlI5hZNKciYTQhm3GNGmWTLYtZJaax8', type: 'string', linked: false },
      { key: 'sub', value: 'sms_6948ff787aff463407da338', type: 'string', linked: false },
      { key: 'iat', value: Math.floor(Date.now() / 1000), type: 'timestamp', linked: false },
      { key: 'exp', value: Math.floor(Date.now() / 1000) + 86400, type: 'timestamp', linked: false },
      { key: 'sid', value: crypto.randomUUID().replace(/-/g, '').substring(0, 24), type: 'string', linked: false },
      { key: 'auth_time', value: Math.floor(Date.now() / 1000) - 300, type: 'timestamp', linked: false },
    ];
    
    setFields(defaultFields);
  };

  // Charger depuis un token existant
  const loadFromToken = async () => {
    if (!originalToken.trim()) {
      toast.warning('Veuillez entrer un token JWT');
      return;
    }

    setLoading(true);
    try {
      const result = await jwtApiService.decodeToken(originalToken);
      if (result.success) {
        const payload = result.decoded.payload;
        
        const fieldArray = Object.entries(payload).map(([key, value]) => ({
          key,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          type: getValueType(value),
          linked: ['https://mymtn.com/phone_number', 'nickname', 'name'].includes(key)
        }));
        
        setFields(fieldArray);
        toast.success('Token chargé avec succès');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error loading token:', error);
      toast.error('Erreur lors du décodage du token');
    } finally {
      setLoading(false);
    }
  };

  const getValueType = (value) => {
    if (typeof value === 'number') {
      // Vérifier si c'est un timestamp
      if (value > 1000000000 && value < 2000000000) {
        return 'timestamp';
      }
      return 'number';
    }
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const updateField = (index, value) => {
    const newFields = [...fields];
    newFields[index].value = value;
    
    // Si c'est le champ téléphone et qu'il est lié, mettre à jour les champs liés
    if (newFields[index].key === 'https://mymtn.com/phone_number' && newFields[index].linked) {
      newFields.forEach((field, i) => {
        if (field.linked && i !== index && ['nickname', 'name'].includes(field.key)) {
          newFields[i].value = value;
        }
      });
    }
    
    setFields(newFields);
  };

  const toggleLinked = (index) => {
    const newFields = [...fields];
    newFields[index].linked = !newFields[index].linked;
    setFields(newFields);
  };

  const addNewField = () => {
    setFields([
      ...fields,
      { key: '', value: '', type: 'string', linked: false }
    ]);
  };

  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const setFieldValue = (key, value) => {
    const newFields = fields.map(field => {
      if (field.key === key) {
        return { ...field, value: String(value) };
      }
      return field;
    });
    setFields(newFields);
  };

  const generateModifiedToken = async () => {
    if (fields.length === 0) {
      toast.warning('Aucun champ à générer');
      return;
    }

    setLoading(true);
    try {
      // Convertir les champs en objet modifications
      const modifications = {};
      fields.forEach(field => {
        if (field.key && field.value !== '') {
          let value = field.value;
          
          // Conversion des types
          switch(field.type) {
            case 'number':
              value = Number(value);
              break;
            case 'boolean':
              value = value.toLowerCase() === 'true';
              break;
            case 'timestamp':
              value = Number(value);
              break;
            case 'array':
            case 'object':
              try {
                value = JSON.parse(value);
              } catch {
                // Garder la valeur telle quelle
              }
              break;
          }
          
          modifications[field.key] = value;
        }
      });

      // Si on a un token original, le modifier
      if (originalToken) {
        const result = await jwtApiService.modifyToken(originalToken, modifications);
        if (result.success) {
          setModifiedToken(result.modifiedToken);
          toast.success('Token modifié avec succès');
        } else {
          toast.error(result.message);
        }
      } else {
        // Sinon, générer un nouveau token
        const result = await jwtApiService.generateToken(modifications);
        if (result.success) {
          setModifiedToken(result.token);
          toast.success('Token généré avec succès');
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error('Error generating token:', error);
      toast.error('Erreur lors de la génération du token');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomValues = async () => {
    setLoading(true);
    try {
      const result = await jwtApiService.getRandomValues();
      if (result.success) {
        Object.entries(result.values).forEach(([key, value]) => {
          setFieldValue(key, value);
        });
        toast.success('Valeurs aléatoires générées');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error getting random values:', error);
      toast.error('Erreur lors de la génération des valeurs aléatoires');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(modifiedToken)
      .then(() => toast.success('Token copié dans le presse-papier'))
      .catch(() => toast.error('Erreur lors de la copie'));
  };

  const downloadToken = () => {
    const blob = new Blob([modifiedToken], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mtn-jwt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Token téléchargé');
  };

  const clearAll = () => {
    setFields([]);
    setModifiedToken('');
    setOriginalToken('');
    toast.info('Tout a été effacé');
  };

  return (
    <div className="space-y-6">
      {/* Section Token Original */}
      <div className="mtn-card p-6">
        <h3 className="text-xl font-semibold text-mtn-gray-dark mb-4 flex items-center gap-3">
          <Key className="w-6 h-6 text-mtn-yellow" />
          Token JWT Original
        </h3>
        
        <div className="space-y-4">
          <textarea
            value={originalToken}
            onChange={(e) => setOriginalToken(e.target.value)}
            placeholder="Collez votre token JWT MTN ici (optionnel)..."
            rows={4}
            className="mtn-input font-mono text-sm"
          />
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={loadFromToken} 
              className="mtn-btn-primary"
              disabled={loading || !originalToken.trim()}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Charger le Token
                </>
              )}
            </button>
            
            <button 
              onClick={initializeDefaultFields} 
              className="mtn-btn-secondary"
              disabled={loading}
            >
              <RefreshCw className="w-5 h-5" />
              Champs par Défaut
            </button>
            
            <button 
              onClick={generateRandomValues} 
              className="mtn-btn-secondary"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              Valeurs Aléatoires
            </button>
          </div>
        </div>
      </div>

      {/* Éditeur de champs */}
      <div className="mtn-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-mtn-gray-dark flex items-center gap-3">
            <Edit2 className="w-6 h-6 text-mtn-blue" />
            Édition des Champs du Token
            <span className="text-sm font-normal text-mtn-gray">
              ({fields.length} champs)
            </span>
          </h3>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={addNewField} 
              className="mtn-btn-primary"
              disabled={loading}
            >
              <Hash className="w-5 h-5" />
              Nouveau Champ
            </button>
          </div>
        </div>

        {/* Table des champs */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-mtn-gray-light">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-mtn-gray-dark">Champ</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-mtn-gray-dark">Valeur</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-mtn-gray-dark">Type</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-mtn-gray-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fields.map((field, index) => (
                <tr key={index} className="hover:bg-mtn-gray-light/50">
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[index].key = e.target.value;
                        setFields(newFields);
                      }}
                      className="mtn-input font-mono text-sm"
                      placeholder="Nom du champ"
                    />
                  </td>
                  <td className="py-3 px-4">
                    {field.type === 'timestamp' ? (
                      <input
                        type="datetime-local"
                        value={new Date(Number(field.value) * 1000).toISOString().slice(0, 16)}
                        onChange={(e) => {
                          const timestamp = Math.floor(new Date(e.target.value).getTime() / 1000);
                          updateField(index, timestamp.toString());
                        }}
                        className="mtn-input text-sm"
                      />
                    ) : field.type === 'boolean' ? (
                      <select
                        value={field.value}
                        onChange={(e) => updateField(index, e.target.value)}
                        className="mtn-input text-sm"
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={field.value}
                        onChange={(e) => updateField(index, e.target.value)}
                        className="mtn-input font-mono text-sm"
                        placeholder="Valeur"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <select 
                      value={field.type}
                      onChange={(e) => {
                        const newFields = [...fields];
                        newFields[index].type = e.target.value;
                        setFields(newFields);
                      }}
                      className="mtn-input text-sm"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="timestamp">Timestamp</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {['https://mymtn.com/phone_number', 'nickname', 'name'].includes(field.key) && (
                        <button
                          onClick={() => toggleLinked(index)}
                          className={`p-2 rounded-lg ${field.linked ? 'bg-mtn-yellow text-mtn-black' : 'bg-gray-100 text-gray-600'}`}
                          title="Lier/Délier"
                        >
                          {field.linked ? <Link className="w-4 h-4" /> : <Unlink className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => removeField(index)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {fields.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-mtn-gray">
                    <div className="flex flex-col items-center gap-2">
                      <Key className="w-8 h-8 opacity-50" />
                      <p>Aucun champ défini</p>
                      <p className="text-sm">Chargez un token ou ajoutez des champs</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button 
            onClick={generateModifiedToken} 
            className="mtn-btn-success"
            disabled={loading || fields.length === 0}
          >
            <Save className="w-5 h-5" />
            {originalToken ? 'Modifier Token' : 'Générer Token'}
          </button>
          
          <button 
            onClick={clearAll} 
            className="mtn-btn-secondary"
            disabled={loading}
          >
            <Trash2 className="w-5 h-5" />
            Tout Effacer
          </button>
        </div>
      </div>

      {/* Token modifié/généré */}
      {modifiedToken && (
        <div className="mtn-card p-6">
          <h3 className="text-xl font-semibold text-mtn-gray-dark mb-4 flex items-center gap-3">
            <Server className="w-6 h-6 text-mtn-green" />
            Token {originalToken ? 'Modifié' : 'Généré'}
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={modifiedToken}
                readOnly
                rows={6}
                className="mtn-input font-mono text-sm bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                title="Copier"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={copyToClipboard} 
                className="mtn-btn-secondary"
              >
                <Copy className="w-5 h-5" />
                Copier
              </button>
              
              <button 
                onClick={downloadToken} 
                className="mtn-btn-primary"
              >
                <Download className="w-5 h-5" />
                Télécharger
              </button>
              
              <button 
                onClick={() => {
                  setOriginalToken(modifiedToken);
                  setModifiedToken('');
                  toast.info('Token défini comme original');
                }} 
                className="mtn-btn-secondary"
              >
                <RefreshCw className="w-5 h-5" />
                Réutiliser
              </button>
            </div>
            
            {/* Info sur le token */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-mtn-gray">
                <AlertCircle className="w-4 h-4" />
                <span>Ce token utilise une signature factice et n'est valable que pour les tests.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenEditor;