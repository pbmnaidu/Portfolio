'use client';

import React, { useEffect, useState } from 'react';
import { subscribePortfolioData, defaultPortfolioData, PortfolioData } from '@/lib/firebase';

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData);
  const [navOpen, setNavOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  const applyTheme = (theme?: any) => {
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

  useEffect(() => {
    const syncFromCache = () => {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('portfolioData');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed) {
              setData(parsed);
              applyTheme(parsed.theme);
            }
          } catch (e) { }
        }
      }
    };

    syncFromCache();
    window.addEventListener('storage', syncFromCache);

    // Subscribe to Firebase Firestore real-time updates
    const unsubscribe = subscribePortfolioData((latestData) => {
      if (latestData) {
        setData(latestData);
        applyTheme(latestData.theme);
      }
    });

    return () => {
      window.removeEventListener('storage', syncFromCache);
      unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMsg.trim()) {
      showToast('Please fill all fields.');
      return;
    }
    showToast('Message sent successfully!');
    setContactName('');
    setContactEmail('');
    setContactMsg('');
  };

  const { hero, about, experiences, projects, skills, education, achievements, certifications, profiles } = data;

  return (
    <div className="min-h-screen bg-transparent text-portfolio-text font-display transition-colors duration-300">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-portfolio-bg/90 backdrop-blur-md border-b border-portfolio-border transition-colors duration-300">
        <div className="font-mono text-xs text-portfolio-accent tracking-widest uppercase font-semibold">
          {hero.brandTitle || 'Bhanu-Dev'}
        </div>

        <ul className={`md:flex gap-8 list-none font-mono text-xs text-portfolio-muted transition-all duration-300 ${navOpen ? 'flex flex-col absolute top-full left-0 right-0 bg-portfolio-bg p-6 border-b border-portfolio-border gap-4' : 'hidden md:flex'
          }`}>
          <li><a href="#about" onClick={() => setNavOpen(false)} className="hover:text-portfolio-accent hover:bg-portfolio-surface px-3 py-1.5 rounded-lg transition-all">About</a></li>
          <li><a href="#experience" onClick={() => setNavOpen(false)} className="hover:text-portfolio-accent hover:bg-portfolio-surface px-3 py-1.5 rounded-lg transition-all">Experience</a></li>
          <li><a href="#projects" onClick={() => setNavOpen(false)} className="hover:text-portfolio-accent hover:bg-portfolio-surface px-3 py-1.5 rounded-lg transition-all">Projects</a></li>
          <li><a href="#skills" onClick={() => setNavOpen(false)} className="hover:text-portfolio-accent hover:bg-portfolio-surface px-3 py-1.5 rounded-lg transition-all">Skills</a></li>
          <li><a href="#resume" onClick={() => setNavOpen(false)} className="hover:text-portfolio-accent hover:bg-portfolio-surface px-3 py-1.5 rounded-lg transition-all">Resume</a></li>
          <li><a href="#contact" onClick={() => setNavOpen(false)} className="hover:text-portfolio-accent hover:bg-portfolio-surface px-3 py-1.5 rounded-lg transition-all">Contact</a></li>
        </ul>

        <button
          onClick={() => setNavOpen(!navOpen)}
          className="md:hidden flex flex-col gap-1.5 color-portfolio-accent cursor-pointer border-none bg-transparent"
          aria-label="Toggle Navigation Menu"
        >
          <span className="w-6 h-0.5 bg-portfolio-text block"></span>
          <span className="w-6 h-0.5 bg-portfolio-text block"></span>
          <span className="w-6 h-0.5 bg-portfolio-text block"></span>
        </button>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="min-h-screen flex items-center px-6 md:px-12 py-32 relative border-b border-portfolio-border overflow-hidden">
        <div className="max-w-6xl w-full mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="max-w-2xl flex-1">
            <div className="font-mono text-xs text-portfolio-accent tracking-widest uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-portfolio-accent"></span>
              {hero.location}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-portfolio-text mb-6">
              {hero.nameLine1}<br />
              <em className="not-italic text-portfolio-accent">{hero.nameLine2}</em><br />
              {hero.nameLine3}
            </h1>

            <p className="font-mono text-xs md:text-sm text-portfolio-muted leading-relaxed max-w-xl mb-10">
              {hero.tagline}
            </p>

            <div className="flex flex-wrap gap-5 font-mono text-xs text-portfolio-muted mb-10">
              {hero.email && (
                <a href={`mailto:${hero.email}`} className="hover:text-portfolio-accent flex items-center gap-2 transition-colors">
                  <i className="fas fa-envelope"></i> {hero.email}
                </a>
              )}
              {hero.phone && (
                <a href={`tel:${hero.phone}`} className="hover:text-portfolio-accent flex items-center gap-2 transition-colors">
                  <i className="fas fa-phone"></i> {hero.phone}
                </a>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin} target="_blank" rel="noreferrer" className="hover:text-portfolio-accent flex items-center gap-2 transition-colors">
                  <i className="fab fa-linkedin"></i> LinkedIn
                </a>
              )}
              {hero.github && (
                <a href={hero.github} target="_blank" rel="noreferrer" className="hover:text-portfolio-accent flex items-center gap-2 transition-colors">
                  <i className="fab fa-github"></i> GitHub
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="#projects" className="font-mono text-xs tracking-wider uppercase px-6 py-3 bg-portfolio-accent text-black font-semibold rounded-lg hover:bg-transparent hover:text-portfolio-accent border border-portfolio-accent transition-all duration-200 flex items-center gap-2">
                <i className="fas fa-code"></i> View Projects
              </a>
              <a href="#contact" className="font-mono text-xs tracking-wider uppercase px-6 py-3 bg-transparent text-portfolio-muted border border-portfolio-border rounded-lg hover:border-portfolio-text hover:text-portfolio-text transition-all duration-200 flex items-center gap-2">
                <i className="fas fa-paper-plane"></i> Contact Me
              </a>
              {hero.resumeLink && (
                <a href={hero.resumeLink} target="_blank" rel="noreferrer" className="font-mono text-xs tracking-wider uppercase px-6 py-3 bg-transparent text-portfolio-accent border border-portfolio-accent rounded-lg hover:bg-portfolio-accent hover:text-black transition-all duration-200 flex items-center gap-2">
                  <i className="fas fa-file-download"></i> Resume
                </a>
              )}
            </div>
          </div>

          {/* Profile Photo & Background Monogram Code Display */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center relative w-full lg:w-auto">
            {/* Single Clean Border Profile Photo */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-full z-10 mb-4 overflow-hidden border border-portfolio-accent/60 shadow-xl">
              <img
                src={
                  hero.profileImg
                    ? (hero.profileImg.startsWith('http') || hero.profileImg.startsWith('data:') || hero.profileImg.startsWith('/')
                      ? hero.profileImg
                      : `/${hero.profileImg}`)
                    : '/profile.jpeg'
                }
                alt={hero.nameLine2 || 'Profile Photo'}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/profile.jpeg';
                }}
              />
            </div>

            {/* B.TECH CSE (AI) Degree / Specialization Badge - Borderless Sleek Pill */}
            <div className="z-10 mt-1 mb-2 text-center">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full bg-portfolio-accent/15 text-portfolio-accent shadow-sm">
                <span className="w-2 h-2 rounded-full bg-portfolio-accent animate-pulse" />
                <span>{hero.typeLine || 'B.TECH CSE (AI)'}</span>
              </div>
            </div>

            {/* Dynamic Background Monogram Code (Adaptive stroke & subtle glow based on active theme colors) */}
            {hero.bgNumber && (
              <div
                className="font-mono text-[clamp(50px,9vw,110px)] font-black leading-none select-none tracking-tighter uppercase z-0 text-center transition-all duration-300 mt-2"
                style={{
                  WebkitTextStroke: '1.5px var(--accent)',
                  color: 'transparent',
                  opacity: 0.45,
                  filter: 'drop-shadow(0 0 8px var(--accent))'
                }}
              >
                {hero.bgNumber}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">01</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              About <span className="text-portfolio-accent">Me</span>
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-start">
            <div>
              {about.p1 && <p className="text-base leading-relaxed text-portfolio-text/90 mb-5" dangerouslySetInnerHTML={{ __html: about.p1 }} />}
              {about.p2 && <p className="text-base leading-relaxed text-portfolio-text/90 mb-5" dangerouslySetInnerHTML={{ __html: about.p2 }} />}
              {about.p3 && <p className="text-base leading-relaxed text-portfolio-text/80 mb-6">{about.p3}</p>}

              <div className="flex flex-wrap gap-2.5 mt-6">
                {about.tags?.map((tag, idx) => (
                  <span key={idx} className="font-mono text-xs tracking-wider px-3 py-1.5 border border-portfolio-border text-portfolio-muted rounded-md hover:border-portfolio-accent hover:text-portfolio-accent transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="flex flex-col border-t border-portfolio-border pt-4">
              <div className="flex justify-between items-center py-3.5 border-b border-portfolio-border font-mono text-xs">
                <span className="text-portfolio-muted">Location</span>
                <span className="text-portfolio-text font-medium">{about.stats?.location}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-portfolio-border font-mono text-xs">
                <span className="text-portfolio-muted">Degree</span>
                <span className="text-portfolio-text font-medium">{about.stats?.degree}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-portfolio-border font-mono text-xs">
                <span className="text-portfolio-muted">Institute</span>
                <span className="text-portfolio-text font-medium">{about.stats?.institute}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-portfolio-border font-mono text-xs">
                <span className="text-portfolio-muted">Diploma Score</span>
                <span className="text-portfolio-accent font-semibold">{about.stats?.diplomaScore}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-portfolio-border font-mono text-xs">
                <span className="text-portfolio-muted">SSC Score</span>
                <span className="text-portfolio-accent font-semibold">{about.stats?.sscScore}</span>
              </div>
              <div className="flex justify-between items-center py-3.5 border-b border-portfolio-border font-mono text-xs">
                <span className="text-portfolio-muted">Languages</span>
                <span className="text-portfolio-text font-medium">{about.stats?.languages}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="experience" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">02</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              Work <span className="text-portfolio-accent">Experience</span>
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="flex flex-col gap-10">
            {experiences?.map((exp) => (
              <div key={exp.id} className="grid md:grid-cols-[180px_1fr] gap-8 py-6 border-b border-portfolio-border/60 last:border-none">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs text-portfolio-accent tracking-wider font-semibold">{exp.period}</span>
                  <span className="text-sm font-semibold text-portfolio-text">{exp.company}</span>
                  <span className="font-mono text-xs text-portfolio-muted">{exp.location}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-portfolio-text mb-3">{exp.role}</h3>
                  <p className="text-sm text-portfolio-muted leading-relaxed">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">03</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              Featured <span className="text-portfolio-accent">Projects</span>
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="flex flex-col gap-6">
            {projects?.map((proj) => (
              <div
                key={proj.id}
                className="bg-portfolio-surface border border-portfolio-border p-8 rounded-xl grid md:grid-cols-[auto_1fr_auto] gap-8 items-start hover:border-portfolio-accent/60 transition-all duration-300 group"
              >
                <span className="font-mono text-xs text-portfolio-muted pt-1 font-medium">{proj.num}</span>
                <div>
                  <h3 className="text-xl font-bold text-portfolio-text mb-2 group-hover:text-portfolio-accent transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-portfolio-muted leading-relaxed mb-4">
                    {proj.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proj.techs?.map((t, tidx) => (
                      <span key={tidx} className="font-mono text-[11px] tracking-wider px-2.5 py-1 bg-portfolio-bg border border-portfolio-border text-portfolio-muted rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 justify-end items-end">
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="font-mono text-xs px-3.5 py-2 border border-portfolio-border text-portfolio-muted hover:border-portfolio-accent hover:text-portfolio-accent rounded transition-all flex items-center gap-1.5 whitespace-nowrap">
                      <i className="fas fa-external-link-alt"></i> Live
                    </a>
                  )}
                  {proj.codeUrl && (
                    <a href={proj.codeUrl} target="_blank" rel="noreferrer" className="font-mono text-xs px-3.5 py-2 border border-portfolio-border text-portfolio-muted hover:border-portfolio-accent hover:text-portfolio-accent rounded transition-all flex items-center gap-1.5 whitespace-nowrap">
                      <i className="fab fa-github"></i> Code
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section id="skills" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">04</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              Technical <span className="text-portfolio-accent">Skills</span>
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-mono text-xs text-portfolio-accent uppercase tracking-widest mb-5 pb-2 border-b border-portfolio-border">Languages</h3>
              <div className="flex flex-col gap-2">
                {skills?.languages?.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-portfolio-border/40 text-sm">
                    <span>{s}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-portfolio-accent opacity-60"></span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs text-portfolio-accent uppercase tracking-widest mb-5 pb-2 border-b border-portfolio-border">Web Technologies</h3>
              <div className="flex flex-col gap-2">
                {skills?.web?.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-portfolio-border/40 text-sm">
                    <span>{s}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-portfolio-accent opacity-60"></span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs text-portfolio-accent uppercase tracking-widest mb-5 pb-2 border-b border-portfolio-border">Tools &amp; Databases</h3>
              <div className="flex flex-col gap-2">
                {skills?.tools?.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-portfolio-border/40 text-sm">
                    <span>{s}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-portfolio-accent opacity-60"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION SECTION */}
      <section id="education" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">05</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">Education</h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="flex flex-col">
            {education?.map((edu) => (
              <div key={edu.id} className="grid md:grid-cols-[180px_1fr_auto] gap-6 items-center py-6 border-b border-portfolio-border last:border-none">
                <span className="font-mono text-xs text-portfolio-muted">{edu.year}</span>
                <div>
                  <h3 className="font-bold text-portfolio-text text-base">{edu.school}</h3>
                  <p className="text-sm text-portfolio-muted mt-1">{edu.degree}</p>
                </div>
                <span className="font-mono text-base text-portfolio-accent font-medium">{edu.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS & CERTS SECTION */}
      <section id="achievements" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">06</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              Achievements <span className="text-portfolio-accent">&amp;</span> Certifications
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-mono text-xs text-portfolio-accent uppercase tracking-widest mb-6">Achievements</h3>
              <ul className="flex flex-col gap-3">
                {achievements?.map((ach, idx) => (
                  <li key={idx} className="text-sm text-portfolio-muted leading-relaxed py-2 border-b border-portfolio-border/40 flex items-start gap-3">
                    <span className="text-portfolio-accent font-mono">—</span>
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs text-portfolio-accent uppercase tracking-widest mb-6">Certifications</h3>
              <ul className="flex flex-col gap-3">
                {certifications?.map((cert, idx) => (
                  <li key={idx} className="text-sm text-portfolio-muted leading-relaxed py-2 border-b border-portfolio-border/40 flex items-start gap-3">
                    <span className="text-portfolio-accent font-mono">—</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILES SECTION */}
      <section id="profiles" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">07</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              My <span className="text-portfolio-accent">Profiles</span>
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {profiles?.map((prof, idx) => (
              <a
                key={idx}
                href={prof.url}
                target="_blank"
                rel="noreferrer"
                className="bg-portfolio-surface border border-portfolio-border p-6 text-center rounded-xl flex flex-col items-center gap-3 hover:border-portfolio-accent hover:bg-portfolio-surface/80 transition-all duration-300 group"
              >
                <i className={`${prof.icon || 'fas fa-link'} text-xl text-portfolio-muted group-hover:text-portfolio-accent transition-colors`}></i>
                <div className="font-bold text-sm text-portfolio-text">{prof.name}</div>
                <div className="font-mono text-xs text-portfolio-muted truncate max-w-full">{prof.handle}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* RESUME SECTION */}
      <section id="resume" className="border-b border-portfolio-border py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-portfolio-surface border border-portfolio-border p-10 rounded-2xl">
            <div>
              <h3 className="text-2xl font-bold text-portfolio-text mb-2">My Resume</h3>
              <p className="text-sm text-portfolio-muted max-w-lg leading-relaxed">
                My full academic background, technical skills, project details, internship experience, and certifications — all in one clean PDF document.
              </p>
            </div>
            {hero.resumeLink && (
              <a href={hero.resumeLink} target="_blank" rel="noreferrer" className="font-mono text-xs tracking-widest uppercase px-8 py-4 border border-portfolio-accent text-portfolio-accent hover:bg-portfolio-accent hover:text-black rounded-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap font-semibold">
                <i className="fas fa-file-download"></i> Resume
              </a>
            )}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-5 mb-14">
            <span className="font-mono text-xs text-portfolio-muted tracking-widest">08</span>
            <h2 className="text-2xl md:text-4xl font-bold text-portfolio-text">
              Get In <span className="text-portfolio-accent">Touch</span>
            </h2>
            <div className="flex-1 h-px bg-portfolio-border ml-5"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-base text-portfolio-muted leading-relaxed mb-8">
                Open to internship opportunities, collaboration on interesting projects, or just a friendly conversation about tech. Feel free to reach out.
              </p>
              <div className="flex flex-col gap-4 font-mono text-xs text-portfolio-muted">
                <div className="flex items-center gap-3 py-2 border-b border-portfolio-border">
                  <i className="fas fa-envelope text-portfolio-accent w-4"></i>
                  <a href={`mailto:${hero.email}`} className="hover:text-portfolio-accent">{hero.email}</a>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-portfolio-border">
                  <i className="fas fa-phone text-portfolio-accent w-4"></i>
                  <span>{hero.phone}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-portfolio-border">
                  <i className="fas fa-map-marker-alt text-portfolio-accent w-4"></i>
                  <span>{hero.location}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSendContact} className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-portfolio-surface border border-portfolio-border rounded-lg px-4 py-3 text-sm outline-none focus:border-portfolio-accent transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-portfolio-surface border border-portfolio-border rounded-lg px-4 py-3 text-sm outline-none focus:border-portfolio-accent transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-portfolio-muted uppercase tracking-widest mb-2">Message</label>
                <textarea
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full bg-portfolio-surface border border-portfolio-border rounded-lg px-4 py-3 text-sm outline-none focus:border-portfolio-accent transition-colors resize-none"
                />
              </div>
              <button type="submit" className="w-full bg-portfolio-accent text-black font-mono text-xs tracking-widest uppercase font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-portfolio-border px-6 md:px-12 py-8 flex flex-wrap justify-between items-center gap-4 font-mono text-xs text-portfolio-muted">
        <div><span className="text-portfolio-accent font-semibold">{hero.brandTitle || 'BHANUPRAKASH'}</span></div>
        <div>© {new Date().getFullYear()} · All Rights Reserved</div>
      </footer>

      {/* TOAST ALERT */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-portfolio-accent text-black font-mono text-xs font-semibold px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
