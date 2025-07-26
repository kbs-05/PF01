'use client';

import { useState, useEffect } from 'react';
import { addPayment, getStudents } from '../lib/database';
import { generateReceipt, downloadReceipt } from '../lib/receipt';

type Payment = {
  id: string;
  studentName: string;
  month: string; // chaîne concaténée des mois sélectionnés
  amount: number;
  paymentMethod: string;
  date: string;
};

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    class: '',
    studentName: '',
    month: [] as string[],
    amount: ''
  });

  const [students, setStudents] = useState<{ id: string; name: string; class: string }[]>([]);
  const [studentInputType, setStudentInputType] = useState<'list' | 'manual'>('list');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const months = [
    'INSCRIPTION',
    'FOURNITURE',
    'TENUE',
    'POLO',
    'POLO DE SPORT',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai'
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

    const { class: selectedClass, studentName, month, amount } = formData;

    if (!selectedClass || !studentName || month.length === 0 || !amount) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsProcessing(true);

    try {
      const payment: Payment = {
        studentName,
        month: month.join(', '), // convertir tableau en chaîne
        amount: parseFloat(amount),
        paymentMethod: 'cash',
        date: new Date().toISOString(),
        id: Date.now().toString()
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
    setFormData({ class: '', studentName: '', month: [], amount: '' });
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
        studentName: '' // reset studentName quand la classe change
      }));
    } else if (name !== 'month') { // ignore le champ 'month' ici, il est géré par handleMonthChange
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Gestion dédiée du select multiple pour 'month'
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
                <i className="ri-checkbox-circle-line text-green-600 w-5 h-5 mr-2 flex items-center justify-center"></i>
                <span className="text-green-800">Paiement enregistré avec succès !</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrintReceipt}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-printer-line w-4 h-4 mr-1 flex items-center justify-center"></i>
                  Imprimer
                </button>
                <button
                  onClick={handleDownloadReceipt}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-download-line w-4 h-4 mr-1 flex items-center justify-center"></i>
                  Télécharger
                </button>
                <button
                  onClick={handleNewPayment}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line w-4 h-4 mr-1 flex items-center justify-center"></i>
                  Nouveau paiement
                </button>
              </div>
            </div>
          </div>
        )}

        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <div className="relative">
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                  required
                  disabled={paymentCompleted}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((className, index) => (
                    <option key={index} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'élève *
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="studentInputType"
                    value="list"
                    checked={studentInputType === 'list'}
                    onChange={() => handleStudentInputTypeChange('list')}
                    className="mr-2"
                    disabled={paymentCompleted}
                  />
                  <span className="text-sm text-gray-700">Liste</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="studentInputType"
                    value="manual"
                    checked={studentInputType === 'manual'}
                    onChange={() => handleStudentInputTypeChange('manual')}
                    className="mr-2"
                    disabled={paymentCompleted}
                  />
                  <span className="text-sm text-gray-700">Manuel</span>
                </label>
              </div>

              {studentInputType === 'list' ? (
                <div className="relative">
                  <select
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                    required
                    disabled={!formData.class || paymentCompleted}
                  >
                    <option value="">
                      {formData.class ? "Sélectionner un élève" : "Choisir d'abord une classe"}
                    </option>
                    {filteredStudents.map((student, index) => (
                      <option key={index} value={student.name}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 flex items-center justify-center pointer-events-none"></i>
                </div>
              ) : (
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Saisir le nom de l'élève"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={paymentCompleted}
              >
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <span className="text-blue-700">Classe:</span>
                <span className="text-blue-900">{formData.class || 'Non sélectionnée'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Élève:</span>
                <span className="text-blue-900">{formData.studentName || 'Non sélectionné'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Mois:</span>
                <span className="text-blue-900">
                  {formData.month.length > 0 ? formData.month.join(', ') : 'Non sélectionné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Montant:</span>
                <span className="text-blue-900 font-medium">
                  {formData.amount ? `${parseFloat(formData.amount).toLocaleString()} CFA` : '0 CFA'}
                </span>
              </div>
            </div>
          </div>

          {!paymentCompleted && (
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <i className="ri-loader-4-line animate-spin w-5 h-5 mr-2 flex items-center justify-center"></i>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="ri-money-dollar-circle-line w-5 h-5 mr-2 flex items-center justify-center"></i>
                    Enregistrer le paiement
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ class: '', studentName: '', month: [], amount: '' });
                  setStudentInputType('list');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
