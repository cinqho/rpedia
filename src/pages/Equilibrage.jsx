import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const statOptions = [
  'S+', 'S', 'S-',
  'A+', 'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-',
  'D+', 'D', 'D-'
]

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#ffffff',
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '0.8rem',
  fontFamily: 'monospace',
  outline: 'none',
}

const labelStyle = {
  color: '#38BDF8',
  fontSize: '0.6rem',
  fontFamily: 'monospace',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '4px',
}

const rarityColors = {
  NORMAL:     '#9CA3AF',
  VETERAN:    '#34D399',
  ELITE:      '#38BDF8',
  EPIQUE:     '#A855F7',
  SECRET:     '#F472B6',
  LEGENDAIRE: '#0205bf',
  ANCESTRAL:  '#FFF9C4',
  ICONE:      '#FF1A1A',
}

function CharacterEquilibrageRow({ character, onSave }) {
  const [open, setOpen] = useState(false)
  const [stats, setStats] = useState({
    stat_rp:  character.stat_rp,
    stat_pvp: character.stat_pvp,
    stat_lor: character.stat_lor,
    stat_imp: character.stat_imp,
    rarity:   character.rarity || 'NORMAL',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [markingReady, setMarkingReady] = useState(false)
  const [markedReady, setMarkedReady] = useState(character.status === 'equilibrage_ready')

  const rarityColor = rarityColors[stats.rarity] || '#9CA3AF'

  function handleStatChange(e) {
    setStats({ ...stats, [e.target.name]: e.target.value })
  }

  async function handleSaveStats() {
    setSaving(true)
    const { error } = await supabase
      .from('characters')
      .update({
        stat_rp:  stats.stat_rp,
        stat_pvp: stats.stat_pvp,
        stat_lor: stats.stat_lor,
        stat_imp: stats.stat_imp,
        rarity:   stats.rarity,
      })
      .eq('id', character.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSave({ ...character, ...stats })
    }
  }

  async function handleMarkReady() {
    setMarkingReady(true)
    await supabase.from('characters').update({
      stat_rp:  stats.stat_rp,
      stat_pvp: stats.stat_pvp,
      stat_lor: stats.stat_lor,
      stat_imp: stats.stat_imp,
      rarity:   stats.rarity,
      status:   'equilibrage_ready',
    }).eq('id', character.id)
    setMarkingReady(false)
    setMarkedReady(true)
    onSave({ ...character, ...stats, status: 'equilibrage_ready' })
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${markedReady ? 'rgba(168,85,247,0.4)' : rarityColor + '22'}`, background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-all" onClick={() => setOpen(o => !o)}>
        {character.image_url && (
          <img src={character.image_url} alt={character.rp_name} className="w-8 h-8 rounded-lg object-cover object-top flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-sm truncate" style={{ color: '#ffffff' }}>{character.rp_name}</p>
          <p className="font-mono text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {character.server} · {character.universe}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {['stat_rp', 'stat_pvp', 'stat_lor', 'stat_imp'].map(s => (
            <span key={s} className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(56,189,248,0.08)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}>
              {stats[s] || '?'}
            </span>
          ))}
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${rarityColor}18`, color: rarityColor, border: `1px solid ${rarityColor}44` }}>
          {stats.rarity}
        </span>
        {markedReady ? (
          <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-bold"
            style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.4)' }}>
            ⚡ READY
          </span>
        ) : (
          <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: 'rgba(56,189,248,0.08)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}>
            en cours
          </span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.2)' }}>Nom RP</p>
              <p className="font-mono text-sm" style={{ color: '#fff' }}>{character.rp_name}</p>
            </div>
            <div>
              <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.2)' }}>Joueur</p>
              <p className="font-mono text-sm" style={{ color: '#fff' }}>{character.player || '—'}</p>
            </div>
            <div className="col-span-2">
              <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.2)' }}>Description</p>
              <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'pre-wrap' }}>{character.description || '—'}</p>
            </div>
            {character.legacy && (
              <div className="col-span-2">
                <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.2)' }}>Legacy</p>
                <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'pre-wrap' }}>{character.legacy}</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <p style={{ ...labelStyle, marginBottom: '10px' }}>Stats (modifiables)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* RARETÉ AJOUTÉE ICI */}
              <div>
                <label style={labelStyle}>Rareté</label>
                <select name="rarity" value={stats.rarity} onChange={handleStatChange}
                  style={{ ...inputStyle, color: rarityColor, borderColor: `${rarityColor}44` }}>
                  {Object.keys(rarityColors).map(r => (
                    <option key={r} value={r} style={{ background: '#0a0a0a', color: rarityColors[r] }}>{r}</option>
                  ))}
                </select>
              </div>

              {[
                { name: 'stat_rp',  label: 'RP' },
                { name: 'stat_pvp', label: 'PVP' },
                { name: 'stat_lor', label: 'LOR' },
                { name: 'stat_imp', label: 'IMP' },
              ].map(stat => (
                <div key={stat.name}>
                  <label style={labelStyle}>{stat.label}</label>
                  <select name={stat.name} value={stats[stat.name] || 'C'} onChange={handleStatChange}
                    style={{ ...inputStyle, color: '#38BDF8', borderColor: 'rgba(56,189,248,0.3)' }}>
                    {statOptions.map(o => (
                      <option key={o} value={o} style={{ background: '#0a0a0a', color: '#fff' }}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>ID : {character.id}</p>
            <div className="flex gap-2">
              <button onClick={handleSaveStats} disabled={saving || markedReady}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-40"
                style={{ background: saved ? '#34D399' : 'rgba(56,189,248,0.1)', color: saved ? '#0a0a0a' : '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}>
                {saving ? '...' : saved ? '✓ Sauvegardé' : 'Sauvegarder stats'}
              </button>
              {!markedReady ? (
                <button onClick={handleMarkReady} disabled={markingReady}
                  className="px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#A855F7', color: '#fff' }}>
                  {markingReady ? '...' : '⚡ Marquer ready'}
                </button>
              ) : (
                <div className="px-4 py-2 rounded-lg font-mono text-xs font-bold"
                  style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.4)' }}>
                  ⚡ Envoyé aux admins
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Equilibrage() {
  const [user, setUser] = useState(null)
  const [isEquilibrage, setIsEquilibrage] = useState(false)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterServer, setFilterServer] = useState('all')
  const [servers, setServers] = useState([])
  const [tab, setTab] = useState('equilibrage')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('role')
          .eq('user_id', u.id)
          .single()
        setIsEquilibrage(adminData?.role === 'equilibrage' || adminData?.role === 'owner')
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (user && isEquilibrage) fetchCharacters()
  }, [user, isEquilibrage])

  async function fetchCharacters() {
    setLoading(true)
    const { data } = await supabase
      .from('characters')
      .select('*')
      .in('status', ['equilibrage', 'equilibrage_ready'])
      .order('created_at', { ascending: false })
    setCharacters(data || [])
    const unique = [...new Set((data || []).map(c => c.server?.trim()).filter(Boolean))].sort()
    setServers(unique)
    setLoading(false)
  }

  function handleSave(updated) {
    setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  if (!user) return (
    <div className="flex items-center justify-center h-full">
      <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connexion requise.</p>
    </div>
  )

  if (!loading && !isEquilibrage) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="font-mono text-4xl mb-2" style={{ color: '#FF2D55' }}>Accès refusé</p>
        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Réservé à l'équipe d'équilibrage.</p>
      </div>
    </div>
  )

  const enCours = characters.filter(c => c.status === 'equilibrage')
  const ready   = characters.filter(c => c.status === 'equilibrage_ready')

  const filtered = (tab === 'equilibrage' ? enCours : ready).filter(c => {
    const matchSearch = !search || c.rp_name?.toLowerCase().includes(search.toLowerCase())
    const matchServer = filterServer === 'all' || c.server === filterServer
    return matchSearch && matchServer
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: '#ffffff' }}>
          PANEL <span style={{ color: '#fbc059' }}>ÉQUILIBRAGE</span>
        </h1>
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {enCours.length} en cours · {ready.length} prêtes à approuver
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { key: 'equilibrage', label: `⚙ En cours (${enCours.length})` },
          { key: 'ready',       label: `⚡ Ready (${ready.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200"
            style={{
              background: tab === t.key ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tab === t.key ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: tab === t.key ? '#38BDF8' : 'rgba(255,255,255,0.4)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un personnage..."
          style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
        <select value={filterServer} onChange={e => setFilterServer(e.target.value)}
          style={{ ...inputStyle, width: 'auto' }}>
          <option value="all" style={{ background: '#0a0a0a' }}>Tous les serveurs</option>
          {servers.map(s => <option key={s} value={s} style={{ background: '#0a0a0a' }}>{s}</option>)}
        </select>
        <button onClick={fetchCharacters} className="px-4 py-2 rounded-lg font-mono text-xs"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {tab === 'equilibrage' ? 'Aucune carte à équilibrer.' : 'Aucune carte ready.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => (
            <CharacterEquilibrageRow key={c.id} character={c} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Equilibrage