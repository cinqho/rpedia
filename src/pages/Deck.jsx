import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import CharacterCard from '../components/CharacterCard'

function Deck() {
  const [user, setUser] = useState(null)
  const [deck, setDeck] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchDeck(u.id)
      else setLoading(false)
    })
  }, [])

  async function fetchDeck(userId) {
    const { data } = await supabase
      .from('deck')
      .select('character_id, obtained_at, characters_with_likes(*)')
      .eq('user_id', userId)
      .order('obtained_at', { ascending: false })

    setDeck(data || [])
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
            Connecte-toi avec Discord pour voir ton deck.
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
            MON <span style={{ color: '#fbc059' }}>DECK</span>
          </h1>
          <p className="font-mono text-xs tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Toutes les cartes que tu as obtenues.
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="font-mono text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>CARTES</p>
          <p className="font-bold" style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2.5rem',
            color: '#fbc059',
            lineHeight: 1,
          }}>
            {deck.length}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
        </div>
      )}

      {!loading && deck.length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 gap-4">
          <p className="font-mono text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Ton deck est vide.<br />Ouvre des packs pour obtenir des cartes !
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
          {deck.map(entry => (
            <CharacterCard
              key={entry.character_id}
              character={entry.characters_with_likes}
            />
          ))}
        </div>
      )}

    </div>
  )
}

export default Deck