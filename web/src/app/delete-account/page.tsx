'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  const requiredText = 'DELETE';

  const handleDelete = async () => {
    if (confirmText !== requiredText) {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      
      // Redirect to home
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'An error occurred while deleting your account');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-2xl border border-red-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-red-100 bg-red-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-900">Delete Account</h1>
              <p className="text-sm text-red-700">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === 'warning' ? (
            <>
              <div className="mb-6 space-y-4">
                <p className="text-zinc-700">
                  Are you sure you want to delete your account? This will permanently:
                </p>
                <ul className="list-disc space-y-2 pl-6 text-sm text-zinc-600">
                  <li>Delete your profile and all personal information</li>
                  <li>Delete all your listings</li>
                  <li>Delete all your messages and conversations</li>
                  <li>Delete all your favorites</li>
                  <li>Remove you from all follow relationships</li>
                  <li>Delete all your account data</li>
                </ul>
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <p className="text-sm font-semibold text-red-900">
                    ⚠️ This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <p className="text-zinc-700">
                  To confirm account deletion, please type <strong className="font-mono text-red-600">DELETE</strong> in the box below:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError(null);
                  }}
                  placeholder="Type DELETE to confirm"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  disabled={loading}
                />
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('warning');
                    setConfirmText('');
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmText !== requiredText}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

