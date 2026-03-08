import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CharactersContext = createContext(null)

export function CharactersProvider({ children }) {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      setCharacters(data || [])
      setLoading(false)
    }
    fetch()

    // Realtime : écoute les approbations/suppressions en direct
    const channel = supabase
      .channel('characters-approved')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'characters',
      }, payload => {
        const c = payload.new
        if (c.status === 'approved') {
          // Nouveau perso approuvé → on l'ajoute s'il n'est pas déjà là
          setCharacters(prev =>
            prev.find(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]
          )
        } else {
          // Perso retiré (rejected, pending...) → on le retire
          setCharacters(prev => prev.filter(x => x.id !== c.id))
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'characters',
      }, payload => {
        setCharacters(prev => prev.filter(x => x.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <CharactersContext.Provider value={{ characters, loading, setCharacters }}>
      {children}
    </CharactersContext.Provider>
  )
}

export function useCharacters() {
  return useContext(CharactersContext)
}