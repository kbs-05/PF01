'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import PaymentForm from '../components/PaymentForm';
import StudentList from '../components/StudentList';
import PaymentHistory from '../components/PaymentHistory';
import AddStudent from '../components/AddStudent';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-dashboard-line w-5 h-5 mr-2 flex items-center justify-center"></i>
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'payment'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-money-dollar-circle-line w-5 h-5 mr-2 flex items-center justify-center"></i>
            Nouveau paiement
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-group-line w-5 h-5 mr-2 flex items-center justify-center"></i>
            Liste des élèves
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-history-line w-5 h-5 mr-2 flex items-center justify-center"></i>
            Historique
          </button>
          <button
            onClick={() => setActiveTab('addStudent')}
            className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'addStudent'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="ri-user-add-line w-5 h-5 mr-2 flex items-center justify-center"></i>
            Ajouter élève
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'payment' && <PaymentForm />}
          {activeTab === 'students' && <StudentList />}
          {activeTab === 'history' && <PaymentHistory />}
          {activeTab === 'addStudent' && <AddStudent />}
        </div>
      </div>
    </div>
  );
}