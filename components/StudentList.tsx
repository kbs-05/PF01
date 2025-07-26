'use client';

import { useState, useEffect } from 'react';
import { getStudents, getPayments } from '../lib/firebase'; // adapte le chemin si besoin

interface Student {
  id: string;
  name: string;
  class: string;
  // autres propriétés si nécessaire
}

interface Payment {
  studentName: string;
  month: string;
  // autres propriétés si nécessaire
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const months = [
    'Septembre', 'Octobre', 'Novembre', 'Décembre', 'Janvier',
    'Février', 'Mars', 'Avril', 'Mai'
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
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === '' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = Array.from(new Set(students.map(s => s.class)));

  const hasPayment = (studentName: string, month: string) => {
    return payments.some(payment =>
      payment.studentName === studentName && payment.month === month
    );
  };

  const exportToCSV = () => {
    const csvData = [
      ['Nom', 'Classe', ...months],
      ...filteredStudents.map(student => [
        student.name,
        student.class,
        ...months.map(month => hasPayment(student.name, month) ? 'Payé' : 'Non payé')
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
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
          <span>Exporter CSV</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center"></i>
        </div>

        <div className="sm:w-48 relative">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 text-sm"
          >
            <option value="">Toutes les classes</option>
            {classes.map((cls, index) => (
              <option key={index} value={cls}>{cls}</option>
            ))}
          </select>
          <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center pointer-events-none"></i>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                {months.map((month, index) => (
                  <th key={index} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {month.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={2 + months.length} className="text-center py-8 text-gray-500">
                    Aucun élève trouvé
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <i className="ri-user-line text-blue-600 w-4 h-4 flex items-center justify-center"></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {student.class}
                      </span>
                    </td>
                    {months.map((month, monthIndex) => (
                      <td key={monthIndex} className="px-3 py-4 text-center">
                        {hasPayment(student.name, month) ? (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <i className="ri-check-line text-green-600 w-4 h-4 flex items-center justify-center"></i>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <i className="ri-close-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Total: {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
