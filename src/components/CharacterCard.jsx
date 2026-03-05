import { useEffect, useRef } from 'react'

// 1. Définition des raretés avec leurs styles visuels
export const rarities = {
  NORMAL:              { label: 'NORMAL',               color: '#9CA3AF', bg: '#1a1a2e', pattern: null,        stars: 0, fullArt: false },
  VETERAN:             { label: '⚔ VÉTÉRAN',            color: '#34D399', bg: '#0a1a12', pattern: null,        stars: 1, fullArt: false },
  ELITE:               { label: '◆ ÉLITE',               color: '#38BDF8', bg: '#0c1a2e', pattern: null,        stars: 2, fullArt: false },
  EPIQUE:              { label: '✦ ÉPIQUE',              color: '#A855F7', bg: '#120a1a', pattern: 'dots',      stars: 3, fullArt: false },
  LEGEND:              { label: '★ LÉGENDAIRE',          color: '#fbc059', bg: '#1a1200', pattern: 'triangles', stars: 5, fullArt: true  },
  'COUP DE COEUR':     { label: '💛 COUP DE CŒUR',       color: '#F472B6', bg: '#1a0a14', pattern: 'diamonds',  stars: 4, fullArt: true  },
  'RPEDIA VALIDATION': { label: '⚜️ RPÉDIA VALIDATION',  color: '#fbc059', bg: '#0a0a0a', pattern: 'triangles', stars: 6, fullArt: true  },
  SHINY:               { label: '✦ SHINY',               color: '#67E8F9', bg: '#0c1a2e', pattern: 'diamonds',  stars: 3, fullArt: true  },
  SECRET:              { label: '◈ SECRET',              color: '#F472B6', bg: '#050005', pattern: 'dots',      stars: 4, fullArt: true  },
  SUPREME:             { label: '👁 SUPRÊME',             color: '#FF1A1A', bg: '#070000', pattern: null,        stars: 0, fullArt: true  },
  ABYSSAL:             { label: '🌊 ABYSSAL',             color: '#0EA5E9', bg: '#000a14', pattern: null,        stars: 0, fullArt: true  },
  DIVIN:               { label: '✦ DIVIN',                color: '#FFF9C4', bg: '#0a0800', pattern: null,        stars: 0, fullArt: true  },
  COSMIQUE:            { label: '🌌 COSMIQUE',            color: '#C084FC', bg: '#020008', pattern: null,        stars: 0, fullArt: true  },
  NECROSIS:            { label: '☠ NÉCROSIS',             color: '#4ADE80', bg: '#010800', pattern: null,        stars: 0, fullArt: true  },
}

// 2. Calcul des probabilités (Weights)
export const RARITY_WEIGHTS = [
  { rarity: 'SUPREME',           weight: 0.05 },
  { rarity: 'ABYSSAL',           weight: 0.08 },
  { rarity: 'DIVIN',             weight: 0.07 },
  { rarity: 'COSMIQUE',          weight: 0.06 },
  { rarity: 'NECROSIS',          weight: 0.09 },
  { rarity: 'SECRET',            weight: 0.1  },
  { rarity: 'SHINY',             weight: 0.4  },
  { rarity: 'RPEDIA VALIDATION', weight: 0.5  },
  { rarity: 'COUP DE COEUR',     weight: 1    },
  { rarity: 'LEGEND',            weight: 3    },
  { rarity: 'EPIQUE',            weight: 10   },
  { rarity: 'ELITE',             weight: 15   },
  { rarity: 'VETERAN',           weight: 25   },
  { rarity: 'NORMAL',            weight: 45   },
]

// 3. Logique de tirage (Roll)
export function rollRarity() {
  const total = RARITY_WEIGHTS.reduce((s, r) => s + r.weight, 0)
  let rand = Math.random() * total
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    rand -= weight
    if (rand <= 0) return rarity
  }
  return 'NORMAL'
}

// 4. Couleurs des Rangs (incluant + et -)
export const rankColors = {
  'S+': '#ff4ecd', 'S': '#fbc059', 'S-': '#e2ab50',
  'A+': '#4ade80', 'A': '#34D399', 'A-': '#2eb886',
  'B+': '#60a5fa', 'B': '#38BDF8', 'B-': '#30a2d1',
  'C+': '#a1a1aa', 'C': '#9CA3AF', 'C-': '#8a8f99',
  'D+': '#7a808c', 'D': '#6B7280', 'D-': '#5a5f6b',
}

// 5. Runes pour les effets visuels
const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

// ─── SUPREME CSS animations ───────────────────────────────────────────────────
const SUPREME_STYLES = `
  @keyframes heartbeat {
    0%   { box-shadow: 0 0 15px #FF0000aa, 0 0 40px #FF000033; }
    14%  { box-shadow: 0 0 40px #FF0000ff, 0 0 80px #FF000066, 0 0 120px #FF000022; }
    28%  { box-shadow: 0 0 15px #FF0000aa, 0 0 40px #FF000033; }
    42%  { box-shadow: 0 0 55px #FF2200ff, 0 0 100px #FF220077, 0 0 160px #FF220033; }
    70%  { box-shadow: 0 0 10px #AA000088, 0 0 25px #FF000011; }
    100% { box-shadow: 0 0 15px #FF0000aa, 0 0 40px #FF000033; }
  }
  @keyframes flameA {
    0%   { transform: scaleX(1.0) scaleY(1.0) translateY(0px); opacity: 0.9; }
    33%  { transform: scaleX(0.85) scaleY(1.4) translateY(-8px); opacity: 0.7; }
    66%  { transform: scaleX(1.1) scaleY(0.9) translateY(-3px); opacity: 0.8; }
    100% { transform: scaleX(1.0) scaleY(1.0) translateY(0px); opacity: 0.9; }
  }
  @keyframes flameB {
    0%   { transform: scaleX(1.0) scaleY(1.0) translateY(0px); opacity: 0.7; }
    50%  { transform: scaleX(0.7) scaleY(1.6) translateY(-12px); opacity: 0.4; }
    100% { transform: scaleX(1.0) scaleY(1.0) translateY(0px); opacity: 0.7; }
  }
  @keyframes flameC {
    0%   { transform: scaleX(1.2) scaleY(0.8) translateY(2px); opacity: 0.95; }
    40%  { transform: scaleX(0.9) scaleY(1.3) translateY(-6px); opacity: 0.6; }
    100% { transform: scaleX(1.2) scaleY(0.8) translateY(2px); opacity: 0.95; }
  }
  @keyframes runeFloat {
    0%   { opacity: 0; transform: translateY(4px) scale(0.6); }
    15%  { opacity: 0.9; transform: translateY(-2px) scale(1); }
    75%  { opacity: 0.5; transform: translateY(-18px) scale(0.85); }
    100% { opacity: 0; transform: translateY(-35px) scale(0.3); }
  }
  @keyframes crackPulse {
    0%,100% { opacity: 0.25; filter: drop-shadow(0 0 1px #FF0000); }
    50%     { opacity: 0.9;  filter: drop-shadow(0 0 6px #FF3300) drop-shadow(0 0 12px #FF000066); }
  }
  @keyframes eyeBlink {
    0%,90%,100% { transform: scaleY(1); }
    95%         { transform: scaleY(0.05); }
  }
  @keyframes pupilMove {
    0%,100% { transform: translate(0px, 0px); }
    20%     { transform: translate(2px, -1px); }
    40%     { transform: translate(-2px, 1px); }
    60%     { transform: translate(1px, 2px); }
    80%     { transform: translate(-1px, -2px); }
  }
  @keyframes bloodDrip {
    0%   { height: 0px; opacity: 1; }
    60%  { height: 18px; opacity: 1; }
    85%  { height: 22px; opacity: 0.8; }
    100% { height: 22px; opacity: 0; }
  }
  @keyframes borderFlicker {
    0%,100% { opacity: 1; }
    8%      { opacity: 0.6; }
    16%     { opacity: 1; }
    72%     { opacity: 0.8; }
    80%     { opacity: 1; }
  }
  @keyframes smokeRise {
    0%   { transform: translateY(0) scale(1); opacity: 0.15; }
    100% { transform: translateY(-60px) scale(2.5); opacity: 0; }
  }
  .supreme-card     { animation: heartbeat 1.6s ease-in-out infinite; }
  .supreme-border   { animation: borderFlicker 3s ease-in-out infinite; }
  .crack-pulse      { animation: crackPulse 2.2s ease-in-out infinite; }
  .eye-blink        { animation: eyeBlink 5s ease-in-out infinite; }
  .pupil-move       { animation: pupilMove 4s ease-in-out infinite; }
  .rune-0  { animation: runeFloat 3.5s ease-in-out infinite 0.0s; }
  .rune-1  { animation: runeFloat 2.8s ease-in-out infinite 0.6s; }
  .rune-2  { animation: runeFloat 4.0s ease-in-out infinite 1.1s; }
  .rune-3  { animation: runeFloat 3.2s ease-in-out infinite 1.8s; }
  .rune-4  { animation: runeFloat 2.6s ease-in-out infinite 0.3s; }
  .rune-5  { animation: runeFloat 3.7s ease-in-out infinite 2.2s; }
  .flame-a1 { animation: flameA 1.3s ease-in-out infinite 0.00s; transform-origin: bottom center; }
  .flame-a2 { animation: flameA 1.7s ease-in-out infinite 0.25s; transform-origin: bottom center; }
  .flame-a3 { animation: flameA 1.1s ease-in-out infinite 0.50s; transform-origin: bottom center; }
  .flame-b1 { animation: flameB 1.5s ease-in-out infinite 0.10s; transform-origin: bottom center; }
  .flame-b2 { animation: flameB 1.9s ease-in-out infinite 0.40s; transform-origin: bottom center; }
  .flame-c1 { animation: flameC 1.4s ease-in-out infinite 0.20s; transform-origin: bottom center; }
  .flame-c2 { animation: flameC 1.2s ease-in-out infinite 0.70s; transform-origin: bottom center; }
  .blood-1 { animation: bloodDrip 4.0s ease-in infinite 0.0s; transform-origin: top; }
  .blood-2 { animation: bloodDrip 5.5s ease-in infinite 1.2s; transform-origin: top; }
  .blood-3 { animation: bloodDrip 3.8s ease-in infinite 2.7s; transform-origin: top; }
  .blood-4 { animation: bloodDrip 6.0s ease-in infinite 0.8s; transform-origin: top; }
  .smoke-1 { animation: smokeRise 3s ease-out infinite 0.0s; }
  .smoke-2 { animation: smokeRise 4s ease-out infinite 1.0s; }
  .smoke-3 { animation: smokeRise 3.5s ease-out infinite 2.0s; }
`

function SupremeEffects() {
  return (
    <>
      <style>{SUPREME_STYLES}</style>

      {/* Border rouge flicker */}
      <div className="supreme-border absolute inset-0 rounded-2xl pointer-events-none" style={{
        zIndex: 20,
        border: '2px solid #FF1A1A',
        borderRadius: 16,
      }} />

      {/* Craquelures SVG */}
      <div className="crack-pulse absolute inset-0 pointer-events-none" style={{ zIndex: 8 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 133" preserveAspectRatio="none">
          {/* Craquelure centrale principale */}
          <path d="M50,0 L49,12 L52,18 L47,30 L51,35 L46,52 L50,56" stroke="#FF2200" strokeWidth="0.5" fill="none" strokeLinecap="round"/>
          {/* Branches gauche */}
          <path d="M47,30 L40,36 L38,48" stroke="#CC1100" strokeWidth="0.3" fill="none" strokeLinecap="round"/>
          <path d="M46,52 L38,58 L35,70 L37,78" stroke="#AA0000" strokeWidth="0.25" fill="none" strokeLinecap="round"/>
          {/* Branches droite */}
          <path d="M51,35 L60,42 L63,55" stroke="#CC1100" strokeWidth="0.3" fill="none" strokeLinecap="round"/>
          <path d="M50,56 L60,63 L62,75 L58,85" stroke="#AA0000" strokeWidth="0.25" fill="none" strokeLinecap="round"/>
          {/* Craquelures latérales */}
          <path d="M0,45 L10,50 L15,58 L12,68" stroke="#880000" strokeWidth="0.2" fill="none" strokeLinecap="round"/>
          <path d="M100,35 L90,42 L87,55 L91,62" stroke="#880000" strokeWidth="0.2" fill="none" strokeLinecap="round"/>
          {/* Microfissures */}
          <path d="M30,80 L35,85 L33,92" stroke="#661100" strokeWidth="0.15" fill="none"/>
          <path d="M70,75 L65,82 L68,90" stroke="#661100" strokeWidth="0.15" fill="none"/>
          {/* Lueurs aux intersections */}
          <circle cx="47" cy="30" r="0.8" fill="#FF4400" opacity="0.8"/>
          <circle cx="51" cy="35" r="0.8" fill="#FF4400" opacity="0.8"/>
          <circle cx="46" cy="52" r="1.0" fill="#FF2200" opacity="0.9"/>
          <circle cx="50" cy="56" r="1.2" fill="#FF0000" opacity="1.0"/>
        </svg>
      </div>

      {/* Gouttes de sang en haut */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ zIndex: 19, height: '30px', overflow: 'visible' }}>
        {[
          { left: '15%', cls: 'blood-1', w: 3 },
          { left: '35%', cls: 'blood-2', w: 2 },
          { left: '58%', cls: 'blood-3', w: 3.5 },
          { left: '80%', cls: 'blood-4', w: 2.5 },
        ].map((b, i) => (
          <div key={i} className={b.cls} style={{
            position: 'absolute',
            top: 0,
            left: b.left,
            width: b.w,
            background: 'linear-gradient(to bottom, #CC0000, #880000)',
            borderRadius: '0 0 50% 50%',
            boxShadow: '0 0 4px #FF0000',
          }} />
        ))}
      </div>

      {/* Œil démoniaque */}
      <div className="absolute pointer-events-none" style={{ top: '22%', left: '50%', transform: 'translateX(-50%)', zIndex: 15 }}>
        {/* Iris */}
        <div className="eye-blink" style={{
          width: 44, height: 22,
          background: 'radial-gradient(ellipse, #FF0000 0%, #880000 50%, #1a0000 80%)',
          borderRadius: '50%',
          border: '1.5px solid #FF2200',
          boxShadow: '0 0 12px #FF0000, 0 0 24px #FF000044',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Pupille */}
          <div className="pupil-move" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12, height: 16,
            background: '#000000',
            borderRadius: '50%',
            boxShadow: '0 0 4px #FF000066',
          }} />
          {/* Reflet */}
          <div style={{
            position: 'absolute',
            top: '20%', left: '30%',
            width: 5, height: 4,
            background: 'rgba(255,100,100,0.4)',
            borderRadius: '50%',
            filter: 'blur(1px)',
          }} />
        </div>
        {/* Cils démoniaques haut */}
        <svg style={{ position: 'absolute', top: -6, left: -4, width: 52, height: 12 }} viewBox="0 0 52 12">
          {[-18,-12,-6,0,6,12,18].map((x, i) => (
            <line key={i} x1={26+x} y1="10" x2={26+x*1.1} y2="0" stroke="#FF1100" strokeWidth="0.8" strokeLinecap="round"/>
          ))}
        </svg>
        {/* Cils démoniaques bas */}
        <svg style={{ position: 'absolute', bottom: -6, left: -4, width: 52, height: 12 }} viewBox="0 0 52 12">
          {[-18,-12,-6,0,6,12,18].map((x, i) => (
            <line key={i} x1={26+x} y1="2" x2={26+x*1.1} y2="12" stroke="#FF1100" strokeWidth="0.8" strokeLinecap="round"/>
          ))}
        </svg>
        {/* Glow autour de l'oeil */}
        <div style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FF000033 0%, transparent 70%)',
          filter: 'blur(6px)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Flammes du bas */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '38%', zIndex: 9 }}>
        {/* Couche 1 — grosses flammes de base */}
        {[
          { left: '2%',  w: 32, h: 65, cls: 'flame-a1', color1: '#FF2200', color2: '#FF4400' },
          { left: '22%', w: 26, h: 50, cls: 'flame-b1', color1: '#FF1100', color2: '#FF3300' },
          { left: '42%', w: 36, h: 72, cls: 'flame-a2', color1: '#FF0000', color2: '#FF2200' },
          { left: '62%', w: 28, h: 55, cls: 'flame-c1', color1: '#FF1A00', color2: '#FF4400' },
          { left: '80%', w: 30, h: 60, cls: 'flame-a3', color1: '#FF0000', color2: '#FF2200' },
        ].map((f, i) => (
          <div key={i} className={f.cls} style={{
            position: 'absolute', bottom: 0, left: f.left,
            width: f.w, height: f.h,
            background: `radial-gradient(ellipse at 50% 90%, ${f.color1}ff 0%, ${f.color2}99 35%, transparent 75%)`,
            borderRadius: '50% 50% 30% 30%',
            filter: 'blur(4px)',
          }} />
        ))}
        {/* Couche 2 — flammes secondaires */}
        {[
          { left: '12%', w: 20, h: 40, cls: 'flame-b2', color1: '#FF3300', color2: '#FF5500' },
          { left: '52%', w: 22, h: 45, cls: 'flame-c2', color1: '#FF2200', color2: '#FF4400' },
        ].map((f, i) => (
          <div key={`s${i}`} className={f.cls} style={{
            position: 'absolute', bottom: 0, left: f.left,
            width: f.w, height: f.h,
            background: `radial-gradient(ellipse at 50% 90%, ${f.color1}cc 0%, transparent 70%)`,
            borderRadius: '50% 50% 30% 30%',
            filter: 'blur(3px)',
          }} />
        ))}
        {/* Glow rouge de sol */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 30,
          background: 'linear-gradient(to top, #FF000077, transparent)',
          filter: 'blur(3px)',
        }} />
      </div>

      {/* Fumée au-dessus des flammes */}
      <div className="absolute pointer-events-none" style={{ bottom: '35%', left: 0, right: 0, zIndex: 8 }}>
        {[
          { left: '15%', cls: 'smoke-1', size: 18 },
          { left: '50%', cls: 'smoke-2', size: 22 },
          { left: '75%', cls: 'smoke-3', size: 16 },
        ].map((s, i) => (
          <div key={i} className={s.cls} style={{
            position: 'absolute',
            left: s.left,
            width: s.size, height: s.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(80,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }} />
        ))}
      </div>

      {/* Runes flottantes */}
      {[
        { left: '6%',  bottom: '42%', cls: 'rune-0', r: RUNES[0]  },
        { left: '80%', bottom: '38%', cls: 'rune-1', r: RUNES[4]  },
        { left: '14%', bottom: '56%', cls: 'rune-2', r: RUNES[9]  },
        { left: '72%', bottom: '52%', cls: 'rune-3', r: RUNES[14] },
        { left: '40%', bottom: '60%', cls: 'rune-4', r: RUNES[19] },
        { left: '88%', bottom: '62%', cls: 'rune-5', r: RUNES[23] },
      ].map((ru, i) => (
        <div key={i} className={`absolute pointer-events-none ${ru.cls}`}
          style={{
            left: ru.left, bottom: ru.bottom, zIndex: 11,
            fontSize: '0.8rem', color: '#FF3300', fontWeight: 'bold',
            textShadow: '0 0 6px #FF0000, 0 0 14px #FF000088',
            fontFamily: 'serif',
          }}>
          {ru.r}
        </div>
      ))}

      {/* Overlay rouge bas */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 6,
        background: 'radial-gradient(ellipse at 50% 110%, #FF000022 0%, transparent 55%)',
      }} />
    </>
  )
}

// ─── ABYSSAL effects ──────────────────────────────────────────────────────────
const ABYSSAL_STYLES = `
  @keyframes abyssalPulse {
    0%,100% { box-shadow: 0 0 20px #0EA5E9aa, 0 0 60px #0EA5E933; }
    50%     { box-shadow: 0 0 50px #0EA5E9ff, 0 0 100px #0EA5E966, 0 0 150px #0EA5E922; }
  }
  @keyframes tentacleWave {
    0%   { transform: rotate(0deg) scaleY(1); }
    25%  { transform: rotate(8deg) scaleY(1.15); }
    75%  { transform: rotate(-8deg) scaleY(0.9); }
    100% { transform: rotate(0deg) scaleY(1); }
  }
  @keyframes bubbleRise {
    0%   { transform: translateY(0) scale(1); opacity: 0.7; }
    80%  { transform: translateY(-70px) scale(0.6); opacity: 0.3; }
    100% { transform: translateY(-90px) scale(0.2); opacity: 0; }
  }
  @keyframes waveScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes abyssGlow {
    0%,100% { opacity: 0.15; }
    50%     { opacity: 0.4; }
  }
  .abyssal-card    { animation: abyssalPulse 3s ease-in-out infinite; }
  .tentacle-1 { animation: tentacleWave 2.8s ease-in-out infinite 0.0s; transform-origin: bottom center; }
  .tentacle-2 { animation: tentacleWave 3.2s ease-in-out infinite 0.4s; transform-origin: bottom center; }
  .tentacle-3 { animation: tentacleWave 2.5s ease-in-out infinite 0.8s; transform-origin: bottom center; }
  .tentacle-4 { animation: tentacleWave 3.6s ease-in-out infinite 0.2s; transform-origin: bottom center; }
  .tentacle-5 { animation: tentacleWave 2.9s ease-in-out infinite 1.0s; transform-origin: bottom center; }
  .bubble-1   { animation: bubbleRise 3.5s ease-in infinite 0.0s; }
  .bubble-2   { animation: bubbleRise 4.2s ease-in infinite 0.7s; }
  .bubble-3   { animation: bubbleRise 3.0s ease-in infinite 1.4s; }
  .bubble-4   { animation: bubbleRise 5.0s ease-in infinite 0.3s; }
  .bubble-5   { animation: bubbleRise 3.8s ease-in infinite 2.0s; }
  .bubble-6   { animation: bubbleRise 4.5s ease-in infinite 1.0s; }
  .wave-scroll { animation: waveScroll 6s linear infinite; }
  .abyss-glow  { animation: abyssGlow 4s ease-in-out infinite; }
`

function AbyssalEffects() {
  return (
    <>
      <style>{ABYSSAL_STYLES}</style>

      {/* Vagues animées au bas */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '35%', zIndex: 7 }}>
        <div className="wave-scroll" style={{ display: 'flex', width: '200%', height: '100%' }}>
          <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0369A1" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M0,40 C50,10 100,70 150,40 C200,10 250,70 300,40 C350,10 400,70 400,40 L400,120 L0,120 Z" fill="url(#waveGrad)" />
            <path d="M0,60 C60,30 120,90 180,60 C240,30 300,90 360,60 C380,50 400,65 400,60 L400,120 L0,120 Z" fill="#0EA5E9" opacity="0.2" />
          </svg>
          <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ width: '50%', height: '100%', flexShrink: 0 }}>
            <path d="M0,40 C50,10 100,70 150,40 C200,10 250,70 300,40 C350,10 400,70 400,40 L400,120 L0,120 Z" fill="url(#waveGrad)" />
            <path d="M0,60 C60,30 120,90 180,60 C240,30 300,90 360,60 C380,50 400,65 400,60 L400,120 L0,120 Z" fill="#0EA5E9" opacity="0.2" />
          </svg>
        </div>
      </div>

      {/* Tentacules SVG sur les bords */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 8 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 133" preserveAspectRatio="none">
          {/* Tentacules gauche */}
          <path className="tentacle-1" d="M0,80 Q8,70 4,55 Q0,40 8,30" stroke="#0EA5E9" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          <path className="tentacle-2" d="M0,95 Q12,85 8,70 Q4,55 12,45" stroke="#38BDF8" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4"/>
          {/* Tentacules droite */}
          <path className="tentacle-3" d="M100,75 Q92,65 96,50 Q100,35 92,25" stroke="#0EA5E9" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          <path className="tentacle-4" d="M100,90 Q88,80 92,65 Q96,50 88,40" stroke="#38BDF8" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4"/>
          {/* Tentacule du bas centre */}
          <path className="tentacle-5" d="M50,133 Q45,120 50,108 Q55,96 48,85" stroke="#0EA5E9" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
          {/* Ventouses */}
          <circle cx="4" cy="55" r="1.2" fill="#0EA5E9" opacity="0.5"/>
          <circle cx="8" cy="30" r="1" fill="#38BDF8" opacity="0.4"/>
          <circle cx="96" cy="50" r="1.2" fill="#0EA5E9" opacity="0.5"/>
          <circle cx="92" cy="25" r="1" fill="#38BDF8" opacity="0.4"/>
          <circle cx="50" cy="108" r="1" fill="#0EA5E9" opacity="0.4"/>
        </svg>
      </div>

      {/* Bulles bioluminescentes */}
      {[
        { left: '15%', bottom: '32%', cls: 'bubble-1', size: 6  },
        { left: '35%', bottom: '28%', cls: 'bubble-2', size: 4  },
        { left: '55%', bottom: '36%', cls: 'bubble-3', size: 8  },
        { left: '70%', bottom: '30%', cls: 'bubble-4', size: 5  },
        { left: '25%', bottom: '45%', cls: 'bubble-5', size: 3  },
        { left: '80%', bottom: '42%', cls: 'bubble-6', size: 7  },
      ].map((b, i) => (
        <div key={i} className={`absolute pointer-events-none ${b.cls}`} style={{
          left: b.left, bottom: b.bottom, zIndex: 9,
          width: b.size, height: b.size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7DD3FC 0%, #0EA5E9 50%, transparent 80%)',
          boxShadow: '0 0 6px #0EA5E9, 0 0 12px #0EA5E966',
        }} />
      ))}

      {/* Glow abyssal bas */}
      <div className="abyss-glow absolute inset-0 pointer-events-none" style={{
        zIndex: 6,
        background: 'radial-gradient(ellipse at 50% 120%, #0EA5E933 0%, transparent 60%)',
      }} />

      {/* Vignette bords sombres */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 5,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, #000a1488 100%)',
      }} />
    </>
  )
}

// ─── DIVIN effects ────────────────────────────────────────────────────────────
const DIVIN_STYLES = `
  @keyframes divinPulse {
    0%,100% { box-shadow: 0 0 25px #FFF9C4bb, 0 0 60px #FFF9C444; }
    50%     { box-shadow: 0 0 60px #FFFFFfff, 0 0 120px #FFF9C477, 0 0 200px #FFFFFF22; }
  }
  @keyframes rayRotate {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes featherFall {
    0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
    10%  { opacity: 0.8; }
    90%  { opacity: 0.5; }
    100% { transform: translateY(120px) rotate(25deg); opacity: 0; }
  }
  @keyframes haloGlow {
    0%,100% { opacity: 0.4; transform: scale(1); }
    50%     { opacity: 0.9; transform: scale(1.05); }
  }
  @keyframes goldShimmer {
    0%,100% { opacity: 0.3; }
    50%     { opacity: 0.7; }
  }
  .divin-card     { animation: divinPulse 3s ease-in-out infinite; }
  .ray-rotate     { animation: rayRotate 20s linear infinite; transform-origin: center; }
  .feather-1 { animation: featherFall 5s ease-in infinite 0.0s; }
  .feather-2 { animation: featherFall 7s ease-in infinite 1.5s; }
  .feather-3 { animation: featherFall 6s ease-in infinite 3.0s; }
  .feather-4 { animation: featherFall 8s ease-in infinite 0.8s; }
  .halo-glow  { animation: haloGlow 2.5s ease-in-out infinite; }
  .gold-shimmer { animation: goldShimmer 3s ease-in-out infinite; }
`

function DivinEffects() {
  return (
    <>
      <style>{DIVIN_STYLES}</style>

      {/* Rayons de lumière tournants */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
        <div className="ray-rotate" style={{
          position: 'absolute',
          top: '-50%', left: '-50%',
          width: '200%', height: '200%',
          background: `conic-gradient(
            transparent 0deg,
            rgba(255,249,196,0.06) 10deg,
            transparent 20deg,
            transparent 40deg,
            rgba(255,249,196,0.04) 50deg,
            transparent 60deg,
            transparent 90deg,
            rgba(255,249,196,0.05) 100deg,
            transparent 110deg,
            transparent 150deg,
            rgba(255,249,196,0.07) 160deg,
            transparent 170deg,
            transparent 210deg,
            rgba(255,249,196,0.04) 220deg,
            transparent 230deg,
            transparent 270deg,
            rgba(255,249,196,0.06) 280deg,
            transparent 290deg,
            transparent 330deg,
            rgba(255,249,196,0.05) 340deg,
            transparent 360deg
          )`,
        }} />
      </div>

      {/* Halo doré */}
      <div className="halo-glow absolute pointer-events-none" style={{
        zIndex: 7,
        top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 60, height: 60,
        borderRadius: '50%',
        border: '2px solid rgba(255,249,196,0.6)',
        boxShadow: '0 0 20px #FFF9C466, 0 0 40px #FFF9C422, inset 0 0 20px #FFF9C411',
      }} />

      {/* Ailes SVG */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 133" preserveAspectRatio="none">
          {/* Aile gauche */}
          <path d="M50,25 Q20,35 5,55 Q15,50 50,45 Z" fill="rgba(255,249,196,0.08)" stroke="rgba(255,249,196,0.2)" strokeWidth="0.3"/>
          <path d="M50,30 Q18,42 2,68 Q15,58 50,52 Z" fill="rgba(255,249,196,0.06)" stroke="rgba(255,249,196,0.15)" strokeWidth="0.2"/>
          <path d="M50,35 Q22,50 8,78 Q20,65 50,58 Z" fill="rgba(255,249,196,0.04)" stroke="rgba(255,249,196,0.1)" strokeWidth="0.2"/>
          {/* Aile droite (miroir) */}
          <path d="M50,25 Q80,35 95,55 Q85,50 50,45 Z" fill="rgba(255,249,196,0.08)" stroke="rgba(255,249,196,0.2)" strokeWidth="0.3"/>
          <path d="M50,30 Q82,42 98,68 Q85,58 50,52 Z" fill="rgba(255,249,196,0.06)" stroke="rgba(255,249,196,0.15)" strokeWidth="0.2"/>
          <path d="M50,35 Q78,50 92,78 Q80,65 50,58 Z" fill="rgba(255,249,196,0.04)" stroke="rgba(255,249,196,0.1)" strokeWidth="0.2"/>
        </svg>
      </div>

      {/* Plumes qui tombent */}
      {[
        { left: '12%', cls: 'feather-1' },
        { left: '38%', cls: 'feather-2' },
        { left: '62%', cls: 'feather-3' },
        { left: '82%', cls: 'feather-4' },
      ].map((f, i) => (
        <div key={i} className={`absolute pointer-events-none ${f.cls}`} style={{
          top: 0, left: f.left, zIndex: 9,
        }}>
          <svg width="8" height="20" viewBox="0 0 8 20">
            <path d="M4,0 Q6,5 4,10 Q2,5 4,0 Z" fill="rgba(255,249,196,0.7)"/>
            <line x1="4" y1="0" x2="4" y2="20" stroke="rgba(255,249,196,0.4)" strokeWidth="0.5"/>
          </svg>
        </div>
      ))}

      {/* Shimmer doré global */}
      <div className="gold-shimmer absolute inset-0 pointer-events-none" style={{
        zIndex: 4,
        background: 'radial-gradient(ellipse at 50% 20%, rgba(255,249,196,0.1) 0%, transparent 60%)',
      }} />
    </>
  )
}

// ─── COSMIQUE effects ─────────────────────────────────────────────────────────
const COSMIQUE_STYLES = `
  @keyframes cosmicPulse {
    0%,100% { box-shadow: 0 0 20px #C084FCaa, 0 0 50px #C084FC33; }
    50%     { box-shadow: 0 0 50px #C084FCff, 0 0 100px #C084FC66, 0 0 180px #C084FC22; }
  }
  @keyframes nebulaShift {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(5px,-3px) scale(1.05); }
    66%  { transform: translate(-3px,5px) scale(0.97); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes starTwinkle {
    0%,100% { opacity: 0.2; transform: scale(0.8); }
    50%     { opacity: 1; transform: scale(1.3); }
  }
  @keyframes shootingStar {
    0%   { transform: translateX(-20px) translateY(-20px); opacity: 0; }
    10%  { opacity: 1; }
    100% { transform: translateX(80px) translateY(80px); opacity: 0; }
  }
  @keyframes warpRing {
    0%   { transform: scale(0.8) rotate(0deg); opacity: 0.6; }
    100% { transform: scale(1.4) rotate(180deg); opacity: 0; }
  }
  .cosmic-card     { animation: cosmicPulse 3s ease-in-out infinite; }
  .nebula-shift    { animation: nebulaShift 8s ease-in-out infinite; }
  .star-twinkle-1  { animation: starTwinkle 1.8s ease-in-out infinite 0.0s; }
  .star-twinkle-2  { animation: starTwinkle 2.4s ease-in-out infinite 0.5s; }
  .star-twinkle-3  { animation: starTwinkle 1.5s ease-in-out infinite 1.0s; }
  .star-twinkle-4  { animation: starTwinkle 2.8s ease-in-out infinite 0.3s; }
  .star-twinkle-5  { animation: starTwinkle 2.0s ease-in-out infinite 1.5s; }
  .star-twinkle-6  { animation: starTwinkle 1.6s ease-in-out infinite 0.8s; }
  .star-twinkle-7  { animation: starTwinkle 2.2s ease-in-out infinite 2.0s; }
  .star-twinkle-8  { animation: starTwinkle 1.9s ease-in-out infinite 1.2s; }
  .shooting-1 { animation: shootingStar 3.5s ease-in infinite 0.5s; }
  .shooting-2 { animation: shootingStar 5s ease-in infinite 2.5s; }
  .warp-ring  { animation: warpRing 4s ease-out infinite; }
`

function CosmiqueEffects() {
  return (
    <>
      <style>{COSMIQUE_STYLES}</style>

      {/* Nébuleuse en fond */}
      <div className="nebula-shift absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: '70%', height: '60%',
          background: 'radial-gradient(ellipse, #7C3AED22 0%, #C084FC11 40%, transparent 70%)',
          filter: 'blur(12px)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '5%',
          width: '50%', height: '40%',
          background: 'radial-gradient(ellipse, #2563EB18 0%, #818CF811 40%, transparent 70%)',
          filter: 'blur(10px)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', top: '15%', right: '5%',
          width: '45%', height: '35%',
          background: 'radial-gradient(ellipse, #EC489922 0%, transparent 70%)',
          filter: 'blur(8px)',
          borderRadius: '50%',
        }} />
      </div>

      {/* Étoiles scintillantes */}
      {[
        { top: '8%',  left: '15%', cls: 'star-twinkle-1', size: 2.5 },
        { top: '15%', left: '70%', cls: 'star-twinkle-2', size: 1.5 },
        { top: '25%', left: '40%', cls: 'star-twinkle-3', size: 3   },
        { top: '35%', left: '85%', cls: 'star-twinkle-4', size: 2   },
        { top: '45%', left: '10%', cls: 'star-twinkle-5', size: 1.5 },
        { top: '20%', left: '55%', cls: 'star-twinkle-6', size: 2   },
        { top: '55%', left: '30%', cls: 'star-twinkle-7', size: 1.8 },
        { top: '12%', left: '90%', cls: 'star-twinkle-8', size: 2.5 },
      ].map((s, i) => (
        <div key={i} className={`absolute pointer-events-none ${s.cls}`} style={{
          top: s.top, left: s.left, zIndex: 8,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: `0 0 ${s.size * 2}px #C084FC, 0 0 ${s.size * 4}px #C084FC55`,
        }} />
      ))}

      {/* Étoiles filantes */}
      {[
        { top: '10%', left: '5%',  cls: 'shooting-1' },
        { top: '30%', left: '20%', cls: 'shooting-2' },
      ].map((s, i) => (
        <div key={i} className={`absolute pointer-events-none ${s.cls}`} style={{
          top: s.top, left: s.left, zIndex: 9,
          width: 40, height: 1.5,
          background: 'linear-gradient(to right, transparent, #E0AAFF, white)',
          borderRadius: 2,
          filter: 'blur(0.5px)',
          transform: 'rotate(35deg)',
        }} />
      ))}

      {/* Anneau warp */}
      <div className="warp-ring absolute pointer-events-none" style={{
        zIndex: 7,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 80, height: 40,
        border: '1px solid rgba(192,132,252,0.4)',
        borderRadius: '50%',
        boxShadow: '0 0 10px #C084FC44',
      }} />

      {/* Overlay cosmique */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 3,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2,0,8,0.5) 100%)',
      }} />
    </>
  )
}

// ─── NECROSIS effects ─────────────────────────────────────────────────────────
const NECROSIS_STYLES = `
  @keyframes necrosisPulse {
    0%,100% { box-shadow: 0 0 20px #4ADE80aa, 0 0 50px #4ADE8033; }
    33%     { box-shadow: 0 0 40px #22C55Eff, 0 0 80px #22C55E55; }
    66%     { box-shadow: 0 0 10px #16A34A88, 0 0 20px #16A34A22; }
  }
  @keyframes toxicBubble {
    0%   { transform: translateY(0) scale(1); opacity: 0.8; }
    70%  { transform: translateY(-50px) scale(0.5); opacity: 0.3; }
    100% { transform: translateY(-70px) scale(0); opacity: 0; }
  }
  @keyframes drip {
    0%   { height: 0; opacity: 0.9; }
    70%  { height: 24px; opacity: 0.8; }
    100% { height: 28px; opacity: 0; }
  }
  @keyframes glitchShift {
    0%,90%,100% { transform: translateX(0); filter: none; }
    92%   { transform: translateX(-2px); filter: hue-rotate(90deg) brightness(1.5); }
    94%   { transform: translateX(2px); filter: hue-rotate(-90deg); }
    96%   { transform: translateX(0); filter: none; }
  }
  @keyframes rotDecay {
    0%,100% { opacity: 0.15; }
    50%     { opacity: 0.35; }
  }
  .necrosis-card  { animation: necrosisPulse 2s ease-in-out infinite; }
  .necrosis-glitch { animation: glitchShift 4s ease-in-out infinite; }
  .tox-bubble-1  { animation: toxicBubble 3.5s ease-in infinite 0.0s; }
  .tox-bubble-2  { animation: toxicBubble 4.2s ease-in infinite 0.8s; }
  .tox-bubble-3  { animation: toxicBubble 3.0s ease-in infinite 1.6s; }
  .tox-bubble-4  { animation: toxicBubble 5.0s ease-in infinite 0.4s; }
  .tox-bubble-5  { animation: toxicBubble 3.8s ease-in infinite 2.2s; }
  .poison-drip-1 { animation: drip 4.5s ease-in infinite 0.0s; transform-origin: top; }
  .poison-drip-2 { animation: drip 6.0s ease-in infinite 1.5s; transform-origin: top; }
  .poison-drip-3 { animation: drip 3.5s ease-in infinite 3.0s; transform-origin: top; }
  .rot-decay     { animation: rotDecay 3s ease-in-out infinite; }
`

function NecrosisEffects() {
  return (
    <>
      <style>{NECROSIS_STYLES}</style>

      {/* Glitch global */}
      <div className="necrosis-glitch absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />

      {/* Texture de pourriture — cercles verts sombres */}
      <div className="rot-decay absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 133">
          {[
            [20,30,8],[45,55,6],[70,25,10],[15,75,7],[60,85,5],[80,50,9],[35,110,6],[55,15,5]
          ].map(([x,y,r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#16A34A" strokeWidth="0.3" opacity="0.4"/>
          ))}
          {/* Os SVG */}
          <g opacity="0.25" stroke="#4ADE80" strokeWidth="0.4" fill="none">
            <line x1="10" y1="40" x2="20" y2="50"/>
            <circle cx="10" cy="40" r="2"/><circle cx="20" cy="50" r="2"/>
            <line x1="75" y1="35" x2="85" y2="45"/>
            <circle cx="75" cy="35" r="2"/><circle cx="85" cy="45" r="2"/>
            <line x1="30" y1="95" x2="40" y2="105"/>
            <circle cx="30" cy="95" r="1.5"/><circle cx="40" cy="105" r="1.5"/>
          </g>
        </svg>
      </div>

      {/* Gouttes de poison en haut */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ zIndex: 19, height: '35px', overflow: 'visible' }}>
        {[
          { left: '20%', cls: 'poison-drip-1', w: 3 },
          { left: '50%', cls: 'poison-drip-2', w: 2.5 },
          { left: '75%', cls: 'poison-drip-3', w: 3.5 },
        ].map((d, i) => (
          <div key={i} className={d.cls} style={{
            position: 'absolute', top: 0, left: d.left,
            width: d.w,
            background: 'linear-gradient(to bottom, #16A34A, #4ADE80)',
            borderRadius: '0 0 50% 50%',
            boxShadow: '0 0 4px #4ADE80',
          }} />
        ))}
      </div>

      {/* Bulles toxiques */}
      {[
        { left: '10%', bottom: '38%', cls: 'tox-bubble-1', size: 5 },
        { left: '30%', bottom: '32%', cls: 'tox-bubble-2', size: 7 },
        { left: '52%', bottom: '40%', cls: 'tox-bubble-3', size: 4 },
        { left: '68%', bottom: '35%', cls: 'tox-bubble-4', size: 6 },
        { left: '85%', bottom: '42%', cls: 'tox-bubble-5', size: 5 },
      ].map((b, i) => (
        <div key={i} className={`absolute pointer-events-none ${b.cls}`} style={{
          left: b.left, bottom: b.bottom, zIndex: 9,
          width: b.size, height: b.size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #86EFAC 0%, #4ADE80 50%, transparent 80%)',
          boxShadow: '0 0 4px #4ADE80, 0 0 8px #4ADE8055',
          border: '0.5px solid #22C55E55',
        }} />
      ))}

      {/* Brume toxique bas */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '30%', zIndex: 7 }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%',
          background: 'linear-gradient(to top, rgba(22,163,74,0.25) 0%, rgba(74,222,128,0.08) 60%, transparent 100%)',
          filter: 'blur(4px)',
        }} />
      </div>

      {/* Overlay verdâtre */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 4,
        background: 'radial-gradient(ellipse at 50% 80%, rgba(22,163,74,0.08) 0%, transparent 60%)',
      }} />
    </>
  )
}


// ─── Canvas Particles ─────────────────────────────────────────────────────────
function ParticleCanvas({ color, count = 18, rarityKey }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const isSecret  = rarityKey === 'SECRET'
    const isShiny   = rarityKey === 'SHINY'
    const isHolo    = rarityKey === 'RPEDIA VALIDATION'
    const isSupreme = rarityKey === 'SUPREME'
    const isAbyssal  = rarityKey === 'ABYSSAL'
    const isDivin    = rarityKey === 'DIVIN'
    const isCosmique = rarityKey === 'COSMIQUE'
    const isNecrosis = rarityKey === 'NECROSIS'

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: isSupreme ? Math.random() * H * 0.6 + H * 0.3 : Math.random() * H,
      r: Math.random() * (isSupreme ? 1.5 : 2.5) + 0.5,
      vx: (Math.random() - 0.5) * (isSupreme ? 0.3 : 0.4),
      vy: isSupreme ? -(Math.random() * 0.8 + 0.3) : -Math.random() * 0.6 - 0.2,
      alpha: Math.random(),
      hue: isHolo ? Math.random() * 360 : isSupreme ? Math.random() * 30 : null,
    }))

    let raf
    function draw() {
      ctx.clearRect(0, 0, W, H)

      if (isSecret) {
        for (let i = 0; i < H; i += 4) {
          if (Math.random() > 0.97) {
            ctx.fillStyle = 'rgba(255,0,255,0.04)'
            ctx.fillRect(0, i, W, 2)
          }
        }
      }
      if (isShiny) {
        const grad = ctx.createLinearGradient(0, 0, W, H)
        const t = (Date.now() % 2000) / 2000
        grad.addColorStop(Math.max(0, t - 0.1), 'transparent')
        grad.addColorStop(t, 'rgba(150,240,255,0.12)')
        grad.addColorStop(Math.min(1, t + 0.1), 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)
      }

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.alpha += (Math.random() - 0.5) * 0.04
        p.alpha = Math.max(0.05, Math.min(1, p.alpha))

        if (isSupreme) {
          // Cendres rouges qui montent depuis les flammes bas
          if (p.y < -5) { p.y = H * 0.9; p.x = Math.random() * W }
        } else {
          if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W }
        }
        if (p.x < -5 || p.x > W + 5) p.x = Math.random() * W

        ctx.beginPath()
        if (isHolo) {
          p.hue = (p.hue + 0.5) % 360
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`
        } else if (isSupreme) {
          const hue = p.hue + Math.random() * 10
          ctx.fillStyle = `hsla(${hue}, 100%, ${40 + Math.random() * 20}%, ${p.alpha * 0.7})`
        } else {
          ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        }

        if (rarityKey === 'LEGEND' || rarityKey === 'RPEDIA VALIDATION' || rarityKey === 'SUPREME') {
          drawStar(ctx, p.x, p.y, 4, p.r * 2, p.r)
        } else if (isShiny) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2)
          ctx.restore()
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        }
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [color, rarityKey])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 4 }} />
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerR)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
  }
  ctx.lineTo(cx, cy - outerR)
  ctx.closePath()
}

function HoloBorder() {
  return (
    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ zIndex: 5 }}>
      <style>{`
        @keyframes holoSpin {
          0%   { border-image-source: linear-gradient(0deg,   #ff0080, #ff8c00, #ffe100, #00ff9d, #00cfff, #8000ff, #ff0080); }
          25%  { border-image-source: linear-gradient(90deg,  #ff0080, #ff8c00, #ffe100, #00ff9d, #00cfff, #8000ff, #ff0080); }
          50%  { border-image-source: linear-gradient(180deg, #ff0080, #ff8c00, #ffe100, #00ff9d, #00cfff, #8000ff, #ff0080); }
          75%  { border-image-source: linear-gradient(270deg, #ff0080, #ff8c00, #ffe100, #00ff9d, #00cfff, #8000ff, #ff0080); }
          100% { border-image-source: linear-gradient(360deg, #ff0080, #ff8c00, #ffe100, #00ff9d, #00cfff, #8000ff, #ff0080); }
        }
        .holo-border {
          position: absolute; inset: 0; border-radius: 16px;
          border: 2px solid transparent;
          border-image: linear-gradient(0deg, #ff0080, #ff8c00, #ffe100, #00ff9d, #00cfff, #8000ff, #ff0080) 1;
          animation: holoSpin 3s linear infinite;
        }
      `}</style>
      <div className="holo-border" />
    </div>
  )
}

function PulseGlow({ color }) {
  return (
    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ zIndex: 3 }}>
      <div style={{ position: 'absolute', inset: -4, borderRadius: 20, background: `${color}22`, animation: 'pulse 2s ease-in-out infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  )
}

function ShimmerBorder({ color }) {
  return (
    <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      <div style={{
        position: 'absolute', top: '-100%', left: '-100%', width: '300%', height: '300%',
        background: `linear-gradient(115deg, transparent 40%, ${color}44 50%, transparent 60%)`,
        animation: 'shimmer 3s linear infinite',
      }} />
      <style>{`@keyframes shimmer { to { transform: translateX(66%) translateY(66%) } }`}</style>
    </div>
  )
}

function VeteranBorder({ color }) {
  return (
    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ zIndex: 3 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, boxShadow: `0 0 8px ${color}88, inset 0 0 8px ${color}22`, animation: 'vetPulse 2.5s ease-in-out infinite' }} />
      <style>{`@keyframes vetPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  )
}

function PatternOverlay({ type, color }) {
  if (!type) return null
  const id = `${type}-${color.replace('#','')}`
  const shape = type === 'diamonds'
    ? <polygon points="10,2 18,10 10,18 2,10" fill={color} />
    : type === 'triangles'
    ? <polygon points="10,2 18,18 2,18" fill={color} />
    : <circle cx="8" cy="8" r="2" fill={color} />
  const size = type === 'dots' ? 16 : 20
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1, opacity: 0.07 }}>
      <svg width="100%" height="100%">
        <defs><pattern id={id} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">{shape}</pattern></defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

function Stars({ count, color }) {
  if (!count) return null
  const positions = [
    { top: '8%', left: '8%' }, { top: '12%', right: '12%' },
    { bottom: '30%', left: '5%' }, { bottom: '28%', right: '6%' },
    { top: '45%', left: '3%' }, { top: '55%', right: '4%' },
  ].slice(0, count)
  return (
    <>
      {positions.map((pos, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ ...pos, zIndex: 2 }}>
          <span style={{ color, fontSize: i % 2 === 0 ? '0.5rem' : '0.35rem', opacity: 0.6 }}>✦</span>
        </div>
      ))}
    </>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────
function CharacterCard({ character, onClick }) {
  const rarity = rarities[character.rarity] || rarities.NORMAL
  const { color, bg, fullArt } = rarity
  const rarityKey = character.rarity || 'NORMAL'
  const isSupreme = rarityKey === 'SUPREME'
  const isAbyssal  = rarityKey === 'ABYSSAL'
  const isDivin    = rarityKey === 'DIVIN'
  const isCosmique = rarityKey === 'COSMIQUE'
  const isNecrosis = rarityKey === 'NECROSIS'
  const isSpecial  = isSupreme || isAbyssal || isDivin || isCosmique || isNecrosis

  const hasParticles = ['EPIQUE','LEGEND','COUP DE COEUR','RPEDIA VALIDATION','SHINY','SECRET','SUPREME','ABYSSAL','COSMIQUE'].includes(rarityKey)
  const particleCount = { EPIQUE: 12, LEGEND: 20, 'COUP DE COEUR': 18, 'RPEDIA VALIDATION': 25, SHINY: 15, SECRET: 20, SUPREME: 25, ABYSSAL: 18, COSMIQUE: 30 }[rarityKey] || 0

  const stats = [
    { label: 'RP',  value: character.stat_rp  ?? 'C' },
    { label: 'PVP', value: character.stat_pvp ?? 'C' },
    { label: 'LOR', value: character.stat_lor ?? 'C' },
    { label: 'IMP', value: character.stat_imp ?? 'C' },
  ]

  const imgSrc = character.image_url || 'https://static.vecteezy.com/ti/vecteur-libre/p1/35129568-silhouette-de-inconnue-la-personne-avec-visage-cache-couvert-et-masque-mysterieux-etrange-homme-anonyme-personnage-vecteur-illustration-isole-sur-blanc-contexte-gratuit-vectoriel.jpg'

  return (
    <div
      onClick={onClick}
      className={`card-ratio relative flex flex-col rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform duration-200 ${isSupreme ? 'supreme-card' : isAbyssal ? 'abyssal-card' : isDivin ? 'divin-card' : isCosmique ? 'cosmic-card' : isNecrosis ? 'necrosis-card' : ''}`}
      style={{
        background: bg,
        border: `2px solid ${color}60`,
        boxShadow: isSpecial
          ? undefined
          : `0 0 ${fullArt ? 32 : 16}px ${color}${fullArt ? '44' : '20'}, inset 0 0 30px rgba(0,0,0,0.4)`,
        willChange: 'transform',
        aspectRatio: '3/4',
      }}
    >
      {rarityKey === 'VETERAN' && <VeteranBorder color={color} />}
      {rarityKey === 'ELITE' && <ShimmerBorder color={color} />}
      {rarityKey === 'LEGEND' && <PulseGlow color={color} />}
      {rarityKey === 'RPEDIA VALIDATION' && <HoloBorder />}
      {isSupreme && <SupremeEffects />}
      {isAbyssal && <AbyssalEffects />}
      {isDivin && <DivinEffects />}
      {isCosmique && <CosmiqueEffects />}
      {isNecrosis && <NecrosisEffects />}
      {hasParticles && <ParticleCanvas color={color} count={particleCount} rarityKey={rarityKey} />}

      <PatternOverlay type={rarity.pattern} color={color} />
      <Stars count={rarity.stars} color={color} />

      {/* ── FULL ART layout ── */}
      {fullArt ? (
        <>
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <img src={imgSrc} alt={character.rp_name} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{
              background: isSupreme
                ? 'linear-gradient(to top, rgba(7,0,0,0.98) 0%, rgba(7,0,0,0.7) 38%, rgba(7,0,0,0.2) 65%, transparent 100%)'
                : isAbyssal
                ? 'linear-gradient(to top, rgba(0,10,20,0.98) 0%, rgba(0,10,20,0.65) 40%, rgba(0,10,20,0.15) 70%, transparent 100%)'
                : isDivin
                ? 'linear-gradient(to top, rgba(10,8,0,0.95) 0%, rgba(10,8,0,0.5) 45%, rgba(10,8,0,0.1) 70%, transparent 100%)'
                : isCosmique
                ? 'linear-gradient(to top, rgba(2,0,8,0.98) 0%, rgba(2,0,8,0.65) 40%, rgba(2,0,8,0.15) 70%, transparent 100%)'
                : isNecrosis
                ? 'linear-gradient(to top, rgba(1,8,0,0.97) 0%, rgba(1,8,0,0.65) 40%, rgba(1,8,0,0.15) 70%, transparent 100%)'
                : rarityKey === 'SECRET'
                ? 'linear-gradient(to top, rgba(5,0,5,0.95) 0%, rgba(5,0,5,0.5) 50%, rgba(5,0,5,0.1) 100%)'
                : `linear-gradient(to top, ${bg}f0 0%, ${bg}99 40%, ${bg}22 70%, transparent 100%)`
            }} />
          </div>

          {/* Barre top */}
          <div style={{
            height: 4, flexShrink: 0, zIndex: 10,
            background: isSupreme
              ? 'linear-gradient(to right, transparent, #FF0000, #FF4400, #FF0000, transparent)'
              : `linear-gradient(to right, transparent, ${color}, transparent)`
          }} />

          <div className="relative flex justify-between items-center px-3 pt-2 pb-1" style={{ zIndex: 10 }}>
            <span className="font-mono font-bold tracking-widest whitespace-nowrap" style={{
              color: isSupreme ? '#FF2200' : color,
              fontSize: '0.55rem',
              textShadow: isSupreme ? '0 0 8px #FF0000' : 'none',
            }}>{rarity.label}</span>
            {character.player && <span className="font-mono" style={{ color: isSupreme ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.5)', fontSize: '0.55rem' }}>{character.player}</span>}
          </div>

          <div style={{ flex: '1 1 0', minHeight: 0, zIndex: 0 }} />

          <div className="relative px-3 pb-1 pt-2 text-center" style={{ zIndex: 10, flexShrink: 0 }}>
            <h2 className="font-bold tracking-widest uppercase leading-tight" style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.2rem',
              color: isSupreme ? '#FF2200' : '#ffffff',
              textShadow: isSupreme
                ? '0 0 10px #FF0000, 0 0 30px #FF000088, 0 0 50px #FF000044'
                : `0 0 20px ${color}`,
              letterSpacing: isSupreme ? '0.12em' : undefined,
            }}>{character.rp_name}</h2>
            {character.surname && <p className="font-mono" style={{ color: isSupreme ? 'rgba(255,60,60,0.5)' : 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>{character.surname}</p>}
          </div>

          <div className="mx-3 relative" style={{
            height: 1, zIndex: 10, flexShrink: 0,
            background: isSupreme
              ? 'linear-gradient(to right, transparent, #FF0000, transparent)'
              : `linear-gradient(to right, transparent, ${color}80, transparent)`
          }} />

          <div className="relative grid grid-cols-4 gap-1 px-3 py-2" style={{ zIndex: 10, flexShrink: 0 }}>
            {stats.map(stat => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-bold leading-none" style={{
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem',
                  color: rankColors[stat.value] || '#9CA3AF',
                  textShadow: `0 0 8px ${rankColors[stat.value]}88`,
                }}>{stat.value}</span>
                <span className="font-mono" style={{ color: isSupreme ? 'rgba(255,80,80,0.4)' : 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="relative px-3 pb-1 pt-1 flex items-center justify-between" style={{ zIndex: 10, flexShrink: 0 }}>
            <span className="font-mono" style={{ color: isSupreme ? 'rgba(255,50,50,0.4)' : 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>{character.server}</span>
            <span className="font-mono" style={{ color: isSupreme ? 'rgba(255,50,50,0.4)' : 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>♥ {character.likes_count ?? 0}</span>
          </div>

          {/* Barre bottom */}
          <div style={{
            height: 4, flexShrink: 0, zIndex: 10,
            background: isSupreme
              ? 'linear-gradient(to right, transparent, #FF0000, #FF4400, #FF0000, transparent)'
              : `linear-gradient(to right, transparent, ${color}, transparent)`
          }} />
        </>
      ) : (
        /* ── NORMAL layout ── */
        <>
          <div style={{ height: 4, background: `linear-gradient(to right, transparent, ${color}, transparent)`, flexShrink: 0, zIndex: 3 }} />

          <div className="relative z-10 flex items-center justify-between px-3 pt-2 pb-1" style={{ flexShrink: 0 }}>
            <span className="font-mono font-bold tracking-widest whitespace-nowrap" style={{ color, fontSize: '0.55rem' }}>{rarity.label}</span>
            {character.player && <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>{character.player}</span>}
          </div>

          <div className="relative mx-2 rounded-xl overflow-hidden" style={{ flex: '1 1 0', minHeight: 0, maxHeight: '58%', zIndex: 3 }}>
            <img src={imgSrc} alt={character.rp_name} className="w-full h-full object-cover object-top" style={!character.image_url ? { filter: 'brightness(0.4)' } : {}} />
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: `linear-gradient(to top, ${bg}, transparent)` }} />
          </div>

          <div className="relative z-10 px-3 pt-2 pb-1 text-center" style={{ flexShrink: 0 }}>
            <h2 className="font-bold tracking-widest uppercase leading-tight" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: '#ffffff' }}>{character.rp_name}</h2>
            {character.surname && <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>{character.surname}</p>}
          </div>

          <div className="mx-3 relative z-10" style={{ height: 1, background: `linear-gradient(to right, transparent, ${color}80, transparent)`, flexShrink: 0 }} />

          <div className="relative z-10 grid grid-cols-4 gap-1 px-3 py-2" style={{ flexShrink: 0 }}>
            {stats.map(stat => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-bold leading-none" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: rankColors[stat.value] || '#9CA3AF' }}>{stat.value}</span>
                <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 px-3 pt-1 pb-1 flex items-center justify-between" style={{ flexShrink: 0 }}>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>{character.server}</span>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>♥ {character.likes_count ?? 0}</span>
          </div>

          <div style={{ height: 4, background: `linear-gradient(to right, transparent, ${color}, transparent)`, flexShrink: 0, zIndex: 3, marginTop: 'auto' }} />
        </>
      )}
    </div>
  )
}

export default CharacterCard