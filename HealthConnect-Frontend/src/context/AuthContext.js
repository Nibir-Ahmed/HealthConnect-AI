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

  const googleLogin = async () => {
    return { success: true };
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

