'use client';

import React, { useState } from 'react';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';

export default function SecurityManagementPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentPassword) {
      setFormError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setToast({
        message: 'Password successfully updated and securely hashed.',
        type: 'success',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating password';
      setFormError(message);
      setToast({ message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="border-b border-neutral-800 pb-6 mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="text-sm tracking-[0.3em] uppercase text-text-bright font-light">
            Security & Access
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your administrator credentials. Only cryptographically salted hashes are stored.
          </p>
        </div>
      </div>

      <div className="max-w-xl space-y-8">
        <div className="bg-neutral-900/40 border border-neutral-800/80 p-5 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
            Security Architecture
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Authentication uses an isolated cryptographic salt and scrypt hashing algorithm stored in your SQLite database. The plaintext password is never saved to disk or logs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-400 mb-2"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Enter current password (default: password)"
              disabled={saving}
              className="w-full bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-text-bright placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-400 mb-2"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Min 6 characters"
                disabled={saving}
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-text-bright placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-400 mb-2"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Repeat new password"
                disabled={saving}
                className="w-full bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs text-text-bright placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 text-[11px] text-red-400 font-mono">
              {formError}
            </div>
          )}

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-neutral-200 hover:bg-white text-neutral-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
            >
              {saving ? 'Updating Hash…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
