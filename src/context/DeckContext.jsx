import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const DeckContext = createContext(null)

const TEAM_SIZE = 5

export function DeckProvider({ children }) {
  const [user, setUser] = useState(null)
  const [deck, setDeck] = useState([])
  const [team, setTeam] = useState(Array(TEAM_SIZE).fill(null))
  const [loading, setLoading] = useState(true)

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
        .select('id, character_id, obtained_at, characters(*)')
        .eq('user_id', userId)
        .order('obtained_at', { ascending: false }),
      supabase
        .from('team')
        .select('slot, character_id, characters(*)')
        .eq('user_id', userId),
    ])

    const cleaned = (deckData || []).filter(e => e.characters !== null)
    setDeck(cleaned)

    const teamArr = Array(TEAM_SIZE).fill(null)
    for (const entry of teamData || []) teamArr[entry.slot - 1] = entry.characters
    setTeam(teamArr)
    setLoading(false)
  }

  useEffect(() => {
    // Auth
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchAll(u.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchAll(u.id)
      else { setDeck([]); setTeam(Array(TEAM_SIZE).fill(null)); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Realtime sur le deck
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('deck-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deck',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchAll(user.id))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'deck',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchAll(user.id))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  return (
    <DeckContext.Provider value={{ user, deck, team, setTeam, loading, fetchAll, buildGrouped }}>
      {children}
    </DeckContext.Provider>
  )
}

export function useDeck() {
  return useContext(DeckContext)
}