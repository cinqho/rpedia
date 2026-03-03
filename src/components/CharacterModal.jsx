import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLike } from '../hooks/useLike'

function CharacterModal({ character, onClose }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  }, [])

  const { liked, count, toggleLike } = useLike(character?.id, user)

  if (!character) return null

  const universeColors = {
    'Naruto': '#fbc059',
    'One Piece': '#fbc059',
    'Bleach': '#fbc059',
    'Dragon Ball': '#fbc059',
  }

  const color = universeColors[character.universe] || '#fbc059'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
        style={{ background: 'rgba(0,0,0,0.8)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl"
          style={{ background: '#0f0f0f', border: `1px solid ${color}30` }}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
          >
            ✕
          </button>

          {/* Image */}
          {character.image_url && (
            <div className="w-full h-56 overflow-hidden rounded-t-2xl">
              <img src={character.image_url} alt={character.rp_name}
                className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 flex flex-col gap-4">

            {/* Nom + Like */}
            <div className="flex items-start justify-between">
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color, letterSpacing: '0.05em' }}>
                  {character.rp_name}
                </h2>
                {character.surname && (
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {character.surname}
                  </p>
                )}
              </div>

              {/* Bouton like */}
              <button
                onClick={toggleLike}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs transition-all duration-200 hover:scale-105"
                style={{
                  background: liked ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${liked ? '#fbc059' : 'rgba(255,255,255,0.1)'}`,
                  color: liked ? '#fbc059' : 'rgba(255,255,255,0.4)',
                }}
              >
                {liked ? '♥' : '♡'} {count}
              </button>
            </div>

            {/* Badges */}
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs font-mono px-3 py-1 rounded-full"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {character.universe}
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {character.server}
              </span>
              {character.player && (
                <span className="text-xs font-mono px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  👤 {character.player}
                </span>
              )}
            </div>

            <div style={{ height: '1px', background: `linear-gradient(to right, ${color}30, transparent)` }} />

            {/* Description */}
            {character.description && (
              <div>
                <p className="text-xs font-mono tracking-widest uppercase mb-2" style={{ color: '#fbc059' }}>
                  Description
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {character.description}
                </p>
              </div>
            )}

            {/* Legacy */}
            {character.legacy && (
              <div>
                <p className="text-xs font-mono tracking-widest uppercase mb-2" style={{ color: '#fbc059' }}>
                  Legacy
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {character.legacy}
                </p>
              </div>
            )}

            {/* Message si pas connecté */}
            {!user && (
              <p className="text-xs font-mono text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Connecte-toi avec Discord pour liker ce personnage
              </p>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CharacterModal