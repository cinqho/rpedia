import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import CharacterCard from '../components/CharacterCard'
import CharacterModal from '../components/CharacterModal'

const TEAM_SIZE = 5

const RARITY_ORDER = [
  'NORMAL', 'VETERAN', 'ELITE', 'EPIQUE', 'LEGENDAIRE', 'ANCESTRAL', 'ICONE',
]

const RARITY_LABELS = {
  NORMAL: 'NORMAL', VETERAN: 'VÉTÉRAN', ELITE: 'ÉLITE',
  EPIQUE: 'ÉPIQUE', LEGENDAIRE: 'LÉGENDAIRE', ANCESTRAL: 'ANCESTRAL', ICONE: 'ICÔNE',
}

const RARITY_COLORS = {
  NORMAL: '#9CA3AF', VETERAN: '#34D399', ELITE: '#38BDF8',
  EPIQUE: '#A855F7', LEGENDAIRE: '#0205bf', ANCESTRAL: '#FFF9C4', ICONE: '#FF1A1A',
}

// 10 cartes d'une rareté → 1 carte de la rareté suivante (SECRET ignoré)
const RECYCLE_COST = 10
const RECYCLE_CHAIN = ['NORMAL', 'VETERAN', 'ELITE', 'EPIQUE', 'LEGENDAIRE', 'ANCESTRAL', 'ICONE']

function normalizeRarity(r) {
  return RARITY_ORDER.includes(r) ? r : 'NORMAL'
}

// ─── Onglet Recycleur ─────────────────────────────────────────────────────────
function RecyclerTab({ deck, user, onRecycled }) {
  const [selectedRarity, setSelectedRarity] = useState(null)
  const [recycling, setRecycling] = useState(false)
  const [result, setResult] = useState(null) // carte obtenue
  const [error, setError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Compter uniquement les DOUBLONS par rareté (on garde 1 exemplaire de base)
  // Trier ASC (plus ancien en premier) = même logique que doRecycle
  const deckAsc = [...deck].sort((a, b) => new Date(a.obtained_at) - new Date(b.obtained_at))
  const countByRarity = {}
  const seenOnce = {}
  for (const entry of deckAsc) {
    const r = normalizeRarity(entry.characters_with_likes?.rarity)
    if (r === 'SECRET') continue
    const cid = entry.character_id
    if (!seenOnce[cid]) { seenOnce[cid] = true; continue } // 1er exemplaire protégé
    countByRarity[r] = (countByRarity[r] || 0) + 1
  }

  // Raretés recyclables (pas la dernière de la chaîne)
  const recyclableRarities = RECYCLE_CHAIN.slice(0, -1)

  function getNextRarity(r) {
    const idx = RECYCLE_CHAIN.indexOf(r)
    return RECYCLE_CHAIN[idx + 1] || null
  }

  async function doRecycle() {
    if (!selectedRarity || !user) return
    setRecycling(true)
    setError(null)
    setResult(null)

    const nextRarity = getNextRarity(selectedRarity)
    if (!nextRarity) return

    // Récupérer les entrées deck de cette rareté (IDs de lignes)
    const { data: deckRows } = await supabase
      .from('deck')
      .select('id, character_id, characters_with_likes(rarity)')
      .eq('user_id', user.id)
      .order('obtained_at', { ascending: true })
      .limit(500)

    // Filtrer par rareté exacte (en excluant SECRET)
    const matching = (deckRows || []).filter(row => {
      const r = normalizeRarity(row.characters_with_likes?.rarity)
      return r === selectedRarity
    })

    // Exclure 1 exemplaire par character_id (carte de base protégée)
    const seenBase = {}
    const recyclable = matching.filter(row => {
      if (!seenBase[row.character_id]) { seenBase[row.character_id] = true; return false }
      return true
    })

    if (recyclable.length < RECYCLE_COST) {
      setError(`Pas assez de doublons ${RARITY_LABELS[selectedRarity]} (${recyclable.length}/${RECYCLE_COST})`)
      setRecycling(false)
      setConfirmOpen(false)
      return
    }

    // Supprimer les 10 premières lignes doublons
    const toDelete = recyclable.slice(0, RECYCLE_COST).map(r => r.id)
    const { error: delErr } = await supabase
      .from('deck')
      .delete()
      .in('id', toDelete)

    if (delErr) {
      setError('Erreur lors du recyclage : ' + delErr.message)
      setRecycling(false)
      setConfirmOpen(false)
      return
    }

    // Tirer une carte random de la rareté suivante parmi les approuvées
    const { data: wonArr, error: rpcErr } = await supabase
      .rpc('get_random_card', { p_rarity: nextRarity })

    if (rpcErr || !wonArr || wonArr.length === 0) {
      setError(`Aucune carte ${RARITY_LABELS[nextRarity]} disponible pour le moment.`)
      setRecycling(false)
      setConfirmOpen(false)
      return
    }

    const won = wonArr[0]

    // Insérer dans le deck
    await supabase.from('deck').insert({
      user_id: user.id,
      character_id: won.id,
      obtained_at: new Date().toISOString(),
    })

    setResult({ card: won, fromRarity: selectedRarity, toRarity: nextRarity })
    setConfirmOpen(false)
    setRecycling(false)
    onRecycled() // refresh du deck parent
  }

  const selColor = selectedRarity ? RARITY_COLORS[selectedRarity] : '#fbc059'
  const nextRarity = selectedRarity ? getNextRarity(selectedRarity) : null
  const nextColor = nextRarity ? RARITY_COLORS[nextRarity] : null
  const available = selectedRarity ? (countByRarity[selectedRarity] || 0) : 0
  const canRecycle = available >= RECYCLE_COST

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">

      {/* Titre + explication */}
      <div>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: '#ffffff', lineHeight: 1 }}>
          ♻ <span style={{ color: '#fbc059' }}>RECYCLEUR</span>
        </h2>
        <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Transforme 10 cartes d'une même rareté en 1 carte de rareté supérieure (aléatoire). Les cartes SECRET ne sont pas recyclables.
        </p>
      </div>

      {/* Grille des raretés recyclables */}
      <div>
        <p className="font-mono text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
          CHOISIR UNE RARETÉ À RECYCLER
        </p>
        <div className="grid grid-cols-3 gap-3">
          {recyclableRarities.map(rarity => {
            const count = countByRarity[rarity] || 0
            const color = RARITY_COLORS[rarity]
            const next = getNextRarity(rarity)
            const nextCol = RARITY_COLORS[next]
            const enough = count >= RECYCLE_COST
            const isSelected = selectedRarity === rarity

            return (
              <button
                key={rarity}
                onClick={() => { setSelectedRarity(isSelected ? null : rarity); setResult(null); setError(null); setConfirmOpen(false) }}
                disabled={count === 0}
                className="flex flex-col gap-2 p-3 rounded-xl transition-all duration-200 text-left"
                style={{
                  background: isSelected ? `${color}18` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`,
                  opacity: count === 0 ? 0.35 : 1,
                  cursor: count === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: isSelected ? `0 0 16px ${color}22` : 'none',
                }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold" style={{ color, fontSize: '0.6rem', letterSpacing: '0.08em' }}>
                    {RARITY_LABELS[rarity]}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{
                    color: enough ? '#34D399' : 'rgba(255,255,255,0.4)',
                    fontSize: '0.7rem',
                  }}>
                    {count}
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (count / RECYCLE_COST) * 100)}%`,
                    background: enough ? '#34D399' : color,
                    borderRadius: 999,
                    transition: 'width 0.3s',
                  }} />
                </div>

                <div className="flex items-center gap-1">
                  <span className="font-mono" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.55rem' }}>
                    {count}/{RECYCLE_COST} →
                  </span>
                  <span className="font-mono font-bold" style={{ color: nextCol, fontSize: '0.55rem' }}>
                    1 {RARITY_LABELS[next]}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel de confirmation */}
      {selectedRarity && (
        <div className="p-4 rounded-xl" style={{
          background: `${selColor}08`,
          border: `1px solid ${selColor}30`,
        }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-mono text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Échange :</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold" style={{ color: selColor, fontSize: '0.85rem' }}>
                  ×{RECYCLE_COST} {RARITY_LABELS[selectedRarity]}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                <span className="font-mono font-bold" style={{ color: nextColor, fontSize: '0.85rem' }}>
                  ×1 {RARITY_LABELS[nextRarity]}
                </span>
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>(aléatoire)</span>
              </div>
              <p className="font-mono text-xs mt-1" style={{ color: canRecycle ? '#34D399' : '#FF2D55' }}>
                {canRecycle
                  ? `✓ Tu as ${available} cartes disponibles`
                  : `✗ Il te manque ${RECYCLE_COST - available} carte${RECYCLE_COST - available > 1 ? 's' : ''}`}
              </p>
            </div>

            {!confirmOpen ? (
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!canRecycle}
                className="px-6 py-2 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-30"
                style={{ background: '#fbc059', color: '#0a0a0a', whiteSpace: 'nowrap' }}>
                Recycler
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirmer ?</span>
                <button onClick={doRecycle} disabled={recycling}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#34D399', color: '#0a0a0a' }}>
                  {recycling ? '...' : '✓ Oui'}
                </button>
                <button onClick={() => setConfirmOpen(false)}
                  className="px-3 py-2 rounded-xl font-mono text-xs transition-all hover:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  Annuler
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="font-mono text-xs mt-3" style={{ color: '#FF2D55' }}>{error}</p>
          )}
        </div>
      )}

      {/* Résultat du recyclage */}
      {result && (
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl" style={{
          background: `${RARITY_COLORS[result.toRarity]}08`,
          border: `1px solid ${RARITY_COLORS[result.toRarity]}30`,
        }}>
          <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ✓ Recyclage réussi ! Tu as obtenu :
          </p>
          <div style={{ width: 140 }}>
            <CharacterCard character={result.card} />
          </div>
          <div className="text-center">
            <p className="font-mono font-bold" style={{ color: RARITY_COLORS[result.toRarity], fontSize: '1rem' }}>
              {result.card.rp_name}
            </p>
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {RARITY_LABELS[result.toRarity]}
            </p>
          </div>
          <button
            onClick={() => { setResult(null); setSelectedRarity(null) }}
            className="px-5 py-2 rounded-xl font-mono text-xs font-bold transition-all hover:opacity-90"
            style={{ background: '#fbc059', color: '#0a0a0a' }}>
            Recycler encore
          </button>
        </div>
      )}

      {/* Tableau récap */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-xs font-bold mb-3" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
          TABLE DE RECYCLAGE
        </p>
        <div className="flex flex-col gap-1.5">
          {recyclableRarities.map(r => {
            const next = getNextRarity(r)
            const c1 = RARITY_COLORS[r]
            const c2 = RARITY_COLORS[next]
            return (
              <div key={r} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="font-mono font-bold" style={{ color: c1, fontSize: '0.65rem', minWidth: 80 }}>
                  ×{RECYCLE_COST} {RARITY_LABELS[r]}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>→</span>
                <span className="font-mono font-bold" style={{ color: c2, fontSize: '0.65rem' }}>
                  ×1 {RARITY_LABELS[next]}
                </span>
                <span className="ml-auto font-mono text-xs" style={{ color: countByRarity[r] >= RECYCLE_COST ? '#34D399' : 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}>
                  {countByRarity[r] || 0} dispo
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Page Deck ────────────────────────────────────────────────────────────────
function Deck() {
  const [user, setUser] = useState(null)
  const [deck, setDeck] = useState([])
  const [grouped, setGrouped] = useState([])
  const [team, setTeam] = useState(Array(TEAM_SIZE).fill(null))
  const [loading, setLoading] = useState(true)
  const [savingSlot, setSavingSlot] = useState(null)
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [raritySort, setRaritySort] = useState(null)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [activeTab, setActiveTab] = useState('inventaire') // 'inventaire' | 'recycleur'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchAll(u.id)
      else setLoading(false)
    })
  }, [])

  function buildGrouped(deckData) {
    const map = {}
    for (const entry of deckData) {
      const id = entry.character_id
      if (!map[id]) map[id] = { ...entry, count: 1 }
      else map[id].count += 1
    }
    return Object.values(map)
  }

  async function fetchAll(userId) {
    setLoading(true)
    const [{ data: deckData }, { data: teamData }] = await Promise.all([
      supabase
        .from('deck')
        .select('id, character_id, obtained_at, characters_with_likes(*)')
        .eq('user_id', userId)
        .order('obtained_at', { ascending: false }),
      supabase
        .from('team')
        .select('slot, character_id, characters_with_likes(*)')
        .eq('user_id', userId),
    ])

    const cleaned = (deckData || []).filter(e => e.characters_with_likes !== null)
    setDeck(cleaned)
    setGrouped(buildGrouped(cleaned))

    const teamArr = Array(TEAM_SIZE).fill(null)
    for (const entry of teamData || []) teamArr[entry.slot - 1] = entry.characters_with_likes
    setTeam(teamArr)
    setLoading(false)
  }

  async function toggleTeam(character) {
    const alreadyInSlot = team.findIndex(c => c?.id === character.id)
    if (alreadyInSlot !== -1) {
      const newTeam = [...team]
      newTeam[alreadyInSlot] = null
      setTeam(newTeam)
      setSavingSlot(alreadyInSlot)
      await supabase.from('team').delete().eq('user_id', user.id).eq('slot', alreadyInSlot + 1)
      setSavingSlot(null)
      return
    }
    const freeSlot = team.findIndex(c => c === null)
    if (freeSlot === -1) return
    const newTeam = [...team]
    newTeam[freeSlot] = character
    setTeam(newTeam)
    setSavingSlot(freeSlot)
    await supabase.from('team').upsert({ user_id: user.id, slot: freeSlot + 1, character_id: character.id }, { onConflict: 'user_id,slot' })
    setSavingSlot(null)
  }

  async function removeFromSlot(slotIndex) {
    if (!editMode) return
    const newTeam = [...team]
    newTeam[slotIndex] = null
    setTeam(newTeam)
    setSavingSlot(slotIndex)
    await supabase.from('team').delete().eq('user_id', user.id).eq('slot', slotIndex + 1)
    setSavingSlot(null)
  }

  function cycleSort() {
    setRaritySort(prev => prev === null ? 'desc' : prev === 'desc' ? 'asc' : null)
  }

  function handleCardClick(character) {
    if (editMode) toggleTeam(character)
    else setSelectedCharacter(character)
  }

  if (!user) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-4xl mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#fbc059' }}>Connexion requise</h2>
        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connecte-toi avec Discord pour voir ton casier.</p>
      </div>
    </div>
  )

  const teamCount = team.filter(Boolean).length
  const uniqueCount = grouped.length
  const totalCount = deck.length
  const doublesCount = totalCount - uniqueCount

  let filtered = grouped.filter(entry =>
    !search || entry.characters_with_likes?.rp_name?.toLowerCase().includes(search.toLowerCase())
  )
  if (raritySort !== null) {
    filtered = [...filtered].sort((a, b) => {
      const ri = RARITY_ORDER.indexOf(normalizeRarity(a.characters_with_likes?.rarity))
      const rj = RARITY_ORDER.indexOf(normalizeRarity(b.characters_with_likes?.rarity))
      return raritySort === 'desc' ? rj - ri : ri - rj
    })
  }

  const sortLabel = raritySort === null ? 'Rareté' : raritySort === 'desc' ? 'Rareté ↓' : 'Rareté ↑'
  const sortActive = raritySort !== null

  // Compter les recyclables dispo
  const recyclableCount = deck.filter(e => {
    const r = normalizeRarity(e.characters_with_likes?.rarity)
    return r !== 'SECRET' && RECYCLE_CHAIN.slice(0, -1).includes(r)
  }).length

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <CharacterModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />

      {/* ── MON ÉQUIPE ── */}
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
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all hover:opacity-90"
              style={{ background: 'rgba(251,192,89,0.1)', border: '1px solid rgba(251,192,89,0.3)', color: '#fbc059' }}>
              ✎ Modifier l'équipe
            </button>
          ) : (
            <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all hover:opacity-90"
              style={{ background: '#34D399', color: '#0a0a0a' }}>
              ✓ Valider l'équipe
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3">
          {team.map((character, i) => (
            <div key={i} className="relative">
              {character ? (
                <div className="relative group">
                  <div onClick={() => !editMode && setSelectedCharacter(character)} style={{ cursor: editMode ? 'default' : 'pointer' }}>
                    <CharacterCard character={character} />
                  </div>
                  {editMode && (
                    <button onClick={() => removeFromSlot(i)} disabled={savingSlot === i}
                      className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: 'rgba(0,0,0,0.65)', zIndex: 10 }}>
                      <span className="font-mono text-xs font-bold" style={{ color: '#FF2D55' }}>
                        {savingSlot === i ? '...' : '✕ Retirer'}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl flex flex-col items-center justify-center"
                  style={{ aspectRatio: '3/4', background: editMode ? 'rgba(251,192,89,0.04)' : 'rgba(255,255,255,0.02)', border: `2px dashed ${editMode ? 'rgba(251,192,89,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                  <span style={{ fontSize: '1.5rem', opacity: editMode ? 0.4 : 0.15, color: editMode ? '#fbc059' : '#fff' }}>+</span>
                  <span className="font-mono text-xs mt-1" style={{ color: editMode ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.12)' }}>Slot {i + 1}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6" style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />

      {/* ── ONGLETS ── */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('inventaire')}
          className="px-5 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200"
          style={{
            background: activeTab === 'inventaire' ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeTab === 'inventaire' ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: activeTab === 'inventaire' ? '#fbc059' : 'rgba(255,255,255,0.4)',
          }}>
          🃏 Inventaire
          {uniqueCount > 0 && (
            <span className="ml-2 font-mono text-xs" style={{ color: activeTab === 'inventaire' ? '#fbc059' : 'rgba(255,255,255,0.25)' }}>
              {uniqueCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recycleur')}
          className="px-5 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200 relative"
          style={{
            background: activeTab === 'recycleur' ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeTab === 'recycleur' ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.08)'}`,
            color: activeTab === 'recycleur' ? '#34D399' : 'rgba(255,255,255,0.4)',
          }}>
          ♻ Recycleur
          {doublesCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full font-mono text-xs font-bold"
              style={{ background: '#fbc059', color: '#0a0a0a', fontSize: '0.6rem' }}>
              {doublesCount}
            </span>
          )}
        </button>
      </div>

      {/* ── INVENTAIRE ── */}
      {activeTab === 'inventaire' && (
        <div>
          <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {uniqueCount} carte{uniqueCount !== 1 ? 's' : ''} unique{uniqueCount !== 1 ? 's' : ''}
              {doublesCount > 0 && (
                <span style={{ color: '#fbc059' }}> · {doublesCount} doublon{doublesCount > 1 ? 's' : ''}</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={cycleSort}
                className="px-3 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200 hover:opacity-90"
                style={{
                  background: sortActive ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${sortActive ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: sortActive ? '#fbc059' : 'rgba(255,255,255,0.4)',
                }}>
                {sortLabel}
              </button>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une carte..."
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff', padding: '8px 14px', borderRadius: '10px',
                  fontSize: '0.8rem', fontFamily: 'monospace', outline: 'none', width: '220px',
                }}
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-40">
              <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
            </div>
          )}

          {!loading && grouped.length === 0 && (
            <div className="flex flex-col items-center justify-center h-60 gap-4">
              <p className="font-mono text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Ton casier est vide.<br />Ouvre des packs pour obtenir des cartes !
              </p>
              <a href="/pack" className="px-8 py-3 rounded-xl font-mono text-sm font-bold transition-all duration-200 hover:opacity-90"
                style={{ background: '#fbc059', color: '#0a0a0a' }}>
                Ouvrir un pack →
              </a>
            </div>
          )}

          {!loading && grouped.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(entry => {
                const character = entry.characters_with_likes
                if (!character) return null
                const inTeam = team.some(c => c?.id === character?.id)
                const count = entry.count || 1
                return (
                  <div key={entry.character_id} className="relative cursor-pointer group" style={{ overflow: 'visible' }}
                    onClick={() => handleCardClick(character)}>
                    <CharacterCard character={character} />

                    {/* Badge doublons */}
                    {count > 1 && (
                      <div className="absolute z-20 flex items-center justify-center"
                        style={{
                          top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                          minWidth: 22, height: 22, borderRadius: 999,
                          background: '#fbc059', color: '#0a0a0a',
                          fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 'bold',
                          padding: '0 6px', boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}>
                        ×{count}
                      </div>
                    )}

                    {inTeam && (
                      <div className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ border: '2px solid rgba(52,211,153,0.5)', background: 'rgba(52,211,153,0.08)', zIndex: 10 }}>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(52,211,153,0.9)', color: '#0a0a0a' }}>✓ Dans l'équipe</span>
                        </div>
                      </div>
                    )}
                    {editMode && !inTeam && (
                      <div className="absolute inset-0 rounded-2xl pointer-events-none flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ zIndex: 10 }}>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(251,192,89,0.9)', color: '#0a0a0a' }}>+ Ajouter</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── RECYCLEUR ── */}
      {activeTab === 'recycleur' && (
        <RecyclerTab deck={deck} user={user} onRecycled={() => fetchAll(user.id)} />
      )}
    </div>
  )
}

export default Deck