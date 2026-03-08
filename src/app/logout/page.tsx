'use client';

// TEMPORARY LOGOUT PAGE
// Calls the POST /api/auth/logout endpoint and redirects to /login.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function doLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // Ignore network/auth errors – user will still be redirected.
      } finally {
        if (isMounted) {
          router.replace('/login');
        }
      }
    }

    void doLogout();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-slate-600">Logging you out…</p>
    </div>
  );
}

