'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { AnimatedLoader } from '@/components/loaders/AnimatedLoader';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const hasExchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMsg('Google access denied or cancelled.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code found.');
      return;
    }

    // Prevent duplicate calls in React strict mode
    if (hasExchanged.current) {
      return;
    }
    hasExchanged.current = true;

    const exchangeCode = async () => {
      try {
        await api.post('/appointments/google-auth/exchange', { code });
        setStatus('success');
        // Redirect after short delay
        setTimeout(() => {
            router.push('/doctor/dashboard'); 
        }, 2000);
      } catch (err: any) {
        console.error('OAuth Exchange Error:', err);
        setStatus('error');
        setErrorMsg(err.response?.data?.detail || 'Failed to connect Google Calendar.');
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <AnimatedLoader message="Connecting your Google Calendar..." />
          </>
        )}

        {status === 'success' && (
          <div className="text-green-600">
            <h2 className="text-2xl font-bold mb-2">Connected!</h2>
            <p>Your Google Calendar is now linked.</p>
            <p className="text-sm text-slate-500 mt-4">Redirecting you back...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-coral-600">
            <h2 className="text-xl font-bold mb-2">Connection Failed</h2>
            <p>{errorMsg}</p>
            <button 
                onClick={() => router.push('/doctor/dashboard')}
                className="mt-6 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
                Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
