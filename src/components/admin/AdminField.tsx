'use client';

import React from 'react';

interface AdminFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url' | 'textarea' | 'number';
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  hint?: string;
  className?: string;
}

export default function AdminField({
  label,
  value,
  onChange,
  type = 'text',
  error,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  hint,
  className = '',
}: AdminFieldProps) {
  const baseInputStyle =
    'bg-neutral-900 border border-neutral-700 text-text-bright px-3 py-2 w-full text-sm placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs tracking-[0.15em] uppercase text-neutral-400 font-medium">
          {label}
          {required && <span className="text-neutral-500 ml-1">*</span>}
        </label>
        {hint && <span className="text-[11px] text-neutral-500">{hint}</span>}
      </div>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputStyle} resize-y ${error ? 'border-red-500/70 focus:border-red-400' : ''}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputStyle} ${error ? 'border-red-500/70 focus:border-red-400' : ''}`}
        />
      )}

      {error && (
        <p className="text-xs text-red-400 mt-1.5 tracking-wide">{error}</p>
      )}
    </div>
  );
}
