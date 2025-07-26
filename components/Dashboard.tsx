'use client';

import { useState, useEffect } from 'react';
import { getStudents, getPayments } from '../lib/firebase';

type Student = {
  id: string;
  name: string;
};

type Payment = {
  studentName: string;
  month: string;
  amount: number;
  date: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    paidThisMonth: 0,
    totalAmount: 0,
    pendingPayments: 0,
  });

  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const students: Student[] = await getStudents();
        const payments: Payment[] = await getPayments();

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const thisMonthPayments = payments.filter((p) => {
          const paymentDate = new Date(p.date);
          return (
            paymentDate.getMonth() + 1 === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });

        // Étudiants uniques ayant payé ce mois
        const uniqueStudentsPaidThisMonth = new Set(thisMonthPayments.map(p => p.studentName));

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

        setStats({
          totalStudents: students.length,
          paidThisMonth: uniqueStudentsPaidThisMonth.size,
          totalAmount: totalAmount,
          pendingPayments: students.length - uniqueStudentsPaidThisMonth.size,
        });

        setRecentPayments(
          payments
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
        );
      } catch (error) {
        console.error('Erreur chargement données tableau de bord:', error);
      }
    }

    loadDashboardData();
  }, []);

  const months = [
    'Septembre','Octobre', 'Novembre','Décembre','Janvier', 'Février', 'Mars', 'Avril', 'Mai', 
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tableau de Bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Répartition mensuelle des paiements</h2>
        <div className="space-y-4">
          {months.map((month, index) => {
            const studentNames = new Set(
              recentPayments
                .filter(p => p.month === month)
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

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Derniers paiements</h2>
        <ul className="divide-y divide-gray-200">
          {recentPayments.map((payment, index) => (
            <li key={index} className="py-2 flex justify-between text-sm">
              <span>{payment.studentName}</span>
              <span>{payment.month}</span>
              <span>{payment.amount} FCFA</span>
              <span>{new Date(payment.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
