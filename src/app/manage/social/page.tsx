'use client';

import React, { useState, useEffect } from 'react';
import AdminField from '@/components/admin/AdminField';
import ReorderList from '@/components/admin/ReorderList';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';
import { validateSocialLink, isValidUrl, isNonEmpty } from '@/lib/validation';
import type { ContentData, SocialLink } from '@/types/portfolio';

interface EditableSocialLink extends SocialLink {
  id: string; // Internal key for React reconciliation
}

export default function SocialLinksManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [links, setLinks] = useState<EditableSocialLink[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    async function loadSocialLinks() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load content');
        const data: ContentData = await res.json();
        const initialLinks: EditableSocialLink[] = (data.social_links || []).map((l, idx) => ({
          ...l,
          id: `social-${idx}-${Date.now()}`,
        }));
        setLinks(initialLinks);
      } catch (err) {
        setToast({
          message: err instanceof Error ? err.message : 'Error loading social links',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    }

    loadSocialLinks();
  }, []);

  const handleUpdate = (id: string, field: keyof SocialLink, value: string) => {
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // Clear error
    if (fieldErrors[id]?.[field]) {
      setFieldErrors((prev) => {
        const itemErrors = { ...prev[id] };
        delete itemErrors[field];
        return { ...prev, [id]: itemErrors };
      });
    }
  };

  const handleAdd = () => {
    const newEntry: EditableSocialLink = {
      id: `social-new-${Date.now()}`,
      label: '',
      handle: '',
      url: '',
    };
    setLinks((prev) => [...prev, newEntry]);
  };

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
    setConfirmDeleteId(null);
  };

  const handleSave = async () => {
    // Validate all items
    const errorsMap: Record<string, Record<string, string>> = {};
    let hasError = false;

    links.forEach((item) => {
      const itemErrors: Record<string, string> = {};
      if (!isNonEmpty(item.label)) {
        itemErrors.label = 'Label is required';
        hasError = true;
      }
      if (item.url && !isValidUrl(item.url)) {
        itemErrors.url = 'Must be a valid URL (e.g. https://instagram.com/user)';
        hasError = true;
      }
      if (Object.keys(itemErrors).length > 0) {
        errorsMap[item.id] = itemErrors;
      }
    });

    if (hasError) {
      setFieldErrors(errorsMap);
      setToast({
        message: 'Please resolve form errors before saving',
        type: 'error',
      });
      return;
    }

    try {
      setSaving(true);
      const payload: SocialLink[] = links.map(({ label, handle, url }) => ({
        label: label.trim(),
        handle: handle?.trim() || undefined,
        url: url.trim(),
      }));

      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social_links: payload }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save social links');
      }

      setFieldErrors({});
      setToast({
        message: 'Social links updated successfully',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error saving social links',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs tracking-[0.2em] uppercase text-neutral-600 animate-pulse">
        Loading social links…
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-neutral-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-sm tracking-[0.3em] uppercase text-text-bright font-light">
            Social Links
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Reorder priorities, edit accounts, or remove outbound social profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="text-xs tracking-[0.15em] uppercase text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 px-4 py-2 transition-colors self-start sm:self-auto"
        >
          + Add Social Link
        </button>
      </div>

      <div className="space-y-6">
        <ReorderList<EditableSocialLink>
          items={links}
          onReorder={setLinks}
          keyExtractor={(item) => item.id}
          renderItem={(item) => {
            const isConfirming = confirmDeleteId === item.id;
            const errors = fieldErrors[item.id] || {};

            return (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AdminField
                    label="Platform / Label"
                    value={item.label}
                    onChange={(val) => handleUpdate(item.id, 'label', val)}
                    required
                    error={errors.label}
                    placeholder="e.g. Instagram"
                  />

                  <AdminField
                    label="Handle"
                    value={item.handle || ''}
                    onChange={(val) => handleUpdate(item.id, 'handle', val)}
                    placeholder="e.g. @alexmoreau"
                  />

                  <AdminField
                    label="Target URL"
                    type="url"
                    value={item.url}
                    onChange={(val) => handleUpdate(item.id, 'url', val)}
                    error={errors.url}
                    hint="https://..."
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-neutral-800/50">
                  {isConfirming ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400 tracking-wide uppercase">
                        Confirm removal?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs uppercase tracking-wider text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 border border-red-900/60"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white px-2 py-1 border border-neutral-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="text-xs uppercase tracking-wider text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        />

        <div className="pt-6 border-t border-neutral-800 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-neutral-200 hover:bg-white text-neutral-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
          >
            {saving ? 'Syncing...' : 'Save Social Links'}
          </button>
        </div>
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
