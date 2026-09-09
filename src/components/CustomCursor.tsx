'use client';

import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  id: number;
  char: string;
}

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorStyle, setCursorStyle] = useState('spotlight');
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [binaryTrail, setBinaryTrail] = useState<Particle[]>([]);

  const prevPosRef = useRef({ x: -100, y: -100 });
  const pointIdRef = useRef(0);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    // Hide cursor on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    // Initial cursor style detection
    const initialStyle = document.documentElement.getAttribute('data-cursor-style') || 'spotlight';
    setCursorStyle(initialStyle);

    // Observe changes to data-cursor-style attribute on <html> tag
    const observer = new MutationObserver(() => {
      const updated = document.documentElement.getAttribute('data-cursor-style') || 'spotlight';
      setCursorStyle(updated);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-cursor-style']
    });

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });

      // Update global CSS variables for cursor-following background pattern animation
      const root = document.documentElement;
      root.style.setProperty('--mouse-x', `${x}px`);
      root.style.setProperty('--mouse-y', `${y}px`);
      root.style.setProperty('--mouse-percent-x', `${(x / window.innerWidth) * 100}%`);
      root.style.setProperty('--mouse-percent-y', `${(y / window.innerHeight) * 100}%`);

      // Calculate instant velocity vector
      const vx = x - prevPosRef.current.x;
      const vy = y - prevPosRef.current.y;
      prevPosRef.current = { x, y };

      setVelocity({
        x: Math.min(Math.max(vx, -50), 50),
        y: Math.min(Math.max(vy, -50), 50)
      });

      // Binary particles for binary node cursor (Dense 1,0 stream spanning 2cm radius)
      const hovering = isHoveredRef.current;
      setBinaryTrail((prev) => {
        const count = hovering ? 4 : 2;
        const radius = hovering ? 75 : 45; // ~2cm radius (~75px) on hover
        const newItems: Particle[] = [];
        for (let i = 0; i < count; i++) {
          const nextId = pointIdRef.current++;
          const char = Math.random() > 0.5 ? '1' : '0';
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * radius;
          newItems.push({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            id: nextId,
            char
          });
        }
        return [...newItems, ...prev.slice(0, hovering ? 30 : 18)];
      });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, input, textarea, select, [role="button"], .interactive') as HTMLElement | null;

      if (interactiveEl) {
        setIsHovered(true);
        isHoveredRef.current = true;
        document.documentElement.setAttribute('data-is-hovering', 'true');
        const customText = interactiveEl.getAttribute('data-cursor-label') ||
          (interactiveEl.tagName === 'A' ? 'OPEN' :
            interactiveEl.tagName === 'BUTTON' ? 'SELECT' : null);
        setHoverLabel(customText);
      } else {
        setIsHovered(false);
        isHoveredRef.current = false;
        document.documentElement.setAttribute('data-is-hovering', 'false');
        setHoverLabel(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  // Smooth Ring Follower Animation Frame
  useEffect(() => {
    if (!isVisible) return;
    let animId: number;

    const followMouse = () => {
      setRingPos((prev) => {
        const dx = pos.x - prev.x;
        const dy = pos.y - prev.y;
        return {
          x: prev.x + dx * 0.22,
          y: prev.y + dy * 0.22,
        };
      });
      animId = requestAnimationFrame(followMouse);
    };

    animId = requestAnimationFrame(followMouse);
    return () => cancelAnimationFrame(animId);
  }, [pos, isVisible]);

  if (!isVisible) return null;

  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  const angleRad = Math.atan2(velocity.y, velocity.x);
  const angleDeg = (angleRad * 180) / Math.PI;
  const cursorColor = 'var(--cursor-color, var(--accent))';

  // 1. SPOTLIGHT CURSOR (Ambient Illumination Radial Glow - Retained)
  if (cursorStyle === 'spotlight') {
    return (
      <>
        <div
          className="fixed pointer-events-none z-[9997] top-0 left-0 rounded-full transition-transform duration-75"
          style={{
            transform: `translate3d(${pos.x - (isHovered ? 140 : 100)}px, ${pos.y - (isHovered ? 140 : 100)}px, 0)`,
            width: isHovered ? '280px' : '200px',
            height: isHovered ? '280px' : '200px',
            background: `radial-gradient(circle, ${cursorColor} 0%, rgba(0,0,0,0) 75%)`,
            opacity: isHovered ? 0.45 : 0.25,
            transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease'
          }}
        />
        <div
          className="custom-cursor-dot"
          style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, backgroundColor: cursorColor, boxShadow: `0 0 10px ${cursorColor}` }}
        />
      </>
    );
  }

  // 2. ACADEMIC CURSOR (Graduation Cap & Diploma Aura)
  if (cursorStyle === 'academic' || cursorStyle === 'grad_cap') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-75"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      >
        {/* Core Dot Nib */}
        <div
          className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: cursorColor, boxShadow: `0 0 12px ${cursorColor}` }}
        />
        {/* Floating Mortarboard / Graduation Cap Icon Container */}
        <div
          className={`absolute flex items-center justify-center rounded-xl border transition-all duration-300 ${isHovered ? 'w-12 h-12 -top-6 -left-6 scale-110 bg-portfolio-surface/90 shadow-[0_0_20px_var(--cursor-color,var(--accent))]' : 'w-9 h-9 -top-4.5 -left-4.5 bg-portfolio-bg/80'}`}
          style={{ borderColor: cursorColor }}
        >
          <svg className="w-5 h-5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke={cursorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          </svg>
          {isHovered && hoverLabel && (
            <span className="absolute -bottom-5 text-[8px] font-mono font-bold uppercase tracking-wider text-portfolio-text whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-portfolio-border">
              {hoverLabel}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. BOOK CURSOR (Open Notebook & Knowledge Beam)
  if (cursorStyle === 'book' || cursorStyle === 'notebook') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-75"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      >
        <div
          className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: cursorColor, boxShadow: `0 0 12px ${cursorColor}` }}
        />
        <div
          className={`absolute flex items-center justify-center rounded-xl border transition-all duration-300 ${isHovered ? 'w-12 h-12 -top-6 -left-6 scale-110 bg-portfolio-surface/90 shadow-[0_0_20px_var(--cursor-color,var(--accent))]' : 'w-9 h-9 -top-4.5 -left-4.5 bg-portfolio-bg/80'}`}
          style={{ borderColor: cursorColor }}
        >
          <svg className="w-5 h-5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke={cursorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
      </div>
    );
  }

  // 4. PENCIL CURSOR (Tech Stylus / Study Pencil with Line Trail)
  if (cursorStyle === 'pencil' || cursorStyle === 'stylus') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-75"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      >
        {/* Sharp Tip Pointer */}
        <div
          className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: cursorColor, boxShadow: `0 0 10px ${cursorColor}` }}
        />
        <div
          className={`absolute flex items-center justify-center transition-all duration-200 ${isHovered ? 'scale-125 -top-7 -left-7' : 'scale-100 -top-5 -left-5'}`}
          style={{ transform: `rotate(${isHovered ? '-25deg' : '-45deg'})` }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={cursorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </div>
      </div>
    );
  }

  // 5. BRACKETS CURSOR (Dev Terminal Code Brackets < />)
  if (cursorStyle === 'brackets' || cursorStyle === 'code') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-75"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      >
        <div
          className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: cursorColor, boxShadow: `0 0 10px ${cursorColor}` }}
        />
        <div
          className={`absolute flex items-center justify-center rounded-lg border font-mono font-bold text-xs transition-all duration-300 ${isHovered ? 'px-2.5 py-1 -top-5 -left-8 bg-portfolio-surface/90 scale-110 shadow-[0_0_18px_var(--cursor-color,var(--accent))]' : 'px-2 py-0.5 -top-4 -left-6 bg-portfolio-bg/90'}`}
          style={{ borderColor: cursorColor, color: cursorColor }}
        >
          &lt;/&gt;
          <span className="w-1.5 h-3 ml-1 bg-current animate-pulse inline-block" />
        </div>
      </div>
    );
  }

  // 6. CHIP CURSOR (AI Microchip / Silicon CPU Processor Core)
  if (cursorStyle === 'chip' || cursorStyle === 'cpu') {
    return (
      <div
        className="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-75"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      >
        <div
          className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: cursorColor, boxShadow: `0 0 10px ${cursorColor}` }}
        />
        <div
          className={`absolute flex items-center justify-center rounded-xl border transition-all duration-300 ${isHovered ? 'w-12 h-12 -top-6 -left-6 bg-portfolio-surface/90 scale-110 shadow-[0_0_20px_var(--cursor-color,var(--accent))] rotate-45' : 'w-9 h-9 -top-4.5 -left-4.5 bg-portfolio-bg/90'}`}
          style={{ borderColor: cursorColor }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={cursorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <rect x="9" y="9" width="6" height="6" />
            <line x1="9" y1="1" x2="9" y2="4" />
            <line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" />
            <line x1="15" y1="20" x2="15" y2="23" />
            <line x1="20" y1="9" x2="23" y2="9" />
            <line x1="20" y1="15" x2="23" y2="15" />
            <line x1="1" y1="9" x2="4" y2="9" />
            <line x1="1" y1="15" x2="4" y2="15" />
          </svg>
        </div>
      </div>
    );
  }

  // 7. BINARY CURSOR (Binary Code 0101 Quantum Matrix Node with 2cm Aura)
  if (cursorStyle === 'binary' || cursorStyle === 'matrix') {
    return (
      <>
        {/* 2cm Radial Background Matrix Aura */}
        <div
          className="fixed pointer-events-none z-[9997] top-0 left-0 rounded-full transition-all duration-300"
          style={{
            transform: `translate3d(${pos.x - (isHovered ? 75 : 45)}px, ${pos.y - (isHovered ? 75 : 45)}px, 0)`,
            width: isHovered ? '150px' : '90px',
            height: isHovered ? '150px' : '90px',
            background: `radial-gradient(circle, ${cursorColor} 0%, rgba(0,0,0,0) 75%)`,
            opacity: isHovered ? 0.25 : 0.12,
            border: `1px dashed ${cursorColor}`,
            borderRadius: '50%'
          }}
        />

        {/* Floating 1s and 0s Matrix Stream across 2cm radius */}
        {binaryTrail.map((pt, idx) => {
          const opacity = (1 - idx / binaryTrail.length) * (isHovered ? 0.95 : 0.7);
          const scale = 1 - (idx / binaryTrail.length) * 0.35;
          return (
            <div
              key={pt.id}
              className="fixed pointer-events-none z-[9998] font-mono text-[10px] font-extrabold transition-all duration-150 select-none"
              style={{
                transform: `translate3d(${pt.x - 4}px, ${pt.y - 6}px, 0) scale(${scale})`,
                color: cursorColor,
                opacity,
                textShadow: `0 0 8px ${cursorColor}`
              }}
            >
              {pt.char}
            </div>
          );
        })}

        {/* Core Cursor Reticle & Dot */}
        <div
          className="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-75"
          style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        >
          <div
            className={`absolute rounded-full border transition-all duration-300 ${isHovered ? 'w-10 h-10 -top-5 -left-5 bg-portfolio-surface/90 scale-110 shadow-[0_0_20px_var(--cursor-color,var(--accent))]' : 'w-5 h-5 -top-2.5 -left-2.5 bg-portfolio-bg/80'}`}
            style={{ borderColor: cursorColor }}
          >
            {isHovered && (
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-portfolio-accent">
                01
              </span>
            )}
          </div>
          <div
            className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: cursorColor, boxShadow: `0 0 12px ${cursorColor}` }}
          />
        </div>
      </>
    );
  }

  // FALLBACK (Default to Spotlight Illumination)
  return (
    <>
      <div
        className="fixed pointer-events-none z-[9997] top-0 left-0 rounded-full transition-transform duration-75"
        style={{
          transform: `translate3d(${pos.x - (isHovered ? 140 : 100)}px, ${pos.y - (isHovered ? 140 : 100)}px, 0)`,
          width: isHovered ? '280px' : '200px',
          height: isHovered ? '280px' : '200px',
          background: `radial-gradient(circle, ${cursorColor} 0%, rgba(0,0,0,0) 75%)`,
          opacity: isHovered ? 0.45 : 0.25,
          transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease'
        }}
      />
      <div
        className="custom-cursor-dot"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, backgroundColor: cursorColor, boxShadow: `0 0 10px ${cursorColor}` }}
      />
    </>
  );
}
