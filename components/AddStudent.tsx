'use client';

import { useState } from 'react';
import { addStudent, getStudentsByClass } from '@/lib/database'; // On suppose que tu as une fonction pour récupérer les élèves par classe

export default function AjouterEleve() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    classe: '',
    matricule: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour générer le matricule dans l'ordre par classe
  const generateMatricule = async (classe: string) => {
    // Récupérer tous les élèves de cette classe
    const studentsInClass = await getStudentsByClass(classe);

    // Trouver le matricule le plus élevé
    let maxNumber = 0;
    studentsInClass.forEach((student: any) => {
      if (student.matricule) {
        const parts = student.matricule.split('-');
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    // Nouveau numéro
    const newNumber = maxNumber + 1;

    // Formater sur 3 chiffres
    const formattedNumber = String(newNumber).padStart(3, '0');

    return `${classe}-${formattedNumber}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Générer matricule
      const newMatricule = await generateMatricule(formData.classe);

      const studentToAdd = {
        name: formData.nom + ' ' + formData.prenom,
        class: formData.classe,
        matricule: newMatricule,
        parentName: '',
        parentPhone: '',
      };

      await addStudent(studentToAdd);

      setSuccess(true);
      setFormData({ nom: '', prenom: '', classe: '', matricule: '' });
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Ajouter un élève</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formData.nom}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={formData.prenom}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="matricule"
          placeholder="Matricule (généré automatiquement)"
          value={formData.matricule}
          className="w-full p-2 border rounded bg-gray-100"
          disabled
        />
        <select
          name="classe"
          value={formData.classe}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Sélectionner une classe</option>
          <option value="2ANS">2ANS</option>
          <option value="3ANS">3ANS</option>
          <option value="4ANS">4ANS</option>
          <option value="5ANS">5ANS</option>
          <option value="1ère">1ère</option>
          <option value="2ème">2ème</option>
          <option value="3ème">3ème</option>
          <option value="4ème">4ème</option>
          <option value="5ème">5ème</option>
           
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter'}
        </button>

        {success && <p className="text-green-600">Élève ajouté avec succès ✅</p>}
      </form>
    </div>
  );
}
