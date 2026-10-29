'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Shield,
  LogOut,
  FileText,
  Database,
  CheckCircle2,
  AlertTriangle,
  Users,
  Layers,
  Edit3,
  Trash2,
  Plus,
  Code2,
} from 'lucide-react';
import type {
  AdminRole,
  Article,
  AuditLogEntry,
  AuthorProfile,
  PseoCategory,
  PseoPage,
  SectionInfo,
  SectionSlug,
} from '@/lib/domain/types';
import { BrainRootsIcon } from '../brand/BrandLogo';

interface AdminConsoleProps {
  initialArticles: Article[];
  authors: AuthorProfile[];
  sections: SectionInfo[];
  pseoCorePages: PseoPage[];
  totalPseoCount: number;
  sitemapChunks: {
    chunkIndex: number;
    filename: string;
    count: number;
    lastmod: string;
  }[];
  canonicalBase: string;
}

export function AdminConsoleClient({
  initialArticles,
  authors: initialAuthors,
  sections: initialSections,
  pseoCorePages: initialPseoPages,
  totalPseoCount,
  sitemapChunks,
  canonicalBase,
}: AdminConsoleProps) {
  const [authUser, setAuthUser] = useState<{
    username: string;
    displayName: string;
    role: AdminRole;
  } | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Live CMS state collections
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [authors, setAuthors] = useState<AuthorProfile[]>(initialAuthors);
  const [sections, setSections] = useState<SectionInfo[]>(initialSections);
  const [pseoPages, setPseoPages] = useState<PseoPage[]>(initialPseoPages);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Console Tab (5 full management domains)
  const [activeTab, setActiveTab] = useState<
    'articles' | 'authors' | 'sections' | 'pseo' | 'security'
  >('articles');

  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Article Editor State
  // ---------------------------------------------------------------------------
  const [editingArticleSlug, setEditingArticleSlug] = useState<string>('');
  const [artTitle, setArtTitle] = useState('');
  const [artSubtitle, setArtSubtitle] = useState('');
  const [artSection, setArtSection] = useState<SectionSlug>('research-studies');
  const [artDateline, setArtDateline] = useState('[DATELINE]');
  const [artAuthorSlug, setArtAuthorSlug] = useState(
    initialAuthors[0]?.slug || 'author-placeholder'
  );
  const [artReviewerSlug, setArtReviewerSlug] = useState(
    initialAuthors[1]?.slug || 'reviewer-placeholder'
  );
  const [artStudyTitle, setArtStudyTitle] = useState('[Primary Study Title Placeholder]');
  const [artJournal, setArtJournal] = useState('[Journal / Source Name]');
  const [artDoi, setArtDoi] = useState('https://doi.org/[DOI-Placeholder]');
  const [artStudyDesign, setArtStudyDesign] = useState('[Study Design Placeholder]');
  const [artSampleSize, setArtSampleSize] = useState('[Sample Size Placeholder]');
  const [artPullQuote, setArtPullQuote] = useState('');
  const [artPullQuoteAttr, setArtPullQuoteAttr] = useState('[Quote Attribution Placeholder]');
  const [artBodyText, setArtBodyText] = useState('');
  const [artIsLead, setArtIsLead] = useState(false);

  // ---------------------------------------------------------------------------
  // 2. Author / Reviewer Editor State
  // ---------------------------------------------------------------------------
  const [editingAuthorSlug, setEditingAuthorSlug] = useState<string>(
    initialAuthors[1]?.slug || 'reviewer-placeholder'
  );
  const [authorName, setAuthorName] = useState(initialAuthors[1]?.name || '[Reviewer Name]');
  const [authorCredentials, setAuthorCredentials] = useState(
    initialAuthors[1]?.credentials || '[Credentials]'
  );
  const [authorRole, setAuthorRole] = useState(initialAuthors[1]?.role || '[Reviewer Role / Title]');
  const [authorInstitution, setAuthorInstitution] = useState(
    initialAuthors[1]?.institution || '[Institution / Affiliation]'
  );
  const [authorOrcid, setAuthorOrcid] = useState(
    initialAuthors[1]?.orcid || '[0000-0000-0000-0000]'
  );
  const [authorBio, setAuthorBio] = useState(initialAuthors[1]?.bio || '');
  const [authorEducation, setAuthorEducation] = useState(
    initialAuthors[1]?.education.join(', ') || ''
  );
  const [authorSpecialties, setAuthorSpecialties] = useState(
    initialAuthors[1]?.clinicalSpecialties.join(', ') || ''
  );
  const [authorDisclosure, setAuthorDisclosure] = useState(
    initialAuthors[1]?.conflictOfInterestDisclosure || ''
  );
  const [authorIsReviewer, setAuthorIsReviewer] = useState(
    initialAuthors[1]?.isMedicalReviewer ?? true
  );

  // ---------------------------------------------------------------------------
  // 3. Section / Category Editor State
  // ---------------------------------------------------------------------------
  const [secSlug, setSecSlug] = useState<string>(initialSections[0]?.slug || 'latest-news');
  const [secName, setSecName] = useState<string>(initialSections[0]?.name || 'Latest News');
  const [secShortName, setSecShortName] = useState<string>(
    initialSections[0]?.shortName || 'Latest'
  );
  const [secDescription, setSecDescription] = useState<string>(
    initialSections[0]?.description || ''
  );
  const [secLeadNote, setSecLeadNote] = useState<string>(initialSections[0]?.leadNote || '');

  // ---------------------------------------------------------------------------
  // 4. pSEO Template Editor State
  // ---------------------------------------------------------------------------
  const [pseoSlug, setPseoSlug] = useState<string>(
    initialPseoPages[0]?.slug || 'major-depressive-disorder'
  );
  const [pseoCategory, setPseoCategory] = useState<PseoCategory>(
    initialPseoPages[0]?.category || 'condition'
  );
  const [pseoTitle, setPseoTitle] = useState<string>(initialPseoPages[0]?.title || '');
  const [pseoSubtitle, setPseoSubtitle] = useState<string>(initialPseoPages[0]?.subtitle || '');
  const [pseoCode, setPseoCode] = useState<string>(
    initialPseoPages[0]?.dsmOrIcdCode || '[Diagnostic Code Placeholder]'
  );
  const [pseoEvidence, setPseoEvidence] = useState<string>(
    initialPseoPages[0]?.evidenceGrade || '[Evidence Grade Placeholder]'
  );
  const [pseoSummary, setPseoSummary] = useState<string>(
    initialPseoPages[0]?.clinicalSummary || ''
  );
  const [pseoMechanism, setPseoMechanism] = useState<string>(
    initialPseoPages[0]?.neurobiologicalMechanism || ''
  );

  // ---------------------------------------------------------------------------
  // 5. Admin-Only CMS JSON Snapshot State (Max 512 KB) & Image Upload State
  // ---------------------------------------------------------------------------
  const [snapshotJson, setSnapshotJson] = useState<string>('');
  const MAX_CLIENT_SNAPSHOT_BYTES = 512 * 1024; // 512 KB strict file size limit
  const MAX_CLIENT_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB strict image upload limit
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadedImageResult, setUploadedImageResult] = useState<{
    filename: string;
    signedUrl: string;
    width: number;
    height: number;
    byteLength: number;
    detectedFormat: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setAuthUser(data.user);
          setCsrfToken(data.csrfToken);
          setAuditLogs(data.auditLogs || []);
        }
      })
      .catch(() => {});
  }, []);

  function loadArticleIntoEditor(art: Article) {
    setEditingArticleSlug(art.slug);
    setArtTitle(art.title);
    setArtSubtitle(art.subtitle);
    setArtSection(art.section);
    setArtDateline(art.locationDateline);
    setArtAuthorSlug(art.authorSlug);
    setArtReviewerSlug(art.reviewerSlug);
    setArtStudyTitle(art.primarySources[0]?.title || '[Primary Study Title Placeholder]');
    setArtJournal(art.primarySources[0]?.journalOrInstitution || '[Journal / Source Name]');
    setArtDoi(art.primarySources[0]?.doiOrUrl || 'https://doi.org/[DOI-Placeholder]');
    setArtStudyDesign(art.primarySources[0]?.studyDesign || '[Study Design Placeholder]');
    setArtSampleSize(art.primarySources[0]?.sampleSize || '[Sample Size Placeholder]');
    setArtPullQuote(art.pullQuote.quote);
    setArtPullQuoteAttr(art.pullQuote.attribution);
    setArtBodyText(
      art.body
        .flatMap((b) => b.paragraphs)
        .join('\n\n')
    );
    setArtIsLead(Boolean(art.isFeaturedLead));
    setActionFeedback(null);
  }

  function resetArticleEditorForNew() {
    setEditingArticleSlug('');
    setArtTitle('');
    setArtSubtitle('');
    setArtSection('research-studies');
    setArtDateline('[DATELINE]');
    setArtAuthorSlug(authors[0]?.slug || 'author-placeholder');
    setArtReviewerSlug(authors[1]?.slug || authors[0]?.slug || 'reviewer-placeholder');
    setArtStudyTitle('[Primary Study Title Placeholder]');
    setArtJournal('[Journal / Source Name]');
    setArtDoi('https://doi.org/[DOI-Placeholder]');
    setArtStudyDesign('[Study Design Placeholder]');
    setArtSampleSize('[Sample Size Placeholder]');
    setArtPullQuote('');
    setArtPullQuoteAttr('[Quote Attribution Placeholder]');
    setArtBodyText('');
    setArtIsLead(false);
    setActionFeedback(null);
  }

  function loadAuthorIntoEditor(a: AuthorProfile) {
    setEditingAuthorSlug(a.slug);
    setAuthorName(a.name);
    setAuthorCredentials(a.credentials);
    setAuthorRole(a.role);
    setAuthorInstitution(a.institution);
    setAuthorOrcid(a.orcid);
    setAuthorBio(a.bio);
    setAuthorEducation(a.education.join(', '));
    setAuthorSpecialties(a.clinicalSpecialties.join(', '));
    setAuthorDisclosure(a.conflictOfInterestDisclosure);
    setAuthorIsReviewer(a.isMedicalReviewer);
    setActionFeedback(null);
  }

  function resetAuthorEditorForNew() {
    setEditingAuthorSlug('');
    setAuthorName('');
    setAuthorCredentials('');
    setAuthorRole('');
    setAuthorInstitution('');
    setAuthorOrcid('[0000-0000-0000-0000]');
    setAuthorBio('');
    setAuthorEducation('');
    setAuthorSpecialties('');
    setAuthorDisclosure('');
    setAuthorIsReviewer(true);
    setActionFeedback(null);
  }

  function loadSectionIntoEditor(s: SectionInfo) {
    setSecSlug(s.slug);
    setSecName(s.name);
    setSecShortName(s.shortName);
    setSecDescription(s.description);
    setSecLeadNote(s.leadNote);
    setActionFeedback(null);
  }

  function loadPseoIntoEditor(p: PseoPage) {
    setPseoSlug(p.slug);
    setPseoCategory(p.category);
    setPseoTitle(p.title);
    setPseoSubtitle(p.subtitle);
    setPseoCode(p.dsmOrIcdCode || '');
    setPseoEvidence(p.evidenceGrade || '');
    setPseoSummary(p.clinicalSummary);
    setPseoMechanism(p.neurobiologicalMechanism);
    setActionFeedback(null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    setActionFeedback(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
          totpCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials');
        if (typeof data.remainingAttempts === 'number') {
          setRemainingAttempts(data.remainingAttempts);
        }
        setIsLoggingIn(false);
        return;
      }

      setAuthUser(data.user);
      setCsrfToken(data.csrfToken);
      setAuditLogs(data.auditLogs || []);
      setPassword('');
      setTotpCode('');
      setIsLoggingIn(false);
    } catch {
      setLoginError('Authentication service error.');
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setAuthUser(null);
    setCsrfToken('');
    setActionFeedback(null);
  }

  async function handleSaveArticle(e: React.FormEvent) {
    e.preventDefault();
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          operation: 'save_article',
          slug: editingArticleSlug,
          title: artTitle,
          subtitle: artSubtitle,
          section: artSection,
          locationDateline: artDateline,
          authorSlug: artAuthorSlug,
          reviewerSlug: artReviewerSlug,
          studyTitle: artStudyTitle,
          journal: artJournal,
          doiOrUrl: artDoi,
          studyDesign: artStudyDesign,
          sampleSize: artSampleSize,
          pullQuote: artPullQuote,
          pullQuoteAttribution: artPullQuoteAttr,
          bodyText: artBodyText,
          isFeaturedLead: artIsLead,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Action denied.' });
        return;
      }
      setArticles(data.articles);
      setAuditLogs(data.auditLogs);
      setEditingArticleSlug(data.article.slug);
      setActionFeedback({
        type: 'success',
        message: `Saved article "${data.article.title}" (/articles/${data.article.slug}). Live site updated.`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Network error saving article.' });
    }
  }

  async function handleDeleteArticle(slugToDelete: string) {
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          operation: 'delete_article',
          slug: slugToDelete,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Delete denied.' });
        return;
      }
      setArticles(data.articles);
      setAuditLogs(data.auditLogs);
      if (editingArticleSlug === slugToDelete) {
        resetArticleEditorForNew();
      }
      setActionFeedback({
        type: 'success',
        message: `Deleted article /articles/${slugToDelete}.`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to delete article.' });
    }
  }

  async function handleSaveAuthor(e: React.FormEvent) {
    e.preventDefault();
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          operation: 'save_author',
          slug: editingAuthorSlug,
          name: authorName,
          credentials: authorCredentials,
          role: authorRole,
          institution: authorInstitution,
          orcid: authorOrcid,
          bio: authorBio,
          education: authorEducation,
          clinicalSpecialties: authorSpecialties,
          conflictOfInterestDisclosure: authorDisclosure,
          isMedicalReviewer: authorIsReviewer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Unable to save profile.' });
        return;
      }
      setAuthors(data.authors);
      setAuditLogs(data.auditLogs);
      setEditingAuthorSlug(data.author.slug);
      setActionFeedback({
        type: 'success',
        message: `Saved profile "${data.author.name}, ${data.author.credentials}" (/authors/${data.author.slug}). All articles & disclaimers updated.`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to save author/reviewer profile.' });
    }
  }

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault();
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          operation: 'save_section',
          slug: secSlug,
          name: secName,
          shortName: secShortName,
          description: secDescription,
          leadNote: secLeadNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Unable to save section.' });
        return;
      }
      setSections(data.sections);
      setAuditLogs(data.auditLogs);
      setActionFeedback({
        type: 'success',
        message: `Saved section "${data.section.name}" (/section/${data.section.slug}).`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to save section.' });
    }
  }

  async function handleSavePseoPage(e: React.FormEvent) {
    e.preventDefault();
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          operation: 'save_pseo_page',
          slug: pseoSlug,
          category: pseoCategory,
          title: pseoTitle,
          subtitle: pseoSubtitle,
          dsmOrIcdCode: pseoCode,
          evidenceGrade: pseoEvidence,
          clinicalSummary: pseoSummary,
          neurobiologicalMechanism: pseoMechanism,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Unable to save pSEO page.' });
        return;
      }
      setPseoPages(data.pseoCorePages);
      setAuditLogs(data.auditLogs);
      setActionFeedback({
        type: 'success',
        message: `Saved pSEO template "${data.pseoPage.title}" (${data.pseoPage.urlPath}).`,
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to save pSEO template.' });
    }
  }

  async function handleReindexPseo() {
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ operation: 'reindex_pseo' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'RBAC permission denied.' });
        return;
      }
      setAuditLogs(data.auditLogs);
      setActionFeedback({ type: 'success', message: data.message });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to trigger reindex.' });
    }
  }

  async function handleExportSnapshot() {
    setActionFeedback(null);
    if (authUser?.role !== 'admin') {
      setActionFeedback({
        type: 'error',
        message: 'Forbidden: Only the admin role can export CMS dataset snapshots.',
      });
      return;
    }
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ operation: 'export_snapshot' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Snapshot export denied.' });
        return;
      }
      setSnapshotJson(JSON.stringify(data.snapshot, null, 2));
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      setActionFeedback({
        type: 'success',
        message: 'Generated full CMS JSON dataset snapshot for backup / PostgreSQL migration.',
      });
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to export CMS snapshot.' });
    }
  }

  function handleSnapshotFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setActionFeedback(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CLIENT_SNAPSHOT_BYTES) {
      setActionFeedback({
        type: 'error',
        message: `File "${file.name}" (${Math.round(file.size / 1024)} KB) exceeds the 512 KB maximum file size limit.`,
      });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setSnapshotJson(content);
      setActionFeedback({
        type: 'success',
        message: `Loaded "${file.name}" (${Math.max(1, Math.round(file.size / 1024))} KB). Click "Validate & Import Snapshot" to apply.`,
      });
    };
    reader.onerror = () => {
      setActionFeedback({ type: 'error', message: 'Failed to read selected JSON file.' });
    };
    reader.readAsText(file);
  }

  async function handleImportSnapshot() {
    setActionFeedback(null);
    if (authUser?.role !== 'admin') {
      setActionFeedback({
        type: 'error',
        message: 'Forbidden: Only the admin role can import CMS dataset snapshots.',
      });
      return;
    }
    const byteSize = new Blob([snapshotJson]).size;
    if (byteSize > MAX_CLIENT_SNAPSHOT_BYTES) {
      setActionFeedback({
        type: 'error',
        message: `Snapshot payload (${Math.round(byteSize / 1024)} KB) exceeds the 512 KB maximum file size limit.`,
      });
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(snapshotJson);
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Invalid JSON syntax. Please provide a valid JSON object matching the CMS schema.',
      });
      return;
    }
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          operation: 'import_snapshot',
          snapshot: parsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({ type: 'error', message: data.error || 'Snapshot import rejected.' });
        return;
      }
      setArticles(data.articles);
      setAuthors(data.authors);
      setSections(data.sections);
      setPseoPages(data.pseoCorePages);
      setAuditLogs(data.auditLogs);
      setActionFeedback({
        type: 'success',
        message:
          'Successfully validated schema, sanitized all HTML, and imported CMS dataset snapshot.',
      });
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Network error importing CMS snapshot.',
      });
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setActionFeedback(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (authUser?.role !== 'admin' && authUser?.role !== 'editor') {
      setActionFeedback({
        type: 'error',
        message: 'Forbidden: Admin or Editor role is required to upload images.',
      });
      e.target.value = '';
      return;
    }

    if (file.size > MAX_CLIENT_IMAGE_BYTES) {
      setActionFeedback({
        type: 'error',
        message: `File "${file.name}" exceeds the 5 MB maximum upload size limit.`,
      });
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback({
          type: 'error',
          message: data.error || 'Image upload rejected.',
        });
        e.target.value = '';
        return;
      }
      setUploadedImageResult({
        filename: data.filename,
        signedUrl: data.signedUrl,
        width: data.width,
        height: data.height,
        byteLength: data.byteLength,
        detectedFormat: data.detectedFormat,
      });
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      setActionFeedback({
        type: 'success',
        message: `Verified ${String(data.detectedFormat).toUpperCase()} magic bytes, stripped EXIF metadata, re-encoded to WebP (${data.filename}), and generated signed URL.`,
      });
    } catch {
      setActionFeedback({
        type: 'error',
        message: 'Network error uploading image.',
      });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] text-[#111111] flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-[#E5E5E0] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 border-b border-[#E5E5E0] pb-4 mb-6">
            <BrainRootsIcon variant="blue-on-light" size={28} />
            <h1 className="font-serif text-xl font-bold text-[#111111]">
              Sign In
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-sans font-bold uppercase tracking-wider text-[#111111] mb-1"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7] focus:bg-white focus:outline-none focus:border-[#1E48B8]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-sans font-bold uppercase tracking-wider text-[#111111] mb-1"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7] focus:bg-white focus:outline-none focus:border-[#1E48B8]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-totp"
                className="block text-xs font-sans font-bold uppercase tracking-wider text-[#111111] mb-1"
              >
                Two-Factor Code
              </label>
              <input
                id="admin-totp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-[#E5E5E0] bg-[#FAFAF7] focus:bg-white focus:outline-none focus:border-[#1E48B8]"
              />
            </div>

            {loginError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-300 text-red-900 px-3.5 py-2.5 text-xs font-sans flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">{loginError}</strong>
                  {remainingAttempts !== null && (
                    <span className="block text-[11px] mt-0.5 font-mono">
                      {remainingAttempts} attempt(s) remaining.
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-colors cursor-pointer"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]">
      {/* Top Admin Header */}
      <header className="bg-[#111111] text-white border-b-2 border-[#1E48B8] px-4 sm:px-8 py-4">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrainRootsIcon variant="white-on-blue" size={32} />
            <div>
              <h1 className="font-serif text-xl font-bold text-white">
                Therapist Psychologist Today — Editorial CMS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="text-right">
              <div className="font-bold text-white">{authUser.displayName}</div>
              <div className="font-mono text-[11px] text-blue-300 uppercase">
                RBAC Role: {authUser.role} · CSRF Token Active
              </div>
            </div>
            <Link
              href="/"
              className="px-3 py-2 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              View Live Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 bg-[#1E48B8] text-white font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8">
        {/* 5-Domain Admin Navigation Tabs */}
        <div
          className="flex flex-wrap gap-2 border-b-2 border-[#111111] pb-4 mb-6"
          role="tablist"
          aria-label="Admin Console Sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'articles'}
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'articles'
                ? 'bg-[#1E48B8] text-white'
                : 'bg-white text-[#111111] border border-[#E5E5E0]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Articles ({articles.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'authors'}
            onClick={() => setActiveTab('authors')}
            className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'authors'
                ? 'bg-[#1E48B8] text-white'
                : 'bg-white text-[#111111] border border-[#E5E5E0]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Authors &amp; Reviewers ({authors.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sections'}
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'sections'
                ? 'bg-[#1E48B8] text-white'
                : 'bg-white text-[#111111] border border-[#E5E5E0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Categories &amp; Sections ({sections.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pseo'}
            onClick={() => setActiveTab('pseo')}
            className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'pseo'
                ? 'bg-[#1E48B8] text-white'
                : 'bg-white text-[#111111] border border-[#E5E5E0]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>4. pSEO Templates &amp; Sitemaps ({pseoPages.length} Core)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-[#1E48B8] text-white'
                : 'bg-white text-[#111111] border border-[#E5E5E0]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>5. Security Audit &amp; DB Schema ({auditLogs.length})</span>
          </button>
        </div>

        {actionFeedback && (
          <div
            role="status"
            className={`mb-6 p-4 border flex items-center gap-2 text-xs sm:text-sm font-sans ${
              actionFeedback.type === 'success'
                ? 'bg-[#EEF2FB] border-[#1E48B8] text-[#111111]'
                : 'bg-red-50 border-red-400 text-red-900'
            }`}
          >
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#1E48B8] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
        )}

        {/* =====================================================================
            TAB 1: ARTICLES & DISPATCHES (CREATE, EDIT PLACEHOLDERS, DELETE)
           ===================================================================== */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white border border-[#E5E5E0] p-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 mb-4">
                <h2 className="font-serif text-xl font-bold text-[#111111]">
                  {editingArticleSlug
                    ? `Editing Article: /articles/${editingArticleSlug}`
                    : 'Publish New Article Dispatch'}
                </h2>
                {editingArticleSlug && (
                  <button
                    type="button"
                    onClick={resetArticleEditorForNew}
                    className="text-xs font-sans font-bold text-[#1F44A8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Article</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-4">
                <div>
                  <label
                    htmlFor="cms-article-title"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Headline
                  </label>
                  <input
                    id="cms-article-title"
                    type="text"
                    required
                    value={artTitle}
                    onChange={(e) => setArtTitle(e.target.value)}
                    placeholder="Enter real article headline..."
                    className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-article-subtitle"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Subheadline &amp; Excerpt
                  </label>
                  <textarea
                    id="cms-article-subtitle"
                    rows={2}
                    required
                    value={artSubtitle}
                    onChange={(e) => setArtSubtitle(e.target.value)}
                    placeholder="Summarize study design, sample size, and primary outcome..."
                    className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="cms-article-section"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Editorial Section
                    </label>
                    <select
                      id="cms-article-section"
                      value={artSection}
                      onChange={(e) => setArtSection(e.target.value as SectionSlug)}
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    >
                      {sections.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-article-dateline"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Dateline
                    </label>
                    <input
                      id="cms-article-dateline"
                      type="text"
                      value={artDateline}
                      onChange={(e) => setArtDateline(e.target.value)}
                      placeholder="e.g. BOSTON / LONDON"
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="cms-article-author"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Author Byline
                    </label>
                    <select
                      id="cms-article-author"
                      value={artAuthorSlug}
                      onChange={(e) => setArtAuthorSlug(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    >
                      {authors.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.name}, {a.credentials}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-article-reviewer"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Medical Reviewer
                    </label>
                    <select
                      id="cms-article-reviewer"
                      value={artReviewerSlug}
                      onChange={(e) => setArtReviewerSlug(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    >
                      {authors.map((a) => (
                        <option key={a.slug} value={a.slug}>
                          {a.name}, {a.credentials}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cms-article-body"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Article Body Paragraphs (Separate paragraphs with a blank line)
                  </label>
                  <textarea
                    id="cms-article-body"
                    rows={4}
                    value={artBodyText}
                    onChange={(e) => setArtBodyText(e.target.value)}
                    placeholder="Enter article paragraphs..."
                    className="w-full px-3 py-2 text-xs font-serif border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div className="border-t border-[#E5E5E0] pt-3 space-y-3">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#1E48B8] block">
                    Primary Source Citation &amp; Study Metadata
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="cms-study-title"
                        className="block text-[11px] font-sans font-semibold mb-1"
                      >
                        Primary Study Title
                      </label>
                      <input
                        id="cms-study-title"
                        type="text"
                        value={artStudyTitle}
                        onChange={(e) => setArtStudyTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cms-article-journal"
                        className="block text-[11px] font-sans font-semibold mb-1"
                      >
                        Journal / Institution
                      </label>
                      <input
                        id="cms-article-journal"
                        type="text"
                        value={artJournal}
                        onChange={(e) => setArtJournal(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="cms-article-doi"
                        className="block text-[11px] font-sans font-semibold mb-1"
                      >
                        Primary DOI / URL
                      </label>
                      <input
                        id="cms-article-doi"
                        type="url"
                        value={artDoi}
                        onChange={(e) => setArtDoi(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cms-study-design"
                        className="block text-[11px] font-sans font-semibold mb-1"
                      >
                        Study Design
                      </label>
                      <input
                        id="cms-study-design"
                        type="text"
                        value={artStudyDesign}
                        onChange={(e) => setArtStudyDesign(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cms-sample-size"
                        className="block text-[11px] font-sans font-semibold mb-1"
                      >
                        Sample Size
                      </label>
                      <input
                        id="cms-sample-size"
                        type="text"
                        value={artSampleSize}
                        onChange={(e) => setArtSampleSize(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="cms-is-lead"
                    type="checkbox"
                    checked={artIsLead}
                    onChange={(e) => setArtIsLead(e.target.checked)}
                    className="accent-[#1E48B8]"
                  />
                  <label htmlFor="cms-is-lead" className="text-xs font-sans font-semibold">
                    Feature as Homepage Lead Story
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                >
                  {editingArticleSlug
                    ? 'Save Article Changes & Update Live Site'
                    : 'Publish New Article & Embed Ownership Watermark'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white border border-[#E5E5E0] p-6">
              <h2 className="font-serif text-xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-3 mb-4">
                Existing Articles — Click &ldquo;Edit&rdquo; to Replace Placeholders ({articles.length})
              </h2>
              <div className="divide-y divide-[#E5E5E0]">
                {articles.map((art) => (
                  <div key={art.slug} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px] font-sans text-neutral-500">
                      <span className="font-bold uppercase text-[#1E48B8]">
                        {art.section} {art.isFeaturedLead ? '· LEAD STORY' : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadArticleIntoEditor(art)}
                          className="px-2.5 py-1 bg-[#EEF2FB] text-[#1F44A8] font-bold hover:bg-[#1E48B8] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art.slug)}
                          aria-label={`Delete ${art.title}`}
                          className="px-2 py-1 border border-red-200 text-red-700 hover:bg-red-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <Link
                      href={`/articles/${art.slug}`}
                      className="font-serif text-base font-bold text-[#111111] hover:text-[#1F44A8] block mt-1"
                    >
                      {art.title}
                    </Link>
                    <div className="text-[11px] font-mono text-neutral-500 mt-1">
                      Author: {art.authorSlug} · Reviewer: {art.reviewerSlug} · Source:{' '}
                      {art.primarySources[0]?.journalOrInstitution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: AUTHORS & MEDICAL REVIEWERS (REPLACE [Author Name] / [Reviewer Name])
           ===================================================================== */}
        {activeTab === 'authors' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white border border-[#E5E5E0] p-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3 mb-4">
                <h2 className="font-serif text-xl font-bold text-[#111111]">
                  {editingAuthorSlug
                    ? `Editing Profile: ${editingAuthorSlug}`
                    : 'Add New Author or Reviewer Profile'}
                </h2>
                <button
                  type="button"
                  onClick={resetAuthorEditorForNew}
                  className="text-xs font-sans font-bold text-[#1F44A8] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Profile</span>
                </button>
              </div>

              <form onSubmit={handleSaveAuthor} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="cms-author-name"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Full Name (Replaces [Reviewer Name])
                    </label>
                    <input
                      id="cms-author-name"
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cms-author-creds"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Credentials (Replaces [Credentials])
                    </label>
                    <input
                      id="cms-author-creds"
                      type="text"
                      required
                      value={authorCredentials}
                      onChange={(e) => setAuthorCredentials(e.target.value)}
                      placeholder="e.g. MD, PhD / PsyD"
                      className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="cms-author-role"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Editorial Role / Title
                    </label>
                    <input
                      id="cms-author-role"
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="e.g. Medical Reviewer / Staff Writer"
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cms-author-inst"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Institution / Affiliation
                    </label>
                    <input
                      id="cms-author-inst"
                      type="text"
                      value={authorInstitution}
                      onChange={(e) => setAuthorInstitution(e.target.value)}
                      placeholder="e.g. Department of Psychiatry"
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cms-author-orcid"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    ORCID Identifier
                  </label>
                  <input
                    id="cms-author-orcid"
                    type="text"
                    value={authorOrcid}
                    onChange={(e) => setAuthorOrcid(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-author-bio"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Biography
                  </label>
                  <textarea
                    id="cms-author-bio"
                    rows={3}
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-serif border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-author-edu"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Education &amp; Licensure (Comma-separated)
                  </label>
                  <input
                    id="cms-author-edu"
                    type="text"
                    value={authorEducation}
                    onChange={(e) => setAuthorEducation(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-author-spec"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Clinical Specialties (Comma-separated)
                  </label>
                  <input
                    id="cms-author-spec"
                    type="text"
                    value={authorSpecialties}
                    onChange={(e) => setAuthorSpecialties(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cms-author-coi"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Conflict of Interest Disclosure
                  </label>
                  <textarea
                    id="cms-author-coi"
                    rows={2}
                    value={authorDisclosure}
                    onChange={(e) => setAuthorDisclosure(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="cms-author-is-reviewer"
                    type="checkbox"
                    checked={authorIsReviewer}
                    onChange={(e) => setAuthorIsReviewer(e.target.checked)}
                    className="accent-[#1E48B8]"
                  />
                  <label htmlFor="cms-author-is-reviewer" className="text-xs font-sans font-semibold">
                    Designated Clinical / Medical Reviewer
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                >
                  Save Author / Reviewer Profile
                </button>
              </form>
            </div>

            <div className="lg:col-span-6 bg-white border border-[#E5E5E0] p-6">
              <h2 className="font-serif text-xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-3 mb-4">
                Active Author &amp; Reviewer Profiles ({authors.length})
              </h2>
              <p className="text-xs font-sans text-neutral-600 mb-4">
                Editing <code className="font-mono">author-placeholder</code> or{' '}
                <code className="font-mono">reviewer-placeholder</code> immediately updates all
                articles, pSEO pages, and disclaimer strips across the site with your real
                information.
              </p>
              <div className="space-y-4">
                {authors.map((a) => (
                  <div key={a.slug} className="border border-[#E5E5E0] p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/authors/${a.slug}`}
                        className="font-serif text-lg font-bold text-[#1F44A8] hover:underline"
                      >
                        {a.name}, {a.credentials}
                      </Link>
                      <button
                        type="button"
                        onClick={() => loadAuthorIntoEditor(a)}
                        className="px-3 py-1 bg-[#EEF2FB] text-[#1F44A8] text-xs font-sans font-bold hover:bg-[#1E48B8] hover:text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Profile</span>
                      </button>
                    </div>
                    <p className="text-xs font-sans font-semibold text-[#111111]">
                      {a.role} · {a.institution}
                    </p>
                    <p className="text-xs font-mono text-neutral-500">
                      Slug: /authors/{a.slug} · ORCID: {a.orcid}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: CATEGORIES & EDITORIAL SECTIONS MANAGER
           ===================================================================== */}
        {activeTab === 'sections' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white border border-[#E5E5E0] p-6">
              <h2 className="font-serif text-xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-3 mb-4">
                Edit Editorial Category / Section
              </h2>
              <form onSubmit={handleSaveSection} className="space-y-4">
                <div>
                  <label
                    htmlFor="cms-sec-slug"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Section Slug
                  </label>
                  <input
                    id="cms-sec-slug"
                    type="text"
                    required
                    value={secSlug}
                    onChange={(e) => setSecSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="cms-sec-name"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      id="cms-sec-name"
                      type="text"
                      required
                      value={secName}
                      onChange={(e) => setSecName(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cms-sec-short"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Compact Nav Label
                    </label>
                    <input
                      id="cms-sec-short"
                      type="text"
                      required
                      value={secShortName}
                      onChange={(e) => setSecShortName(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="cms-sec-lead"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Section Desk Kicker / Lead Note
                  </label>
                  <input
                    id="cms-sec-lead"
                    type="text"
                    value={secLeadNote}
                    onChange={(e) => setSecLeadNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cms-sec-desc"
                    className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                  >
                    Section Description (Meta &amp; Header)
                  </label>
                  <textarea
                    id="cms-sec-desc"
                    rows={3}
                    required
                    value={secDescription}
                    onChange={(e) => setSecDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-serif border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                >
                  Save Category / Section
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#E5E5E0] p-6">
              <h2 className="font-serif text-xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-3 mb-4">
                Top-Bar Navigation Sections ({sections.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sections.map((s) => (
                  <div
                    key={s.slug}
                    className="border border-[#E5E5E0] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#1E48B8] font-bold">
                          /section/{s.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => loadSectionIntoEditor(s)}
                          className="px-2.5 py-1 bg-[#EEF2FB] text-[#1F44A8] text-xs font-sans font-bold hover:bg-[#1E48B8] hover:text-white transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#111111] mt-1">
                        {s.name}
                      </h3>
                      <p className="text-xs font-serif text-neutral-600 mt-1">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: PROGRAMMATIC SEO TEMPLATES & SITEMAP CHUNK STATUS
           ===================================================================== */}
        {activeTab === 'pseo' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 bg-white border border-[#E5E5E0] p-6">
                <h2 className="font-serif text-xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-3 mb-4">
                  Edit or Create pSEO Clinical Template
                </h2>
                <form onSubmit={handleSavePseoPage} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="cms-pseo-slug"
                        className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                      >
                        Template URL Slug
                      </label>
                      <input
                        id="cms-pseo-slug"
                        type="text"
                        required
                        value={pseoSlug}
                        onChange={(e) => setPseoSlug(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cms-pseo-cat"
                        className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                      >
                        pSEO Page Type
                      </label>
                      <select
                        id="cms-pseo-cat"
                        value={pseoCategory}
                        onChange={(e) => setPseoCategory(e.target.value as PseoCategory)}
                        className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                      >
                        <option value="condition">Condition Explainer (/conditions/...)</option>
                        <option value="treatment">Treatment Explainer (/treatments/...)</option>
                        <option value="topic-hub">Topic Hub (/topics/...)</option>
                        <option value="study-explainer">Study Explainer (/studies/...)</option>
                        <option value="glossary">Medical Glossary (/glossary/...)</option>
                        <option value="faq">Clinical FAQ (/faq/...)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-pseo-title"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Page Title
                    </label>
                    <input
                      id="cms-pseo-title"
                      type="text"
                      required
                      value={pseoTitle}
                      onChange={(e) => setPseoTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-pseo-sub"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Subtitle &amp; Meta Description
                    </label>
                    <input
                      id="cms-pseo-sub"
                      type="text"
                      value={pseoSubtitle}
                      onChange={(e) => setPseoSubtitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="cms-pseo-code"
                        className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                      >
                        Diagnostic / Classification Code
                      </label>
                      <input
                        id="cms-pseo-code"
                        type="text"
                        value={pseoCode}
                        onChange={(e) => setPseoCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cms-pseo-grade"
                        className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                      >
                        Evidence Grade Label
                      </label>
                      <input
                        id="cms-pseo-grade"
                        type="text"
                        value={pseoEvidence}
                        onChange={(e) => setPseoEvidence(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-sans border border-[#E5E5E0] bg-[#FAFAF7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cms-pseo-summary"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Clinical Overview &amp; Summary
                    </label>
                    <textarea
                      id="cms-pseo-summary"
                      rows={3}
                      required
                      value={pseoSummary}
                      onChange={(e) => setPseoSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-serif border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cms-pseo-mech"
                      className="block text-xs font-sans font-bold uppercase tracking-wider mb-1"
                    >
                      Neurobiological / Clinical Mechanism
                    </label>
                    <textarea
                      id="cms-pseo-mech"
                      rows={2}
                      value={pseoMechanism}
                      onChange={(e) => setPseoMechanism(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-serif border border-[#E5E5E0] bg-[#FAFAF7]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                  >
                    Save pSEO Clinical Template
                  </button>
                </form>
              </div>

              <div className="lg:col-span-6 bg-white border border-[#E5E5E0] p-6">
                <h2 className="font-serif text-xl font-bold text-[#111111] border-b border-[#E5E5E0] pb-3 mb-4">
                  Core pSEO Templates — Click &ldquo;Edit&rdquo; ({pseoPages.length})
                </h2>
                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                  {pseoPages.map((p) => (
                    <div
                      key={p.slug}
                      className="border border-[#E5E5E0] p-3.5 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                          {p.category} · {p.urlPath}
                        </span>
                        <Link
                          href={p.urlPath}
                          className="font-serif text-sm font-bold text-[#111111] hover:text-[#1F44A8] block mt-0.5"
                        >
                          {p.title}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadPseoIntoEditor(p)}
                        className="px-2.5 py-1 bg-[#EEF2FB] text-[#1F44A8] text-xs font-sans font-bold hover:bg-[#1E48B8] hover:text-white transition-colors shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Automatic Sitemap Chunk Partitioning Status */}
            <div className="bg-white border border-[#E5E5E0] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E0]">
                <div>
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#1E48B8] block">
                    Automatic XML Sitemap Partitioning Engine
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#111111]">
                    Sitemap Index (/sitemap.xml) &amp; Chunk Status ({sitemapChunks.length} Chunks,{' '}
                    {totalPseoCount.toLocaleString()} Total URLs)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleReindexPseo}
                  className="px-4 py-2 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#1E3A8A] transition-colors shrink-0 cursor-pointer"
                >
                  Verify &amp; Re-Index Sitemap Chunks
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {sitemapChunks.map((chunk) => (
                  <div key={chunk.filename} className="bg-[#FAFAF7] border border-[#E5E5E0] p-4">
                    <span className="text-[11px] font-mono text-[#1E48B8] font-bold block">
                      CHUNK #{chunk.chunkIndex}
                    </span>
                    <Link
                      href={chunk.filename}
                      className="font-mono text-sm font-bold text-[#111111] hover:text-[#1F44A8] underline block mt-1"
                    >
                      {chunk.filename}
                    </Link>
                    <p className="text-xs font-sans text-neutral-600 mt-1">
                      URLs in Chunk: <strong className="font-mono">{chunk.count}</strong>
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                      lastmod: {chunk.lastmod}
                    </p>
                  </div>
                ))}
                <div className="bg-[#EEF2FB] border border-[#1E48B8]/30 p-4">
                  <span className="text-[11px] font-mono text-[#1E48B8] font-bold block">
                    48-HR GOOGLE NEWS
                  </span>
                  <Link
                    href="/news-sitemap.xml"
                    className="font-mono text-sm font-bold text-[#111111] hover:text-[#1F44A8] underline block mt-1"
                  >
                    /news-sitemap.xml
                  </Link>
                  <p className="text-xs font-sans text-neutral-700 mt-1">
                    Google News feed for articles published in the last 48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 5: SECURITY AUDIT LOG, ADMIN-ONLY JSON SNAPSHOT & DB SCHEMA
           ===================================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Admin / Editor Secure Image Upload (Magic Bytes + EXIF Strip + WebP Re-Encode + Signed URL) */}
            <div className="bg-white border border-[#E5E5E0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E0] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1E48B8]" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E48B8] block font-bold">
                      Admin / Editor · Max 5 MB · Magic-Byte Check · EXIF Strip · WebP Re-Encode
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#111111]">
                      Secure Editorial Image Upload &amp; Signed URL Generator
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 bg-[#EEF2FB] text-[#1F44A8] font-bold">
                  Required Role: admin / editor
                </span>
              </div>

              {authUser.role !== 'admin' && authUser.role !== 'editor' ? (
                <div className="p-4 bg-red-50 border border-red-200 text-xs font-sans text-red-900">
                  <strong>Restricted to Admin / Editor Roles:</strong> Your current session role (
                  <code className="font-mono">{authUser.role}</code>) is not permitted to upload
                  images.
                </div>
              ) : (
                <>
                  <p className="text-xs font-sans text-neutral-600 leading-relaxed">
                    Uploads are verified via binary magic bytes (JPEG, PNG, WebP, GIF), limited to 5
                    MB, stripped of all EXIF/GPS/XMP metadata, re-encoded from scratch to WebP, saved
                    under a random 32-character hex filename in{' '}
                    <code className="font-mono">/.cms-uploads/</code>, and served exclusively via the
                    HMAC-signed route <code className="font-mono">/api/media/[filename]?sig=[token]</code>.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-3.5 py-2 bg-[#1E48B8] text-white hover:bg-[#1E3A8A] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors">
                      <span>
                        {isUploadingImage
                          ? 'Verifying & Re-Encoding to WebP...'
                          : 'Upload Image (Max 5 MB)'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        disabled={isUploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadedImageResult && (
                    <div className="p-4 bg-[#EEF2FB] border border-[#1E48B8]/30 space-y-2 text-xs font-mono">
                      <div className="font-bold text-[#111111]">
                        Sanitized WebP Stored &amp; Signed URL Generated:
                      </div>
                      <div>
                        Random Filename: <span className="text-[#1F44A8]">{uploadedImageResult.filename}</span>
                      </div>
                      <div>
                        Detected Magic Bytes:{' '}
                        <span className="uppercase">{uploadedImageResult.detectedFormat}</span> →
                        Re-Encoded WebP ({uploadedImageResult.width}&times;
                        {uploadedImageResult.height}px, {uploadedImageResult.byteLength} bytes, EXIF
                        stripped)
                      </div>
                      <div className="break-all">
                        Signed URL:{' '}
                        <a
                          href={uploadedImageResult.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1F44A8] underline font-bold"
                        >
                          {uploadedImageResult.signedUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Admin-Only CMS Dataset JSON Snapshot (Strict Schema + HTML Sanitization + 512 KB Limit) */}
            <div className="bg-white border border-[#E5E5E0] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E0] pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#1E48B8]" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E48B8] block font-bold">
                      Admin-Only · Max 512 KB · Strict Schema &amp; HTML Sanitization
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#111111]">
                      CMS Dataset JSON Snapshot (Export / Import)
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 bg-[#EEF2FB] text-[#1F44A8] font-bold">
                  Required Role: admin
                </span>
              </div>

              {authUser.role !== 'admin' ? (
                <div className="p-4 bg-red-50 border border-red-200 text-xs font-sans text-red-900">
                  <strong>Restricted to Admin Role:</strong> Your current session role (
                  <code className="font-mono">{authUser.role}</code>) is not permitted to export or
                  import full CMS JSON snapshots. Sign in with the <code className="font-mono">admin</code>{' '}
                  account to access this tool.
                </div>
              ) : (
                <>
                  <p className="text-xs font-sans text-neutral-600 leading-relaxed">
                    Export or import the CMS dataset (<code className="font-mono">articles</code>,{' '}
                    <code className="font-mono">authors</code>,{' '}
                    <code className="font-mono">sections</code>,{' '}
                    <code className="font-mono">corePseoPages</code>). Imports enforce a strict 512 KB
                    file size cap, reject unknown keys or invalid schemas, and strip all HTML/script
                    markup across every string field.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleExportSnapshot}
                      className="px-3.5 py-2 bg-[#1E48B8] text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#1E3A8A] transition-colors cursor-pointer"
                    >
                      Generate Live JSON Snapshot
                    </button>

                    <label className="px-3.5 py-2 bg-[#FAFAF7] text-[#111111] border border-[#E5E5E0] hover:border-[#1E48B8] text-xs font-sans font-bold uppercase tracking-wider cursor-pointer">
                      <span>Select .JSON File (&le; 512 KB)</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleSnapshotFileSelect}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleImportSnapshot}
                      disabled={!snapshotJson.trim()}
                      className="px-3.5 py-2 bg-white text-[#111111] border border-[#111111] text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#EEF2FB] disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Validate &amp; Import Snapshot
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={snapshotJson}
                    onChange={(e) => setSnapshotJson(e.target.value)}
                    placeholder='Click "Generate Live JSON Snapshot" or upload a .json file (max 512 KB)...'
                    aria-label="CMS JSON Snapshot"
                    className="w-full px-3 py-2 text-[11px] font-mono border border-[#E5E5E0] bg-[#FAFAF7]"
                  />
                </>
              )}
            </div>

            <div className="bg-white border border-[#E5E5E0] p-6">
              <h2 className="font-serif text-xl font-bold text-[#111111] mb-4">
                Immutable Server-Side Security &amp; RBAC Audit Log
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-[#EEF2FB] border-b border-[#E5E5E0] text-[#111111]">
                      <th className="py-2.5 px-3">Timestamp (UTC)</th>
                      <th className="py-2.5 px-3">Actor &amp; Role</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Resource</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E0]">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {log.actorUsername} ({log.actorRole})
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#1F44A8]">{log.action}</td>
                        <td className="py-2.5 px-3">{log.resource}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={
                              log.status === 'success'
                                ? 'text-emerald-800 font-bold'
                                : 'text-red-700 font-bold'
                            }
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-700">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decoupled PostgreSQL Schema & Infrastructure Hardening Specification */}
            <div className="bg-white border border-[#E5E5E0] p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#111111]">
                PostgreSQL Backend Swap &amp; Disaster Recovery Architecture
              </h2>
              <p className="text-xs sm:text-sm font-sans text-neutral-700 leading-relaxed">
                The <code className="font-mono">IPublicationRepository</code> interface in{' '}
                <code className="font-mono">/lib/services/publication-service.ts</code> decouples all
                UI components from the underlying data store. When connecting PostgreSQL via{' '}
                <code className="font-mono">DATABASE_URL</code>, execute the following
                least-privilege parameterized schema (no superuser access, automated daily off-site
                encrypted pg_dump backups, and DNSSEC / SPF / DKIM / DMARC enforcement on{' '}
                {canonicalBase}):
              </p>
              <pre className="bg-[#111111] text-blue-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`-- Least-Privilege Application Role (Never Superuser)
CREATE ROLE tpt_app_user WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD 'USE_ENV_SECRET';

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Argon2id / Scrypt PHC string
  role VARCHAR(16) NOT NULL CHECK (role IN ('admin', 'editor', 'author')),
  totp_secret_encrypted TEXT,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE authors (
  slug VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  credentials TEXT NOT NULL,
  role TEXT NOT NULL,
  institution TEXT NOT NULL,
  orcid VARCHAR(32),
  bio TEXT NOT NULL,
  is_medical_reviewer BOOLEAN NOT NULL DEFAULT FALSE,
  conflict_of_interest_disclosure TEXT NOT NULL
);

CREATE TABLE articles (
  slug VARCHAR(140) PRIMARY KEY, -- Non-sequential slug
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  section_slug VARCHAR(32) NOT NULL,
  author_slug VARCHAR(64) NOT NULL REFERENCES authors(slug),
  reviewer_slug VARCHAR(64) NOT NULL REFERENCES authors(slug),
  published_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_reviewed_at TIMESTAMPTZ NOT NULL
);`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
