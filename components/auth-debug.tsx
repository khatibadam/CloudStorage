'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

export function AuthDebug() {
  const { user, isReady } = useAuth();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          setSessionUser(JSON.parse(userStr));
        } catch (e) {
          console.error('Erreur parsing user:', e);
        }
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>
          <strong>isReady:</strong> {isReady ? '✅' : '❌'}
        </div>
        <div>
          <strong>Hook user:</strong> {user ? '✅' : '❌'}
        </div>
        {user && (
          <div className="ml-4 text-green-400">
            <div>id_user: {user.id_user || '❌ VIDE'}</div>
            <div>email: {user.email}</div>
            <div className="text-yellow-400 mt-1">
              Toutes les clés: {Object.keys(user).join(', ')}
            </div>
          </div>
        )}
        <div>
          <strong>SessionStorage user:</strong> {sessionUser ? '✅' : '❌'}
        </div>
        {sessionUser && (
          <div className="ml-4 text-blue-400">
            <div>id_user: {sessionUser.id_user || '❌ VIDE'}</div>
            <div>email: {sessionUser.email}</div>
            <div className="text-yellow-400 mt-1">
              Toutes les clés: {Object.keys(sessionUser).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

