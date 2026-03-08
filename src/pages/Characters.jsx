import { useState, useEffect, useRef, useCallback } from 'react'
import CharacterCard from '../components/CharacterCard'
import CharacterModal from '../components/CharacterModal'
import { useCharacters } from '../context/CharactersContext'

const universes = ['Tous', 'Naruto', 'One Piece', 'Bleach', 'Dragon Ball', 'Autre']

const RARITY_ORDER = [
  'NORMAL', 'VETERAN', 'ELITE', 'EPIQUE', 'LEGENDAIRE', 'ANCESTRAL', 'ICONE',
]

const PAGE_SIZE = 20

function Characters() {
  const { characters, loading } = useCharacters()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [universeFilter, setUniverseFilter] = useState('Tous')
  const [serverFilter, setServerFilter] = useState('')
  const [raritySort, setRaritySort] = useState(null)
  const [page, setPage] = useState(1)

  const observerRef = useRef(null)

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1)
  }, [search, universeFilter, serverFilter, raritySort])

  function cycleSort() {
    setRaritySort(prev => prev === null ? 'desc' : prev === 'desc' ? 'asc' : null)
  }

  const servers = ['Tous', ...new Set(characters.map(c => c.server).filter(Boolean))]

  function normalizeRarity(r) {
    return RARITY_ORDER.includes(r) ? r : 'NORMAL'
  }

  let filtered = characters
    .filter(c => c.rarity !== 'SECRET')
    .filter(c => {
      const matchSearch = c.rp_name.toLowerCase().includes(search.toLowerCase()) || (c.player && c.player.toLowerCase().includes(search.toLowerCase()))
      const matchUniverse = universeFilter === 'Tous' || c.universe === universeFilter
      const matchServer = serverFilter === '' || serverFilter === 'Tous' || c.server === serverFilter
      return matchSearch && matchUniverse && matchServer
    })

  if (raritySort !== null) {
    filtered = [...filtered].sort((a, b) => {
      const ri = RARITY_ORDER.indexOf(normalizeRarity(a.rarity))
      const rj = RARITY_ORDER.indexOf(normalizeRarity(b.rarity))
      return raritySort === 'desc' ? rj - ri : ri - rj
    })
  }

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  // Infinite scroll via IntersectionObserver
  const handleSentinel = useCallback(node => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1)
      }
    }, { rootMargin: '200px' })
    observerRef.current.observe(node)
  }, [hasMore])

  const sortLabel = raritySort === null ? 'Rareté' : raritySort === 'desc' ? 'Rareté ↓' : 'Rareté ↑'
  const sortActive = raritySort !== null

  return (
    <div className="p-8">

      <div className="mb-6">
        <h1 className="text-white mb-1" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', letterSpacing: '0.05em' }}>
          PERSON<span style={{ color: '#fbc059' }}>NAGES</span>
        </h1>
        <p className="text-xs font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {filtered.length} personnage{filtered.length > 1 ? 's' : ''} archivé{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un personnage / joueur..."
          className="flex-1 px-4 py-3 rounded-xl text-sm font-mono outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}
        />
        <button
          onClick={cycleSort}
          className="px-4 py-3 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200 hover:opacity-90 whitespace-nowrap"
          style={{
            background: sortActive ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${sortActive ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.08)'}`,
            color: sortActive ? '#fbc059' : 'rgba(255,255,255,0.4)',
          }}
        >
          {sortLabel}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {universes.map(u => (
          <button key={u} onClick={() => setUniverseFilter(u)}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: universeFilter === u ? '#fbc059' : 'rgba(255,255,255,0.04)',
              color: universeFilter === u ? '#0a0a0a' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${universeFilter === u ? '#fbc059' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {u}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {servers.map(s => (
          <button key={s} onClick={() => setServerFilter(s)}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: serverFilter === s ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              color: serverFilter === s ? '#ffffff' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${serverFilter === s ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm animate-pulse" style={{ color: '#fbc059' }}>Chargement...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Aucun personnage trouvé.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {visible.map(character => (
              <div key={character.id} onClick={() => setSelected(character)} className="cursor-pointer">
                <CharacterCard character={character} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div ref={handleSentinel} className="flex justify-center py-8">
              <p className="font-mono text-xs animate-pulse" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Chargement...
              </p>
            </div>
          )}

          {!hasMore && filtered.length > PAGE_SIZE && (
            <p className="text-center font-mono text-xs mt-8" style={{ color: 'rgba(255,255,255,0.1)' }}>
              — {filtered.length} personnages affichés —
            </p>
          )}
        </>
      )}

      <CharacterModal character={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default Characters