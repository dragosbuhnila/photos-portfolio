'use client';

import React, { useState, useEffect } from 'react';
import AdminField from '@/components/admin/AdminField';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';
import { validateOwner, FieldError } from '@/lib/validation';
import type { ContentData, OwnerInfo } from '@/types/portfolio';

export default function ProfileManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [owner, setOwner] = useState<OwnerInfo>({
    name: '',
    email: '',
    location: '',
    available_for_travel: '',
    copyright_year: '2026',
    bio: [],
  });

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load site content');
        const data: ContentData = await res.json();
        if (data.owner) {
          setOwner({
            name: data.owner.name || '',
            email: data.owner.email || '',
            location: data.owner.location || '',
            available_for_travel: data.owner.available_for_travel || '',
            copyright_year: data.owner.copyright_year || '2026',
            bio: Array.isArray(data.owner.bio) ? data.owner.bio : [],
          });
        }
      } catch (err) {
        setToast({
          message: err instanceof Error ? err.message : 'Error loading profile',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  const handleOwnerChange = (field: keyof OwnerInfo, value: string) => {
    setOwner((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBioChange = (index: number, text: string) => {
    setOwner((prev) => {
      const nextBio = [...prev.bio];
      nextBio[index] = text;
      return { ...prev, bio: nextBio };
    });
  };

  const addBioParagraph = () => {
    setOwner((prev) => ({
      ...prev,
      bio: [...prev.bio, ''],
    }));
  };

  const removeBioParagraph = (index: number) => {
    setOwner((prev) => ({
      ...prev,
      bio: prev.bio.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const errors: FieldError[] = validateOwner({
      name: owner.name,
      email: owner.email,
      copyright_year: owner.copyright_year,
    });

    if (errors.length > 0) {
      const mapped: Record<string, string> = {};
      errors.forEach((err) => {
        mapped[err.field] = err.message;
      });
      setFieldErrors(mapped);
      setToast({
        message: 'Please resolve form errors before saving',
        type: 'error',
      });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: {
            ...owner,
            bio: owner.bio.map((p) => p.trim()).filter(Boolean),
          },
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      setToast({
        message: 'Profile saved and database synchronized',
        type: 'success',
      });
      setFieldErrors({});
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error updating profile',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs tracking-[0.2em] uppercase text-neutral-600 animate-pulse">
        Loading profile details…
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-neutral-800 pb-6 mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="text-sm tracking-[0.3em] uppercase text-text-bright font-light">
            Owner Profile
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Global metadata, contact endpoints, and editorial artist bio.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminField
            label="Photographer Name"
            value={owner.name}
            onChange={(val) => handleOwnerChange('name', val)}
            required
            error={fieldErrors.name}
            placeholder="e.g. Alex Moreau"
          />

          <AdminField
            label="Direct Email"
            type="email"
            value={owner.email}
            onChange={(val) => handleOwnerChange('email', val)}
            error={fieldErrors.email}
            hint="Valid format or empty"
            placeholder="e.g. contact@domain.photo"
          />

          <AdminField
            label="Location"
            value={owner.location}
            onChange={(val) => handleOwnerChange('location', val)}
            placeholder="e.g. Berlin, Germany"
          />

          <AdminField
            label="Available For Travel"
            value={owner.available_for_travel || ''}
            onChange={(val) => handleOwnerChange('available_for_travel', val)}
            placeholder="e.g. Available for travel worldwide"
          />

          <AdminField
            label="Copyright Year"
            value={owner.copyright_year || ''}
            onChange={(val) => handleOwnerChange('copyright_year', val)}
            error={fieldErrors.copyright_year}
            hint="4 digits"
            placeholder="2026"
          />
        </div>

        {/* Bio Paragraphs */}
        <div className="pt-6 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs tracking-[0.2em] uppercase text-text-bright">
                Artist Biography
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Each paragraph renders as a distinct section on the About page.
              </p>
            </div>
            <button
              type="button"
              onClick={addBioParagraph}
              className="text-xs tracking-[0.15em] uppercase text-neutral-400 hover:text-text-bright border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 transition-colors"
            >
              + Add Paragraph
            </button>
          </div>

          <div className="space-y-4">
            {owner.bio.map((paragraph, index) => (
              <div key={index} className="flex gap-3 items-start bg-neutral-900/50 p-4 border border-neutral-800/80">
                <span className="text-[11px] font-mono text-neutral-600 pt-2 shrink-0">
                  §{index + 1}
                </span>
                <div className="flex-1">
                  <AdminField
                    label={`Paragraph ${index + 1}`}
                    type="textarea"
                    rows={4}
                    value={paragraph}
                    onChange={(val) => handleBioChange(index, val)}
                    placeholder="Enter artist statement or bio paragraph..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBioParagraph(index)}
                  title="Remove paragraph"
                  className="text-neutral-600 hover:text-red-400 p-2 text-xs transition-colors shrink-0 pt-7"
                >
                  ✕
                </button>
              </div>
            ))}

            {owner.bio.length === 0 && (
              <div className="py-8 text-center text-xs tracking-wider uppercase text-neutral-600 border border-dashed border-neutral-800">
                No bio paragraphs defined yet. Click "+ Add Paragraph" above.
              </div>
            )}
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-6 border-t border-neutral-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-neutral-200 hover:bg-white text-neutral-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
          >
            {saving ? 'Syncing...' : 'Save Profile'}
          </button>
        </div>
      </form>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
