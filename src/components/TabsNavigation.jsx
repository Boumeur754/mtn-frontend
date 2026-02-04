import React from 'react';
import { 
  Code, Edit, PlusCircle, TestTube, Settings, History, 
  User, Package, Wallet, Gift, BarChart 
} from 'lucide-react';

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'decode', label: 'Décodage', icon: Code },
    { id: 'edit', label: 'Édition', icon: Edit },
    { id: 'account', label: 'Compte MTN', icon: User },
  ];

  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="container mx-auto">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-4 font-medium whitespace-nowrap
                  transition-all duration-200 border-b-4
                  ${isActive 
                    ? 'border-mtn-yellow text-mtn-yellow-dark bg-gradient-to-b from-yellow-50/50 to-transparent' 
                    : 'border-transparent text-mtn-gray hover:text-mtn-gray-dark hover:bg-mtn-gray-light'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-mtn-yellow' : 'text-mtn-gray'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabsNavigation;