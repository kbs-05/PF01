'use client';

import { useState, useEffect } from 'react';
import { getStudents, getPayments } from '../lib/database';
import { format } from 'date-fns';

type Student = {
  id: string;
  name: string;
};

type Payment = {
  studentName: string;
  monthsPaid: string[];
  remainder?: { month: string; amount: number };
  amount: number;
  date: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidThisMonth: 0,
    totalAmount: 0,
    pendingPayments: 0,
    inscriptions: 0,
    reinscriptions: 0,
  });

  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const months = [
    'INSCRIPTION', 'REINSCRIPTION', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai'
  ];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const studentsData: Student[] = await getStudents();
        const paymentsData: Payment[] = await getPayments();

        setStudents(studentsData);
        setPayments(paymentsData);

        // ---------- Mois courant ----------
        const now = new Date();
        const monthNames = [
          'Septembre','Octobre','Novembre','Décembre',
          'Janvier','Février','Mars','Avril','Mai'
        ];
        const currentMonthIndex = now.getMonth() - 8; // 8 = Septembre
        const currentMonthName = monthNames[currentMonthIndex >= 0 ? currentMonthIndex : 0];

        // ---------- Élèves ayant payé ce mois ----------
        const studentsPaidThisMonth = new Set(
          paymentsData
            .filter(p => p.monthsPaid.includes(currentMonthName))
            .map(p => p.studentName)
        );

        // ---------- Montant total payé ----------
        const totalAmount = paymentsData.reduce((sum, p) => sum + p.amount, 0);

        // ---------- Inscriptions / Réinscriptions ----------
        const inscriptions = paymentsData.filter(p => p.monthsPaid.includes('INSCRIPTION')).length;
        const reinscriptions = paymentsData.filter(p => p.monthsPaid.includes('REINSCRIPTION')).length;

        // ---------- Paiements récents de la semaine ----------
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const recent = paymentsData
          .filter(p => {
            const d = new Date(p.date);
            return d >= weekStart && d <= weekEnd;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setStats({
          totalStudents: studentsData.length,
          paidThisMonth: studentsPaidThisMonth.size,
          totalAmount,
          pendingPayments: studentsData.length - studentsPaidThisMonth.size,
          inscriptions,
          reinscriptions,
        });

        setRecentPayments(recent);
      } catch (error) {
        console.error('Erreur chargement données tableau de bord:', error);
      }
    }

    loadDashboardData();
  }, []);

  // ---------- Fonction pour savoir si un élève a payé un mois ----------
  const hasPaidMonth = (studentName: string, month: string) => {
    return payments.some(
      p => p.studentName === studentName && p.monthsPaid.includes(month)
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord</h1>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Total Élèves</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Élèves ayant payé ce mois</h2>
          <p className="text-3xl font-bold text-green-600">{stats.paidThisMonth}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Montant total payé</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalAmount} FCFA</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Paiements en attente</h2>
          <p className="text-3xl font-bold text-red-600">{stats.pendingPayments}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Inscriptions</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.inscriptions}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold">Réinscriptions</h2>
          <p className="text-3xl font-bold text-yellow-600">{stats.reinscriptions}</p>
        </div>
      </div>

      {/* Graphique mensuel */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Répartition mensuelle des paiements</h2>
        <div className="space-y-4">
          {months.map((month, index) => {
            const studentNames = new Set(
              payments
                .filter(p => p.monthsPaid.includes(month))
                .map(p => p.studentName)
            );
            const percentage =
              stats.totalStudents > 0
                ? (studentNames.size / stats.totalStudents) * 100
                : 0;

            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-12">{studentNames.size}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derniers paiements */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Derniers paiements (cette semaine)</h2>
        <ul className="divide-y divide-gray-200">
          {recentPayments.length === 0 && (
            <li className="py-2 text-center text-gray-500">Aucun paiement cette semaine</li>
          )}
          {recentPayments.map((p, index) => (
            <li key={index} className="py-2 flex justify-between text-sm">
              <span>{p.studentName}</span>
              <span>{p.monthsPaid.join(', ')}</span>
              <span>{p.amount} FCFA</span>
              <span>{format(new Date(p.date), 'dd/MM/yyyy')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
