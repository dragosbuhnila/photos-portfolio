'use client';

import React, { useState } from 'react';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';

export default function BackupManagementPage() {
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/admin/backup');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to download backup archive');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'portfolio-backup.zip';
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match?.[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({
        message: 'Backup archive created and downloaded successfully',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error downloading backup archive',
        type: 'error',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="border-b border-neutral-800 pb-6 mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="text-sm tracking-[0.3em] uppercase text-text-bright font-light">
            Backup
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Snapshot and download the complete portfolio backup (database and project photos).
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900/50 p-6 border border-neutral-800/80 space-y-4">
          <div>
            <h2 className="text-xs tracking-[0.2em] uppercase text-text-bright font-medium">
              Portfolio Backup
            </h2>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Before packaging, the system executes a Write-Ahead Log (WAL) checkpoint to merge
              all pending write journals directly into <code className="text-neutral-300 font-mono text-[11px]">portfolio.db</code>.
              The updated database along with all project photo folders in the <code className="text-neutral-300 font-mono text-[11px]">public</code> directory
              are bundled into a single ZIP archive for seamless offline preservation and migration.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="bg-neutral-200 hover:bg-white text-neutral-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
            >
              {downloading ? 'Packaging & Downloading...' : 'Download Backup'}
            </button>
          </div>
        </div>
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
