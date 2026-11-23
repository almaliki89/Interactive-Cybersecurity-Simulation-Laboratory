import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db, signInWithPopup, googleProvider, signOut } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useSimulationStore } from '../stores/simulationStore';
import { DEFAULT_LESSON_ID } from '../stores/simulationStore';
import { sanitizeCloudProgress } from './progressSync';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isSynced: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const resetAccountProgress = () => {
  useSimulationStore.setState({
    completedLessons: [],
    completedChallenges: [],
    lessonProgress: {},
    onboardingProgress: { firewallInspected: false, policyAltered: false },
    activeLessonId: DEFAULT_LESSON_ID,
  });
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  const reloadFromStorage = useSimulationStore((s) => s.reloadFromStorage);

  useEffect(() => {
    let activeUid: string | null = null;
    let unsubscribeProgress: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      // Detach the previous account listener before handling the new auth state.
      unsubscribeProgress?.();
      unsubscribeProgress = undefined;

      activeUid = nextUser?.uid ?? null;
      setUser(nextUser);
      setLoading(false);
      setIsSynced(false);

      if (!nextUser) {
        // Guest progress remains local to this browser and is never uploaded by this client.
        reloadFromStorage();
        return;
      }

      // Do not leave the previous account's progress visible while this account loads.
      resetAccountProgress();

      const progressDocRef = doc(db, 'users', nextUser.uid, 'progress', 'current');
      unsubscribeProgress = onSnapshot(
        progressDocRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          // A queued callback from a previous account must never update the active account.
          if (activeUid !== nextUser.uid) return;

          if (!snapshot.exists()) {
            resetAccountProgress();
            setIsSynced(false);
            return;
          }

          useSimulationStore.setState(sanitizeCloudProgress(snapshot.data()));
          // Cached data can be shown, but is only marked synced after a server snapshot.
          setIsSynced(!snapshot.metadata.fromCache);
        },
        (error) => {
          if (activeUid !== nextUser.uid) return;
          setIsSynced(false);
          console.error('[Firebase] Progress subscription failed:', error);
        }
      );
    });

    return () => {
      activeUid = null;
      unsubscribeProgress?.();
      unsubscribeAuth();
    };
  }, [reloadFromStorage]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    // The auth-state listener detaches the account subscription and restores guest state.
    await signOut(auth);
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
