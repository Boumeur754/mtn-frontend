import React, { useState } from 'react';
import Header from './components/Header';
import TabsNavigation from './components/TabsNavigation';
import TokenDecoder from './components/TokenDecoder';
import TokenEditor from './components/TokenEditor';
import AccountManager from './components/AccountManager';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [activeTab, setActiveTab] = useState('decode');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'decode':
                return <TokenDecoder />;
            case 'edit':
                return <TokenEditor />;
            case 'generate':
                return <div className="p-8 text-center">Génération de Token (à implémenter)</div>;
            case 'test':
                return <div className="p-8 text-center">Test de Token (à implémenter)</div>;
            case 'history':
                return <div className="p-8 text-center">Historique (à implémenter)</div>;
            case 'settings':
                return <div className="p-8 text-center">Paramètres (à implémenter)</div>;
            case 'account':
                return <AccountManager />;
            case 'balance':
                return <AccountManager />; // Avec section active par défaut
            case 'bundles':
                return <AccountManager />; // Avec section active par défaut
            case 'gift':
                return <AccountManager />; // Avec section active par défaut
            default:
                return <TokenDecoder />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />
            <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="container mx-auto px-4 py-8">
                {renderTabContent()}
            </main>

            {/* Footer */}
            <footer className="bg-mtn-black text-white py-8 mt-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <div className="text-2xl font-bold">MyMTn</div>
                            <div className="text-mtn-gray">Exploitation de l'app MyMTN © 2026</div>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-white transition">Documentation</a>
                            <a href="#" className="text-gray-400 hover:text-white transition">API</a>
                            <a href="#" className="text-gray-400 hover:text-white transition">Support</a>
                        </div>
                    </div>
                </div>
            </footer>

            <ToastContainer position="bottom-right" theme="dark" />
        </div>
    );
}

export default App;