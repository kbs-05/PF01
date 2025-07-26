// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase (à remplacer par tes infos)
const firebaseConfig = {
  apiKey: "AIzaSyCcVV_FeUdY2y-o-50SXawHhZPSrS4nvVg",
  authDomain: "pf00-b9e58.firebaseapp.com",
  projectId: "pf00-b9e58",
  storageBucket: "pf00-b9e58.firebasestorage.app",
  messagingSenderId: "815924358207",
  appId: "1:815924358207:web:689db0dc393a6a18f19c8a",
  measurementId: "G-0KC2DSNN91"
};

// Initialise Firebase (évite les doubles initialisations)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore & Auth exportés
const db = getFirestore(app);
const auth = getAuth(app);

// Interfaces pour typer les données

export interface Student {
  id: string;
  name: string;
  class: string;
  // autres propriétés si nécessaire
}

export interface Payment {
  id: string;
  studentName: string;
  month: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

// Fonction pour récupérer tous les étudiants
export async function getStudents(): Promise<Student[]> {
  try {
    const studentsCol = collection(db, 'students');
    const studentsSnapshot: QuerySnapshot<DocumentData> = await getDocs(studentsCol);

    const studentsList: Student[] = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, 'id'>),
    }));

    return studentsList;
  } catch (error) {
    console.error('Erreur récupération étudiants :', error);
    return [];
  }
}

// Fonction pour ajouter un étudiant
export async function addStudent(student: Omit<Student, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'students'), student);
    return docRef.id;
  } catch (error) {
    console.error('Erreur ajout étudiant :', error);
    throw error;
  }
}

// Fonction pour mettre à jour un étudiant (réinscription ou modification)
export async function updateStudent(id: string, student: Partial<Student>): Promise<void> {
  try {
    const studentRef = doc(db, 'students', id);
    await updateDoc(studentRef, student);
  } catch (error) {
    console.error('Erreur mise à jour étudiant :', error);
    throw error;
  }
}

// Fonction pour ajouter un paiement
export async function addPayment(payment: Omit<Payment, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'payments'), payment);
    return docRef.id;
  } catch (error) {
    console.error('Erreur ajout paiement :', error);
    throw error;
  }
}

// Fonction pour récupérer tous les paiements
export async function getPayments(): Promise<Payment[]> {
  try {
    const paymentsCol = collection(db, 'payments');
    const paymentsSnapshot: QuerySnapshot<DocumentData> = await getDocs(paymentsCol);

    const paymentsList: Payment[] = paymentsSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<Payment, 'id'> & { date: any };

      let dateStr: string;
      if (
        typeof data.date === 'object' &&
        data.date !== null &&
        'toDate' in data.date &&
        typeof data.date.toDate === 'function'
      ) {
        // data.date est un Timestamp Firestore
        dateStr = data.date.toDate().toISOString();
      } else if (typeof data.date === 'string') {
        // data.date est déjà une string
        dateStr = data.date;
      } else {
        // Cas par défaut, on met la date actuelle (ou vide)
        dateStr = new Date().toISOString();
      }

      return {
        id: doc.id,
        studentName: data.studentName,
        month: data.month,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        date: dateStr,
      };
    });

    return paymentsList;
  } catch (error) {
    console.error('Erreur récupération paiements :', error);
    return [];
  }
}

// Fonction pour récupérer les paiements d'un étudiant spécifique
export async function getPaymentsByStudent(studentName: string): Promise<Payment[]> {
  try {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, where('studentName', '==', studentName));
    const paymentsSnapshot = await getDocs(q);

    const paymentsList: Payment[] = paymentsSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<Payment, 'id'> & { date: any };

      let dateStr: string;
      if (
        typeof data.date === 'object' &&
        data.date !== null &&
        'toDate' in data.date &&
        typeof data.date.toDate === 'function'
      ) {
        dateStr = data.date.toDate().toISOString();
      } else if (typeof data.date === 'string') {
        dateStr = data.date;
      } else {
        dateStr = new Date().toISOString();
      }

      return {
        id: doc.id,
        studentName: data.studentName,
        month: data.month,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        date: dateStr,
      };
    });

    return paymentsList;
  } catch (error) {
    console.error('Erreur récupération paiements par étudiant :', error);
    return [];
  }
}

export { app, db, auth };
