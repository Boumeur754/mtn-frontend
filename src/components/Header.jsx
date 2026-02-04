import React from 'react';
import { Shield, Lock, Key } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-mtn-black to-mtn-gray-dark text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-6">
          <div className="bg-mtn-yellow w-20 h-20 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-mtn-black" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Lock className="w-8 h-8" />
              MyMTN app
              <span className="text-xl text-mtn-yellow font-normal">
                - Hacked By Brondon Njotsa 
              </span>
            </h1>
            <p className="text-gray-300 mt-2 text-lg">
              Modifiez, générez et testez MyMTN en toute sécurité
            </p>
          </div>
          <div className="hidden md:block bg-mtn-gray-dark/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-mtn-yellow" />
              <div>
                <div className="text-sm text-gray-400">Statut API</div>
                <div className="text-green-400 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  En ligne
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;