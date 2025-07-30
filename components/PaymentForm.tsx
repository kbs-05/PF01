'use client';

import { useState, useEffect } from 'react';
import { addPayment, getStudents } from '../lib/database';
import { generateReceipt, downloadReceipt } from '../lib/receipt';

type Payment = {
  id: string;
  studentName: string;
  month: string;
  amount: number;
  paymentMethod: string;
  date: string;
  academicYear: string;
};

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    class: '',
    studentName: '',
    month: [] as string[],
    amount: '',
    academicYear: ''
  });

  const [students, setStudents] = useState<{ id: string; name: string; class: string }[]>([]);
  const [studentInputType, setStudentInputType] = useState<'list' | 'manual'>('list');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const months = [
    'INSCRIPTION', 'FOURNITURE', 'TENUE', 'POLO', 'POLO DE SPORT',
    'Septembre', 'Octobre', 'Novembre', 'Décembre',
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai'
  ];
  const classes = ['2ANS', '3ANS', '4ANS', '5ANS', 'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];

  useEffect(() => {
    const fetchStudents = async () => {
      const data = await getStudents();
      setStudents(data);
    };
    fetchStudents();
  }, []);

  const filteredStudents = formData.class
    ? students.filter(student => student.class === formData.class)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { class: selectedClass, studentName, month, amount, academicYear } = formData;

    if (!selectedClass || !studentName || month.length === 0 || !amount || !academicYear) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsProcessing(true);
    try {
      const payment: Payment = {
        id: Date.now().toString(),
        studentName,
        month: month.join(', '),
        amount: parseFloat(amount),
        paymentMethod: 'cash',
        date: new Date().toISOString(),
        academicYear
      };

      await addPayment(payment);
      setLastPayment(payment);
      setShowSuccess(true);
      setPaymentCompleted(true);
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
      alert('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewPayment = () => {
    setFormData({ class: '', studentName: '', month: [], amount: '', academicYear: '' });
    setStudentInputType('list');
    setShowSuccess(false);
    setPaymentCompleted(false);
    setLastPayment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'class') {
      setFormData(prev => ({
        ...prev,
        class: value,
        studentName: ''
      }));
    } else if (name !== 'month') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      month: selected
    }));
  };

  const handleStudentInputTypeChange = (type: 'list' | 'manual') => {
    setStudentInputType(type);
    setFormData(prev => ({
      ...prev,
      studentName: ''
    }));
  };

  const handlePrintReceipt = () => {
    if (lastPayment) {
      generateReceipt(lastPayment);
    }
  };

  const handleDownloadReceipt = () => {
    if (lastPayment) {
      downloadReceipt(lastPayment);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau paiement</h2>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-checkbox-circle-line text-green-600 w-5 h-5 mr-2"></i>
                <span className="text-green-800">Paiement enregistré avec succès !</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={handlePrintReceipt} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  <i className="ri-printer-line mr-1"></i> Imprimer
                </button>
                <button onClick={handleDownloadReceipt} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                  <i className="ri-download-line mr-1"></i> Télécharger
                </button>
                <button onClick={handleNewPayment} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">
                  <i className="ri-add-line mr-1"></i> Nouveau paiement
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                disabled={paymentCompleted}
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((className, index) => (
                  <option key={index} value={className}>{className}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                Année académique *
              </label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                placeholder="2024-2025"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                disabled={paymentCompleted}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'élève *</label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input type="radio" name="studentInputType" value="list" checked={studentInputType === 'list'} onChange={() => handleStudentInputTypeChange('list')} className="mr-2" disabled={paymentCompleted} />
                  Liste
                </label>
                <label className="flex items-center">
                  <input type="radio" name="studentInputType" value="manual" checked={studentInputType === 'manual'} onChange={() => handleStudentInputTypeChange('manual')} className="mr-2" disabled={paymentCompleted} />
                  Manuel
                </label>
              </div>

              {studentInputType === 'list' ? (
                <select
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={!formData.class || paymentCompleted}
                >
                  <option value="">
                    {formData.class ? "Sélectionner un élève" : "Choisir d'abord une classe"}
                  </option>
                  {filteredStudents.map((student, index) => (
                    <option key={index} value={student.name}>{student.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Nom de l'élève"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={paymentCompleted}
                />
              )}
            </div>

            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Mois de paiement *
              </label>
              <select
                id="month"
                name="month"
                multiple
                value={formData.month}
                onChange={handleMonthChange}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg"
                required
                disabled={paymentCompleted}
              >
                {months.map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Montant (CFA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="15000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                  disabled={paymentCompleted}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  CFA
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Récapitulatif</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Année académique:</span>
                <span className="text-blue-900">{formData.academicYear || 'Non définie'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Classe:</span>
                <span className="text-blue-900">{formData.class || 'Non sélectionnée'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Élève:</span>
                <span className="text-blue-900">{formData.studentName || 'Non sélectionné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Mois:</span>
                <span className="text-blue-900">{formData.month.length > 0 ? formData.month.join(', ') : 'Non sélectionné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Montant:</span>
                <span className="text-blue-900 font-medium">{formData.amount ? `${parseFloat(formData.amount).toLocaleString()} CFA` : '0 CFA'}</span>
              </div>
            </div>
          </div>

          {!paymentCompleted && (
            <div className="flex space-x-4">
              <button type="submit" disabled={isProcessing} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {isProcessing ? (
                  <>
                    <i className="ri-loader-4-line animate-spin w-5 h-5 mr-2"></i> Traitement...
                  </>
                ) : (
                  <>
                    <i className="ri-money-dollar-circle-line w-5 h-5 mr-2"></i> Enregistrer le paiement
                  </>
                )}
              </button>

              <button type="button" onClick={() => setFormData({ class: '', studentName: '', month: [], amount: '', academicYear: '' })} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
