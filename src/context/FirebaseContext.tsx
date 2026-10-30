import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, signInWithPopup, googleProvider, signOut } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useSimulationStore } from '../stores/simulationStore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isSynced: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);
  
  const reloadFromStorage = useSimulationStore((s) => s.reloadFromStorage);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Initial sync from Firestore to Zustand
        await syncUserProgress(user.uid);
      } else {
        // Fallback to local storage if not logged in
        reloadFromStorage();
      }
    });

    return () => unsubscribe();
  }, [reloadFromStorage]);

  const syncUserProgress = async (uid: string) => {
    const progressDocRef = doc(db, 'users', uid, 'progress', 'current');
    const docSnap = await getDoc(progressDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Update store with cloud data
      // Note: We'll add a helper in store to bulk update from cloud
      useSimulationStore.setState({
        completedLessons: data.completedLessons || [],
        completedChallenges: data.completedChallenges || [],
        lessonProgress: data.lessonProgress || {},
        onboardingProgress: data.onboardingProgress || { firewallInspected: false, policyAltered: false },
        activeLessonId: data.activeLessonId || 'lesson-01-cia-triad',
      });
      setIsSynced(true);
    } else {
      // First time user, push local data to cloud
      const state = useSimulationStore.getState();
      await setDoc(progressDocRef, {
        uid,
        completedLessons: state.completedLessons,
        completedChallenges: state.completedChallenges,
        lessonProgress: state.lessonProgress,
        onboardingProgress: state.onboardingProgress,
        activeLessonId: state.activeLessonId,
        updatedAt: new Date().toISOString()
      });
      setIsSynced(true);
    }

    // Subscribe to cloud changes
    onSnapshot(progressDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        useSimulationStore.setState({
          completedLessons: data.completedLessons || [],
          completedChallenges: data.completedChallenges || [],
          lessonProgress: data.lessonProgress || {},
          onboardingProgress: data.onboardingProgress || { firewallInspected: false, policyAltered: false },
          activeLessonId: data.activeLessonId || 'lesson-01-cia-triad',
        });
      }
    });
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsSynced(false);
    reloadFromStorage();
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, login, logout, isSynced }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
