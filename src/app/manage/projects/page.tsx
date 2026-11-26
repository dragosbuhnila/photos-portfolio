'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminField from '@/components/admin/AdminField';
import ReorderList from '@/components/admin/ReorderList';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';
import { toSlug, isValidSlug, isNonEmpty } from '@/lib/validation';
import type { Photo } from '@/types/portfolio';

interface ProjectData {
  slug: string;
  title: string;
  featured_images: string[];
  images: string[];
}

export default function ProjectsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [featuredPhotos, setFeaturedPhotos] = useState<Photo[]>([]);
  const [showFeaturedSequence, setShowFeaturedSequence] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // New project creation state
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Per-project editing state
  const [editingTitles, setEditingTitles] = useState<Record<string, string>>({});
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState<{ slug: string; fileName: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadSlug, setActiveUploadSlug] = useState<string | null>(null);

  const loadFeaturedPhotos = async () => {
    const res = await fetch('/api/admin/featured');
    if (!res.ok) throw new Error('Failed to load featured images');
    const data: Photo[] = await res.json();
    setFeaturedPhotos(data);
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [projectsRes, featuredRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/featured'),
      ]);
      if (!projectsRes.ok) throw new Error('Failed to load projects');
      if (!featuredRes.ok) throw new Error('Failed to load featured images');

      const [data, featuredData]: [ProjectData[], Photo[]] = await Promise.all([
        projectsRes.json(),
        featuredRes.json(),
      ]);

      setProjects(data);
      setFeaturedPhotos(featuredData);

      const titleMap: Record<string, string> = {};
      data.forEach((p) => {
        titleMap[p.slug] = p.title;
      });
      setEditingTitles(titleMap);

      if (data.length > 0 && !expandedSlug) {
        setExpandedSlug(data[0].slug);
      }
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error loading projects',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (!isSlugManuallyEdited) {
      setNewSlug(toSlug(val));
    }
    setCreateError(null);
  };

  const handleSlugChange = (val: string) => {
    setNewSlug(val);
    setIsSlugManuallyEdited(true);
    setCreateError(null);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newTitle.trim();
    const cleanSlug = (newSlug || toSlug(cleanTitle)).trim();

    if (!isNonEmpty(cleanTitle)) {
      setCreateError('Project title is required');
      return;
    }
    if (!isNonEmpty(cleanSlug) || !isValidSlug(cleanSlug)) {
      setCreateError('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }
    if (projects.some((p) => p.slug === cleanSlug)) {
      setCreateError('A project with this slug already exists');
      return;
    }

    try {
      setCreatingProject(true);
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: cleanSlug, title: cleanTitle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      setToast({
        message: `Project "${cleanTitle}" created`,
        type: 'success',
      });

      setNewTitle('');
      setNewSlug('');
      setIsSlugManuallyEdited(false);
      setExpandedSlug(cleanSlug);
      await loadProjects();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error creating project',
        type: 'error',
      });
    } finally {
      setCreatingProject(false);
    }
  };

  const handleReorderProjects = async (newOrder: ProjectData[]) => {
    setProjects(newOrder);
    try {
      const res = await fetch('/api/admin/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: newOrder.map((p) => p.slug) }),
      });
      if (!res.ok) throw new Error('Failed to persist project order');
      setToast({
        message: 'Project display order updated',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to save project order',
        type: 'error',
      });
      await loadProjects();
    }
  };

  const handleReorderFeatured = async (newOrder: Photo[]) => {
    setFeaturedPhotos(newOrder);
    try {
      const res = await fetch('/api/admin/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: newOrder.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error('Failed to persist featured image order');
      const data = await res.json();
      if (Array.isArray(data.photos)) {
        setFeaturedPhotos(data.photos);
      }
      setToast({
        message: 'Landing canvas sequence updated',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to save featured image order',
        type: 'error',
      });
      await loadFeaturedPhotos().catch(() => {});
    }
  };

  const handleSaveTitle = async (slug: string) => {
    const updatedTitle = (editingTitles[slug] || '').trim();
    if (!isNonEmpty(updatedTitle)) {
      setToast({ message: 'Title cannot be empty', type: 'error' });
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: updatedTitle }),
      });
      if (!res.ok) throw new Error('Failed to update project title');
      setToast({ message: 'Title updated successfully', type: 'success' });
      setProjects((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, title: updatedTitle } : p))
      );
      setFeaturedPhotos((prev) =>
        prev.map((p) => (p.project_slug === slug ? { ...p, title: updatedTitle } : p))
      );
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error updating title',
        type: 'error',
      });
    }
  };

  const handleDeleteProject = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      setToast({ message: `Project ${slug} deleted`, type: 'success' });
      setConfirmDeleteSlug(null);
      await loadProjects();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error deleting project',
        type: 'error',
      });
    }
  };

  const handleToggleFeatured = async (slug: string, fileName: string) => {
    const project = projects.find((p) => p.slug === slug);
    if (!project) return;

    const isCurrentlyFeatured = project.featured_images.includes(fileName);
    const newFeatured = isCurrentlyFeatured
      ? project.featured_images.filter((img) => img !== fileName)
      : [...project.featured_images, fileName];

    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, featured_images: newFeatured } : p))
    );

    try {
      const res = await fetch(`/api/admin/projects/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured_images: newFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update featured images');
      await loadFeaturedPhotos();
      setToast({
        message: isCurrentlyFeatured
          ? `Removed "${fileName}" from landing canvas`
          : `Added "${fileName}" to landing canvas`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error updating featured status',
        type: 'error',
      });
      await loadProjects();
    }
  };

  const triggerUpload = (slug: string) => {
    setActiveUploadSlug(slug);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeUploadSlug) return;

    const slug = activeUploadSlug;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadingFor(slug);
      const res = await fetch(`/api/admin/projects/${slug}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setToast({
        message: `Successfully uploaded ${data.uploaded?.length || files.length} image(s)`,
        type: 'success',
      });

      // Update project images locally
      setProjects((prev) =>
        prev.map((p) =>
          p.slug === slug
            ? { ...p, images: data.images, featured_images: data.featured_images }
            : p
        )
      );
      await loadFeaturedPhotos();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error uploading images',
        type: 'error',
      });
    } finally {
      setUploadingFor(null);
      setActiveUploadSlug(null);
    }
  };

  const handleDeleteImage = async (slug: string, fileName: string) => {
    try {
      const res = await fetch(`/api/admin/projects/${slug}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete image');

      setToast({
        message: `Deleted "${fileName}"`,
        type: 'success',
      });

      setConfirmDeleteImage(null);
      setProjects((prev) =>
        prev.map((p) =>
          p.slug === slug
            ? { ...p, images: data.images, featured_images: data.featured_images }
            : p
        )
      );
      await loadFeaturedPhotos();
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error deleting image',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs tracking-[0.2em] uppercase text-neutral-600 animate-pulse">
        Loading projects & photo galleries…
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={handleFilesSelected}
        className="hidden"
      />

      <div className="border-b border-neutral-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-sm tracking-[0.3em] uppercase text-text-bright font-light">
            Projects & Galleries
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Create collections, upload high-res imagery, set priority, and select featured frames for the landing canvas.
          </p>
        </div>
      </div>

      {/* ── Create New Project Card ────────────────────────── */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 mb-10">
        <h2 className="text-xs tracking-[0.2em] uppercase text-text-bright mb-4 font-medium">
          Create New Project
        </h2>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField
              label="Project Title"
              value={newTitle}
              onChange={handleTitleChange}
              placeholder="e.g. Nocturne"
              required
            />
            <AdminField
              label="Folder Slug"
              value={newSlug}
              onChange={handleSlugChange}
              placeholder="e.g. nocturne"
              hint="my_projects/<slug>"
              required
            />
          </div>

          {createError && (
            <p className="text-xs text-red-400 tracking-wide">{createError}</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={creatingProject}
              className="bg-neutral-200 hover:bg-white text-neutral-950 px-5 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-40"
            >
              {creatingProject ? 'Creating...' : '+ Create Project'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Landing Canvas Sequence (Featured Images) ─────── */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800 mb-4">
          <button
            type="button"
            onClick={() => setShowFeaturedSequence((prev) => !prev)}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-400 group-hover:text-text-bright transition-colors font-mono">
              Landing Canvas Sequence ({featuredPhotos.length})
            </h2>
            <span className="text-[11px] text-neutral-500 font-mono">
              {showFeaturedSequence ? '▴' : '▾'}
            </span>
          </button>
          <span className="text-[11px] text-neutral-500">
            Use ▲ / ▼ on left to reorder featured frames on landing (first 10 shown)
          </span>
        </div>

        {showFeaturedSequence && (
          featuredPhotos.length === 0 ? (
            <div className="py-8 text-center text-xs tracking-wider uppercase text-neutral-600 border border-dashed border-neutral-800">
              No featured images selected. Toggle ★ Feature inside any project gallery below.
            </div>
          ) : (
            <ReorderList<Photo>
              items={featuredPhotos}
              onReorder={handleReorderFeatured}
              keyExtractor={(item) => String(item.id)}
              itemClassName="!p-3 !items-center"
              renderItem={(photo, index) => {
                const isOverLimit = index >= 10;
                const displayTitle =
                  photo.title ||
                  photo.project_slug
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                return (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-12 bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.image_path}
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-text-bright font-medium truncate">
                            {displayTitle}
                          </span>
                          <span className="text-[11px] text-neutral-600 font-mono">
                            /{photo.project_slug}
                          </span>
                          {isOverLimit && (
                            <span className="text-[10px] tracking-wider uppercase font-mono text-neutral-500 border border-neutral-800 px-1.5 py-0.5">
                              Hidden (&gt;10)
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[11px] text-neutral-400 font-mono truncate mt-0.5"
                          title={photo.file_name}
                        >
                          {photo.file_name}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(photo.project_slug, photo.file_name)}
                      className="text-[11px] tracking-wider uppercase text-neutral-500 hover:text-amber-400 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1.5 transition-colors shrink-0"
                      title="Remove from landing canvas"
                    >
                      Remove
                    </button>
                  </div>
                );
              }}
            />
          )
        )}
      </div>

      {/* ── Projects List & Manager ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-500 font-mono">
            Existing Projects ({projects.length})
          </h2>
          <span className="text-[11px] text-neutral-500">
            Use ▲ / ▼ on left to reorder project sequence
          </span>
        </div>

        <ReorderList<ProjectData>
          items={projects}
          onReorder={handleReorderProjects}
          keyExtractor={(item) => item.slug}
          renderItem={(project) => {
            const isExpanded = expandedSlug === project.slug;
            const isUploading = uploadingFor === project.slug;
            const isConfirmingDelete = confirmDeleteSlug === project.slug;

            return (
              <div className="w-full">
                {/* Project Header Bar */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setExpandedSlug(isExpanded ? null : project.slug)}
                    className="flex-1 flex items-center justify-between text-left group focus:outline-none"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-text-bright font-medium group-hover:text-white transition-colors">
                          {project.title}
                        </span>
                        <span className="text-xs text-neutral-600 font-mono">
                          /{project.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-neutral-500">
                        <span>{project.images.length} images total</span>
                        <span>•</span>
                        <span className={project.featured_images.length > 0 ? 'text-amber-400/80 font-medium' : ''}>
                          ★ {project.featured_images.length} featured on landing
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-neutral-500 group-hover:text-text-bright uppercase tracking-wider font-mono mr-2">
                      {isExpanded ? 'Collapse ▴' : 'Manage Images ▾'}
                    </span>
                  </button>
                </div>

                {/* Expanded Details & Images */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-neutral-800 space-y-6">
                    {/* Project Title Edit & Danger Zone */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-neutral-950/60 p-4 border border-neutral-800/80">
                      <div className="flex-1 max-w-md">
                        <AdminField
                          label="Edit Title"
                          value={editingTitles[project.slug] || ''}
                          onChange={(val) =>
                            setEditingTitles((prev) => ({ ...prev, [project.slug]: val }))
                          }
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleSaveTitle(project.slug)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-text-bright px-3 py-2 text-xs uppercase tracking-wider transition-colors"
                        >
                          Save Title
                        </button>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project.slug)}
                              className="text-xs uppercase tracking-wider text-red-400 hover:text-red-300 px-3 py-2 bg-red-950/50 border border-red-900"
                            >
                              Confirm Delete Project
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSlug(null)}
                              className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white px-2 py-2 border border-neutral-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSlug(project.slug)}
                            className="text-xs uppercase tracking-wider text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-900/50 px-3 py-2 transition-colors"
                          >
                            Delete Project
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Image Upload Zone */}
                    <div className="border border-dashed border-neutral-700/80 p-6 text-center bg-neutral-950/40">
                      <p className="text-xs tracking-wider uppercase text-text-bright font-medium mb-1">
                        Upload Imagery to &ldquo;{project.title}&rdquo;
                      </p>
                      <p className="text-[11px] text-neutral-500 mb-4">
                        Supported formats: JPG, PNG, WEBP, AVIF. Files are placed directly into <code className="text-neutral-400">public/my_projects/{project.slug}/</code>.
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerUpload(project.slug)}
                        disabled={isUploading}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors disabled:opacity-40"
                      >
                        {isUploading ? 'Uploading Files…' : 'Select Images to Upload'}
                      </button>
                    </div>

                    {/* Image Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs tracking-[0.15em] uppercase text-neutral-400 font-medium">
                          Project Gallery ({project.images.length})
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Toggle ★ to define which frames appear on the landing page horizontal canvas.
                        </p>
                      </div>

                      {project.images.length === 0 ? (
                        <div className="py-12 text-center text-xs tracking-wider uppercase text-neutral-600 border border-neutral-800 bg-neutral-950/30">
                          No images uploaded yet for this project.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {project.images.map((fileName) => {
                            const isFeatured = project.featured_images.includes(fileName);
                            const imagePath = `/my_projects/${project.slug}/${fileName}`;
                            const isConfirmingImgDelete =
                              confirmDeleteImage?.slug === project.slug &&
                              confirmDeleteImage?.fileName === fileName;

                            return (
                              <div
                                key={fileName}
                                className={`group relative bg-neutral-950 border transition-all ${
                                  isFeatured
                                    ? 'border-amber-500/60 ring-1 ring-amber-500/20'
                                    : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                              >
                                {/* Thumbnail */}
                                <div className="aspect-[4/3] w-full bg-neutral-900 overflow-hidden relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imagePath}
                                    alt={fileName}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />

                                  {/* Featured Badge */}
                                  {isFeatured && (
                                    <div className="absolute top-2 left-2 bg-neutral-950/90 text-amber-300 text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 border border-amber-500/40">
                                      ★ Landing
                                    </div>
                                  )}
                                </div>

                                {/* Caption & Controls */}
                                <div className="p-2.5 bg-neutral-900/90">
                                  <p
                                    className="text-[11px] text-text-muted truncate font-mono mb-2"
                                    title={fileName}
                                  >
                                    {fileName}
                                  </p>

                                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-neutral-800">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleFeatured(project.slug, fileName)}
                                      className={`text-[11px] tracking-wider uppercase transition-colors flex items-center gap-1 ${
                                        isFeatured
                                          ? 'text-amber-400 font-medium hover:text-amber-300'
                                          : 'text-neutral-500 hover:text-text-bright'
                                      }`}
                                      title={
                                        isFeatured
                                          ? 'Click to remove from landing canvas'
                                          : 'Click to feature on landing canvas'
                                      }
                                    >
                                      {isFeatured ? '★ Featured' : '☆ Feature'}
                                    </button>

                                    {isConfirmingImgDelete ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteImage(project.slug, fileName)}
                                          className="text-[10px] uppercase text-red-400 hover:text-red-300 px-1 bg-red-950/60"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteImage(null)}
                                          className="text-[10px] text-neutral-400 hover:text-white px-1"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteImage({
                                            slug: project.slug,
                                            fileName,
                                          })
                                        }
                                        className="text-[11px] uppercase text-neutral-600 hover:text-red-400 transition-colors"
                                        title="Delete image"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
