import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const getDoctors = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const doctors = [];
    querySnapshot.forEach((docSnap) => {
      doctors.push({ id: docSnap.id, ...docSnap.data() });
    });
    return doctors;
  } catch (error) {
    console.error('Error fetching doctors from Firestore:', error);
    return [];
  }
};

export const getDoctorById = async (id) => {
  try {
    const docRef = doc(db, 'doctors', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor from Firestore:', error);
    return null;
  }
};

