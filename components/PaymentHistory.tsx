'use client';

import { useEffect, useState } from 'react';
import { getPayments } from '@/lib/firebase'; // récupère depuis Firestore
import { format } from 'date-fns';

// Type Payment (à garder identique)
type Payment = {
  id: string;
  studentName: string;
  month: string;
  amount: number;
  paymentMethod: string;
  date: string;
};

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'student'>('date');

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await getPayments();
      setPayments(data);
    };
    fetchPayments();
  }, []);

  // Filtrage et tri des paiements
  const filteredPayments = payments
    .filter(payment =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(payment => (selectedMonth ? payment.month === selectedMonth : true))
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'student') return a.studentName.localeCompare(b.studentName);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Calcul du total des montants des paiements filtrés
  const totalAmount = filteredPayments.reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Suivi des paiements</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher un élève"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="">Tous les mois</option>
          {[
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ].map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'student')}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="date">Trier par date</option>
          <option value="amount">Trier par montant</option>
          <option value="student">Trier par nom</option>
        </select>
      </div>

      {/* Affichage du total */}
      <div className="mb-4 text-lg font-semibold">
        Montant total : <span className="text-green-600">{totalAmount.toLocaleString()} FCFA</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Élève</th>
              <th className="p-3 border">Mois</th>
              <th className="p-3 border">Montant</th>
              <th className="p-3 border">Mode de paiement</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="p-3 border">{payment.studentName}</td>
                <td className="p-3 border">{payment.month}</td>
                <td className="p-3 border">{payment.amount.toLocaleString()} FCFA</td>
                <td className="p-3 border">{payment.paymentMethod}</td>
                <td className="p-3 border">
                  {format(new Date(payment.date), 'dd/MM/yyyy')}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Aucun paiement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
