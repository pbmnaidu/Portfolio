'use client';

import React, { useEffect, useState } from 'react';
import {
  getPortfolioData,
  savePortfolioData,
  defaultPortfolioData,
  fastProcessFile,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  onAuthChange,
  PortfolioData,
  ThemeConfig
} from '@/lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Palette,
  User,
  Briefcase,
  Laptop,
  Code,
  GraduationCap,
  Trophy,
  Share2,
  Upload,
  Save,
  RotateCcw,
  ExternalLink,
  Sun,
  Moon,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const PRESET_THEMES: Record<string, ThemeConfig> = {
  obsidian: { accent: "#8b5cf6", bg: "#09090e", surface: "#13121c", text: "#f3f4f6", muted: "#a78bfa", border: "#242038", bgPattern: "grid" },
  tokyo: { accent: "#00f0ff", bg: "#0a0e17", surface: "#111827", text: "#f9fafb", muted: "#38bdf8", border: "#1f293d", bgPattern: "dots" },
  sapphire: { accent: "#3b82f6", bg: "#030712", surface: "#0b1329", text: "#f8fafc", muted: "#60a5fa", border: "#1e293b", bgPattern: "mesh" },
  nordic: { accent: "#10b981", bg: "#06141b", surface: "#0b1f28", text: "#f0fdf4", muted: "#34d399", border: "#13313d", bgPattern: "mesh" },
  cyberpunk: { accent: "#facc15", bg: "#0d0b14", surface: "#171324", text: "#fef08a", muted: "#c084fc", border: "#2e2344", bgPattern: "grid" },
  emerald: { accent: "#34d399", bg: "#022c22", surface: "#064e3b", text: "#ecfdf5", muted: "#6ee7b7", border: "#047857", bgPattern: "dots" },
  solar: { accent: "#f97316", bg: "#0c0a09", surface: "#1c1917", text: "#fafaf9", muted: "#fdba74", border: "#2b2522", bgPattern: "waves" },
  rose: { accent: "#f43f5e", bg: "#140b10", surface: "#1f121a", text: "#fff1f2", muted: "#fb7185", border: "#331c2b", bgPattern: "grid" },
  amethyst: { accent: "#a855f7", bg: "#0b0714", surface: "#140c24", text: "#faf5ff", muted: "#c084fc", border: "#2a1745", bgPattern: "mesh" },
  dracula: { accent: "#ff79c6", bg: "#282a36", surface: "#343746", text: "#f8f8f2", muted: "#bd93f9", border: "#44475a", bgPattern: "dots" },
  titanium: { accent: "#38bdf8", bg: "#0a0a0c", surface: "#121216", text: "#ffffff", muted: "#94a3b8", border: "#22222a", bgPattern: "dots" },
  monochrome: { accent: "#e2e8f0", bg: "#09090b", surface: "#18181b", text: "#ffffff", muted: "#a1a1aa", border: "#27272a", bgPattern: "clean" },
  light: { accent: "#2563eb", bg: "#ffffff", surface: "#f8fafc", text: "#0f172a", muted: "#475569", border: "#e2e8f0", bgPattern: "grid" },
  warm: { accent: "#d97706", bg: "#fef3c7", surface: "#fffbeb", text: "#451a03", muted: "#92400e", border: "#fde68a", bgPattern: "mesh" }
};

export default function EditorPage() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [activeTab, setActiveTab] = useState('tabTheme');
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Authentication State
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Input states for Tag adders
  const [aboutTagInput, setAboutTagInput] = useState('');
  const [skillLangInput, setSkillLangInput] = useState('');
  const [skillWebInput, setSkillWebInput] = useState('');
  const [skillToolsInput, setSkillToolsInput] = useState('');
  const [projectTechInputs, setProjectTechInputs] = useState<Record<number, string>>({});

  const [lastDarkTheme, setLastDarkTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthChange((currentUser) => {
      if (!isMounted) return;
      setAuthUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        getPortfolioData(currentUser.uid, currentUser.email || '').then((res) => {
          if (isMounted && res && res.data) {
            setData(res.data);
            applyTheme(res.data.theme);
            if (res.data.theme?.bg) {
              const isDark = res.data.theme.bg !== '#ffffff';
              setIsDarkMode(isDark);
              if (isDark) setLastDarkTheme(res.data.theme);
            }
          }
        });
      } else {
        getPortfolioData().then((res) => {
          if (isMounted && res && res.data) {
            setData(res.data);
            applyTheme(res.data.theme);
            if (res.data.theme?.bg) {
              const isDark = res.data.theme.bg !== '#ffffff';
              setIsDarkMode(isDark);
              if (isDark) setLastDarkTheme(res.data.theme);
            }
          }
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const applyTheme = (theme: ThemeConfig) => {
    if (!theme) return;
    const root = document.documentElement;
    if (theme.accent) root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--cursor-color', theme.cursorColor || theme.accent || '#8b5cf6');
    if (theme.bg) root.style.setProperty('--bg', theme.bg);
    if (theme.surface) root.style.setProperty('--surface', theme.surface);
    if (theme.text) root.style.setProperty('--text', theme.text);
    if (theme.muted) root.style.setProperty('--muted', theme.muted);
    if (theme.border) root.style.setProperty('--border', theme.border);
    root.setAttribute('data-cursor-style', theme.cursorStyle || 'ring');
    root.setAttribute('data-bg-pattern', theme.bgPattern || 'grid');
  };

  const handleUpdateThemeColor = async (key: keyof ThemeConfig, value: string) => {
    const themeObj = data.theme || defaultPortfolioData.theme;
    const updatedTheme = { ...themeObj, [key]: value };
    if (isDarkMode) {
      setLastDarkTheme(updatedTheme);
    }
    const updatedData = { ...data, theme: updatedTheme };
    setData(updatedData);
    applyTheme(updatedTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolioData', JSON.stringify(updatedData));
      window.dispatchEvent(new Event('storage'));
    }
    // Auto-save mode & theme changes to Firebase Database
    await savePortfolioData(updatedData, authUser?.uid);
  };

  const handleApplyPreset = async (presetKey: string) => {
    const selected = PRESET_THEMES[presetKey];
    if (selected) {
      const updated = {
        ...selected,
        cursorStyle: data.theme?.cursorStyle || 'ring'
      };
      if (presetKey !== 'light') {
        setLastDarkTheme(updated);
      }
      const updatedData = { ...data, theme: updated };
      setData(updatedData);
      applyTheme(updated);
      setIsDarkMode(presetKey !== 'light');
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolioData', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
      }
      showToast(`Applied ${presetKey} mode & saved to DB!`, 'info');
      // Auto-save mode & theme changes to Firebase Database
      await savePortfolioData(updatedData, authUser?.uid);
    }
  };

  const toggleDarkLightMode = async () => {
    const currentTheme = data.theme || defaultPortfolioData.theme;
    if (isDarkMode) {
      // Preserve current dark theme so it can be restored when toggling back
      setLastDarkTheme(currentTheme);
      // Switch to Light Mode while preserving accent color and cursor style
      const lightTheme: ThemeConfig = {
        accent: currentTheme.accent || "#2563eb",
        bg: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        muted: "#475569",
        border: "#e2e8f0",
        cursorStyle: currentTheme.cursorStyle || "ring"
      };
      const updatedData = { ...data, theme: lightTheme };
      setData(updatedData);
      applyTheme(lightTheme);
      setIsDarkMode(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolioData', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
      }
      showToast('Switched to Light Mode!', 'info');
      await savePortfolioData(updatedData, authUser?.uid);
    } else {
      // Restore previous dark theme (e.g. Cyber, Dracula, Emerald, Sunset, Amber, Neon) or matching dark theme
      const darkTheme: ThemeConfig = lastDarkTheme || {
        accent: currentTheme.accent || "#d1da28",
        bg: "#000000",
        surface: "#0a0a0d",
        text: "#ffffff",
        muted: currentTheme.accent || "#decc5d",
        border: "#1f1f26",
        cursorStyle: currentTheme.cursorStyle || "ring"
      };
      const updatedData = { ...data, theme: darkTheme };
      setData(updatedData);
      applyTheme(darkTheme);
      setIsDarkMode(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('portfolioData', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
      }
      showToast('Switched to Dark Mode!', 'info');
      await savePortfolioData(updatedData, authUser?.uid);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await loginWithGoogle();
      showToast(`Welcome back, ${res.user.displayName || res.user.email}!`, 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passInput.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      if (isSignUpMode) {
        const res = await registerWithEmail(emailInput, passInput);
        showToast(`Account created! Signed in as ${res.user.email}`, 'success');
      } else {
        const res = await loginWithEmail(emailInput, passInput);
        showToast(`Signed in as ${res.user.email}`, 'success');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    showToast('Signed out of Editor', 'info');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const res = await savePortfolioData(data, authUser?.uid);
    setSaving(false);
    if (res.success) {
      showToast(authUser ? '✓ Saved to your personal database!' : '✓ Portfolio saved!', 'success');
    } else {
      showToast(`Error: ${res.error}`, 'error');
    }
  };

  const handleResetDefaults = async () => {
    if (typeof window !== 'undefined' && window.confirm('Reset all details back to initial default values?')) {
      setData(defaultPortfolioData);
      applyTheme(defaultPortfolioData.theme);
      await savePortfolioData(defaultPortfolioData, authUser?.uid);
      showToast('Reset to defaults and saved.', 'info');
    }
  };

  // Upload Handlers
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    showToast('Compressing & uploading photo...', 'info');
    const res = await fastProcessFile(file);
    if (res.success && res.url) {
      const updatedData = {
        ...data,
        hero: { ...(data.hero || defaultPortfolioData.hero), profileImg: res.url }
      };
      setData(updatedData);
      const saveRes = await savePortfolioData(updatedData);
      if (saveRes.success) {
        showToast('✓ Profile photo updated & saved to database!', 'success');
      } else {
        showToast('Photo uploaded locally (Save to sync DB)', 'info');
      }
    } else {
      showToast(res.error || 'Failed to upload photo.', 'error');
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    showToast('Processing resume PDF...', 'info');
    const res = await fastProcessFile(file);
    if (res.success && res.url) {
      const updatedData = {
        ...data,
        hero: { ...(data.hero || defaultPortfolioData.hero), resumeLink: res.url }
      };
      setData(updatedData);
      const saveRes = await savePortfolioData(updatedData);
      if (saveRes.success) {
        showToast('✓ Resume PDF updated & saved to database!', 'success');
      } else {
        showToast('Resume uploaded locally (Save to sync DB)', 'info');
      }
    } else {
      showToast(res.error || 'Failed to upload resume.', 'error');
    }
  };

  const themeObj = data.theme || defaultPortfolioData.theme;
  const heroObj = data.hero || defaultPortfolioData.hero;
  const aboutObj = data.about || defaultPortfolioData.about;
  const statsObj = aboutObj.stats || defaultPortfolioData.about.stats;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center font-mono text-sm">
        <div className="w-10 h-10 border-4 border-portfolio-accent border-t-transparent rounded-full animate-spin mb-4" />
        <div>Loading Editor Platform...</div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-display flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-portfolio-accent/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#141419] border border-[#24242e] rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-portfolio-accent/15 border border-portfolio-accent/40 rounded-full font-mono text-xs text-portfolio-accent font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> PORTFOLIO EDITOR PLATFORM
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="font-mono text-xs text-slate-400">
              Sign in to manage your portfolio details, 5 custom cursor styles, theme presets, and real-time database content.
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* GOOGLE / GMAIL ONE-CLICK LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authSubmitting}
            className="w-full bg-[#1c1c24] border border-[#2e2e3a] hover:border-portfolio-accent text-white font-mono text-xs font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-md group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>{authSubmitting ? 'Signing in...' : 'Sign in with Gmail / Google'}</span>
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#24242e]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">OR EMAIL LOGIN</span>
            <div className="flex-1 h-px bg-[#24242e]" />
          </div>

          {/* EMAIL & PASSWORD FORM */}
          <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-portfolio-accent" /> Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-[#1c1c24] border border-[#2e2e3a] focus:border-portfolio-accent rounded-xl px-4 py-3 text-xs font-mono text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-portfolio-accent" /> Password
              </label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#1c1c24] border border-[#2e2e3a] focus:border-portfolio-accent rounded-xl px-4 py-3 text-xs font-mono text-white outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full bg-portfolio-accent text-black font-mono text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
            >
              {authSubmitting ? 'Processing...' : (isSignUpMode ? 'Create Account & Start Editing' : 'Sign In with Email')}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#24242e] text-center flex flex-col gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                setAuthError(null);
              }}
              className="text-slate-400 hover:text-portfolio-accent transition-colors"
            >
              {isSignUpMode ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
            </button>

            <a href="/" className="text-slate-500 hover:text-slate-300 text-[11px] transition-colors mt-2">
              ← Return to Main Portfolio Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-portfolio-text font-display flex flex-col md:flex-row transition-colors duration-300">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-portfolio-surface border-b md:border-b-0 md:border-r border-portfolio-border flex flex-col shrink-0 transition-colors duration-300">
        <div className="p-6 border-b border-portfolio-border flex items-center justify-between">
          <div className="font-mono font-bold text-portfolio-accent tracking-wider text-sm flex items-center gap-2 truncate">
            {heroObj.brandTitle || 'Bhanu-Dev'}
            <span className="text-[10px] bg-portfolio-accent/15 text-portfolio-accent px-2 py-0.5 rounded border border-portfolio-accent font-semibold shrink-0">
              EDITOR
            </span>
          </div>
        </div>

        {/* LOGGED IN USER CARD */}
        <div className="p-4 border-b border-portfolio-border bg-portfolio-bg/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {authUser.photoURL ? (
              <img src={authUser.photoURL} alt={authUser.displayName || 'User'} className="w-8 h-8 rounded-full border border-portfolio-accent shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-portfolio-accent text-black font-bold flex items-center justify-center text-xs shrink-0">
                {(authUser.displayName || authUser.email || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden font-mono text-xs">
              <div className="font-bold text-portfolio-text truncate">{authUser.displayName || 'Logged In User'}</div>
              <div className="text-[10px] text-portfolio-muted truncate">{authUser.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="text-portfolio-muted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-portfolio-text/5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-1 overflow-y-auto flex-1 font-mono text-xs text-portfolio-muted">
          <button
            type="button"
            onClick={() => setActiveTab('tabTheme')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabTheme' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Palette className="w-4 h-4" /> Theme &amp; Colors
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabHero')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabHero' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <User className="w-4 h-4" /> Hero &amp; Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabAbout')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabAbout' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <User className="w-4 h-4" /> About Me &amp; Stats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabExperience')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabExperience' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Briefcase className="w-4 h-4" /> Work Experience
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabProjects')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabProjects' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Laptop className="w-4 h-4" /> Featured Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabSkills')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabSkills' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Code className="w-4 h-4" /> Technical Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabEducation')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabEducation' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <GraduationCap className="w-4 h-4" /> Education
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabAchievements')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabAchievements' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Trophy className="w-4 h-4" /> Achievements &amp; Certs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabProfiles')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabProfiles' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Share2 className="w-4 h-4" /> Social Profiles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabUploads')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'tabUploads' ? 'bg-portfolio-accent/15 text-portfolio-accent border-l-4 border-portfolio-accent font-semibold' : 'hover:bg-portfolio-text/5 hover:text-portfolio-text'}`}
          >
            <Upload className="w-4 h-4" /> Upload Assets
          </button>
        </nav>

        <div className="p-4 border-t border-portfolio-border">
          <a href="/" target="_blank" rel="noreferrer" className="w-full bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> View Live Portfolio
          </a>
        </div>
      </aside>

      {/* MAIN EDITOR CONTENT */}
      <main className="flex-1 p-6 md:p-12 max-w-5xl overflow-y-auto">
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-portfolio-border">
          <div>
            <h1 className="text-2xl font-bold text-portfolio-text">Portfolio Editor</h1>
            <p className="font-mono text-xs text-portfolio-muted mt-1 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-portfolio-accent" /> Signed in as <span className="text-portfolio-text font-semibold">{authUser.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode Changer Toggle */}
            <button
              type="button"
              onClick={toggleDarkLightMode}
              className="bg-portfolio-surface border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all"
              title="Toggle Dark / Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="bg-portfolio-surface border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-portfolio-accent text-black font-mono text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All to Database'}
            </button>
          </div>
        </div>

        {/* TAB 1: THEME & COLORS */}
        {activeTab === 'tabTheme' && (
          <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8 mb-6 transition-colors duration-300">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
              <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                <Palette className="w-5 h-5 text-portfolio-accent" /> Portfolio Color &amp; Theme Customizer
              </h2>
              <div className="w-7 h-7 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: themeObj.accent }}></div>
            </div>

            {/* Designer Presets */}
            <div className="mb-8">
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Curated Designer Themes (14 Styles)</span>
                <span className="text-[11px] text-slate-500 font-normal">Click any preset to instantly apply theme</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {[
                  { key: 'obsidian', label: 'Obsidian Violet', color: '#8b5cf6' },
                  { key: 'tokyo', label: 'Tokyo Cyber', color: '#00f0ff' },
                  { key: 'sapphire', label: 'Sapphire Ocean', color: '#3b82f6' },
                  { key: 'nordic', label: 'Nordic Aurora', color: '#10b981' },
                  { key: 'cyberpunk', label: 'Cyber Yellow', color: '#facc15' },
                  { key: 'emerald', label: 'Emerald Forest', color: '#34d399' },
                  { key: 'solar', label: 'Solar Flare', color: '#f97316' },
                  { key: 'rose', label: 'Rose Quartz', color: '#f43f5e' },
                  { key: 'amethyst', label: 'Amethyst Velvet', color: '#a855f7' },
                  { key: 'dracula', label: 'Dracula Neon', color: '#ff79c6' },
                  { key: 'titanium', label: 'Titanium Slate', color: '#38bdf8' },
                  { key: 'monochrome', label: 'Minimal Platinum', color: '#e2e8f0' },
                  { key: 'light', label: 'Porcelain Light', color: '#2563eb' },
                  { key: 'warm', label: 'Warm Sunlight', color: '#d97706' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleApplyPreset(t.key)}
                    className="font-mono text-xs p-3 bg-[#1c1c24] border border-[#2e2e3a] hover:border-portfolio-accent text-slate-200 rounded-xl flex flex-col items-center gap-2 transition-all group"
                  >
                    <div className="w-5 h-5 rounded-full border border-white/20 shadow-md transition-transform group-hover:scale-110" style={{ backgroundColor: t.color }} />
                    <span className="text-[11px] font-semibold truncate max-w-full">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 1-Click Accent Swatches */}
            <div className="mb-8 p-4 bg-[#14141a] border border-[#24242e] rounded-xl">
              <label className="block font-mono text-xs text-portfolio-accent uppercase tracking-widest mb-2.5 flex items-center justify-between">
                <span>Quick Accent Swatch Palette</span>
                <span className="text-[11px] text-slate-400 font-normal">Change accent color with 1 tap</span>
              </label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {[
                  { name: 'Cyan Neon', hex: '#00f0ff' },
                  { name: 'Obsidian Purple', hex: '#8b5cf6' },
                  { name: 'Emerald Mint', hex: '#10b981' },
                  { name: 'Cyber Gold', hex: '#facc15' },
                  { name: 'Rose Red', hex: '#f43f5e' },
                  { name: 'Dracula Pink', hex: '#ff79c6' },
                  { name: 'Sapphire Blue', hex: '#3b82f6' },
                  { name: 'Solar Orange', hex: '#f97316' },
                  { name: 'Amethyst Violet', hex: '#a855f7' },
                  { name: 'Sky Blue', hex: '#38bdf8' },
                  { name: 'Platinum Silver', hex: '#e2e8f0' },
                  { name: 'Electric Lime', hex: '#d1da28' }
                ].map((s) => (
                  <button
                    key={s.hex}
                    type="button"
                    title={`Apply ${s.name} (${s.hex})`}
                    onClick={() => handleUpdateThemeColor('accent', s.hex)}
                    className="w-8 h-8 rounded-lg border border-white/20 transition-all hover:scale-110 hover:shadow-lg flex items-center justify-center relative group"
                    style={{ backgroundColor: s.hex }}
                  >
                    {themeObj.accent?.toLowerCase() === s.hex.toLowerCase() && (
                      <span className="w-2 h-2 rounded-full bg-black/80 border border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Structure Overlay Selector */}
            <div className="pt-6 mb-8 border-t border-dashed border-[#24242e]">
              <h3 className="font-mono text-xs uppercase text-portfolio-accent tracking-widest mb-4 flex items-center justify-between">
                <span>Background Overlay Pattern / Structure</span>
                <span className="text-[11px] text-slate-400 font-normal">Active Pattern: {(themeObj.bgPattern || 'grid').toUpperCase()}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                {[
                  { id: 'grid', label: 'Tech Grid', desc: 'Futuristic Grid Lines Overlay', icon: '🌐' },
                  { id: 'dots', label: 'Cyber Dots', desc: 'Matrix Dot Matrix Structure', icon: '░' },
                  { id: 'mesh', label: 'Ambient Mesh', desc: 'Soft Glowing Color Orbs', icon: '✨' },
                  { id: 'waves', label: 'Scanline Waves', desc: 'Architectural Scanlines', icon: '🌊' },
                  { id: 'clean', label: 'Pure Surface', desc: 'Clean Minimal Solid Background', icon: '🔳' }
                ].map((p) => {
                  const isActive = (themeObj.bgPattern || 'grid') === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleUpdateThemeColor('bgPattern' as any, p.id)}
                      className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${isActive
                        ? 'bg-portfolio-accent/15 border-portfolio-accent text-white shadow-lg shadow-portfolio-accent/10'
                        : 'bg-[#1c1c24] border-[#2e2e3a] text-slate-300 hover:border-portfolio-accent/60 hover:bg-[#22222d]'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{p.icon}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-portfolio-accent shadow-[0_0_8px_var(--accent)]" />
                        )}
                      </div>
                      <div className="font-mono text-xs font-bold text-white mb-1">{p.label}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="pt-6 border-t border-dashed border-[#24242e]">
              <h3 className="font-mono text-xs uppercase text-portfolio-accent tracking-widest mb-4">Custom Color Structure Pickers</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Accent Highlight</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeObj.accent || '#8b5cf6'}
                      onChange={(e) => handleUpdateThemeColor('accent', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={themeObj.accent || '#8b5cf6'}
                      onChange={(e) => handleUpdateThemeColor('accent', e.target.value)}
                      className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Page Background</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeObj.bg || '#09090e'}
                      onChange={(e) => handleUpdateThemeColor('bg', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={themeObj.bg || '#09090e'}
                      onChange={(e) => handleUpdateThemeColor('bg', e.target.value)}
                      className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Surface / Card Background</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeObj.surface || '#13121c'}
                      onChange={(e) => handleUpdateThemeColor('surface', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={themeObj.surface || '#13121c'}
                      onChange={(e) => handleUpdateThemeColor('surface', e.target.value)}
                      className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Primary Text Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeObj.text || '#f3f4f6'}
                      onChange={(e) => handleUpdateThemeColor('text', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={themeObj.text || '#f3f4f6'}
                      onChange={(e) => handleUpdateThemeColor('text', e.target.value)}
                      className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Muted / Subtitle Text</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeObj.muted || '#a78bfa'}
                      onChange={(e) => handleUpdateThemeColor('muted', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={themeObj.muted || '#a78bfa'}
                      onChange={(e) => handleUpdateThemeColor('muted', e.target.value)}
                      className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Borders &amp; Dividers</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeObj.border || '#242038'}
                      onChange={(e) => handleUpdateThemeColor('border', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                      type="text"
                      value={themeObj.border || '#242038'}
                      onChange={(e) => handleUpdateThemeColor('border', e.target.value)}
                      className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Cursor Selector Section */}
            <div className="pt-6 mt-6 border-t border-dashed border-[#24242e]">
              <h3 className="font-mono text-xs uppercase text-portfolio-accent tracking-widest mb-4 flex items-center justify-between">
                <span>Education &amp; Tech Custom Cursors (7 Styles)</span>
                <span className="text-[11px] text-slate-400 font-normal">Active Style: {(themeObj.cursorStyle || 'spotlight').toUpperCase()}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
                {[
                  { id: 'spotlight', label: 'Spotlight', desc: 'Ambient Glow', icon: '🔦' },
                  { id: 'academic', label: 'Grad Cap', desc: 'Studies & Degree', icon: '🎓' },
                  { id: 'book', label: 'Notebook', desc: 'Smart Knowledge', icon: '📖' },
                  { id: 'pencil', label: 'Tech Stylus', desc: 'Study & Drawing', icon: '✏️' },
                  { id: 'brackets', label: 'Dev < />', desc: 'Code Terminal', icon: '💻' },
                  { id: 'chip', label: 'AI Processor', desc: 'Silicon Microchip', icon: '🔲' },
                  { id: 'binary', label: 'Binary Node', desc: 'Quantum Matrix', icon: '⚡' }
                ].map((c) => {
                  const isActive = (themeObj.cursorStyle || 'spotlight') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleUpdateThemeColor('cursorStyle' as any, c.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${isActive
                        ? 'bg-portfolio-accent/15 border-portfolio-accent text-white shadow-lg shadow-portfolio-accent/10'
                        : 'bg-[#1c1c24] border-[#2e2e3a] text-slate-300 hover:border-portfolio-accent/60 hover:bg-[#22222d]'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{c.icon}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-portfolio-accent shadow-[0_0_8px_var(--accent)]" />
                        )}
                      </div>
                      <div className="font-mono text-xs font-bold text-white mb-0.5">{c.label}</div>
                      <div className="text-[10px] text-portfolio-muted leading-tight">{c.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Dedicated Cursor Color Panel */}
              <div className="pt-6 border-t border-dashed border-[#24242e]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h4 className="font-mono text-xs uppercase text-portfolio-accent tracking-widest">
                    Dedicated Cursor Color Panel
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleUpdateThemeColor('cursorColor' as any, themeObj.accent || '#8b5cf6')}
                    className="font-mono text-[11px] px-3 py-1.5 rounded-lg bg-[#1c1c24] border border-[#2e2e3a] hover:border-portfolio-accent text-slate-300 transition-all flex items-center gap-1.5"
                  >
                    <span>🔄 Sync Cursor with Theme Accent</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Custom Cursor Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeObj.cursorColor || themeObj.accent || '#8b5cf6'}
                        onChange={(e) => handleUpdateThemeColor('cursorColor' as any, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                      />
                      <input
                        type="text"
                        value={themeObj.cursorColor || themeObj.accent || '#8b5cf6'}
                        onChange={(e) => handleUpdateThemeColor('cursorColor' as any, e.target.value)}
                        className="bg-[#1c1c24] border border-[#2e2e3a] text-slate-200 font-mono text-xs px-3 py-2 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-mono text-xs text-slate-400 uppercase mb-2">Cursor Color Quick Swatches</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {[
                        { name: 'Neon Cyan', hex: '#00f0ff' },
                        { name: 'Obsidian Purple', hex: '#8b5cf6' },
                        { name: 'Emerald Mint', hex: '#10b981' },
                        { name: 'Cyber Gold', hex: '#facc15' },
                        { name: 'Rose Red', hex: '#f43f5e' },
                        { name: 'Dracula Pink', hex: '#ff79c6' },
                        { name: 'Sapphire Blue', hex: '#3b82f6' },
                        { name: 'Solar Orange', hex: '#f97316' },
                        { name: 'Amethyst Violet', hex: '#a855f7' },
                        { name: 'Sky Blue', hex: '#38bdf8' },
                        { name: 'Pure White', hex: '#ffffff' },
                        { name: 'Hot Pink', hex: '#ff0055' },
                        { name: 'Electric Lime', hex: '#d1da28' }
                      ].map((cs) => (
                        <button
                          key={cs.hex}
                          type="button"
                          title={`Set Cursor Color: ${cs.name} (${cs.hex})`}
                          onClick={() => handleUpdateThemeColor('cursorColor' as any, cs.hex)}
                          className="w-7 h-7 rounded-lg border border-white/20 transition-all hover:scale-110 flex items-center justify-center relative"
                          style={{ backgroundColor: cs.hex }}
                        >
                          {(themeObj.cursorColor || themeObj.accent)?.toLowerCase() === cs.hex.toLowerCase() && (
                            <span className="w-2 h-2 rounded-full bg-black/80 border border-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HERO */}
        {activeTab === 'tabHero' && (
          <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8 mb-6">
            <h2 className="text-lg font-bold text-portfolio-text mb-6 pb-4 border-b border-portfolio-border flex items-center gap-2">
              <User className="w-5 h-5 text-portfolio-accent" /> Hero Section Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Brand / Sidebar Title</label>
                <input
                  type="text"
                  value={heroObj.brandTitle || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, brandTitle: e.target.value } })}
                  placeholder="e.g. Bhanu-Dev"
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Background Monogram Code</label>
                <input
                  type="text"
                  value={heroObj.bgNumber || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, bgNumber: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Degree / Specialization Badge</label>
                <input
                  type="text"
                  value={heroObj.typeLine || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, typeLine: e.target.value } })}
                  placeholder="e.g. B.TECH CSE (AI)"
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Location Tag</label>
                <input
                  type="text"
                  value={heroObj.location || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, location: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Name Line 1</label>
                <input
                  type="text"
                  value={heroObj.nameLine1 || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, nameLine1: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Name Line 2 (Accent Highlighted)</label>
                <input
                  type="text"
                  value={heroObj.nameLine2 || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, nameLine2: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Name Line 3</label>
                <input
                  type="text"
                  value={heroObj.nameLine3 || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, nameLine3: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-display text-sm px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Hero Tagline / Bio Summary</label>
              <textarea
                value={heroObj.tagline || ''}
                onChange={(e) => setData({ ...data, hero: { ...heroObj, tagline: e.target.value } })}
                rows={3}
                className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Email Address</label>
                <input
                  type="text"
                  value={heroObj.email || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, email: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Phone Number</label>
                <input
                  type="text"
                  value={heroObj.phone || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, phone: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">LinkedIn URL</label>
                <input
                  type="text"
                  value={heroObj.linkedin || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, linkedin: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">GitHub URL</label>
                <input
                  type="text"
                  value={heroObj.github || ''}
                  onChange={(e) => setData({ ...data, hero: { ...heroObj, github: e.target.value } })}
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT ME */}
        {activeTab === 'tabAbout' && (
          <div className="space-y-6">
            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-6 pb-4 border-b border-portfolio-border flex items-center gap-2">
                <User className="w-5 h-5 text-portfolio-accent" /> About Me Bio Paragraphs
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Paragraph 1 (HTML allowed)</label>
                  <textarea
                    value={aboutObj.p1 || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, p1: e.target.value } })}
                    rows={3}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent resize-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Paragraph 2 (HTML allowed)</label>
                  <textarea
                    value={aboutObj.p2 || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, p2: e.target.value } })}
                    rows={3}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent resize-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Paragraph 3 (Hobbies &amp; Interests)</label>
                  <textarea
                    value={aboutObj.p3 || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, p3: e.target.value } })}
                    rows={2}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent resize-none"
                  />
                </div>
              </div>

              {/* Tag Adder */}
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Skill / Trait Badges</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {aboutObj.tags?.map((t, tidx) => (
                    <span key={tidx} className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-1 rounded-md flex items-center gap-2">
                      {t}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (aboutObj.tags || []).filter((_, i) => i !== tidx);
                          setData({ ...data, about: { ...aboutObj, tags: updated } });
                        }}
                        className="text-portfolio-muted hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aboutTagInput}
                    onChange={(e) => setAboutTagInput(e.target.value)}
                    placeholder="Add trait (e.g. Quick Learner)"
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-2 rounded-lg outline-none focus:border-portfolio-accent flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (aboutTagInput.trim()) {
                        setData({ ...data, about: { ...aboutObj, tags: [...(aboutObj.tags || []), aboutTagInput.trim()] } });
                        setAboutTagInput('');
                      }
                    }}
                    className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tag
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-6 pb-4 border-b border-portfolio-border">Sidebar Scores &amp; Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Location</label>
                  <input
                    type="text"
                    value={statsObj.location || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, stats: { ...statsObj, location: e.target.value } } })}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Diploma Score</label>
                  <input
                    type="text"
                    value={statsObj.diplomaScore || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, stats: { ...statsObj, diplomaScore: e.target.value } } })}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">SSC Score</label>
                  <input
                    type="text"
                    value={statsObj.sscScore || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, stats: { ...statsObj, sscScore: e.target.value } } })}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Languages Spoken</label>
                  <input
                    type="text"
                    value={statsObj.languages || ''}
                    onChange={(e) => setData({ ...data, about: { ...aboutObj, stats: { ...statsObj, languages: e.target.value } } })}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'tabExperience' && (
          <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
              <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-portfolio-accent" /> Work Experience &amp; Internships
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newExp = {
                    id: `exp-${Date.now()}`,
                    period: "INTERNSHIP",
                    company: "New Company",
                    location: "Location",
                    role: "Role Title",
                    desc: "Key achievements and responsibilities..."
                  };
                  setData({ ...data, experiences: [...(data.experiences || []), newExp] });
                }}
                className="bg-portfolio-accent text-black font-mono text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {(data.experiences || []).map((exp, idx) => (
                <div key={exp.id || idx} className="bg-portfolio-bg border border-portfolio-border p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-portfolio-border">
                    <span className="font-mono text-xs text-portfolio-accent font-semibold">Experience #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.experiences || []).filter((_, i) => i !== idx);
                        setData({ ...data, experiences: updated });
                      }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Period (e.g. INTERNSHIP)</label>
                      <input
                        type="text"
                        value={exp.period || ''}
                        onChange={(e) => {
                          const updated = (data.experiences || []).map((item, i) => i === idx ? { ...item, period: e.target.value } : item);
                          setData({ ...data, experiences: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Company Name</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => {
                          const updated = (data.experiences || []).map((item, i) => i === idx ? { ...item, company: e.target.value } : item);
                          setData({ ...data, experiences: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Location</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => {
                          const updated = (data.experiences || []).map((item, i) => i === idx ? { ...item, location: e.target.value } : item);
                          setData({ ...data, experiences: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Role Title</label>
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => {
                        const updated = (data.experiences || []).map((item, i) => i === idx ? { ...item, role: e.target.value } : item);
                        setData({ ...data, experiences: updated });
                      }}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Description</label>
                    <textarea
                      value={exp.desc || ''}
                      onChange={(e) => {
                        const updated = (data.experiences || []).map((item, i) => i === idx ? { ...item, desc: e.target.value } : item);
                        setData({ ...data, experiences: updated });
                      }}
                      rows={2}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROJECTS */}
        {activeTab === 'tabProjects' && (
          <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
              <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                <Laptop className="w-5 h-5 text-portfolio-accent" /> Featured Projects
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newProj = {
                    id: `proj-${Date.now()}`,
                    num: String((data.projects?.length || 0) + 1).padStart(2, '0'),
                    title: "Awesome Project",
                    desc: "Describe your project features...",
                    techs: ["React", "TypeScript"],
                    liveUrl: "https://",
                    codeUrl: "https://github.com/"
                  };
                  setData({ ...data, projects: [...(data.projects || []), newProj] });
                }}
                className="bg-portfolio-accent text-black font-mono text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="space-y-6">
              {(data.projects || []).map((proj, idx) => (
                <div key={proj.id || idx} className="bg-portfolio-bg border border-portfolio-border p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-portfolio-border">
                    <span className="font-mono text-xs text-portfolio-accent font-semibold">Project #{proj.num || (idx + 1)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.projects || []).filter((_, i) => i !== idx);
                        setData({ ...data, projects: updated });
                      }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Project Title</label>
                      <input
                        type="text"
                        value={proj.title || ''}
                        onChange={(e) => {
                          const updated = (data.projects || []).map((item, i) => i === idx ? { ...item, title: e.target.value } : item);
                          setData({ ...data, projects: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Live Demo URL</label>
                      <input
                        type="text"
                        value={proj.liveUrl || ''}
                        onChange={(e) => {
                          const updated = (data.projects || []).map((item, i) => i === idx ? { ...item, liveUrl: e.target.value } : item);
                          setData({ ...data, projects: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">GitHub Code URL</label>
                    <input
                      type="text"
                      value={proj.codeUrl || ''}
                      onChange={(e) => {
                        const updated = (data.projects || []).map((item, i) => i === idx ? { ...item, codeUrl: e.target.value } : item);
                        setData({ ...data, projects: updated });
                      }}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Description</label>
                    <textarea
                      value={proj.desc || ''}
                      onChange={(e) => {
                        const updated = (data.projects || []).map((item, i) => i === idx ? { ...item, desc: e.target.value } : item);
                        setData({ ...data, projects: updated });
                      }}
                      rows={2}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent resize-none"
                    />
                  </div>

                  {/* Tech Badges */}
                  <div>
                    <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Tech Stack Badges</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(proj.techs || []).map((t, tidx) => (
                        <span key={tidx} className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-2.5 py-1 rounded flex items-center gap-1.5">
                          {t}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (data.projects || []).map((item, i) => i === idx ? { ...item, techs: item.techs.filter((_, ti) => ti !== tidx) } : item);
                              setData({ ...data, projects: updated });
                            }}
                            className="text-portfolio-muted hover:text-red-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectTechInputs[idx] || ''}
                        onChange={(e) => setProjectTechInputs({ ...projectTechInputs, [idx]: e.target.value })}
                        placeholder="Add tech badge (e.g. Next.js)"
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-1.5 rounded-lg outline-none focus:border-portfolio-accent flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = (projectTechInputs[idx] || '').trim();
                          if (val) {
                            const updated = (data.projects || []).map((item, i) => i === idx ? { ...item, techs: [...(item.techs || []), val] } : item);
                            setData({ ...data, projects: updated });
                            setProjectTechInputs({ ...projectTechInputs, [idx]: '' });
                          }
                        }}
                        className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Tech
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SKILLS */}
        {activeTab === 'tabSkills' && (
          <div className="space-y-6">
            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-4 pb-4 border-b border-portfolio-border flex items-center gap-2">
                <Code className="w-5 h-5 text-portfolio-accent" /> Programming Languages
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(data.skills?.languages || []).map((s, idx) => (
                  <span key={idx} className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                    {s}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.skills?.languages || []).filter((_, i) => i !== idx);
                        setData({ ...data, skills: { ...data.skills, languages: updated } });
                      }}
                      className="text-portfolio-muted hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillLangInput}
                  onChange={(e) => setSkillLangInput(e.target.value)}
                  placeholder="e.g. Python, C++, TypeScript"
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg outline-none focus:border-portfolio-accent flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillLangInput.trim()) {
                      setData({ ...data, skills: { ...data.skills, languages: [...(data.skills?.languages || []), skillLangInput.trim()] } });
                      setSkillLangInput('');
                    }
                  }}
                  className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Language
                </button>
              </div>
            </div>

            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-4 pb-4 border-b border-portfolio-border flex items-center gap-2">
                <Code className="w-5 h-5 text-portfolio-accent" /> Web Technologies
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(data.skills?.web || []).map((s, idx) => (
                  <span key={idx} className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                    {s}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.skills?.web || []).filter((_, i) => i !== idx);
                        setData({ ...data, skills: { ...data.skills, web: updated } });
                      }}
                      className="text-portfolio-muted hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillWebInput}
                  onChange={(e) => setSkillWebInput(e.target.value)}
                  placeholder="e.g. React.js, Next.js, Node.js"
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg outline-none focus:border-portfolio-accent flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillWebInput.trim()) {
                      setData({ ...data, skills: { ...data.skills, web: [...(data.skills?.web || []), skillWebInput.trim()] } });
                      setSkillWebInput('');
                    }
                  }}
                  className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>
            </div>

            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-4 pb-4 border-b border-portfolio-border flex items-center gap-2">
                <Code className="w-5 h-5 text-portfolio-accent" /> Tools &amp; Databases
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {(data.skills?.tools || []).map((s, idx) => (
                  <span key={idx} className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                    {s}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.skills?.tools || []).filter((_, i) => i !== idx);
                        setData({ ...data, skills: { ...data.skills, tools: updated } });
                      }}
                      className="text-portfolio-muted hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillToolsInput}
                  onChange={(e) => setSkillToolsInput(e.target.value)}
                  placeholder="e.g. MongoDB, Git, Docker"
                  className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg outline-none focus:border-portfolio-accent flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillToolsInput.trim()) {
                      setData({ ...data, skills: { ...data.skills, tools: [...(data.skills?.tools || []), skillToolsInput.trim()] } });
                      setSkillToolsInput('');
                    }
                  }}
                  className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tool
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: EDUCATION */}
        {activeTab === 'tabEducation' && (
          <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
              <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-portfolio-accent" /> Education History
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newEdu = {
                    id: `edu-${Date.now()}`,
                    year: "2026",
                    school: "University Name",
                    degree: "Degree / Course Name",
                    score: "90%"
                  };
                  setData({ ...data, education: [...(data.education || []), newEdu] });
                }}
                className="bg-portfolio-accent text-black font-mono text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>

            <div className="space-y-6">
              {(data.education || []).map((edu, idx) => (
                <div key={edu.id || idx} className="bg-portfolio-bg border border-portfolio-border p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-portfolio-border">
                    <span className="font-mono text-xs text-portfolio-accent font-semibold">Education #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.education || []).filter((_, i) => i !== idx);
                        setData({ ...data, education: updated });
                      }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Year / Period</label>
                      <input
                        type="text"
                        value={edu.year || ''}
                        onChange={(e) => {
                          const updated = (data.education || []).map((item, i) => i === idx ? { ...item, year: e.target.value } : item);
                          setData({ ...data, education: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">School / College</label>
                      <input
                        type="text"
                        value={edu.school || ''}
                        onChange={(e) => {
                          const updated = (data.education || []).map((item, i) => i === idx ? { ...item, school: e.target.value } : item);
                          setData({ ...data, education: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Score / Percentage</label>
                      <input
                        type="text"
                        value={edu.score || ''}
                        onChange={(e) => {
                          const updated = (data.education || []).map((item, i) => i === idx ? { ...item, score: e.target.value } : item);
                          setData({ ...data, education: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Degree Name</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const updated = (data.education || []).map((item, i) => i === idx ? { ...item, degree: e.target.value } : item);
                        setData({ ...data, education: updated });
                      }}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ACHIEVEMENTS & CERTS */}
        {activeTab === 'tabAchievements' && (
          <div className="space-y-6">
            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
                <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-portfolio-accent" /> Key Achievements
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setData({ ...data, achievements: [...(data.achievements || []), 'New achievement description...'] });
                  }}
                  className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Achievement
                </button>
              </div>

              <div className="space-y-3">
                {(data.achievements || []).map((ach, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={ach}
                      onChange={(e) => {
                        const updated = (data.achievements || []).map((item, i) => i === idx ? e.target.value : item);
                        setData({ ...data, achievements: updated });
                      }}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.achievements || []).filter((_, i) => i !== idx);
                        setData({ ...data, achievements: updated });
                      }}
                      className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
                <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-portfolio-accent" /> Certifications &amp; Training
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setData({ ...data, certifications: [...(data.certifications || []), 'New certification title...'] });
                  }}
                  className="bg-portfolio-bg border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Certification
                </button>
              </div>

              <div className="space-y-3">
                {(data.certifications || []).map((cert, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => {
                        const updated = (data.certifications || []).map((item, i) => i === idx ? e.target.value : item);
                        setData({ ...data, certifications: updated });
                      }}
                      className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.certifications || []).filter((_, i) => i !== idx);
                        setData({ ...data, certifications: updated });
                      }}
                      className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: PROFILES */}
        {activeTab === 'tabProfiles' && (
          <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-portfolio-border">
              <h2 className="text-lg font-bold text-portfolio-text flex items-center gap-2">
                <Share2 className="w-5 h-5 text-portfolio-accent" /> Social &amp; Coding Profiles
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newProf = {
                    name: "Platform",
                    handle: "username",
                    url: "https://",
                    icon: "fas fa-globe"
                  };
                  setData({ ...data, profiles: [...(data.profiles || []), newProf] });
                }}
                className="bg-portfolio-accent text-black font-mono text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="w-4 h-4" /> Add Profile
              </button>
            </div>

            <div className="space-y-6">
              {(data.profiles || []).map((prof, idx) => (
                <div key={idx} className="bg-portfolio-bg border border-portfolio-border p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-portfolio-border">
                    <span className="font-mono text-xs text-portfolio-accent font-semibold">Profile #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (data.profiles || []).filter((_, i) => i !== idx);
                        setData({ ...data, profiles: updated });
                      }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={prof.name || ''}
                        onChange={(e) => {
                          const updated = (data.profiles || []).map((item, i) => i === idx ? { ...item, name: e.target.value } : item);
                          setData({ ...data, profiles: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Handle / Username</label>
                      <input
                        type="text"
                        value={prof.handle || ''}
                        onChange={(e) => {
                          const updated = (data.profiles || []).map((item, i) => i === idx ? { ...item, handle: e.target.value } : item);
                          setData({ ...data, profiles: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">Profile URL</label>
                      <input
                        type="text"
                        value={prof.url || ''}
                        onChange={(e) => {
                          const updated = (data.profiles || []).map((item, i) => i === idx ? { ...item, url: e.target.value } : item);
                          setData({ ...data, profiles: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs text-portfolio-muted uppercase mb-1">FontAwesome Icon Class</label>
                      <input
                        type="text"
                        value={prof.icon || ''}
                        onChange={(e) => {
                          const updated = (data.profiles || []).map((item, i) => i === idx ? { ...item, icon: e.target.value } : item);
                          setData({ ...data, profiles: updated });
                        }}
                        className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-3 py-2.5 rounded-lg w-full outline-none focus:border-portfolio-accent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: UPLOAD ASSETS */}
        {activeTab === 'tabUploads' && (
          <div className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-portfolio-accent" /> Upload Profile Photo
              </h2>
              <p className="font-mono text-xs text-portfolio-muted mb-6">
                Choose an image file from your device. It compresses automatically in under 0.1s and updates your profile image live!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Select Photo File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent cursor-pointer"
                  />
                </div>
                <div className="text-center p-6 bg-portfolio-bg rounded-xl border border-dashed border-portfolio-border">
                  <span className="block font-mono text-[11px] text-portfolio-muted uppercase mb-3">Live Profile Photo Preview</span>
                  {heroObj.profileImg ? (
                    <img
                      src={heroObj.profileImg}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-portfolio-accent shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-portfolio-surface mx-auto flex items-center justify-center text-portfolio-muted font-mono text-xs">
                      No Photo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resume PDF Upload */}
            <div className="bg-portfolio-surface border border-portfolio-border rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-portfolio-text mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-portfolio-accent" /> Upload Resume PDF
              </h2>
              <p className="font-mono text-xs text-portfolio-muted mb-6">
                Select your PDF resume document. It updates your downloadable resume links across all portfolio buttons.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <label className="block font-mono text-xs text-portfolio-muted uppercase mb-2">Select Resume PDF</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleUploadResume}
                    className="bg-portfolio-bg border border-portfolio-border text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg w-full outline-none focus:border-portfolio-accent cursor-pointer"
                  />
                </div>
                <div className="text-center p-6 bg-portfolio-bg rounded-xl border border-dashed border-portfolio-border">
                  <span className="block font-mono text-[11px] text-portfolio-muted uppercase mb-3">Active Downloadable Resume</span>
                  {heroObj.resumeLink ? (
                    <a
                      href={heroObj.resumeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-portfolio-surface border border-portfolio-border hover:border-portfolio-accent text-portfolio-text font-mono text-xs px-4 py-3 rounded-lg"
                    >
                      <span className="text-red-400 font-bold">PDF</span> Active Document Link
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-portfolio-muted">No Document Set</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TOAST ALERT */}
      {toast && (
        <div className={`fixed bottom-6 right-6 font-mono text-xs font-semibold px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-portfolio-accent text-black'
          }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
