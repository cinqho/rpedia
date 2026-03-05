import { useEffect, useRef } from 'react'

export const rarities = {
  NORMAL:             { label: 'NORMAL',               color: '#9CA3AF', bg: '#1a1a2e', pattern: null,        stars: 0, fullArt: false },
  VETERAN:            { label: '⚔ VÉTÉRAN',            color: '#34D399', bg: '#0a1a12', pattern: null,        stars: 1, fullArt: false },
  ELITE:              { label: '◆ ÉLITE',               color: '#38BDF8', bg: '#0c1a2e', pattern: null,        stars: 2, fullArt: false },
  EPIQUE:             { label: '✦ ÉPIQUE',              color: '#A855F7', bg: '#120a1a', pattern: 'dots',      stars: 3, fullArt: false },
  LEGEND:             { label: '★ LÉGENDAIRE',          color: '#fbc059', bg: '#1a1200', pattern: 'triangles', stars: 5, fullArt: true  },
  'COUP DE COEUR':    { label: '💛 COUP DE CŒUR',       color: '#F472B6', bg: '#1a0a14', pattern: 'diamonds',  stars: 4, fullArt: true  },
  'RPEDIA VALIDATION':{ label: '⚜️ RPÉDIA VALIDATION',  color: '#fbc059', bg: '#0a0a0a', pattern: 'triangles', stars: 6, fullArt: true  },
  SHINY:              { label: '✦ SHINY',               color: '#67E8F9', bg: '#0c1a2e', pattern: 'diamonds',  stars: 3, fullArt: true  },
  SECRET:             { label: '◈ SECRET',              color: '#F472B6', bg: '#050005', pattern: 'dots',      stars: 4, fullArt: true  },
}

export const RARITY_WEIGHTS = [
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

export function rollRarity() {
  const total = RARITY_WEIGHTS.reduce((s, r) => s + r.weight, 0)
  let rand = Math.random() * total
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    rand -= weight
    if (rand <= 0) return rarity
  }
  return 'NORMAL'
}

const rankColors = {
  'S+': '#ff4ecd', S: '#fbc059', A: '#34D399', B: '#38BDF8', C: '#9CA3AF', D: '#6B7280',
}

// ─── Canvas Particles ────────────────────────────────────────────────────────
function ParticleCanvas({ color, count = 18, rarityKey }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const isSecret = rarityKey === 'SECRET'
    const isShiny  = rarityKey === 'SHINY'
    const isHolo   = rarityKey === 'RPEDIA VALIDATION'

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2,
      alpha: Math.random(),
      hue: isHolo ? Math.random() * 360 : null,
      glitch: isSecret ? Math.random() > 0.85 : false,
    }))

    let raf
    function draw() {
      ctx.clearRect(0, 0, W, H)

      if (isSecret) {
        for (let i = 0; i < H; i += 4) {
          if (Math.random() > 0.97) {
            ctx.fillStyle = `rgba(255,0,255,0.04)`
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
        p.alpha = Math.max(0.1, Math.min(1, p.alpha))
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W }
        if (p.x < -5 || p.x > W + 5) p.x = Math.random() * W

        ctx.beginPath()
        if (isHolo) {
          p.hue = (p.hue + 0.5) % 360
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`
        } else {
          ctx.fillStyle = color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        }

        if (rarityKey === 'LEGEND' || rarityKey === 'RPEDIA VALIDATION') {
          drawStar(ctx, p.x, p.y, 4, p.r * 2, p.r)
        } else if (isShiny) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(Math.PI / 4)
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2)
          ctx.restore()
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fill()
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
      <div style={{
        position: 'absolute', inset: -4,
        borderRadius: 20,
        background: `${color}22`,
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  )
}

function ShimmerBorder({ color }) {
  return (
    <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      <div style={{
        position: 'absolute', top: '-100%', left: '-100%',
        width: '300%', height: '300%',
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
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        boxShadow: `0 0 8px ${color}88, inset 0 0 8px ${color}22`,
        animation: 'vetPulse 2.5s ease-in-out infinite',
      }} />
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

  const hasParticles = ['EPIQUE','LEGEND','COUP DE COEUR','RPEDIA VALIDATION','SHINY','SECRET'].includes(rarityKey)
  const particleCount = { EPIQUE: 12, LEGEND: 20, 'COUP DE COEUR': 18, 'RPEDIA VALIDATION': 25, SHINY: 15, SECRET: 20 }[rarityKey] || 0

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
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform duration-200"
      style={{
        background: bg,
        border: `2px solid ${color}60`,
        boxShadow: `0 0 ${fullArt ? 32 : 16}px ${color}${fullArt ? '44' : '20'}, inset 0 0 30px rgba(0,0,0,0.4)`,
        willChange: 'transform',
        aspectRatio: '3/4',
      }}
    >
      {/* Effects */}
      {rarityKey === 'VETERAN' && <VeteranBorder color={color} />}
      {rarityKey === 'ELITE' && <ShimmerBorder color={color} />}
      {rarityKey === 'LEGEND' && <PulseGlow color={color} />}
      {rarityKey === 'RPEDIA VALIDATION' && <HoloBorder />}
      {hasParticles && <ParticleCanvas color={color} count={particleCount} rarityKey={rarityKey} />}

      <PatternOverlay type={rarity.pattern} color={color} />
      <Stars count={rarity.stars} color={color} />

      {/* ── FULL ART layout ── */}
      {fullArt ? (
        <>
          {/* Image plein fond */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <img src={imgSrc} alt={character.rp_name} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{
              background: rarityKey === 'SECRET'
                ? 'linear-gradient(to top, rgba(5,0,5,0.95) 0%, rgba(5,0,5,0.5) 50%, rgba(5,0,5,0.1) 100%)'
                : `linear-gradient(to top, ${bg}f0 0%, ${bg}99 40%, ${bg}22 70%, transparent 100%)`
            }} />
          </div>

          <div style={{ height: 4, background: `linear-gradient(to right, transparent, ${color}, transparent)`, flexShrink: 0, zIndex: 6 }} />

          <div className="relative flex justify-between items-center px-3 pt-2 pb-1" style={{ zIndex: 6 }}>
            <span className="font-mono font-bold tracking-widest whitespace-nowrap" style={{ color, fontSize: '0.55rem' }}>{rarity.label}</span>
            {character.player && <span className="font-mono" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.55rem' }}>{character.player}</span>}
          </div>

          {/* Spacer flexible mais avec min-height 0 pour ne jamais écraser le bas */}
          <div style={{ flex: '1 1 0', minHeight: 0, zIndex: 0 }} />

          <div className="relative px-3 pb-1 pt-2 text-center" style={{ zIndex: 6, flexShrink: 0 }}>
            <h2 className="font-bold tracking-widest uppercase leading-tight" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.2rem', color: '#ffffff', textShadow: `0 0 20px ${color}` }}>
              {character.rp_name}
            </h2>
            {character.surname && <p className="font-mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>{character.surname}</p>}
          </div>

          <div className="mx-3 relative" style={{ height: 1, background: `linear-gradient(to right, transparent, ${color}80, transparent)`, zIndex: 6, flexShrink: 0 }} />

          <div className="relative grid grid-cols-4 gap-1 px-3 py-2" style={{ zIndex: 6, flexShrink: 0 }}>
            {stats.map(stat => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-bold leading-none" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: rankColors[stat.value] || '#9CA3AF', textShadow: `0 0 8px ${rankColors[stat.value]}88` }}>{stat.value}</span>
                <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="relative px-3 pb-2 flex items-center justify-between" style={{ zIndex: 6, flexShrink: 0 }}>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>{character.server}</span>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>♥ {character.likes_count ?? 0}</span>
          </div>

          <div style={{ height: 4, background: `linear-gradient(to right, transparent, ${color}, transparent)`, flexShrink: 0, zIndex: 6 }} />
        </>
      ) : (
        /* ── NORMAL layout ── */
        <>
          <div style={{ height: 4, background: `linear-gradient(to right, transparent, ${color}, transparent)`, flexShrink: 0, zIndex: 3 }} />

          {/* Rareté + joueur */}
          <div className="relative z-10 flex items-center justify-between px-3 pt-2 pb-1" style={{ flexShrink: 0 }}>
            <span className="font-mono font-bold tracking-widest whitespace-nowrap" style={{ color, fontSize: '0.55rem' }}>{rarity.label}</span>
            {character.player && <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>{character.player}</span>}
          </div>

          {/* Image — flexible mais avec min/max pour mobile */}
          <div className="relative mx-2 rounded-xl overflow-hidden" style={{ flex: '1 1 0', minHeight: 0, maxHeight: '58%', zIndex: 3 }}>
            <img src={imgSrc} alt={character.rp_name} className="w-full h-full object-cover object-top" style={!character.image_url ? { filter: 'brightness(0.4)' } : {}} />
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: `linear-gradient(to top, ${bg}, transparent)` }} />
          </div>

          {/* Nom */}
          <div className="relative z-10 px-3 pt-2 pb-1 text-center" style={{ flexShrink: 0 }}>
            <h2 className="font-bold tracking-widest uppercase leading-tight" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: '#ffffff' }}>{character.rp_name}</h2>
            {character.surname && <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>{character.surname}</p>}
          </div>

          <div className="mx-3 relative z-10" style={{ height: 1, background: `linear-gradient(to right, transparent, ${color}80, transparent)`, flexShrink: 0 }} />

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-4 gap-1 px-3 py-2" style={{ flexShrink: 0 }}>
            {stats.map(stat => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-bold leading-none" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: rankColors[stat.value] || '#9CA3AF' }}>{stat.value}</span>
                <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Serveur + likes */}
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