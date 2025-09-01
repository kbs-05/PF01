'use client';

import { useEffect, useState } from 'react';
import { getPayments } from '@/lib/database'; // adapte le chemin si besoin
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

type Remainder = {
  month: string;
  amount: number;
};

type Payment = {
  id: string;
  studentName: string;
  studentMatricule: string;
  monthsPaid: string[]; // mois payés
  remainder?: Remainder; // reste éventuel
  amount: number; // montant payé
  paymentMethod: string;
  date: string | Timestamp;
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'student'>('date');

  const months = [
    'INSCRIPTION', 'REINSCRIPTION', 'FOURNITURE', 'TENUE', 'POLO', 'POLO DE SPORT',
    'Septembre', 'Octobre', 'Novembre', 'Décembre',
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai'
  ];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getPayments();
        setPayments(data);
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error);
      }
    };
    fetchPayments();
  }, []);

  const paymentDateToJsDate = (date: string | Timestamp): Date => {
    if (!date) return new Date(0);
    if (date instanceof Timestamp) return date.toDate();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const filteredPayments = payments
    .filter(payment =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentMatricule.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(payment => {
      if (!selectedMonth) return true;
      return payment.monthsPaid.includes(selectedMonth) || payment.remainder?.month === selectedMonth;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      if (sortBy === 'student') return a.studentName.localeCompare(b.studentName);
      const dateA = paymentDateToJsDate(a.date);
      const dateB = paymentDateToJsDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Suivi des paiements</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher un élève ou matricule"
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
          {months.map(month => (
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

      <div className="mb-4 text-lg font-semibold">
        Montant total : <span className="text-green-600">{totalAmount.toLocaleString()} FCFA</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Nom de l'élève</th>
              <th className="p-3 border">Matricule</th>
              <th className="p-3 border">Mois</th>
              <th className="p-3 border">Montant</th>
              <th className="p-3 border">Mode de paiement</th>
              <th className="p-3 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4">Aucun paiement trouvé</td>
              </tr>
            )}
            {filteredPayments.map(payment => {
              const date = paymentDateToJsDate(payment.date);
              const monthsDisplay = payment.remainder
                ? `${payment.monthsPaid.join(', ')} (reste ${payment.remainder.amount} pour ${payment.remainder.month})`
                : payment.monthsPaid.join(', ');

              return (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{payment.studentName}</td>
                  <td className="p-3 border">{payment.studentMatricule}</td>
                  <td className="p-3 border">{monthsDisplay}</td>
                  <td className="p-3 border">{payment.amount.toLocaleString()} FCFA</td>
                  <td className="p-3 border">{payment.paymentMethod}</td>
                  <td className="p-3 border">{date.getTime() > 0 ? format(date, 'dd/MM/yyyy') : 'Date invalide'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
