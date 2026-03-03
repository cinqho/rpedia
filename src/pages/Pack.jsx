import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import CharacterCard from '../components/CharacterCard'

function Booster({ server, selected, onClick, disabled }) {
  const isGeneral = server === 'general'
  const accent = isGeneral ? '#fbc059' : '#7c6fff'
  const label = isGeneral ? 'GÉNÉRAL' : server.toUpperCase()

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: '100%',
        aspectRatio: '2/3',
        borderRadius: 16,
        position: 'relative',
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
      {/* Fond glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, ${accent}22 0%, transparent 70%)`,
      }} />

      {/* Barre haut */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />

      {/* Barre bas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />

      {/* Badge PACK */}
      <div style={{
        position: 'absolute', top: 12, left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 10,
        letterSpacing: '0.3em',
        color: accent,
        background: `${accent}18`,
        border: `1px solid ${accent}44`,
        padding: '2px 8px',
        borderRadius: 4,
        whiteSpace: 'nowrap',
      }}>
        PACK
      </div>

      {/* Icône */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 48,
        filter: `drop-shadow(0 0 16px ${accent})`,
        lineHeight: 1,
      }}>
        {isGeneral ? '🌍' : '⚔️'}
      </div>

      {/* 3 cartes empilées */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 3,
      }}>
        {['-6deg', '0deg', '6deg'].map((rot, i) => (
          <div key={i} style={{
            width: 22, height: 32,
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
            border: `1px solid ${accent}55`,
            borderRadius: 3,
            transform: `rotate(${rot})`,
          }} />
        ))}
      </div>

      {/* Nom */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 14,
        letterSpacing: '0.2em',
        color: '#ffffff',
        whiteSpace: 'nowrap',
        textShadow: `0 0 10px ${accent}`,
      }}>
        {label}
      </div>

      {/* Sélection overlay */}
      {selected && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `${accent}08`,
          borderRadius: 14,
        }} />
      )}
    </div>
  )
}

function Pack() {
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState([])
  const [revealedCards, setRevealedCards] = useState([])
  const [phase, setPhase] = useState('idle') // idle | opening | done
  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchResources(u.id)
    })
    fetchServers()
  }, [])

  async function fetchServers() {
    const { data } = await supabase
      .from('characters')
      .select('server')
      .eq('status', 'approved')
    const unique = [...new Set((data || []).map(c => c.server).filter(Boolean))]
    setServers(unique)
  }

  async function fetchResources(userId) {
    const { data } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data) {
      setResources(data)
      return
    }

    const { data: newData } = await supabase
      .from('resources')
      .insert([{ user_id: userId, packs_available: 1 }])
      .select()
      .maybeSingle()

    setResources(newData)
  }

  async function openPack() {
    if (!user || !resources || resources.packs_available <= 0 || !selectedServer) return
    setLoading(true)

    const { data: deckData } = await supabase
      .from('deck')
      .select('character_id')
      .eq('user_id', user.id)

    const ownedIds = deckData?.map(d => d.character_id) || []

    let query = supabase
      .from('characters_with_likes')
      .select('*')
      .eq('status', 'approved')

    if (selectedServer !== 'general') {
      query = query.eq('server', selectedServer)
    }

    const { data: allChars } = await query
    const available = (allChars || []).filter(c => !ownedIds.includes(c.id))

    if (available.length < 3) {
      setLoading(false)
      return alert("Pas assez de personnages disponibles pour ouvrir ce pack !")
    }

    const picked = available.sort(() => Math.random() - 0.5).slice(0, 3)

    await supabase.from('deck').insert(
      picked.map(c => ({ user_id: user.id, character_id: c.id }))
    )

    await supabase
      .from('resources')
      .update({ packs_available: resources.packs_available - 1 })
      .eq('user_id', user.id)

    setCards(picked)
    setRevealedCards([])
    setResources(prev => ({ ...prev, packs_available: prev.packs_available - 1 }))
    setPhase('opening')

    picked.forEach((_, i) => {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, i])
        if (i === picked.length - 1) setPhase('done')
      }, i * 700)
    })

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#fbc059' }}>
            Connexion requise
          </h2>
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Connecte-toi avec Discord pour ouvrir des packs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', letterSpacing: '0.05em', color: '#ffffff' }}>
            PACKS <span style={{ color: '#fbc059' }}>DISPONIBLES</span>
          </h1>
          <p className="font-mono text-xs tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Sélectionne un pack et ouvre-le pour obtenir 3 cartes.
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="font-mono text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>PACKS RESTANTS</p>
          <p className="font-bold" style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2.5rem',
            color: resources?.packs_available > 0 ? '#fbc059' : '#FF2D55',
            lineHeight: 1,
          }}>
            {resources?.packs_available ?? 0}
          </p>
        </div>
      </div>

      {/* Grille de packs */}
      {phase === 'idle' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">

            {/* Pack général */}
            <Booster
              server="general"
              selected={selectedServer === 'general'}
              onClick={() => setSelectedServer('general')}
              disabled={resources?.packs_available <= 0}
            />

            {/* Packs par serveur */}
            {servers.map(s => (
              <Booster
                key={s}
                server={s}
                selected={selectedServer === s}
                onClick={() => setSelectedServer(s)}
                disabled={resources?.packs_available <= 0}
              />
            ))}

          </div>

          {/* Bouton ouvrir */}
          {selectedServer && (
            <div className="flex justify-center mt-4">
              <button
                onClick={openPack}
                disabled={loading || !resources || resources.packs_available <= 0}
                className="px-12 py-4 rounded-2xl font-mono font-bold tracking-widest uppercase text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#fbc059', color: '#0a0a0a' }}
              >
                {loading ? 'Ouverture...' : `Ouvrir le pack ${selectedServer === 'general' ? 'Général' : selectedServer}`}
              </button>
            </div>
          )}

          {!selectedServer && (
            <p className="text-center font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sélectionne un pack pour continuer
            </p>
          )}
        </>
      )}

      {/* Révélation des cartes */}
      {(phase === 'opening' || phase === 'done') && (
        <div className="flex flex-col items-center gap-8">
          <p className="font-mono text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {phase === 'done' ? '✨ Cartes obtenues !' : 'Révélation en cours...'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            {cards.map((card, i) => (
              <div
                key={card.id}
                style={{
                  opacity: revealedCards.includes(i) ? 1 : 0,
                  transform: revealedCards.includes(i) ? 'translateY(0)' : 'translateY(16px)',
                  transition: 'all 0.4s ease',
                }}
              >
                <CharacterCard character={card} />
              </div>
            ))}
          </div>

          {phase === 'done' && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => { setPhase('idle'); setCards([]); setSelectedServer(null) }}
                className="px-8 py-3 rounded-xl font-mono text-sm transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                Ouvrir un autre pack
              </button>
              <a
                href="/deck"
                className="px-8 py-3 rounded-xl font-mono text-sm font-bold transition-all duration-200 hover:opacity-90"
                style={{ background: '#fbc059', color: '#0a0a0a' }}
              >
                Voir mon deck →
              </a>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default Pack