import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLike } from '../hooks/useLike'
import CharacterCard, { rarities } from './CharacterCard'

// ─── Styles flip ──────────────────────────────────────────────────────────────
const MODAL_STYLES = `
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cardSpawnIn {
    from { opacity: 0; transform: scale(0.75) translateY(24px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes infoFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hintPulse {
    0%,100% { opacity: 0.35; }
    50%     { opacity: 0.7; }
  }
  @keyframes shimmerSlide {
    0%   { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(350%) skewX(-15deg); }
  }

  .modal-backdrop {
    animation: backdropIn 0.2s ease forwards;
  }
  .card-spawn {
    animation: cardSpawnIn 0.35s cubic-bezier(0.34, 1.45, 0.64, 1) forwards;
  }
  .flip-scene {
    perspective: 1200px;
  }
  .flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  .flip-inner.is-flipped {
    transform: rotateY(180deg);
  }
  .flip-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .flip-back-face {
    transform: rotateY(180deg);
  }
  .info-appear {
    animation: infoFadeIn 0.3s ease 0.2s both;
  }
  .hint-pulse {
    animation: hintPulse 2s ease-in-out infinite;
  }
  .hint-shimmer {
    animation: shimmerSlide 2.2s ease-in-out infinite 1.2s;
  }
`

const rankColors = {
  'S+': '#ff4ecd', 'S': '#e83bb5', 'S-': '#c42d99',
  'A+': '#4eedb5', 'A': '#34D399', 'A-': '#22a876',
  'B+': '#60cbff', 'B': '#38BDF8', 'B-': '#1da8e8',
  'C+': '#b0b8c4', 'C': '#9CA3AF', 'C-': '#7a8290',
  'D+': '#848d96', 'D': '#6B7280', 'D-': '#4f555e',
}

// ─── Face arrière ─────────────────────────────────────────────────────────────
function CardBack({ character, onClose, onFlipBack }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])
  const { liked, count, toggleLike } = useLike(character?.id, user)

  const rawRarity = character.rarity || 'NORMAL'
  const rarityKey = rarities[rawRarity] ? rawRarity : 'NORMAL'
  const rarity = rarities[rarityKey]
  const color = rarity.color
  const bg = rarity.bg
  const isIcone = rarityKey === 'ICONE'

  const stats = [
    { label: 'RP',  value: character.stat_rp  ?? 'C' },
    { label: 'PVP', value: character.stat_pvp ?? 'C' },
    { label: 'LOR', value: character.stat_lor ?? 'C' },
    { label: 'IMP', value: character.stat_imp ?? 'C' },
  ]

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: bg,
        border: `2px solid ${color}70`,
        boxShadow: `0 0 40px ${color}33, inset 0 0 40px rgba(0,0,0,0.5)`,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Barre top */}
      <div style={{
        height: 4, flexShrink: 0,
        background: isIcone
          ? 'linear-gradient(to right, transparent, #FF0000, #FF4400, #FF0000, transparent)'
          : `linear-gradient(to right, transparent, ${color}, transparent)`
      }} />

      {/* Header */}
      <div className="info-appear flex items-start justify-between px-4 pt-3 pb-2" style={{ flexShrink: 0 }}>
        <div>
          <p className="font-mono font-bold tracking-widest" style={{ color, fontSize: '0.52rem', opacity: 0.9 }}>
            {rarity.label}
          </p>
          <h2 style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '1.7rem',
            color: '#fff',
            lineHeight: 1.05,
            letterSpacing: '0.06em',
            textShadow: `0 0 20px ${color}88`,
          }}>
            {character.rp_name}
          </h2>
          {character.surname && (
            <p className="font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.58rem' }}>
              {character.surname}
            </p>
          )}
        </div>

        <button
          onClick={e => { e.stopPropagation(); onClose() }}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: 2 }}
        >
          ✕
        </button>
      </div>

      {/* Séparateur */}
      <div style={{ height: 1, margin: '0 16px', background: `linear-gradient(to right, ${color}50, transparent)`, flexShrink: 0 }} />

      {/* Contenu scrollable */}
      <div
        className="info-appear flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
        style={{ scrollbarWidth: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          {character.server && (
            <span className="font-mono px-2 py-0.5 rounded-full" style={{
              fontSize: '0.58rem',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              ⚔️ {character.server}
            </span>
          )}
          {character.player && (
            <span className="font-mono px-2 py-0.5 rounded-full" style={{
              fontSize: '0.58rem',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              👤 {character.player}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col items-center py-2 rounded-lg" style={{
              background: `${color}08`,
              border: `1px solid ${color}20`,
            }}>
              <span style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.15rem',
                color: rankColors[stat.value] || '#9CA3AF',
                lineHeight: 1,
                textShadow: `0 0 8px ${rankColors[stat.value] || '#9CA3AF'}88`,
              }}>
                {stat.value}
              </span>
              <span className="font-mono" style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.3)' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {character.description && (
          <div>
            <p className="font-mono tracking-widest uppercase mb-1.5" style={{ color, fontSize: '0.48rem', opacity: 0.75 }}>
              Description
            </p>
            <p className="font-mono leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65rem', lineHeight: 1.75 }}>
              {character.description}
            </p>
          </div>
        )}

        {/* Legacy */}
        {character.legacy && (
          <div>
            <p className="font-mono tracking-widest uppercase mb-1.5" style={{ color, fontSize: '0.48rem', opacity: 0.75 }}>
              Legacy
            </p>
            <p className="font-mono leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.65rem', lineHeight: 1.75 }}>
              {character.legacy}
            </p>
          </div>
        )}

        {!character.description && !character.legacy && (
          <p className="font-mono text-center py-6" style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.62rem' }}>
            Aucune description disponible.
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ height: 1, margin: '0 16px', background: `linear-gradient(to right, ${color}50, transparent)`, flexShrink: 0 }} />
      <div className="info-appear flex items-center justify-between px-4 py-2" style={{ flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); onFlipBack() }}
          className="font-mono flex items-center gap-1 transition-all hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.52rem' }}
        >
          ↩ retourner
        </button>
        <button
          onClick={e => { e.stopPropagation(); if (user) toggleLike() }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono transition-all duration-200 hover:scale-105"
          style={{
            background: liked ? `${color}20` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${liked ? color : 'rgba(255,255,255,0.1)'}`,
            color: liked ? color : 'rgba(255,255,255,0.35)',
            fontSize: '0.65rem',
            cursor: user ? 'pointer' : 'default',
          }}
        >
          {liked ? '♥' : '♡'} {count}
        </button>
      </div>

      {/* Barre bas */}
      <div style={{
        height: 4, flexShrink: 0,
        background: isIcone
          ? 'linear-gradient(to right, transparent, #FF0000, #FF4400, #FF0000, transparent)'
          : `linear-gradient(to right, transparent, ${color}, transparent)`
      }} />
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────
function CharacterModal({ character, onClose }) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [character?.id])

  if (!character) return null

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <style>{MODAL_STYLES}</style>

      {/* Wrapper taille carte */}
      <div
        className="card-spawn flip-scene relative"
        style={{ width: 'min(420px, 92vw)', maxHeight: '90vh', aspectRatio: '3/4' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hint cliquer */}
        {!flipped && (
          <div
            className="hint-pulse absolute pointer-events-none"
            style={{ bottom: -34, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 50 }}
          >
            <div style={{
              position: 'relative', overflow: 'hidden',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '3px 14px',
            }}>
              <div className="hint-shimmer absolute inset-0" style={{
                width: '28%',
                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)',
              }} />
              <p className="font-mono relative" style={{
                color: 'rgba(255,255,255,0.4)', fontSize: '0.52rem', letterSpacing: '0.12em',
              }}>
                CLIQUER POUR RETOURNER
              </p>
            </div>
          </div>
        )}

        {/* Flip */}
        <div
          className={`flip-inner ${flipped ? 'is-flipped' : ''}`}
          onClick={() => setFlipped(f => !f)}
        >
          {/* Face avant — CharacterCard */}
          <div className="flip-face">
            <CharacterCard character={character} />
          </div>

          {/* Face arrière — Infos */}
          <div className="flip-face flip-back-face">
            <CardBack
              character={character}
              onClose={onClose}
              onFlipBack={() => setFlipped(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterModal