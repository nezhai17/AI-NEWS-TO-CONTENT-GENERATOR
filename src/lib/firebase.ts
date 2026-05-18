import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// Use initializeFirestore to configure long polling, which is more reliable in some environments
// CRITICAL: We must pass the firestoreDatabaseId from the config
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

// Enable persistence carefully
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence failed: Browser not supported');
    } else {
      console.error('Firestore persistence error:', err);
    }
  });

  // Validate connection as per skill instructions
  const testConn = async () => {
    try {
      const { doc, getDocFromServer } = await import('firebase/firestore');
      // First try cache, then server to ensure connectivity
      await getDocFromServer(doc(db, '_connection_test', 'init'));
      console.log("Firestore connection verified.");
    } catch (error: any) {
      if (error.code === 'unavailable') {
        console.warn("Firestore initially unavailable, operating in offline mode. This is expected if network is restricted.");
      } else {
        console.error("Firestore connection test failed:", error.message);
      }
    }
  };
  testConn();
}

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.warn('Firestore Operation Status: ', JSON.stringify(errInfo));
  // Not throwing here to allow services to handle errors gracefully (e.g. return empty lists)
}
