import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig, auth } from './config';
import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import { useUser } from './auth/use-user';
import { FirebaseClientProvider } from './client-provider';

let firebaseApp: FirebaseApp;
let firestore: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
  } else {
    firebaseApp = getApp();
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  auth,
};
