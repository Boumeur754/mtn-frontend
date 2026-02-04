import React, { useState } from 'react';
import { Copy, Download, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const TokenDecoder = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const decodeToken = async () => {
    if (!token.trim()) return;
    
    setLoading(true);
    try {
      // Simulation d'API
      setTimeout(() => {
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          setDecoded({
            header,
            payload,
            signature: parts[2],
            tokenInfo: {
              algorithm: header.alg,
              expires: new Date(payload.exp * 1000).toLocaleString(),
              phone: payload['https://mymtn.com/phone_number'],
              country: payload['https://mymtn.com/country'],
              loginCount: payload['https://mymtn.com/loginCount'],
            }
          });
        }
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
  };

  const clearAll = () => {
    setToken('');
    setDecoded(null);
  };

  return (
    <div className="space-y-6">
      {/* Entrée du token */}
      <div className="mtn-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-mtn-gray-dark">
            Entrée du Token JWT
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-2 text-sm text-mtn-gray hover:text-mtn-gray-dark"
            >
              {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showRaw ? 'Format JSON' : 'Format Brut'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Collez votre token JWT MTN ici..."
            rows={6}
            className="mtn-input font-mono text-sm"
          />

          <div className="flex flex-wrap gap-3">
            <button onClick={decodeToken} className="mtn-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-mtn-black border-t-transparent rounded-full animate-spin"></div>
                  Décodage...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Décoder le Token
                </>
              )}
            </button>
            <button onClick={copyToken} className="mtn-btn-secondary">
              <Copy className="w-5 h-5" />
              Copier
            </button>
            <button onClick={clearAll} className="bg-mtn-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition">
              Effacer
            </button>
          </div>
        </div>
      </div>

      {/* Affichage décodé */}
      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <div className="mtn-card p-6">
            <h4 className="text-lg font-semibold text-mtn-blue mb-4">Header</h4>
            <pre className="bg-mtn-gray-light p-4 rounded-lg overflow-x-auto text-sm">
              {showRaw ? (
                JSON.stringify(decoded.header, null, 2)
              ) : (
                <div className="space-y-2">
                  <div><span className="font-semibold text-mtn-blue">Algorithme:</span> {decoded.header.alg}</div>
                  <div><span className="font-semibold text-mtn-blue">Type:</span> {decoded.header.typ}</div>
                  <div><span className="font-semibold text-mtn-blue">Key ID:</span> {decoded.header.kid}</div>
                </div>
              )}
            </pre>
          </div>

          {/* Payload */}
          <div className="mtn-card p-6">
            <h4 className="text-lg font-semibold text-mtn-green mb-4">Payload</h4>
            <pre className="bg-mtn-gray-light p-4 rounded-lg overflow-x-auto text-sm">
              {showRaw ? (
                JSON.stringify(decoded.payload, null, 2)
              ) : (
                <div className="space-y-2">
                  <div><span className="font-semibold text-mtn-green">Téléphone:</span> {decoded.tokenInfo.phone}</div>
                  <div><span className="font-semibold text-mtn-green">Pays:</span> {decoded.tokenInfo.country}</div>
                  <div><span className="font-semibold text-mtn-green">Login Count:</span> {decoded.tokenInfo.loginCount}</div>
                  <div><span className="font-semibold text-mtn-green">Expiration:</span> {decoded.tokenInfo.expires}</div>
                </div>
              )}
            </pre>
          </div>

          {/* Informations du Token */}
          <div className="lg:col-span-2">
            <div className="mtn-card p-6">
              <h4 className="text-lg font-semibold text-mtn-gray-dark mb-4">
                Informations du Token
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-mtn-gray-light p-4 rounded-lg">
                  <div className="text-sm text-mtn-gray">Statut</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold">Valide</span>
                  </div>
                </div>
                <div className="bg-mtn-gray-light p-4 rounded-lg">
                  <div className="text-sm text-mtn-gray">Téléphone</div>
                  <div className="font-semibold text-lg">{decoded.tokenInfo.phone}</div>
                </div>
                <div className="bg-mtn-gray-light p-4 rounded-lg">
                  <div className="text-sm text-mtn-gray">Pays</div>
                  <div className="font-semibold text-lg">{decoded.tokenInfo.country}</div>
                </div>
                <div className="bg-mtn-gray-light p-4 rounded-lg">
                  <div className="text-sm text-mtn-gray">Expiration</div>
                  <div className="font-semibold text-lg">{decoded.tokenInfo.expires}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDecoder;