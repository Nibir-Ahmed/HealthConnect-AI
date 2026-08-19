import { db } from './firebase';
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';

export const getDoctorAppointments = async (doctorId) => {
  try {
    const q = doctorId 
      ? query(collection(db, 'appointments'), where('doctorId', '==', String(doctorId)))
      : collection(db, 'appointments');
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((docSnap) => {
      appointments.push({ id: docSnap.id, ...docSnap.data() });
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching doctor appointments from Firestore:', error);
    return [];
  }
};

export const getPatientAppointments = async (patientId) => {
  try {
    const q = patientId 
      ? query(collection(db, 'appointments'), where('patientId', '==', String(patientId)))
      : collection(db, 'appointments');
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((docSnap) => {
      appointments.push({ id: docSnap.id, ...docSnap.data() });
    });
    return appointments;
  } catch (error) {
    console.error('Error fetching patient appointments from Firestore:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const docRef = doc(db, 'appointments', String(id));
    await updateDoc(docRef, { status });
    return { id, status };
  } catch (error) {
    console.error('Error updating appointment status in Firestore:', error);
    throw error;
  }
};

