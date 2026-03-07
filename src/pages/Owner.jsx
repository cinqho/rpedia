import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const rarityOptions = [
  'NORMAL', 'VETERAN', 'ELITE', 'EPIQUE', 'LEGENDAIRE',
  'SECRET', 'ANCESTRAL', 'ICONE'
]

const rarityColors = {
  NORMAL: '#9CA3AF', VETERAN: '#34D399', ELITE: '#38BDF8',
  EPIQUE: '#A855F7', LEGENDAIRE: '#0205bf', SECRET: '#F472B6',
  ANCESTRAL: '#FFF9C4', ICONE: '#FF1A1A',
}

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
  color: '#fbc059',
  fontSize: '0.6rem',
  fontFamily: 'monospace',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '4px',
}

// ─── Barre de stats ───────────────────────────────────────────────────────────
function StatsBar() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function fetchStats() {
      const [{ count: totalUsers }, { count: totalCharacters }, { count: approvedCharacters }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('characters').select('*', { count: 'exact', head: true }),
        supabase.from('characters').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      ])
      setStats({ totalUsers, totalCharacters, approvedCharacters })
    }
    fetchStats()
  }, [])

  const items = [
    { label: 'MEMBRES', value: stats?.totalUsers ?? '…', color: '#fbc059', icon: '👥' },
    { label: 'PERSONNAGES', value: stats?.totalCharacters ?? '…', color: '#38BDF8', icon: '🃏' },
    { label: 'APPROUVÉS', value: stats?.approvedCharacters ?? '…', color: '#34D399', icon: '✅' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {items.map(item => (
        <div key={item.label} className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: `${item.color}08`, border: `1px solid ${item.color}22` }}>
          <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
          <div>
            <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.8rem', color: item.color, lineHeight: 1 }}>
              {stats ? item.value : '…'}
            </p>
            <p className="font-mono" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Onglet Ressources ────────────────────────────────────────────────────────
function ResourcesTab() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)
  const [giveAllAmount, setGiveAllAmount] = useState('')
  const [givingAll, setGivingAll] = useState(false)
  const [gaveAll, setGaveAll] = useState(false)
  const [confirmAll, setConfirmAll] = useState(false)

  useEffect(() => { fetchResources() }, [])

  async function fetchResources() {
    setLoading(true)
    const { data: res } = await supabase
      .from('resources')
      .select('*')
      .order('packs_available', { ascending: false })

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, discord_username, avatar_url')

    const profileMap = {}
    for (const p of profiles || []) profileMap[p.id] = p

    setResources((res || []).map(r => ({ ...r, profiles: profileMap[r.user_id] || null })))
    setLoading(false)
  }

  async function updatePacks(userId, value) {
    const n = parseInt(value)
    if (isNaN(n) || n < 0) return
    setSaving(userId)
    await supabase.from('resources').update({ packs_available: n }).eq('user_id', userId)
    setResources(prev => prev.map(r => r.user_id === userId ? { ...r, packs_available: n } : r))
    setSaving(null)
    setSaved(userId)
    setTimeout(() => setSaved(null), 1500)
  }

  async function givePacksToAll() {
    const n = parseInt(giveAllAmount)
    if (isNaN(n) || n <= 0) return
    setGivingAll(true)
    const updates = resources.map(r =>
      supabase.from('resources')
        .update({ packs_available: (parseInt(r.packs_available) || 0) + n })
        .eq('user_id', r.user_id)
    )
    await Promise.all(updates)
    setResources(prev => prev.map(r => ({
      ...r,
      packs_available: (parseInt(r.packs_available) || 0) + n,
    })))
    setGivingAll(false)
    setGaveAll(true)
    setConfirmAll(false)
    setGiveAllAmount('')
    setTimeout(() => setGaveAll(false), 2500)
  }

  const filtered = resources.filter(r =>
    !search || r.profiles?.discord_username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(251,192,89,0.05)', border: '1px solid rgba(251,192,89,0.2)' }}>
        <p className="font-mono text-xs font-bold mb-3" style={{ color: '#fbc059', letterSpacing: '0.08em' }}>
          🎁 DONNER DES PACKS À TOUT LE MONDE
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div style={{ flex: '0 0 auto' }}>
            <label style={labelStyle}>Nombre de packs</label>
            <input
              type="number" min="1" value={giveAllAmount}
              onChange={e => { setGiveAllAmount(e.target.value); setConfirmAll(false) }}
              placeholder="ex: 5"
              style={{ ...inputStyle, width: '100px', textAlign: 'center' }}
            />
          </div>
          <div style={{ flex: '0 0 auto', paddingTop: '18px' }}>
            {!confirmAll ? (
              <button
                onClick={() => { const n = parseInt(giveAllAmount); if (!isNaN(n) && n > 0) setConfirmAll(true) }}
                disabled={!giveAllAmount || parseInt(giveAllAmount) <= 0}
                className="px-5 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-30"
                style={{ background: '#fbc059', color: '#0a0a0a' }}
              >
                Donner
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Confirmer +{giveAllAmount} packs pour {resources.length} joueurs ?
                </span>
                <button onClick={givePacksToAll} disabled={givingAll}
                  className="px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: gaveAll ? '#34D399' : '#FF2D55', color: '#fff' }}>
                  {givingAll ? '...' : gaveAll ? '✓ Envoyé !' : '✓ Confirmer'}
                </button>
                <button onClick={() => setConfirmAll(false)}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
        {gaveAll && <p className="font-mono text-xs mt-2" style={{ color: '#34D399' }}>✓ Packs distribués à tous les joueurs !</p>}
      </div>

      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un joueur..."
          style={{ ...inputStyle, flex: 1 }} />
        <button onClick={fetchResources} className="px-4 py-2 rounded-lg font-mono text-xs"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(r => (
            <div key={r.user_id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {r.profiles?.avatar_url && <img src={r.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>
                  {r.profiles?.discord_username || 'Inconnu'}
                </p>
                <p className="font-mono text-xs truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>{r.user_id}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Packs :</span>
                <input type="number" min="0" value={r.packs_available}
                  onChange={e => setResources(prev => prev.map(x => x.user_id === r.user_id ? { ...x, packs_available: e.target.value } : x))}
                  style={{ ...inputStyle, width: '60px', textAlign: 'center', padding: '4px 8px' }} />
                <button onClick={() => updatePacks(r.user_id, r.packs_available)} disabled={saving === r.user_id}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{ background: saved === r.user_id ? '#34D399' : '#fbc059', color: '#0a0a0a', whiteSpace: 'nowrap' }}>
                  {saved === r.user_id ? '✓' : 'OK'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Onglet Raretés ───────────────────────────────────────────────────────────
function RaritiesTab() {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRarity, setFilterRarity] = useState('all')
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)

  useEffect(() => { fetchCharacters() }, [])

  async function fetchCharacters() {
    setLoading(true)
    const { data } = await supabase
      .from('characters')
      .select('id, rp_name, server, rarity, image_url, status')
      .eq('status', 'approved')
      .order('rp_name')
    setCharacters(data || [])
    setLoading(false)
  }

  async function updateRarity(id, rarity) {
    setSaving(id)
    await supabase.from('characters').update({ rarity }).eq('id', id)
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, rarity } : c))
    setSaving(null)
    setSaved(id)
    setTimeout(() => setSaved(null), 1500)
  }

  const filtered = characters.filter(c => {
    const matchSearch = !search || c.rp_name?.toLowerCase().includes(search.toLowerCase())
    const matchRarity = filterRarity === 'all' || c.rarity === filterRarity
    return matchSearch && matchRarity
  })

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un personnage..."
          style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
        <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all" style={{ background: '#0a0a0a' }}>Toutes les raretés</option>
          {rarityOptions.map(r => <option key={r} value={r} style={{ background: '#0a0a0a' }}>{r}</option>)}
        </select>
        <button onClick={fetchCharacters} className="px-4 py-2 rounded-lg font-mono text-xs"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => {
            const color = rarityColors[c.rarity] || '#9CA3AF'
            return (
              <div key={c.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {c.image_url && <img src={c.image_url} alt={c.rp_name} className="w-8 h-8 rounded-lg object-cover object-top flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>{c.rp_name}</p>
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.server}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={c.rarity || 'NORMAL'} onChange={e => updateRarity(c.id, e.target.value)}
                    disabled={saving === c.id}
                    style={{ ...inputStyle, width: 'auto', color, borderColor: `${color}44` }}>
                    {rarityOptions.map(r => <option key={r} value={r} style={{ background: '#0a0a0a', color: '#fff' }}>{r}</option>)}
                  </select>
                  {saved === c.id && <span className="font-mono text-xs" style={{ color: '#34D399' }}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Onglet Logs raretés ──────────────────────────────────────────────────────
function RarityLogsTab() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data: logsData } = await supabase
      .from('rarity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, discord_username, avatar_url')

    const profileMap = {}
    for (const p of profiles || []) profileMap[p.id] = p

    setLogs((logsData || []).map(l => ({ ...l, profiles: profileMap[l.admin_id] || null })))
    setLoading(false)
  }

  async function clearLogs() {
    setClearing(true)
    await supabase.from('rarity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setLogs([])
    setClearing(false)
    setConfirmClear(false)
  }

  const filtered = logs.filter(l =>
    !search ||
    l.character_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.profiles?.discord_username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par personnage ou admin..."
          style={{ ...inputStyle, flex: 1 }} />
        <button onClick={fetchLogs} className="px-4 py-2 rounded-lg font-mono text-xs"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} className="px-4 py-2 rounded-lg font-mono text-xs transition-all hover:opacity-80"
            style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)', color: '#FF2D55' }}>
            🗑 Vider les logs
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirmer ?</span>
            <button onClick={clearLogs} disabled={clearing}
              className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#FF2D55', color: '#fff' }}>
              {clearing ? '...' : 'Oui, vider'}
            </button>
            <button onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun log.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(log => {
            const fromColor = rarityColors[log.old_rarity] || '#9CA3AF'
            const toColor = rarityColors[log.new_rarity] || '#9CA3AF'
            return (
              <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {log.profiles?.avatar_url ? (
                  <img src={log.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" style={{ opacity: 0.7 }} />
                ) : (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>?</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>{log.character_name}</p>
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    par <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.profiles?.discord_username || log.admin_id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${fromColor}18`, color: fromColor, border: `1px solid ${fromColor}44` }}>
                    {log.old_rarity || 'NORMAL'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>→</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${toColor}18`, color: toColor, border: `1px solid ${toColor}44` }}>
                    {log.new_rarity}
                  </span>
                </div>
                <p className="font-mono text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


// ─── Onglet Logs status ───────────────────────────────────────────────────────
function StatusLogsTab() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    const { data: logsData } = await supabase
      .from('status_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, discord_username, avatar_url')

    const profileMap = {}
    for (const p of profiles || []) profileMap[p.id] = p

    setLogs((logsData || []).map(l => ({ ...l, profiles: profileMap[l.admin_id] || null })))
    setLoading(false)
  }

  async function clearLogs() {
    setClearing(true)
    await supabase.from('status_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setLogs([])
    setClearing(false)
    setConfirmClear(false)
  }

  const statusColors = { approved: '#34D399', pending: '#fbc059', rejected: '#FF2D55' }

  const filtered = logs.filter(l =>
    !search ||
    l.character_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.profiles?.discord_username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par personnage ou admin..."
          style={{ ...inputStyle, flex: 1, minWidth: '160px' }} />
        <button onClick={fetchLogs} className="px-4 py-2 rounded-lg font-mono text-xs"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} className="px-4 py-2 rounded-lg font-mono text-xs transition-all hover:opacity-80"
            style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)', color: '#FF2D55' }}>
            🗑 Vider les logs
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirmer ?</span>
            <button onClick={clearLogs} disabled={clearing}
              className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: '#FF2D55', color: '#fff' }}>
              {clearing ? '...' : 'Oui, vider'}
            </button>
            <button onClick={() => setConfirmClear(false)}
              className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun log.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(log => {
            const fromColor = statusColors[log.old_status] || '#9CA3AF'
            const toColor = statusColors[log.new_status] || '#9CA3AF'
            return (
              <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {log.profiles?.avatar_url ? (
                  <img src={log.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" style={{ opacity: 0.7 }} />
                ) : (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>?</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>{log.character_name}</p>
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    par <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.profiles?.discord_username || log.admin_id}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${fromColor}18`, color: fromColor, border: `1px solid ${fromColor}44` }}>
                    {log.old_status || '?'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>→</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${toColor}18`, color: toColor, border: `1px solid ${toColor}44` }}>
                    {log.new_status}
                  </span>
                </div>
                <p className="font-mono text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


// ─── Onglet Donner une carte ──────────────────────────────────────────────────
function GiveCardTab() {
  const [playerSearch, setPlayerSearch] = useState('')
  const [playerResults, setPlayerResults] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const [cardSearch, setCardSearch] = useState('')
  const [cardResults, setCardResults] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)

  const [giving, setGiving] = useState(false)
  const [given, setGiven] = useState(false)
  const [error, setError] = useState(null)
  const [confirmGive, setConfirmGive] = useState(false)

  const rarityColors = {
    NORMAL: '#9CA3AF', VETERAN: '#34D399', ELITE: '#38BDF8',
    EPIQUE: '#A855F7', LEGENDAIRE: '#0205bf', SECRET: '#F472B6',
    ANCESTRAL: '#FFF9C4', ICONE: '#FF1A1A',
  }

  async function searchPlayers(val) {
    setPlayerSearch(val)
    setSelectedPlayer(null)
    setConfirmGive(false)
    if (val.trim().length < 2) return setPlayerResults([])
    const { data } = await supabase
      .from('profiles')
      .select('id, discord_username, avatar_url')
      .ilike('discord_username', `%${val.trim()}%`)
      .limit(6)
    setPlayerResults(data || [])
  }

  async function searchCards(val) {
    setCardSearch(val)
    setSelectedCard(null)
    setConfirmGive(false)
    if (val.trim().length < 2) return setCardResults([])
    const { data } = await supabase
      .from('characters')
      .select('id, rp_name, server, rarity, image_url')
      .eq('status', 'approved')
      .ilike('rp_name', `%${val.trim()}%`)
      .limit(6)
    setCardResults(data || [])
  }

  async function giveCard() {
    if (!selectedPlayer || !selectedCard) return
    setGiving(true)
    setError(null)

    const { error: err } = await supabase.from('deck').insert({
      user_id: selectedPlayer.id,
      character_id: selectedCard.id,
      obtained_at: new Date().toISOString(),
    })

    if (err) setError(err.message)
    else {
      setGiven(true)
      setConfirmGive(false)
      setTimeout(() => {
        setGiven(false)
        setSelectedPlayer(null)
        setSelectedCard(null)
        setPlayerSearch('')
        setCardSearch('')
        setPlayerResults([])
        setCardResults([])
      }, 2500)
    }
    setGiving(false)
  }

  const color = selectedCard ? (rarityColors[selectedCard.rarity] || '#9CA3AF') : '#fbc059'

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* Sélection joueur */}
      <div>
        <label style={labelStyle}>1. Choisir un joueur</label>
        <input
          value={playerSearch}
          onChange={e => searchPlayers(e.target.value)}
          placeholder="Rechercher par pseudo Discord..."
          style={{
            ...inputStyle,
            borderColor: selectedPlayer ? '#34D399' : 'rgba(255,255,255,0.12)',
          }}
        />
        {playerResults.length > 0 && !selectedPlayer && (
          <div className="mt-1 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f0f' }}>
            {playerResults.map(p => (
              <div key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => { setSelectedPlayer(p); setPlayerSearch(p.discord_username); setPlayerResults([]) }}>
                {p.avatar_url
                  ? <img src={p.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                  : <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                }
                <span className="font-mono text-sm" style={{ color: '#fff' }}>{p.discord_username}</span>
              </div>
            ))}
          </div>
        )}
        {selectedPlayer && (
          <div className="flex items-center gap-3 mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
            {selectedPlayer.avatar_url && <img src={selectedPlayer.avatar_url} alt="" className="w-6 h-6 rounded-full" />}
            <span className="font-mono text-xs" style={{ color: '#34D399' }}>✓ {selectedPlayer.discord_username}</span>
            <button onClick={() => { setSelectedPlayer(null); setPlayerSearch(''); setConfirmGive(false) }}
              className="ml-auto font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
          </div>
        )}
      </div>

      {/* Sélection carte */}
      <div>
        <label style={labelStyle}>2. Choisir une carte</label>
        <input
          value={cardSearch}
          onChange={e => searchCards(e.target.value)}
          placeholder="Rechercher par nom de personnage..."
          style={{
            ...inputStyle,
            borderColor: selectedCard ? color : 'rgba(255,255,255,0.12)',
          }}
        />
        {cardResults.length > 0 && !selectedCard && (
          <div className="mt-1 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f0f' }}>
            {cardResults.map(c => {
              const rc = rarityColors[c.rarity] || '#9CA3AF'
              return (
                <div key={c.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-all"
                  onClick={() => { setSelectedCard(c); setCardSearch(c.rp_name); setCardResults([]) }}>
                  {c.image_url
                    ? <img src={c.image_url} alt="" className="w-7 h-7 rounded-lg object-cover object-top flex-shrink-0" />
                    : <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  }
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm" style={{ color: '#fff' }}>{c.rp_name}</span>
                    <span className="font-mono text-xs ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.server}</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${rc}18`, color: rc, border: `1px solid ${rc}44` }}>
                    {c.rarity || 'NORMAL'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {selectedCard && (
          <div className="flex items-center gap-3 mt-2 px-3 py-2 rounded-lg" style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
            {selectedCard.image_url && <img src={selectedCard.image_url} alt="" className="w-6 h-6 rounded-lg object-cover object-top" />}
            <span className="font-mono text-xs" style={{ color }}>✓ {selectedCard.rp_name}</span>
            <span className="font-mono text-xs ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>— {selectedCard.rarity || 'NORMAL'}</span>
            <button onClick={() => { setSelectedCard(null); setCardSearch(''); setConfirmGive(false) }}
              className="ml-auto font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
          </div>
        )}
      </div>

      {/* Résumé + confirmation */}
      {selectedPlayer && selectedCard && !given && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="font-mono text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Donner <span style={{ color }}>{selectedCard.rp_name}</span> ({selectedCard.rarity || 'NORMAL'}) à <span style={{ color: '#34D399' }}>{selectedPlayer.discord_username}</span>
          </p>
          {error && <p className="font-mono text-xs mb-3" style={{ color: '#FF2D55' }}>{error}</p>}
          {!confirmGive ? (
            <button onClick={() => setConfirmGive(true)}
              className="px-6 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90"
              style={{ background: '#fbc059', color: '#0a0a0a' }}>
              Donner la carte
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirmer ?</span>
              <button onClick={giveCard} disabled={giving}
                className="px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#34D399', color: '#0a0a0a' }}>
                {giving ? '...' : '✓ Confirmer'}
              </button>
              <button onClick={() => setConfirmGive(false)}
                className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-70"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {given && (
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <p className="font-mono text-sm" style={{ color: '#34D399' }}>✓ Carte donnée avec succès !</p>
        </div>
      )}
    </div>
  )
}


// ─── Onglet Équipe / Rôles ────────────────────────────────────────────────────
function TeamTab() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  // Ajout nouveau membre
  const [addSearch, setAddSearch] = useState('')
  const [addResults, setAddResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('admin')
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => { fetchAdmins() }, [])

  async function fetchAdmins() {
    setLoading(true)
    const { data: adminData } = await supabase
      .from('admins')
      .select('user_id, role')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, discord_username, avatar_url')

    const profileMap = {}
    for (const p of profiles || []) profileMap[p.id] = p

    setAdmins((adminData || [])
      .filter(a => a.role !== 'owner')
      .map(a => ({ ...a, profile: profileMap[a.user_id] || null }))
    )
    setLoading(false)
  }

  async function updateRole(userId, newRole) {
    setSaving(userId)
    await supabase.from('admins').update({ role: newRole }).eq('user_id', userId)
    setAdmins(prev => prev.map(a => a.user_id === userId ? { ...a, role: newRole } : a))
    setSaving(null)
    setSaved(userId)
    setTimeout(() => setSaved(null), 1500)
  }

  async function removeAdmin(userId) {
    setRemoving(userId)
    await supabase.from('admins').delete().eq('user_id', userId)
    setAdmins(prev => prev.filter(a => a.user_id !== userId))
    setRemoving(null)
    setConfirmRemove(null)
  }

  async function searchUsers(val) {
    setAddSearch(val)
    setSelectedUser(null)
    if (val.trim().length < 2) return setAddResults([])
    const { data } = await supabase
      .from('profiles')
      .select('id, discord_username, avatar_url')
      .ilike('discord_username', `%${val.trim()}%`)
      .limit(6)
    // Exclure ceux déjà dans l'équipe
    const existing = new Set(admins.map(a => a.user_id))
    setAddResults((data || []).filter(p => !existing.has(p.id)))
  }

  async function addMember() {
    if (!selectedUser) return
    setAdding(true)
    await supabase.from('admins').insert({ user_id: selectedUser.id, role: selectedRole })
    setAdmins(prev => [...prev, { user_id: selectedUser.id, role: selectedRole, profile: selectedUser }])
    setAdding(false)
    setAdded(true)
    setSelectedUser(null)
    setAddSearch('')
    setAddResults([])
    setTimeout(() => setAdded(false), 2000)
  }

  const roleColors = { admin: '#38BDF8', equilibrage: '#A855F7' }
  const roleLabels = { admin: 'Admin', equilibrage: 'Équilibrage' }

  const filtered = admins.filter(a =>
    !search || a.profile?.discord_username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Ajouter un membre */}
      <div className="p-4 rounded-xl" style={{ background: 'rgba(251,192,89,0.05)', border: '1px solid rgba(251,192,89,0.15)' }}>
        <p className="font-mono text-xs font-bold mb-4" style={{ color: '#fbc059', letterSpacing: '0.08em' }}>
          ➕ AJOUTER UN MEMBRE
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label style={labelStyle}>Rechercher un utilisateur</label>
            <input value={addSearch} onChange={e => searchUsers(e.target.value)}
              placeholder="Pseudo Discord..."
              style={{ ...inputStyle, borderColor: selectedUser ? '#34D399' : 'rgba(255,255,255,0.12)' }} />
            {addResults.length > 0 && !selectedUser && (
              <div className="mt-1 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f0f' }}>
                {addResults.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-all"
                    onClick={() => { setSelectedUser(p); setAddSearch(p.discord_username); setAddResults([]) }}>
                    {p.avatar_url
                      ? <img src={p.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                      : <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    }
                    <span className="font-mono text-sm" style={{ color: '#fff' }}>{p.discord_username}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="flex items-center gap-3 mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                {selectedUser.avatar_url && <img src={selectedUser.avatar_url} alt="" className="w-6 h-6 rounded-full" />}
                <span className="font-mono text-xs" style={{ color: '#34D399' }}>✓ {selectedUser.discord_username}</span>
                <button onClick={() => { setSelectedUser(null); setAddSearch('') }} className="ml-auto font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>✕</button>
              </div>
            )}
          </div>

          <div className="flex gap-3 items-end">
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Rôle</label>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={inputStyle}>
                <option value="admin"       style={{ background: '#0a0a0a' }}>Admin</option>
                <option value="equilibrage" style={{ background: '#0a0a0a' }}>Équilibrage</option>
              </select>
            </div>
            <button onClick={addMember} disabled={!selectedUser || adding}
              className="px-5 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: added ? '#34D399' : '#fbc059', color: '#0a0a0a', whiteSpace: 'nowrap' }}>
              {adding ? '...' : added ? '✓ Ajouté' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des membres */}
      <div>
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ ...inputStyle, flex: 1 }} />
          <button onClick={fetchAdmins} className="px-4 py-2 rounded-lg font-mono text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun membre.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(a => {
              const color = roleColors[a.role] || '#9CA3AF'
              return (
                <div key={a.user_id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}18` }}>
                  {a.profile?.avatar_url
                    ? <img src={a.profile.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                    : <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold truncate" style={{ color: '#fff' }}>
                      {a.profile?.discord_username || a.user_id}
                    </p>
                  </div>

                  {/* Sélecteur de rôle */}
                  <select value={a.role} onChange={e => updateRole(a.user_id, e.target.value)}
                    disabled={saving === a.user_id}
                    style={{ ...inputStyle, width: 'auto', color, borderColor: `${color}44` }}>
                    <option value="admin"       style={{ background: '#0a0a0a', color: '#38BDF8' }}>Admin</option>
                    <option value="equilibrage" style={{ background: '#0a0a0a', color: '#A855F7' }}>Équilibrage</option>
                  </select>

                  {saved === a.user_id && <span className="font-mono text-xs" style={{ color: '#34D399' }}>✓</span>}

                  {/* Retirer */}
                  {confirmRemove === a.user_id ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirmer ?</span>
                      <button onClick={() => removeAdmin(a.user_id)} disabled={removing === a.user_id}
                        className="px-3 py-1 rounded-lg font-mono text-xs font-bold hover:opacity-90 disabled:opacity-50"
                        style={{ background: '#FF2D55', color: '#fff' }}>
                        {removing === a.user_id ? '...' : 'Oui'}
                      </button>
                      <button onClick={() => setConfirmRemove(null)}
                        className="px-3 py-1 rounded-lg font-mono text-xs hover:opacity-70"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                        Non
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmRemove(a.user_id)}
                      className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-80 flex-shrink-0"
                      style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)', color: '#FF2D55' }}>
                      Retirer
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Onglet Collections ───────────────────────────────────────────────────────
function CollectionsTab() {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)

  // Création / édition
  const [editMode, setEditMode] = useState(null) // null | 'create' | collection_id
  const [form, setForm] = useState({ name: '', description: '', cover_url: '', accent_color: '#fbc059', active: true })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Assignation persos
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [characters, setCharacters] = useState([])
  const [charsLoading, setCharsLoading] = useState(false)
  const [charSearch, setCharSearch] = useState('')
  const [filterServer, setFilterServer] = useState('all')
  const [servers, setServers] = useState([])
  const [assigningSaving, setAssigningSaving] = useState(null)

  useEffect(() => { fetchCollections() }, [])

  async function fetchCollections() {
    setLoading(true)
    const { data } = await supabase.from('collections').select('*').order('created_at', { ascending: false })
    const { data: chars } = await supabase.from('characters').select('collection_id').eq('status', 'approved').not('collection_id', 'is', null)
    const counts = {}
    for (const c of chars || []) counts[c.collection_id] = (counts[c.collection_id] || 0) + 1
    setCollections((data || []).map(col => ({ ...col, card_count: counts[col.id] || 0 })))
    setLoading(false)
  }

  async function fetchCharacters() {
    setCharsLoading(true)
    const { data } = await supabase.from('characters').select('id, rp_name, server, rarity, image_url, collection_id').eq('status', 'approved').order('rp_name')
    setCharacters(data || [])
    const unique = [...new Set((data || []).map(c => c.server?.trim()).filter(Boolean))].sort()
    setServers(unique)
    setCharsLoading(false)
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setCoverUploading(true)
    const data = new FormData()
    data.append('file', file)
    data.append('upload_preset', 'RPedia')
    data.append('cloud_name', 'dzll8uy9f')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dzll8uy9f/image/upload', { method: 'POST', body: data })
      const json = await res.json()
      if (json.secure_url) setForm(f => ({ ...f, cover_url: json.secure_url }))
    } catch {}
    setCoverUploading(false)
  }

  async function saveCollection() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editMode === 'create') {
      const { data } = await supabase.from('collections').insert({ name: form.name, description: form.description, cover_url: form.cover_url, accent_color: form.accent_color, active: form.active }).select().single()
      if (data) setCollections(prev => [{ ...data, card_count: 0 }, ...prev])
    } else {
      await supabase.from('collections').update({ name: form.name, description: form.description, cover_url: form.cover_url, accent_color: form.accent_color, active: form.active }).eq('id', editMode)
      setCollections(prev => prev.map(c => c.id === editMode ? { ...c, ...form } : c))
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditMode(null) }, 1500)
  }

  async function toggleActive(col) {
    await supabase.from('collections').update({ active: !col.active }).eq('id', col.id)
    setCollections(prev => prev.map(c => c.id === col.id ? { ...c, active: !col.active } : c))
  }

  async function deleteCollection(id) {
    setDeleting(id)
    await supabase.from('collections').delete().eq('id', id)
    setCollections(prev => prev.filter(c => c.id !== id))
    if (selectedCollection?.id === id) setSelectedCollection(null)
    setConfirmDelete(null)
    setDeleting(null)
  }

  async function assignCollection(charId, collectionId) {
    setAssigningSaving(charId)
    await supabase.from('characters').update({ collection_id: collectionId || null }).eq('id', charId)
    setCharacters(prev => prev.map(c => c.id === charId ? { ...c, collection_id: collectionId || null } : c))
    // Recalculer card_count
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) return { ...col, card_count: (col.card_count || 0) + 1 }
      return col
    }))
    setAssigningSaving(null)
  }

  const rarityColors = { NORMAL: '#9CA3AF', VETERAN: '#34D399', ELITE: '#38BDF8', EPIQUE: '#A855F7', SECRET: '#F472B6', LEGENDAIRE: '#0205bf', ANCESTRAL: '#FFF9C4', ICONE: '#FF1A1A' }

  const filteredChars = characters.filter(c => {
    const matchSearch = !charSearch || c.rp_name?.toLowerCase().includes(charSearch.toLowerCase())
    const matchServer = filterServer === 'all' || c.server === filterServer
    return matchSearch && matchServer
  })

  return (
    <div className="flex flex-col gap-6">

      {/* Header + créer */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { setEditMode('create'); setForm({ name: '', description: '', cover_url: '', accent_color: '#fbc059', active: true }) }}
          className="px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90"
          style={{ background: '#fbc059', color: '#0a0a0a' }}>
          + Nouvelle collection
        </button>
      </div>

      {/* Formulaire création / édition */}
      {editMode && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(251,192,89,0.05)', border: '1px solid rgba(251,192,89,0.2)' }}>
          <p className="font-mono text-xs font-bold mb-4" style={{ color: '#fbc059' }}>
            {editMode === 'create' ? '➕ NOUVELLE COLLECTION' : '✎ MODIFIER'}
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label style={labelStyle}>Nom *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Konoha Arc 1" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Description courte de la collection..." style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div>
              <label style={labelStyle}>Couleur accent</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.accent_color || '#fbc059'} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                  style={{ width: 44, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', padding: 2 }} />
                <input value={form.accent_color || '#fbc059'} onChange={e => setForm(f => ({ ...f, accent_color: e.target.value }))}
                  placeholder="#fbc059" style={{ ...inputStyle, width: 120 }} />
                <div style={{ width: 36, height: 36, borderRadius: 8, background: form.accent_color || '#fbc059', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>couleur du pack dans /packs</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Image de couverture</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', border: '1px dashed rgba(251,192,89,0.3)', background: 'rgba(251,192,89,0.04)', color: coverUploading ? 'rgba(255,255,255,0.3)' : '#fbc059', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} disabled={coverUploading} />
                {coverUploading ? '⏳ Upload...' : '📁 Choisir une image'}
              </label>
              {form.cover_url && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={form.cover_url} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <button onClick={() => setForm(f => ({ ...f, cover_url: '' }))} className="font-mono text-xs" style={{ color: '#FF2D55' }}>✕ Retirer</button>
                </div>
              )}
              <input value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="Ou coller une URL..." style={{ ...inputStyle, marginTop: 8 }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="cursor-pointer flex items-center gap-2" onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: form.active ? '#34D399' : 'transparent', border: `1px solid ${form.active ? '#34D399' : 'rgba(255,255,255,0.2)'}` }}>
                  {form.active && <span style={{ color: '#0a0a0a', fontSize: '0.7rem' }}>✓</span>}
                </div>
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Visible dans les packs</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={saveCollection} disabled={saving || !form.name.trim()}
                className="px-6 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: saved ? '#34D399' : '#fbc059', color: '#0a0a0a' }}>
                {saving ? '...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
              </button>
              <button onClick={() => setEditMode(null)} className="px-4 py-2 rounded-lg font-mono text-xs transition-all hover:opacity-70"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste collections */}
      {loading ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : collections.length === 0 ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune collection. Crées-en une !</p>
      ) : (
        <div className="flex flex-col gap-2">
          {collections.map(col => (
            <div key={col.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${col.active ? 'rgba(251,192,89,0.2)' : 'rgba(255,255,255,0.06)'}`, background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-4 px-4 py-3">
                {col.cover_url && <img src={col.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: col.accent_color || '#fbc059', boxShadow: `0 0 6px ${col.accent_color || '#fbc059'}88` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-sm truncate" style={{ color: col.active ? '#ffffff' : 'rgba(255,255,255,0.4)' }}>{col.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{col.card_count} carte{col.card_count !== 1 ? 's' : ''}</p>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: col.active ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)', color: col.active ? '#34D399' : 'rgba(255,255,255,0.3)', border: `1px solid ${col.active ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                  {col.active ? 'visible' : 'masqué'}
                </span>
                <button onClick={() => toggleActive(col)} className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-80 flex-shrink-0"
                  style={{ background: col.active ? 'rgba(255,45,85,0.08)' : 'rgba(52,211,153,0.08)', border: `1px solid ${col.active ? 'rgba(255,45,85,0.2)' : 'rgba(52,211,153,0.2)'}`, color: col.active ? '#FF2D55' : '#34D399' }}>
                  {col.active ? 'Masquer' : 'Activer'}
                </button>
                <button onClick={() => { setEditMode(col.id); setForm({ name: col.name, description: col.description || '', cover_url: col.cover_url || '', accent_color: col.accent_color || '#fbc059', active: col.active }) }}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-80 flex-shrink-0"
                  style={{ background: 'rgba(251,192,89,0.08)', border: '1px solid rgba(251,192,89,0.2)', color: '#fbc059' }}>
                  ✎
                </button>
                <button
                  onClick={() => {
                    if (selectedCollection?.id === col.id) { setSelectedCollection(null) }
                    else { setSelectedCollection(col); fetchCharacters() }
                  }}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-80 flex-shrink-0"
                  style={{ background: selectedCollection?.id === col.id ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.05)', border: `1px solid ${selectedCollection?.id === col.id ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.2)'}`, color: '#38BDF8' }}>
                  {selectedCollection?.id === col.id ? '▲ Fermer' : '🃏 Cartes'}
                </button>
                {confirmDelete === col.id ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Supprimer ?</span>
                    <button onClick={() => deleteCollection(col.id)} disabled={deleting === col.id}
                      className="px-3 py-1 rounded-lg font-mono text-xs font-bold hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#FF2D55', color: '#fff' }}>
                      {deleting === col.id ? '...' : 'Oui'}
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1 rounded-lg font-mono text-xs hover:opacity-70"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                      Non
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(col.id)}
                    className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-80 flex-shrink-0"
                    style={{ background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.15)', color: '#FF2D55' }}>
                    🗑
                  </button>
                )}
              </div>

              {/* Panel assignation cartes */}
              {selectedCollection?.id === col.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="font-mono text-xs font-bold mt-3 mb-3" style={{ color: '#38BDF8' }}>ASSIGNER DES PERSONNAGES À "{col.name}"</p>
                  <div className="flex gap-3 mb-3 flex-wrap">
                    <input value={charSearch} onChange={e => setCharSearch(e.target.value)} placeholder="Rechercher..."
                      style={{ ...inputStyle, flex: 1, minWidth: '140px' }} />
                    <select value={filterServer} onChange={e => setFilterServer(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                      <option value="all" style={{ background: '#0a0a0a' }}>Tous les serveurs</option>
                      {servers.map(s => <option key={s} value={s} style={{ background: '#0a0a0a' }}>{s}</option>)}
                    </select>
                  </div>
                  {charsLoading ? (
                    <p className="font-mono text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                      {filteredChars.map(c => {
                        const rc = rarityColors[c.rarity] || '#9CA3AF'
                        const inThisCol = c.collection_id === col.id
                        const inOtherCol = c.collection_id && c.collection_id !== col.id
                        const otherColName = inOtherCol ? collections.find(x => x.id === c.collection_id)?.name : null
                        return (
                          <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                            style={{ background: inThisCol ? 'rgba(56,189,248,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${inThisCol ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)'}` }}>
                            {c.image_url && <img src={c.image_url} alt="" className="w-6 h-6 rounded object-cover object-top flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-xs font-bold truncate" style={{ color: '#fff' }}>{c.rp_name}</p>
                              {inOtherCol && <p className="font-mono" style={{ fontSize: '0.55rem', color: '#fbc059' }}>Dans : {otherColName}</p>}
                            </div>
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ background: `${rc}18`, color: rc, fontSize: '0.6rem' }}>
                              {c.rarity || 'NORMAL'}
                            </span>
                            <button
                              onClick={() => assignCollection(c.id, inThisCol ? null : col.id)}
                              disabled={assigningSaving === c.id}
                              className="px-3 py-1 rounded font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                              style={{ background: inThisCol ? 'rgba(255,45,85,0.1)' : 'rgba(56,189,248,0.1)', color: inThisCol ? '#FF2D55' : '#38BDF8', border: `1px solid ${inThisCol ? 'rgba(255,45,85,0.3)' : 'rgba(56,189,248,0.3)'}`, minWidth: 60 }}>
                              {assigningSaving === c.id ? '...' : inThisCol ? '✕ Retirer' : '+ Ajouter'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page Owner ───────────────────────────────────────────────────────────────
function Owner() {
  const [user, setUser] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [tab, setTab] = useState('resources')

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
        setIsOwner(adminData?.role === 'owner')
      }
    })
  }, [])

  if (!user) return (
    <div className="flex items-center justify-center h-full">
      <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connexion requise.</p>
    </div>
  )

  if (!isOwner) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="font-mono text-4xl mb-2" style={{ color: '#FF2D55' }}>Accès refusé</p>
        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Réservé au propriétaire.</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: '#ffffff' }}>
          PANEL <span style={{ color: '#fbc059' }}>OWNER</span>
        </h1>
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Gestion des ressources, raretés et logs</p>
      </div>

      <StatsBar />

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'resources', label: '🎁 Ressources joueurs' },
          { key: 'rarities', label: '✦ Raretés des cartes' },
          { key: 'rarity-logs', label: '📋 Logs raretés' },
          { key: 'status-logs', label: '📋 Logs status' },
          { key: 'give-card', label: '🎁 Donner une carte' },
          { key: 'team', label: '👥 Équipe' },
          { key: 'collections', label: '📦 Collections' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200"
            style={{
              background: tab === t.key ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tab === t.key ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: tab === t.key ? '#fbc059' : 'rgba(255,255,255,0.4)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resources' && <ResourcesTab />}
      {tab === 'rarities' && <RaritiesTab />}
      {tab === 'rarity-logs' && <RarityLogsTab />}
      {tab === 'status-logs' && <StatusLogsTab />}
      {tab === 'give-card' && <GiveCardTab />}
      {tab === 'team' && <TeamTab />}
      {tab === 'collections' && <CollectionsTab />}
    </div>
  )
}

export default Owner