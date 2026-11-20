'use client';

import React, { useState, useEffect } from 'react';
import AdminField from '@/components/admin/AdminField';
import ReorderList from '@/components/admin/ReorderList';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';
import { RESUME_SECTIONS, ResumeSection, isNonEmpty } from '@/lib/validation';
import type { ContentData, ResumeEntry } from '@/types/portfolio';

interface EditableResumeEntry extends ResumeEntry {
  tempId: string;
}

const SECTION_LABELS: Record<ResumeSection, string> = {
  experience: 'Work Experience',
  education: 'Education',
  exhibition: 'Exhibitions',
};

export default function ResumeManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [activeSection, setActiveSection] = useState<ResumeSection>('experience');
  const [entries, setEntries] = useState<EditableResumeEntry[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    async function loadResume() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/content');
        if (!res.ok) throw new Error('Failed to load content');
        const data: ContentData = await res.json();
        const loaded: EditableResumeEntry[] = (data.resume || []).map((e, idx) => ({
          ...e,
          tempId: `resume-${idx}-${Date.now()}`,
        }));
        setEntries(loaded);
      } catch (err) {
        setToast({
          message: err instanceof Error ? err.message : 'Error loading resume',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    }

    loadResume();
  }, []);

  // Filter entries belonging to active tab
  const activeEntries = entries.filter((e) => e.section === activeSection);

  const handleReorderActiveSection = (newSectionEntries: EditableResumeEntry[]) => {
    // Merge back: replace the active section entries in their new order
    setEntries((prev) => {
      const otherEntries = prev.filter((e) => e.section !== activeSection);
      return [...otherEntries, ...newSectionEntries];
    });
  };

  const handleUpdate = (tempId: string, field: keyof ResumeEntry, value: string) => {
    setEntries((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );

    if (fieldErrors[tempId]?.[field]) {
      setFieldErrors((prev) => {
        const itemErrors = { ...prev[tempId] };
        delete itemErrors[field];
        return { ...prev, [tempId]: itemErrors };
      });
    }
  };

  const handleAdd = () => {
    const newEntry: EditableResumeEntry = {
      tempId: `resume-new-${Date.now()}`,
      section: activeSection,
      title: '',
      organization: '',
      period: '',
      display_order: activeEntries.length + 1,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleDelete = (tempId: string) => {
    setEntries((prev) => prev.filter((item) => item.tempId !== tempId));
    setConfirmDeleteId(null);
  };

  const handleSave = async () => {
    // Validation
    const errorsMap: Record<string, Record<string, string>> = {};
    let hasError = false;

    entries.forEach((item) => {
      const itemErrors: Record<string, string> = {};
      if (!isNonEmpty(item.title)) {
        itemErrors.title = 'Title is required';
        hasError = true;
      }
      if (!isNonEmpty(item.organization)) {
        itemErrors.organization = 'Organization is required';
        hasError = true;
      }
      if (!isNonEmpty(item.period)) {
        itemErrors.period = 'Period is required';
        hasError = true;
      }

      if (Object.keys(itemErrors).length > 0) {
        errorsMap[item.tempId] = itemErrors;
      }
    });

    if (hasError) {
      setFieldErrors(errorsMap);
      setToast({
        message: 'Please resolve missing fields before saving',
        type: 'error',
      });
      return;
    }

    try {
      setSaving(true);

      // Reassign sequential display_order per section
      const sectionCounters: Record<string, number> = {};
      const payload: ResumeEntry[] = entries.map((e) => {
        sectionCounters[e.section] = (sectionCounters[e.section] || 0) + 1;
        return {
          section: e.section,
          title: e.title.trim(),
          organization: e.organization.trim(),
          period: e.period.trim(),
          display_order: sectionCounters[e.section],
        };
      });

      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: payload }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save resume entries');
      }

      setFieldErrors({});
      setToast({
        message: 'Resume entries and priorities synchronized with database',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error saving resume entries',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs tracking-[0.2em] uppercase text-neutral-600 animate-pulse">
        Loading resume records…
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-neutral-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-sm tracking-[0.3em] uppercase text-text-bright font-light">
            Resume & Chronology
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Organize exhibitions, work history, and academic credentials. Move priorities up/down to set display order.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="text-xs tracking-[0.15em] uppercase text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-500 px-4 py-2 transition-colors self-start sm:self-auto"
        >
          + Add Entry
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 mb-6 overflow-x-auto pb-1">
        {RESUME_SECTIONS.map((sec) => {
          const count = entries.filter((e) => e.section === sec).length;
          const isActive = activeSection === sec;

          return (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2.5 text-xs tracking-[0.15em] uppercase font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                isActive
                  ? 'border-text-bright text-text-bright bg-neutral-900/50'
                  : 'border-transparent text-neutral-500 hover:text-text-muted'
              }`}
            >
              {SECTION_LABELS[sec]} ({count})
            </button>
          );
        })}
      </div>

      {/* Interactive Reordering List */}
      <div className="space-y-6">
        <ReorderList<EditableResumeEntry>
          items={activeEntries}
          onReorder={handleReorderActiveSection}
          keyExtractor={(item) => item.tempId}
          renderItem={(item) => {
            const isConfirming = confirmDeleteId === item.tempId;
            const errors = fieldErrors[item.tempId] || {};

            return (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AdminField
                    label="Role / Title"
                    value={item.title}
                    onChange={(val) => handleUpdate(item.tempId, 'title', val)}
                    required
                    error={errors.title}
                    placeholder="e.g. Editorial Photographer"
                  />

                  <AdminField
                    label="Organization / Venue"
                    value={item.organization}
                    onChange={(val) => handleUpdate(item.tempId, 'organization', val)}
                    required
                    error={errors.organization}
                    placeholder="e.g. Gallery Noir, Berlin"
                  />

                  <AdminField
                    label="Period / Year"
                    value={item.period}
                    onChange={(val) => handleUpdate(item.tempId, 'period', val)}
                    required
                    error={errors.period}
                    placeholder="e.g. 2023 – Present"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/50">
                  <span className="text-[11px] font-mono text-neutral-500">
                    Priority index: auto #{activeEntries.findIndex((e) => e.tempId === item.tempId) + 1}
                  </span>

                  {isConfirming ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-red-400 tracking-wide uppercase">
                        Confirm removal?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.tempId)}
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
                      onClick={() => setConfirmDeleteId(item.tempId)}
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

        <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-[11px] text-neutral-500 font-mono">
            {entries.length} total entries across all sections
          </p>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-neutral-200 hover:bg-white text-neutral-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
          >
            {saving ? 'Syncing...' : 'Save All Resume Entries'}
          </button>
        </div>
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
