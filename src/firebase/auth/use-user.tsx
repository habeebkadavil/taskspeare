'use client';

import { useState, useEffect } from 'react';
import type { AuthUser } from '../config';
import { useAuth } from '../provider';
import { auth as authService } from '../index';

export function useUser() {
  const contextUser = useAuth();
  const [user, setUser] = useState<AuthUser | null>(contextUser ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (contextUser) {
        if (mounted) setUser(contextUser);
        setLoading(false);
        return;
      }

      const u = await authService.getCurrentUser();
      if (mounted) setUser(u);
      if (mounted) setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [contextUser]);

  return { user, loading };
}
