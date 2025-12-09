'use client';
import { useMemo, useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase, auth as authService } from './index';
import type { AuthUser } from './config';

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then(user => {
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, []);

  const { firebaseApp, firestore, auth } = useMemo(
    () => initializeFirebase(),
    []
  );

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      firestore={firestore}
      auth={currentUser || auth}
    >
      {children}
    </FirebaseProvider>
  );
};
