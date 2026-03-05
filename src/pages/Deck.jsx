import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import CharacterCard from '../components/CharacterCard'

const TEAM_SIZE = 5

function Deck() {
  const [user, setUser] = useState(null)
  const [deck, setDeck] = useState([])
  const [team, setTeam] = useState(Array(TEAM_SIZE).fill(null))
  const [loading, setLoading] = useState(true)
  const [savingSlot, setSavingSlot] = useState(null)
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchAll(u.id)
      else setLoading(false)
    })
  }, [])

  async function fetchAll(userId) {
    setLoading(true)

    const [{ data: deckData }, { data: teamData }] = await Promise.all([
      supabase
        .from('deck')
        .select('character_id, obtained_at, characters_with_likes(*)')
        .eq('user_id', userId)
        .order('obtained_at', { ascending: false }),
      supabase
        .from('team')
        .select('slot, character_id, characters_with_likes(*)')
        .eq('user_id', userId),
    ])

    setDeck(deckData || [])

    const teamArr = Array(TEAM_SIZE).fill(null)
    for (const entry of teamData || []) {
      teamArr[entry.slot - 1] = entry.characters_with_likes
    }
    setTeam(teamArr)
    setLoading(false)
  }

  async function toggleTeam(character) {
    if (!editMode) return

    const alreadyInSlot = team.findIndex(c => c?.id === character.id)

    if (alreadyInSlot !== -1) {
      const newTeam = [...team]
      newTeam[alreadyInSlot] = null
      setTeam(newTeam)
      setSavingSlot(alreadyInSlot)
      await supabase.from('team').delete()
        .eq('user_id', user.id)
        .eq('slot', alreadyInSlot + 1)
      setSavingSlot(null)
      return
    }

    const freeSlot = team.findIndex(c => c === null)
    if (freeSlot === -1) return

    const newTeam = [...team]
    newTeam[freeSlot] = character
    setTeam(newTeam)
    setSavingSlot(freeSlot)
    await supabase.from('team').upsert({
      user_id: user.id,
      slot: freeSlot + 1,
      character_id: character.id,
    }, { onConflict: 'user_id,slot' })
    setSavingSlot(null)
  }

  async function removeFromSlot(slotIndex) {
    if (!editMode) return
    const newTeam = [...team]
    newTeam[slotIndex] = null
    setTeam(newTeam)
    setSavingSlot(slotIndex)
    await supabase.from('team').delete()
      .eq('user_id', user.id)
      .eq('slot', slotIndex + 1)
    setSavingSlot(null)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#fbc059' }}>
            Connexion requise
          </h2>
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Connecte-toi avec Discord pour voir ton casier.
          </p>
        </div>
      </div>
    )
  }

  const teamCount = team.filter(Boolean).length
  const filtered = deck.filter(entry =>
    !search || entry.characters_with_likes?.rp_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── MON ÉQUIPE ─────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: '#ffffff', lineHeight: 1 }}>
              MON <span style={{ color: '#fbc059' }}>ÉQUIPE</span>
            </h1>
            <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {teamCount}/5 cartes
              {editMode && <span style={{ color: '#fbc059' }}> · Clique sur une carte de l'inventaire pour l'ajouter</span>}
            </p>
          </div>

          {/* Bouton édition / validation */}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all hover:opacity-90"
              style={{ background: 'rgba(251,192,89,0.1)', border: '1px solid rgba(251,192,89,0.3)', color: '#fbc059' }}
            >
              ✎ Modifier l'équipe
            </button>
          ) : (
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all hover:opacity-90"
              style={{ background: '#34D399', color: '#0a0a0a' }}
            >
              ✓ Valider l'équipe
            </button>
          )}
        </div>

        {/* 5 slots */}
        <div className="grid grid-cols-5 gap-3">
          {team.map((character, i) => (
            <div key={i} className="relative">
              {character ? (
                <div className="relative group">
                  <CharacterCard character={character} />
                  {/* Bouton retirer — visible seulement en mode édition */}
                  {editMode && (
                    <button
                      onClick={() => removeFromSlot(i)}
                      disabled={savingSlot === i}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'rgba(0,0,0,0.65)', zIndex: 10 }}
                    >
                      <span className="font-mono text-xs font-bold" style={{ color: '#FF2D55' }}>
                        {savingSlot === i ? '...' : '✕ Retirer'}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-2xl flex flex-col items-center justify-center"
                  style={{
                    aspectRatio: '3/4',
                    background: editMode ? 'rgba(251,192,89,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `2px dashed ${editMode ? 'rgba(251,192,89,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <span style={{ fontSize: '1.5rem', opacity: editMode ? 0.4 : 0.15, color: editMode ? '#fbc059' : '#fff' }}>+</span>
                  <span className="font-mono text-xs mt-1" style={{ color: editMode ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.12)' }}>
                    Slot {i + 1}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Séparateur */}
      <div className="mb-8" style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* ── INVENTAIRE ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: '#ffffff', lineHeight: 1 }}>
              INVENTAIRE
            </h2>
            <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {deck.length} carte{deck.length !== 1 ? 's' : ''} obtenue{deck.length !== 1 ? 's' : ''}
            </p>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une carte..."
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              outline: 'none',
              width: '220px',
            }}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
          </div>
        )}

        {!loading && deck.length === 0 && (
          <div className="flex flex-col items-center justify-center h-60 gap-4">
            <p className="font-mono text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Ton casier est vide.<br />Ouvre des packs pour obtenir des cartes !
            </p>
            <a
              href="/pack"
              className="px-8 py-3 rounded-xl font-mono text-sm font-bold transition-all duration-200 hover:opacity-90"
              style={{ background: '#fbc059', color: '#0a0a0a' }}
            >
              Ouvrir un pack →
            </a>
          </div>
        )}

        {!loading && deck.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(entry => {
              const character = entry.characters_with_likes
              const inTeam = team.some(c => c?.id === character?.id)

              return (
                <div
                  key={entry.character_id}
                  className="relative cursor-pointer group"
                  onClick={() => toggleTeam(character)}
                >
                  <CharacterCard character={character} />

                  {/* Badge "dans l'équipe" toujours visible */}
                  {inTeam && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: '2px solid rgba(52,211,153,0.5)', background: 'rgba(52,211,153,0.08)', zIndex: 10 }}>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.9)', color: '#0a0a0a' }}>
                          ✓ Dans l'équipe
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Badge "Ajouter" au hover en mode édition */}
                  {editMode && !inTeam && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 10 }}>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,192,89,0.9)', color: '#0a0a0a' }}>
                        + Ajouter
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default Deck