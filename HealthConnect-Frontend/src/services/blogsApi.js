import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';

export const subscribeBlogs = (callback) => {
  const unsubscribe = onSnapshot(
    collection(db, 'blogs'),
    (querySnapshot) => {
      const blogs = [];
      querySnapshot.forEach((docSnap) => {
        blogs.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(blogs);
    },
    (error) => {
      console.error('Error listening to blogs in Firestore:', error);
      callback([]);
    }
  );
  return unsubscribe;
};

export const subscribeSavedBlogs = (callback) => {
  const q = query(collection(db, 'blogs'), where('isSaved', '==', true));
  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const blogs = [];
      querySnapshot.forEach((docSnap) => {
        blogs.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(blogs);
    },
    (error) => {
      console.error('Error listening to saved blogs in Firestore:', error);
      callback([]);
    }
  );
  return unsubscribe;
};

export const getBlogs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'blogs'));
    const blogs = [];
    querySnapshot.forEach((docSnap) => {
      blogs.push({ id: docSnap.id, ...docSnap.data() });
    });
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs from Firestore:', error);
    return [];
  }
};

export const getSavedBlogs = async () => {
  try {
    const q = query(collection(db, 'blogs'), where('isSaved', '==', true));
    const querySnapshot = await getDocs(q);
    const blogs = [];
    querySnapshot.forEach((docSnap) => {
      blogs.push({ id: docSnap.id, ...docSnap.data() });
    });
    return blogs;
  } catch (error) {
    console.error('Error fetching saved blogs from Firestore:', error);
    return [];
  }
};

export const getBlogById = async (id) => {
  try {
    const docRef = doc(db, 'blogs', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog from Firestore:', error);
    return null;
  }
};

export const toggleSaveBlog = async (id) => {
  try {
    const docRef = doc(db, 'blogs', String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentStatus = docSnap.data().isSaved || false;
      await setDoc(docRef, { isSaved: !currentStatus }, { merge: true });
      return { saved: !currentStatus };
    }
    return { saved: false };
  } catch (error) {
    console.error('Error saving blog in Firestore:', error);
    return { saved: false };
  }
};

export const deleteBlog = async (id) => {
  try {
    const docRef = doc(db, 'blogs', String(id));
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting blog from Firestore:', error);
    throw error;
  }
};

export const toggleLikeBlog = async (id, currentLikes, isLiked) => {
  try {
    const docRef = doc(db, 'blogs', String(id));
    await setDoc(docRef, {
      likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
      isLiked: !isLiked
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating like in Firestore:', error);
    return false;
  }
};


