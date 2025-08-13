'use client';

import { useState, useEffect } from 'react';
import { addPayment, getStudents } from '../lib/database';
import { generateReceipt, downloadReceipt } from '../lib/receipt';

type Payment = {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentMatricule: string;
  monthsPaid: string[];
  remainder?: { month: string; amount: number };
  amount: number;
  paymentMethod: string;
  date: string;
  academicYear: string;
};

type Student = {
  id: string;
  name: string;
  matricule: string;
  class: string;
};

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    class: '',
    studentName: '',
    studentMatricule: '',
    receiptNumber: '',
    monthsPaid: [] as string[],
    remainderMonth: '',
    remainderAmount: '',
    amount: '',
    academicYear: ''
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [studentInputType, setStudentInputType] = useState<'list' | 'manual'>('list');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const months = [
    'INSCRIPTION', 'REINSCRIPTION', 'FOURNITURE', 'TENUE', 'POLO', 'POLO DE SPORT',
    'Septembre', 'Octobre', 'Novembre','Décembre','Janvier', 'Février', 'Mars', 'Avril', 'Mai'
  ];

  const classes = ['2ANS', '3ANS', '4ANS', '5ANS', '1ère', '2ème', '3ème', '4ème', '5ème'];

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'class') {
      setFormData(prev => ({
        ...prev,
        class: value,
        studentName: '',
        studentMatricule: ''
      }));
    } else if (name === 'studentName') {
      const selectedStudent = students.find(s => s.name === value);
      setFormData(prev => ({
        ...prev,
        studentName: value,
        studentMatricule: selectedStudent ? selectedStudent.matricule : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, monthsPaid: selected }));
  };

  const handleStudentInputTypeChange = (type: 'list' | 'manual') => {
    setStudentInputType(type);
    setFormData(prev => ({ ...prev, studentName: '', studentMatricule: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { class: selectedClass, studentName, studentMatricule, monthsPaid, remainderMonth, remainderAmount, amount, academicYear, receiptNumber } = formData;

    if (!selectedClass || !studentName || !studentMatricule || monthsPaid.length === 0 || !amount || !academicYear || !receiptNumber) {
      alert('Veuillez remplir tous les champs obligatoires, y compris le numéro de reçu');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentToSave = {
        studentName,
        studentMatricule,
        monthsPaid,
        remainder: remainderAmount && remainderMonth ? { month: remainderMonth, amount: parseFloat(remainderAmount) } : undefined,
        amount: parseFloat(amount),
        paymentMethod: 'cash',
        date: new Date().toISOString(),
        academicYear
      };

      const savedPaymentFromDB = await addPayment(paymentToSave);

      // ⚡ Solution 1 : ajouter receiptNumber manuellement
      const savedPayment: Payment = {
        ...savedPaymentFromDB,
        receiptNumber
      };

      setLastPayment(savedPayment);
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
    setFormData({ class: '', studentName: '', studentMatricule: '', receiptNumber: '', monthsPaid: [], remainderMonth: '', remainderAmount: '', amount: '', academicYear: '' });
    setStudentInputType('list');
    setShowSuccess(false);
    setPaymentCompleted(false);
    setLastPayment(null);
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau paiement</h2>

        {showSuccess && lastPayment && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-checkbox-circle-line text-green-600 w-5 h-5 mr-2"></i>
                <span className="text-green-800">Paiement enregistré avec succès !</span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => generateReceipt(lastPayment)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  <i className="ri-printer-line mr-1"></i> Imprimer
                </button>
                <button onClick={() => downloadReceipt(lastPayment)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
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
            {/* Classe */}
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">Classe *</label>
              <select id="class" name="class" value={formData.class} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={paymentCompleted}>
                <option value="">Sélectionner une classe</option>
                {classes.map((className, idx) => <option key={idx} value={className}>{className}</option>)}
              </select>
            </div>

            {/* Année académique */}
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">Année académique *</label>
              <input type="text" id="academicYear" name="academicYear" placeholder="2024-2025" value={formData.academicYear} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={paymentCompleted} />
            </div>

            {/* Numéro de reçu */}
            <div>
              <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">N° de reçu *</label>
              <input type="text" id="receiptNumber" name="receiptNumber" placeholder="Ex: R0001" value={formData.receiptNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={paymentCompleted} />
            </div>

            {/* Élève */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'élève *</label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input type="radio" name="studentInputType" value="list" checked={studentInputType === 'list'} onChange={() => handleStudentInputTypeChange('list')} className="mr-2" disabled={paymentCompleted} /> Liste
                </label>
                <label className="flex items-center">
                  <input type="radio" name="studentInputType" value="manual" checked={studentInputType === 'manual'} onChange={() => handleStudentInputTypeChange('manual')} className="mr-2" disabled={paymentCompleted} /> Manuel
                </label>
              </div>

              {studentInputType === 'list' ? (
                <select id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={!formData.class || paymentCompleted}>
                  <option value="">{formData.class ? "Sélectionner un élève" : "Choisir d'abord une classe"}</option>
                  {filteredStudents.map((student) => <option key={student.id} value={student.name}>{student.name} ({student.matricule})</option>)}
                </select>
              ) : (
                <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} placeholder="Nom de l'élève" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={paymentCompleted} />
              )}
            </div>

            {/* Mois payés */}
            <div>
              <label htmlFor="monthsPaid" className="block text-sm font-medium text-gray-700 mb-2">Mois payés *</label>
              <select id="monthsPaid" name="monthsPaid" multiple value={formData.monthsPaid} onChange={handleMonthsChange} className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg" required disabled={paymentCompleted}>
                {months.map((month, idx) => <option key={idx} value={month}>{month}</option>)}
              </select>
            </div>

            {/* Montant total payé */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Montant payé (CFA) *</label>
              <div className="relative">
                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="15000" className="w-full px-3 py-2 border border-gray-300 rounded-lg" required disabled={paymentCompleted} />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">CFA</span>
              </div>
            </div>

            {/* Reste */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reste à payer (si partiel)</label>
              <input type="number" name="remainderAmount" value={formData.remainderAmount} onChange={handleInputChange} placeholder="Montant restant" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={paymentCompleted} />
              <select name="remainderMonth" value={formData.remainderMonth} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2" disabled={paymentCompleted}>
                <option value="">Choisir le mois du reste</option>
                {months.map((month, idx) => <option key={idx} value={month}>{month}</option>)}
              </select>
            </div>
          </div>

          {/* Boutons */}
          {!paymentCompleted && (
            <div className="flex space-x-4">
              <button type="submit" disabled={isProcessing} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                {isProcessing ? <> <i className="ri-loader-4-line animate-spin w-5 h-5 mr-2"></i> Traitement... </> : <> <i className="ri-money-dollar-circle-line w-5 h-5 mr-2"></i> Enregistrer le paiement </>}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
