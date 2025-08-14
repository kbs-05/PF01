'use client';

import { useState, useEffect } from 'react';
import { getStudents, getPayments } from '../lib/database';

interface Student {
  id: string;
  matricule: string;
  name: string;
  class: string;
}

interface Payment {
  id: string;
  studentName: string;
  monthsPaid: string[];
  remainder?: { month: string; amount: number };
  amount: number;
  paymentMethod: string;
  date: string;
  academicYear: string;
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const months = [
    'INSCRIPTION', 'REINSCRIPTION', 'FOURNITURE', 'TENUE', 'POLO', 'POLO DE SPORT',
    'Septembre', 'Octobre', 'Novembre','Décembre','Janvier', 'Février', 'Mars', 'Avril', 'Mai'
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const studentsData = await getStudents();
        setStudents(studentsData);

        const paymentsData = await getPayments();
        setPayments(paymentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
    fetchData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) 
                          || student.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = Array.from(new Set(students.map(s => s.class)));

  // ---------------- Logique paiement ----------------
  const getPaymentStatus = (studentName: string, month: string) => {
    const studentPayments = payments.filter(p => p.studentName === studentName && p.monthsPaid.includes(month));

    if (studentPayments.length === 0) return 'unpaid';

    // Si au moins un paiement pour ce mois n'a pas de reste ou reste = 0 => payé
    for (const p of studentPayments) {
      if (!p.remainder || (p.remainder.month !== month) || p.remainder.amount === 0) {
        return 'paid';
      }
    }

    // Sinon, il y a un reste pour ce mois => partiel
    return 'partial';
  };

  // ---------------- Export CSV ----------------
  const exportToCSV = () => {
    const csvData = [
      ['Matricule', 'Nom', 'Classe', ...months],
      ...filteredStudents.map(student => [
        student.matricule,
        student.name,
        student.class,
        ...months.map(month => {
          const status = getPaymentStatus(student.name, month);
          if (status === 'paid') return 'Payé';
          if (status === 'partial') return 'Partiel';
          return 'Non payé';
        })
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suivi_paiements.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Suivi des paiements</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>Exporter CSV</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher un élève ou matricule..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="sm:w-48 px-3 py-2 border rounded-lg"
        >
          <option value="">Toutes les classes</option>
          {classes.map((cls, idx) => <option key={idx} value={cls}>{cls}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th>Matricule</th>
              <th>Élève</th>
              <th>Classe</th>
              {months.map((month, idx) => (
                <th key={idx}>{month.substring(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={3 + months.length} className="text-center py-8">Aucun élève trouvé</td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.matricule}</td>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  {months.map((month, idx) => {
                    const status = getPaymentStatus(student.name, month);
                    return (
                      <td key={idx} className="text-center">
                        {status === 'paid' && '✅'}
                        {status === 'partial' && '⚠️'}
                        {status === 'unpaid' && '❌'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
