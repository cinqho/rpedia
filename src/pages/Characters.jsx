import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import CharacterCard from '../components/CharacterCard'
import CharacterModal from '../components/CharacterModal'

const universes = ['Tous', 'Naruto', 'One Piece', 'Bleach', 'Dragon Ball', 'Autre']

function Characters() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [universeFilter, setUniverseFilter] = useState('Tous')
  const [serverFilter, setServerFilter] = useState('')

  useEffect(() => {
    async function fetchCharacters() {
      const { data, error } = await supabase
        .from('characters_with_likes')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setCharacters(data)
      setLoading(false)
    }
    fetchCharacters()
  }, [])

  const servers = ['Tous', ...new Set(characters.map(c => c.server).filter(Boolean))]

  const filtered = characters.filter(c => {
    const matchSearch = c.rp_name.toLowerCase().includes(search.toLowerCase()) || (c.player && c.player.toLowerCase().includes(search.toLowerCase()))
    const matchUniverse = universeFilter === 'Tous' || c.universe === universeFilter
    const matchServer = serverFilter === '' || serverFilter === 'Tous' || c.server === serverFilter
    return matchSearch && matchUniverse && matchServer
  })

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white mb-1"
          style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', letterSpacing: '0.05em' }}>
          PERSON<span style={{ color: '#fbc059' }}>NAGES</span>
        </h1>
        <p className="text-xs font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {filtered.length} personnage{filtered.length > 1 ? 's' : ''} archivé{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Barre de recherche */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher un personnage / joueur..."
        className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none mb-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#ffffff',
        }}
      />

      {/* Filtres univers */}
      <div className="flex gap-2 flex-wrap mb-3">
        {universes.map(u => (
          <button
            key={u}
            onClick={() => setUniverseFilter(u)}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: universeFilter === u ? '#fbc059' : 'rgba(255,255,255,0.04)',
              color: universeFilter === u ? '#0a0a0a' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${universeFilter === u ? '#fbc059' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Filtres serveurs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {servers.map(s => (
          <button
            key={s}
            onClick={() => setServerFilter(s)}
            className="text-xs font-mono px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: serverFilter === s ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
              color: serverFilter === s ? '#ffffff' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${serverFilter === s ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm animate-pulse" style={{ color: '#fbc059' }}>
            Chargement...
          </p>
        </div>
      )}

      {/* Vide */}
      {!loading && filtered.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Aucun personnage trouvé.
          </p>
        </div>
      )}

      {/* Grille */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((character) => (
            <div key={character.id} onClick={() => setSelected(character)} className="cursor-pointer">
              <CharacterCard character={character} />
            </div>
          ))}
        </div>
      )}

      <CharacterModal character={selected} onClose={() => setSelected(null)} />

    </div>
  )
}

export default Characters