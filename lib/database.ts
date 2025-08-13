// lib/database.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------------- Types ----------------
export interface Student {
  id: string;
  matricule: string; // ✅ Nouveau champ
  name: string;
  class: string;
  parentName: string;
  parentPhone: string;
}

export interface Payment {
  id: string;
  studentName: string;
  studentMatricule: string; // ✅ Nouveau champ ajouté
  month: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

// ---------------- Étudiants ----------------

// ✅ Récupérer tous les étudiants
export const getStudents = async (): Promise<Student[]> => {
  const studentsCol = collection(db, 'students');
  const snapshot = await getDocs(studentsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
};

// ✅ Récupérer les étudiants par classe
export const getStudentsByClass = async (className: string): Promise<Student[]> => {
  const q = query(collection(db, 'students'), where('class', '==', className));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
};

// ✅ Ajouter un étudiant
export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  const docRef = await addDoc(collection(db, 'students'), {
    ...student,
    createdAt: Timestamp.now(),
  });
  return { id: docRef.id, ...student };
};

// ✅ Mettre à jour un étudiant
export const updateStudent = async (id: string, updates: Partial<Student>): Promise<void> => {
  const docRef = doc(db, 'students', id);
  await updateDoc(docRef, updates);
};

// ✅ Supprimer un étudiant
export const deleteStudent = async (id: string): Promise<void> => {
  const docRef = doc(db, 'students', id);
  await deleteDoc(docRef);
};

// ---------------- Paiements ----------------

// ✅ Récupérer tous les paiements
export const getPayments = async (): Promise<Payment[]> => {
  const paymentsCol = collection(db, 'payments');
  const snapshot = await getDocs(paymentsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
};

// ✅ Ajouter un paiement
export const addPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
  const docRef = await addDoc(collection(db, 'payments'), {
    ...payment,
    date: payment.date ? new Date(payment.date) : Timestamp.now(),
  });
  return { id: docRef.id, ...payment };
};

// ✅ Supprimer un paiement
export const deletePayment = async (id: string): Promise<void> => {
  const docRef = doc(db, 'payments', id);
  await deleteDoc(docRef);
};
