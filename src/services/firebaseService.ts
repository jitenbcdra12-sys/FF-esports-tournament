import { 
  collection, doc, getDoc, getDocs, setDoc, onSnapshot 
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { Match, UserProfile, WalletTransaction, PushNotification } from '../types/tournament';

// Real Google Sign-In with Popup
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    return null;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Observe Auth State
export function onAuthUserChanged(callback: (fbUser: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// User Profile in Firestore
export async function syncUserProfile(user: UserProfile): Promise<void> {
  // Only attempt to sync to Firestore if user is authenticated in Firebase
  if (!auth.currentUser) {
    return;
  }

  const targetId = auth.currentUser.uid;
  try {
    const userRef = doc(db, 'users', targetId);
    await setDoc(userRef, {
      ...user,
      id: targetId,
      email: auth.currentUser.email || user.email,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${targetId}`);
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!auth.currentUser) {
    return null;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return null;
  }
}

// Matches collection real-time sync & seeding
export function subscribeToMatches(callback: (matches: Match[]) => void) {
  const matchesRef = collection(db, 'matches');
  return onSnapshot(matchesRef, (snapshot) => {
    const matches: Match[] = [];
    snapshot.forEach((doc) => {
      matches.push(doc.data() as Match);
    });
    if (matches.length > 0) {
      callback(matches);
    }
  }, (error) => {
    console.warn('Matches subscription offline/fallback:', error.message);
  });
}

export async function seedMatchesIfEmpty(initialMatches: Match[]): Promise<void> {
  // Only seed if user is signed in as admin, or skip silently
  if (!auth.currentUser) return;
  try {
    const matchesRef = collection(db, 'matches');
    const snap = await getDocs(matchesRef);
    if (snap.empty) {
      for (const m of initialMatches.slice(0, 10)) {
        await setDoc(doc(db, 'matches', m.id), m);
      }
    }
  } catch (error) {
    console.warn('Firestore seeding skipped:', error);
  }
}

export async function updateMatchInFirestore(match: Match): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const matchRef = doc(db, 'matches', match.id);
    await setDoc(matchRef, match, { merge: true });
  } catch (error) {
    console.warn('Update match offline fallback:', error);
  }
}

// Transactions collection
export async function addTransactionToFirestore(tx: WalletTransaction): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const txRef = doc(db, 'transactions', tx.id);
    await setDoc(txRef, {
      ...tx,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Transaction write offline fallback:', error);
  }
}

// Notifications collection
export async function addNotificationToFirestore(notif: PushNotification): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const notifRef = doc(db, 'notifications', notif.id);
    await setDoc(notifRef, notif);
  } catch (error) {
    console.warn('Notification write offline fallback:', error);
  }
}
