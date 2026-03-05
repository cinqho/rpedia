import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const OWNER_ID = '723c19f4-54ec-4ff2-951e-ae98765a6b9d'

const rarityOptions = [
  'NORMAL', 'VETERAN', 'ELITE', 'EPIQUE', 'LEGEND',
  'COUP DE COEUR', 'RPEDIA VALIDATION', 'SHINY', 'SECRET'
]

const rarityColors = {
  NORMAL: '#9CA3AF', VETERAN: '#34D399', ELITE: '#38BDF8',
  EPIQUE: '#A855F7', LEGEND: '#fbc059', 'COUP DE COEUR': '#F472B6',
  'RPEDIA VALIDATION': '#fbc059', SHINY: '#67E8F9', SECRET: '#F472B6',
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

// ─── Onglet Ressources ────────────────────────────────────────────────────────
function ResourcesTab() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)

  // Donner packs à tous
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
      {/* Donner packs à tous */}
      <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(251,192,89,0.05)', border: '1px solid rgba(251,192,89,0.2)' }}>
        <p className="font-mono text-xs font-bold mb-3" style={{ color: '#fbc059', letterSpacing: '0.08em' }}>
          🎁 DONNER DES PACKS À TOUT LE MONDE
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div style={{ flex: '0 0 auto' }}>
            <label style={labelStyle}>Nombre de packs</label>
            <input
              type="number"
              min="1"
              value={giveAllAmount}
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
                <button
                  onClick={givePacksToAll}
                  disabled={givingAll}
                  className="px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: gaveAll ? '#34D399' : '#FF2D55', color: '#fff' }}
                >
                  {givingAll ? '...' : gaveAll ? '✓ Envoyé !' : '✓ Confirmer'}
                </button>
                <button
                  onClick={() => setConfirmAll(false)}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all hover:opacity-70"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
        {gaveAll && (
          <p className="font-mono text-xs mt-2" style={{ color: '#34D399' }}>✓ Packs distribués à tous les joueurs !</p>
        )}
      </div>

      {/* Liste joueurs */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un joueur..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={fetchResources} className="px-4 py-2 rounded-lg font-mono text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(r => (
            <div key={r.user_id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {r.profiles?.avatar_url && (
                <img src={r.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>
                  {r.profiles?.discord_username || 'Inconnu'}
                </p>
                <p className="font-mono text-xs truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>{r.user_id}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Packs :</span>
                <input
                  type="number"
                  min="0"
                  value={r.packs_available}
                  onChange={e => setResources(prev => prev.map(x => x.user_id === r.user_id ? { ...x, packs_available: e.target.value } : x))}
                  style={{ ...inputStyle, width: '60px', textAlign: 'center', padding: '4px 8px' }}
                />
                <button
                  onClick={() => updatePacks(r.user_id, r.packs_available)}
                  disabled={saving === r.user_id}
                  className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{ background: saved === r.user_id ? '#34D399' : '#fbc059', color: '#0a0a0a', whiteSpace: 'nowrap' }}
                >
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
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un personnage..."
          style={{ ...inputStyle, flex: 1, minWidth: '160px' }}
        />
        <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all" style={{ background: '#0a0a0a' }}>Toutes les raretés</option>
          {rarityOptions.map(r => <option key={r} value={r} style={{ background: '#0a0a0a' }}>{r}</option>)}
        </select>
        <button onClick={fetchCharacters} className="px-4 py-2 rounded-lg font-mono text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
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
              <div key={c.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {c.image_url && <img src={c.image_url} alt={c.rp_name} className="w-8 h-8 rounded-lg object-cover object-top flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>{c.rp_name}</p>
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.server}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={c.rarity || 'NORMAL'}
                    onChange={e => updateRarity(c.id, e.target.value)}
                    disabled={saving === c.id}
                    style={{ ...inputStyle, width: 'auto', color, borderColor: `${color}44` }}
                  >
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

  const filtered = logs.filter(l =>
    !search ||
    l.character_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.profiles?.discord_username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par personnage ou admin..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={fetchLogs} className="px-4 py-2 rounded-lg font-mono text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          ↻ Refresh
        </button>
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
              <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Admin avatar */}
                {log.profiles?.avatar_url ? (
                  <img src={log.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" style={{ opacity: 0.7 }} />
                ) : (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>?</span>
                  </div>
                )}

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold truncate" style={{ color: '#ffffff' }}>{log.character_name}</p>
                  <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    par <span style={{ color: 'rgba(255,255,255,0.5)' }}>{log.profiles?.discord_username || log.admin_id}</span>
                  </p>
                </div>

                {/* Changement */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: `${fromColor}18`, color: fromColor, border: `1px solid ${fromColor}44` }}>
                    {log.old_rarity || 'NORMAL'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>→</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: `${toColor}18`, color: toColor, border: `1px solid ${toColor}44` }}>
                    {log.new_rarity}
                  </span>
                </div>

                {/* Date */}
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

// ─── Page Owner ───────────────────────────────────────────────────────────────
function Owner() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('resources')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  }, [])

  if (!user) return (
    <div className="flex items-center justify-center h-full">
      <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connexion requise.</p>
    </div>
  )

  if (user.id !== OWNER_ID) return (
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'resources', label: '🎁 Ressources joueurs' },
          { key: 'rarities', label: '✦ Raretés des cartes' },
          { key: 'rarity-logs', label: '📋 Logs raretés' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider transition-all duration-200"
            style={{
              background: tab === t.key ? 'rgba(251,192,89,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tab === t.key ? 'rgba(251,192,89,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: tab === t.key ? '#fbc059' : 'rgba(255,255,255,0.4)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resources' && <ResourcesTab />}
      {tab === 'rarities' && <RaritiesTab />}
      {tab === 'rarity-logs' && <RarityLogsTab />}
    </div>
  )
}

export default Owner