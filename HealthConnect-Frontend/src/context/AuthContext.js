import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, uid: firebaseUser.uid, ...userDoc.data() });
          } else {
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'patient'
            });
          }
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : { email, role: 'patient' };
      setUser({ id: firebaseUser.uid, uid: firebaseUser.uid, ...userData });
      return { success: true };
    } catch (error) {
      console.error('Firebase Login Error:', error.message);
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { email, password, name, role } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const profileData = {
        name: name || 'User',
        email: email,
        role: role || 'patient',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), profileData);
      setUser({ id: firebaseUser.uid, uid: firebaseUser.uid, ...profileData });
      return { success: true };
    } catch (error) {
      console.error('Firebase Register Error:', error.message);
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const googleLogin = async (googleUserData) => {
    try {
      const { uid, email, name, avatar, role } = googleUserData;
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      let profileData = {
        name: name || 'Google User',
        email: email,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=00A896&color=fff&bold=true`,
        role: role || 'patient',
        lastLogin: new Date().toISOString()
      };

      if (!userSnap.exists()) {
        profileData.createdAt = new Date().toISOString();
        await setDoc(userRef, profileData);
      } else {
        const existingData = userSnap.data();
        profileData = { ...existingData, ...profileData, role: existingData.role || role || 'patient' };
        await setDoc(userRef, profileData, { merge: true });
      }

      // If user is a doctor, ensure doctor document exists in 'doctors' collection
      if (profileData.role === 'doctor') {
        const docRef = doc(db, 'doctors', uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            id: uid,
            userId: uid,
            name: name ? (name.startsWith('Dr.') ? name : `Dr. ${name}`) : 'Dr. Specialist',
            email: email,
            specialty: 'General Physician',
            avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doctor')}&background=00A896&color=fff&bold=true`,
            experience: 5,
            rating: 5.0,
            reviews: 0,
            consultationFee: 40,
            bio: 'Verified medical practitioner on HealthConnect.',
            isVerified: true,
            isOnline: true,
            availability: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
            createdAt: new Date().toISOString()
          });
        }
      }

      setUser({ id: uid, uid, ...profileData });
      return { success: true };
    } catch (error) {
      console.error('Google login sync error:', error);
      return { success: false, message: error.message };
    }
  };

  const updateUser = async (updatedData) => {
    if (user && user.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
        setUser((prev) => ({ ...prev, ...updatedData }));
      } catch (err) {
        console.error('Error updating user profile in Firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export const useAuth = () => useContext(AuthContext);
export default AuthContext;

