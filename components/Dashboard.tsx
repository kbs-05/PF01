'use client';

import { useState, useEffect } from 'react';
import { getStudents, getPayments } from '../lib/firebase'; // Assure-toi que c'est le bon chemin

type Student = {
  id: string;
  name: string;
  // autres propriétés si nécessaire
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

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

        setStats({
          totalStudents: students.length,
          paidThisMonth: thisMonthPayments.length,
          totalAmount: totalAmount,
          pendingPayments: students.length - thisMonthPayments.length,
        });

        setRecentPayments(payments.slice(0, 5));
      } catch (error) {
        console.error('Erreur chargement données tableau de bord:', error);
      }
    }

    loadDashboardData();
  }, []);

  const handlePrintDashboard = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Tableau de bord - Pierre de la Fontaine</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .dashboard-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 30px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }
          .stat-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #212529;
          }
          .recent-payments {
            margin-top: 30px;
          }
          .payments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .payments-table th,
          .payments-table td {
            border: 1px solid #dee2e6;
            padding: 10px;
            text-align: left;
          }
          .payments-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .header { margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">Pierre de la Fontaine</div>
          <div>AKAE après l'Ecole publique Ozoungue</div>
          <div>Tél: 077 71 55 10 / 066 31 07 08 / 077 80 27 78 / 066 30 01 40</div>
        </div>

        <div class="dashboard-title">TABLEAU DE BORD</div>
        <div style="text-align: center; margin-bottom: 20px; color: #6c757d;">
          Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total élèves</div>
            <div class="stat-value">${stats.totalStudents}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Payé ce mois</div>
            <div class="stat-value">${stats.paidThisMonth}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Montant total</div>
            <div class="stat-value">${stats.totalAmount.toLocaleString()} CFA</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">En attente</div>
            <div class="stat-value">${stats.pendingPayments}</div>
          </div>
        </div>

        <div class="recent-payments">
          <h3>Paiements récents</h3>
          <table class="payments-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Mois</th>
                <th>Montant</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${recentPayments.map(payment => `
                <tr>
                  <td>${payment.studentName}</td>
                  <td>${payment.month}</td>
                  <td>${payment.amount.toLocaleString()} CFA</td>
                  <td>${new Date(payment.date).toLocaleDateString('fr-FR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>École Pierre de la Fontaine - Système de gestion des paiements</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const months = [
    'Septembre', 'Octobre', 'Novembre', 'Décembre',
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai'
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <button
            onClick={handlePrintDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-printer-line w-4 h-4 flex items-center justify-center"></i>
            <span>Imprimer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total élèves */}
          <StatCard color="blue" label="Total élèves" value={stats.totalStudents} icon="ri-group-line" />
          {/* Payé ce mois */}
          <StatCard color="green" label="Payé ce mois" value={stats.paidThisMonth} icon="ri-checkbox-circle-line" />
          {/* Montant total */}
          <StatCard color="purple" label="Montant total" value={`${stats.totalAmount.toLocaleString()} CFA`} icon="ri-money-dollar-circle-line" />
          {/* En attente */}
          <StatCard color="orange" label="En attente" value={stats.pendingPayments} icon="ri-time-line" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Paiements récents */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Paiements récents</h3>
            <div className="space-y-3">
              {recentPayments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun paiement enregistré</p>
              ) : (
                recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="ri-user-line text-blue-600 w-4 h-4"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.studentName}</p>
                        <p className="text-sm text-gray-500">{payment.month}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{payment.amount.toLocaleString()} CFA</p>
                      <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Répartition mensuelle */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition mensuelle</h3>
            <div className="space-y-2">
              {months.map((month, index) => {
                const monthPayments = recentPayments.filter(p => p.month === month);
                const percentage = stats.totalStudents > 0 ? (monthPayments.length / stats.totalStudents) * 100 : 0;

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
                      <span className="text-sm text-gray-500 w-12">{monthPayments.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  color,
  label,
  value,
  icon
}: {
  color: string;
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className={`bg-${color}-50 p-6 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{label}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <i className={`${icon} text-${color}-600 w-6 h-6`}></i>
        </div>
      </div>
    </div>
  );
}
