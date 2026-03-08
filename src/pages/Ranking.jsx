import { useState } from 'react'
import CharacterModal from '../components/CharacterModal'
import { useCharacters } from '../context/CharactersContext'

function Rankings() {
  const { characters, loading } = useCharacters()
  const [selected, setSelected] = useState(null)

  const top20 = [...characters]
    .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
    .slice(0, 20)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', letterSpacing: '0.05em', color: '#ffffff' }}>
          CLASS<span style={{ color: '#fbc059' }}>EMENTS</span>
        </h1>
        <p className="font-mono text-xs tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Top 20 des personnages les plus likés
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm animate-pulse" style={{ color: '#fbc059' }}>Chargement...</p>
        </div>
      )}

      {!loading && top20.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Aucun personnage pour l'instant.</p>
        </div>
      )}

      {!loading && top20.length > 0 && (
        <div className="flex flex-col gap-3">
          {top20.map((character, i) => (
            <div
              key={character.id}
              onClick={() => setSelected(character)}
              className="flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              style={{
                background: i < 3 ? 'rgba(251,192,89,0.05)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i < 3 ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="w-8 text-center flex-shrink-0">
                {i < 3
                  ? <span className="text-xl">{medals[i]}</span>
                  : <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>#{i + 1}</span>
                }
              </div>

              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {character.image_url
                  ? <img src={character.image_url} alt={character.rp_name} className="w-full h-full object-cover" loading="lazy" />
                  : <div className="w-full h-full flex items-center justify-center"><span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '1.2rem' }}>?</span></div>
                }
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold tracking-widest uppercase truncate"
                  style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: '#fbc059' }}>
                  {character.rp_name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{character.universe}</span>
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                  <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>{character.server}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span style={{ color: '#fbc059' }}>♥</span>
                <span className="font-mono text-sm font-bold" style={{ color: '#fbc059' }}>{character.likes_count ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CharacterModal character={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

export default Rankings