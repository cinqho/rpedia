import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useLike(characterId, user) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!characterId) return

    // Compte total des likes
    async function fetchCount() {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('character_id', characterId)
      setCount(count ?? 0)
    }

    // Vérifie si l'user a déjà liké
    async function fetchLiked() {
      if (!user) return
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('character_id', characterId)
        .eq('user_id', user.id)
        .single()
      setLiked(!!data)
    }

    fetchCount()
    fetchLiked()
  }, [characterId, user])

  async function toggleLike() {
    if (!user || loading) return
    setLoading(true)

    if (liked) {
      await supabase.from('likes').delete()
        .eq('character_id', characterId)
        .eq('user_id', user.id)
      setLiked(false)
      setCount(c => c - 1)
    } else {
      await supabase.from('likes').insert({ character_id: characterId, user_id: user.id })
      setLiked(true)
      setCount(c => c + 1)
    }

    setLoading(false)
  }

  return { liked, count, toggleLike, loading }
}