'use client';

import { useState } from 'react';
import { addStudent } from '@/lib/database';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transformation des données du formulaire en objet compatible avec addStudent
      const studentToAdd = {
        name: formData.nom + ' ' + formData.prenom, // fusion nom + prénom dans "name"
        class: formData.classe,
        parentName: '',  // Pas de champs parent dans le formulaire, donc vide ici
        parentPhone: '', // Idem
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
          placeholder="Matricule"
          value={formData.matricule}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          disabled // Matricule n'est pas utilisé dans l'ajout, donc on peut désactiver ou enlever ce champ
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
          <option value="CP1">CP1</option>
          <option value="CP2">CP2</option>
          <option value="CE1">CE1</option>
          <option value="CE2">CE2</option>
          <option value="CM1">CM1</option>
          <option value="CM2">CM2</option> 
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
