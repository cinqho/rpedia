import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import CharacterCard, { rollRarity, rarities, RARITY_WEIGHTS } from '../components/CharacterCard'

// 🔧 MAINTENANCE — mettre à true pour désactiver les packs
const PACKS_DISABLED = false

function DropRates() {
  const [open, setOpen] = useState(false)

  const totalWeight = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0)

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="font-mono text-xs tracking-widest flex items-center gap-2 transition-all duration-200 hover:opacity-80"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <span style={{ color: '#fbc059' }}>{open ? '▼' : '▶'}</span>
        TAUX DE DROP
      </button>

      {open && (
        <div className="mt-3 rounded-xl p-4 max-h-80 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col gap-3">
            {RARITY_WEIGHTS.map(({ rarity, weight }) => {
              const r = rarities[rarity]
              const percentage = ((weight / totalWeight) * 100).toFixed(weight < 1 ? 2 : 1)
              const barWidth = Math.max(2, (weight / totalWeight) * 100)
              return (
                <div key={rarity} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] w-36 flex-shrink-0 truncate" style={{ color: r?.color || '#9CA3AF' }}>
                    {r?.label || rarity}
                  </span>
                  <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, background: r?.color || '#9CA3AF', opacity: 0.7 }} />
                  </div>
                  <span className="font-mono text-[10px] w-12 text-right flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function HowToGetPacks() {
  return (
    <div className="mt-6 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>COMMENT OBTENIR DES PACKS ?</p>
      <div className="flex flex-col gap-3">

        {/* Connexion quotidienne */}
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>📅</span>
          <div>
            <p className="font-mono text-xs font-bold" style={{ color: '#fbc059' }}>Connexion quotidienne</p>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              Connecte-toi chaque jour sur RPédia pour recevoir automatiquement des packs gratuits.
            </p>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

        {/* Discord */}
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '1.1rem', lineHeight: 1.2 }}>💬</span>
          <div>
            <p className="font-mono text-xs font-bold" style={{ color: '#7c6fff' }}>Autres moyens à venir</p>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              Des événements et récompenses supplémentaires seront annoncés sur le Discord.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

function Booster({ server, selected, onClick, disabled }) {
  const isGeneral = server === 'general'
  const accent = isGeneral ? '#fbc059' : '#7c6fff'
  const label = isGeneral ? 'GÉNÉRAL' : server.toUpperCase()

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: '100%', aspectRatio: '2/3', borderRadius: 16, position: 'relative',
        overflow: 'hidden',
        boxShadow: selected ? `0 0 30px ${accent}88` : `0 0 10px ${accent}22`,
        border: `2px solid ${selected ? accent : accent + '44'}`,
        background: `linear-gradient(160deg, #1a1a2e 0%, #0f0f1a 40%, #1a1a2e 100%)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${accent}22 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 10, letterSpacing: '0.3em', color: accent, background: `${accent}18`, border: `1px solid ${accent}44`, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>PACK</div>
      <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 48, filter: `drop-shadow(0 0 16px ${accent})`, lineHeight: 1 }}>
        {isGeneral ? '🌍' : '⚔️'}
      </div>
      <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3 }}>
        {['-6deg', '0deg', '6deg'].map((rot, i) => (
          <div key={i} style={{ width: 22, height: 32, background: `linear-gradient(135deg, ${accent}33, ${accent}11)`, border: `1px solid ${accent}55`, borderRadius: 3, transform: `rotate(${rot})` }} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: '0.2em', color: '#ffffff', whiteSpace: 'nowrap', textShadow: `0 0 10px ${accent}` }}>{label}</div>
      {selected && <div style={{ position: 'absolute', inset: 0, background: `${accent}08`, borderRadius: 14 }} />}
    </div>
  )
}

function Pack() {
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState([])
  const [revealedCards, setRevealedCards] = useState([])
  const [phase, setPhase] = useState('idle')
  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [dailyClaimed, setDailyClaimed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchResources(u.id)
    })
    fetchServers()
  }, [])

  async function fetchServers() {
    const { data } = await supabase.from('characters').select('server').eq('status', 'approved')
    const unique = [...new Set((data || []).map(c => c.server).filter(Boolean))]
    setServers(unique)
  }

  async function fetchResources(userId) {
    const { data } = await supabase.from('resources').select('*').eq('user_id', userId).maybeSingle()
    if (data) {
      setResources(data)
    } else {
      const { data: newData } = await supabase.from('resources').insert([{ user_id: userId, packs_available: 1 }]).select().maybeSingle()
      setResources(newData)
    }

    // Réclame les packs quotidiens automatiquement
    const { data: daily } = await supabase.rpc('claim_daily_packs', { p_user_id: userId })
    if (daily?.claimed) {
      setResources(prev => ({ ...prev, packs_available: daily.packs_available }))
      setDailyClaimed(true)
    }
  }

  async function openPackFor(server) {
    if (!user || !resources || resources.packs_available <= 0 || !server) return
    setLoading(true)

    const { data, error } = await supabase.rpc('open_pack', {
      p_user_id: user.id,
      p_server:  server,
    })

    if (error || data?.error) {
      setLoading(false)
      const msg = data?.message || error?.message || 'Erreur inconnue'
      if (data?.error === 'no_packs')      return alert('Tu n\'as plus de packs !')
      if (data?.error === 'no_characters') return alert('Aucun personnage disponible sur ce serveur.')
      return alert(`Erreur : ${msg}`)
    }

    const picked = data.cards
    const packsRemaining = data.packs_remaining

    setCards(picked)
    setRevealedCards([])
    setResources(prev => ({ ...prev, packs_available: packsRemaining }))
    setPhase('opening')

    picked.forEach((_, i) => {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, i])
        if (i === picked.length - 1) setPhase('done')
      }, i * 800)
    })
    setLoading(false)
  }

  if (!user) return (
    <div className="p-8 text-center text-white/40 font-mono text-sm">
      Connecte-toi pour ouvrir des packs.
    </div>
  )

  // 🔧 PAGE DE MAINTENANCE
  if (PACKS_DISABLED) {
    return (
      <div className="p-8 flex flex-col items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-center max-w-md">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: '#fbc059', letterSpacing: '0.05em' }}>
            MAINTENANCE
          </h1>
          <p className="font-mono text-sm mt-3" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
            Les packs sont temporairement désactivés.<br />
            Une mise à jour des raretés est en cours.<br />
            Reviens très bientôt !
          </p>
          <div className="mt-6 px-4 py-2 rounded-xl font-mono text-xs" style={{ background: 'rgba(251,192,89,0.06)', border: '1px solid rgba(251,192,89,0.15)', color: 'rgba(251,192,89,0.5)' }}>
            Tes packs actuels sont conservés et ne seront pas perdus.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', color: '#ffffff' }}>
            PACKS <span style={{ color: '#fbc059' }}>DISPONIBLES</span>
          </h1>
          <p className="font-mono text-xs text-white/30">Ouvre un pack pour obtenir 3 cartes.</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-white/30">RESTANTS</p>
          <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: resources?.packs_available > 0 ? '#fbc059' : '#FF2D55', lineHeight: 1 }}>
            {resources?.packs_available ?? 0}
          </p>
        </div>
      </div>

      {dailyClaimed && (
        <div className="mb-6 px-4 py-3 rounded-xl font-mono text-xs flex items-center gap-3"
          style={{ background: 'rgba(251,192,89,0.08)', border: '1px solid rgba(251,192,89,0.2)', color: '#fbc059' }}>
          <span style={{ fontSize: '1.2rem' }}>🎁</span>
          <span>Packs quotidiens réclamés ! Reviens demain pour en obtenir d'autres.</span>
        </div>
      )}

      {phase === 'idle' && (
        <>
          <HowToGetPacks />
          <DropRates />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8 mb-8">
            <Booster server="general" selected={selectedServer === 'general'} onClick={() => { setSelectedServer('general'); openPackFor('general') }} disabled={resources?.packs_available <= 0 || loading} />
            {servers.map(s => (
              <Booster key={s} server={s} selected={selectedServer === s} onClick={() => { setSelectedServer(s); openPackFor(s) }} disabled={resources?.packs_available <= 0 || loading} />
            ))}
          </div>
        </>
      )}

      {(phase === 'opening' || phase === 'done') && (
        <div className="flex flex-col items-center gap-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {cards.map((card, i) => (
              <div key={i} style={{ opacity: revealedCards.includes(i) ? 1 : 0, transform: revealedCards.includes(i) ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)', transition: 'all 0.5s ease' }}>
                <CharacterCard character={card} />
              </div>
            ))}
          </div>
          {phase === 'done' && (
            <button
              onClick={() => { setPhase('idle'); setCards([]); setSelectedServer(null) }}
              className="px-8 py-3 rounded-xl font-mono text-xs transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
            >
              RETOUR
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Pack