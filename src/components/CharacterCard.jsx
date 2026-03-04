export const rarities = {
  NORMAL: { label: 'NORMAL', color: '#9CA3AF', bg: '#1a1a2e', pattern: null, stars: 0 },
  'VETERAN': { label: '⚔ VÉTÉRAN', color: '#34D399', bg: '#0a1a12', pattern: null, stars: 1 },
  'ELITE': { label: '◆ ÉLITE', color: '#38BDF8', bg: '#0c1a2e', pattern: null, stars: 2 },
  'EPIQUE': { label: '✦ ÉPIQUE', color: '#A855F7', bg: '#120a1a', pattern: 'dots', stars: 3 },
  'LEGEND': { label: '★ LÉGENDAIRE', color: '#fbc059', bg: '#1a1200', pattern: 'triangles', stars: 5 },
  'COUP DE COEUR': { label: '💛 COUP DE CŒUR', color: '#F472B6', bg: '#1a0a14', pattern: 'diamonds', stars: 4 },
  'RPEDIA VALIDATION': { label: '⚜️ RPÉDIA VALIDATION', color: '#fbc059', bg: '#0a0a0a', pattern: 'triangles', stars: 6 },
  'SHINY': { label: '✦ SHINY', color: '#67E8F9', bg: '#0c1a2e', pattern: 'diamonds', stars: 3 },
  'SECRET': { label: '◈ SECRET', color: '#F472B6', bg: '#1a0014', pattern: 'dots', stars: 4 },
}

export const RARITY_WEIGHTS = [
  { rarity: 'SECRET',           weight: 0.1  },
  { rarity: 'SHINY',            weight: 0.4  },
  { rarity: 'RPEDIA VALIDATION',weight: 0.5  },
  { rarity: 'COUP DE COEUR',    weight: 1    },
  { rarity: 'LEGEND',           weight: 3    },
  { rarity: 'EPIQUE',           weight: 10   },
  { rarity: 'ELITE',            weight: 15   },
  { rarity: 'VETERAN',          weight: 25   },
  { rarity: 'NORMAL',           weight: 45   },
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
  'S+': '#ff4ecd',
  S: '#fbc059',
  A: '#34D399',
  B: '#38BDF8',
  C: '#9CA3AF',
  D: '#6B7280',
}

function PatternOverlay({ type, color }) {
  if (!type) return null
  if (type === 'diamonds') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1, opacity: 0.07 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id={`diamonds-${color}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <polygon points="10,2 18,10 10,18 2,10" fill={color} />
        </pattern></defs>
        <rect width="100%" height="100%" fill={`url(#diamonds-${color})`} />
      </svg>
    </div>
  )
  if (type === 'triangles') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1, opacity: 0.07 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id={`triangles-${color}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <polygon points="10,2 18,18 2,18" fill={color} />
        </pattern></defs>
        <rect width="100%" height="100%" fill={`url(#triangles-${color})`} />
      </svg>
    </div>
  )
  if (type === 'dots') return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1, opacity: 0.1 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id={`dots-${color}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="2" fill={color} />
        </pattern></defs>
        <rect width="100%" height="100%" fill={`url(#dots-${color})`} />
      </svg>
    </div>
  )
  return null
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

function CharacterCard({ character, onClick }) {
  const universeColors = {
    'Naruto': '#FF6B00', 'One Piece': '#FF2D55',
    'Bleach': '#A855F7', 'Dragon Ball': '#FFE500',
  }

  const rarity = rarities[character.rarity] || rarities.NORMAL
  const universeColor = universeColors[character.universe] || '#fbc059'

  const stats = [
    { label: 'RP', value: character.stat_rp ?? 'C' },
    { label: 'PVP', value: character.stat_pvp ?? 'C' },
    { label: 'LOR', value: character.stat_lor ?? 'C' },
    { label: 'IMP', value: character.stat_imp ?? 'C' },
  ]

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer hover:scale-[1.03] transition-transform duration-200"
      style={{
        background: rarity.bg,
        border: `2px solid ${rarity.color}60`,
        boxShadow: `0 0 16px ${rarity.color}20, inset 0 0 30px rgba(0,0,0,0.4)`,
        willChange: 'transform',
        aspectRatio: '3/4',
      }}
    >
      <PatternOverlay type={rarity.pattern} color={rarity.color} />
      <Stars count={rarity.stars} color={rarity.color} />

      <div style={{ height: '4px', background: `linear-gradient(to right, transparent, ${rarity.color}, transparent)`, flexShrink: 0, zIndex: 3 }} />

      <div className="relative z-10 flex items-center justify-between px-3 pt-2 pb-1">
        <span className="font-mono font-bold tracking-widest whitespace-nowrap" style={{ color: rarity.color, fontSize: '0.55rem' }}>
          {rarity.label}
        </span>
        {character.player && (
          <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>
            {character.player}
          </span>
        )}
      </div>

      <div className="relative z-3 flex-1 overflow-hidden mx-2 rounded-xl" style={{ minHeight: '160px' }}>
        <img
          src={character.image_url || "https://static.vecteezy.com/ti/vecteur-libre/p1/35129568-silhouette-de-inconnue-la-personne-avec-visage-cache-couvert-et-masque-mysterieux-etrange-homme-anonyme-personnage-vecteur-illustration-isole-sur-blanc-contexte-gratuit-vectoriel.jpg"}
          alt={character.rp_name}
          className="w-full h-full object-cover object-top"
          style={!character.image_url ? { filter: 'brightness(0.4)' } : {}}
        />
        <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: `linear-gradient(to top, ${rarity.bg}, transparent)` }} />
      </div>

      <div className="relative z-10 px-3 pt-2 pb-1 text-center">
        <h2 className="font-bold tracking-widest uppercase leading-tight" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: '#ffffff' }}>
          {character.rp_name}
        </h2>
        {character.surname && (
          <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>
            {character.surname}
          </p>
        )}
      </div>

      <div className="mx-3 relative z-10" style={{ height: '1px', background: `linear-gradient(to right, transparent, ${rarity.color}80, transparent)` }} />

      <div className="relative z-10 grid grid-cols-4 gap-1 px-3 py-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="font-bold leading-none" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: rankColors[stat.value] || '#9CA3AF' }}>
              {stat.value}
            </span>
            <span className="font-mono" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55rem' }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-10 px-3 pb-2 flex items-center justify-between">
        <span className="font-mono" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>{character.server}</span>
        <span className="font-mono flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>
          ♥ {character.likes_count ?? 0}
        </span>
      </div>

      <div style={{ height: '4px', background: `linear-gradient(to right, transparent, ${rarity.color}, transparent)`, flexShrink: 0, zIndex: 3 }} />
    </div>
  )
}

export default CharacterCard