
'use client';

import { useState } from 'react';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-school-line text-white w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Pierre de la Fontaine</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-blue-600 w-4 h-4 flex items-center justify-center"></i>
                </div>
                <span className="text-sm font-medium text-gray-700">Caissier</span>
                <i className="ri-arrow-down-s-line w-4 h-4 flex items-center justify-center text-gray-400"></i>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i className="ri-user-settings-line w-4 h-4 mr-2 flex items-center justify-center"></i>
                    Profil
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i className="ri-settings-line w-4 h-4 mr-2 flex items-center justify-center"></i>
                    Paramètres
                  </a>
                  <hr className="my-1" />
                  <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <i className="ri-logout-box-line w-4 h-4 mr-2 flex items-center justify-center"></i>
                    Déconnexion
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}