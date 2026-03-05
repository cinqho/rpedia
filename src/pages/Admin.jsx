import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

// ICI : Mise à jour complète de la liste pour le menu déroulant
const statOptions = [
  'S+', 'S', 'S-', 
  'A+', 'A', 'A-', 
  'B+', 'B', 'B-', 
  'C+', 'C', 'C-', 
  'D+', 'D', 'D-'
]

const universes = ['Naruto', 'One Piece', 'Bleach', 'Dragon Ball', 'Autre']
const statusOptions = ['pending', 'approved', 'rejected']
const rarityOptions = [
  'NORMAL', 'VETERAN', 'ELITE', 'EPIQUE', 'LEGEND',
  'COUP DE COEUR', 'RPEDIA VALIDATION', 'SHINY', 'SECRET', 'NECROSIS', 'COSMIQUE', 'DIVIN', 'ABYSSAL','SUPREME'
]

const rarityColors = {
  NORMAL: '#9CA3AF', VETERAN: '#34D399', ELITE: '#38BDF8',
  EPIQUE: '#A855F7', LEGEND: '#fbc059', 'COUP DE COEUR': '#F472B6',
  'RPEDIA VALIDATION': '#fbc059', SHINY: '#67E8F9', SECRET: '#F472B6',
  SUPREME: '#FF1A1A', ABYSSAL: '#0EA5E9', DIVIN: '#FFF9C4',
  COSMIQUE: '#C084FC', NECROSIS: '#4ADE80',
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

function Field({ label, name, value, onChange, type = 'text', options }) {
  if (options) return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select name={name} value={value || ''} onChange={onChange} style={inputStyle}>
        {options.map(o => <option key={o} value={o} style={{ background: '#0a0a0a' }}>{o}</option>)}
      </select>
    </div>
  )
  if (type === 'textarea') return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea name={name} value={value || ''} onChange={onChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
    </div>
  )
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} name={name} value={value || ''} onChange={onChange} style={inputStyle} />
    </div>
  )
}

function CharacterRow({ character, adminId, onSave }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(character)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savingRarity, setSavingRarity] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleRarityChange(newRarity) {
    const oldRarity = form.rarity || 'NORMAL'
    if (newRarity === oldRarity) return
    setSavingRarity(true)

    await supabase.from('characters').update({ rarity: newRarity }).eq('id', character.id)

    await supabase.from('rarity_logs').insert({
      character_id: character.id,
      character_name: form.rp_name,
      admin_id: adminId,
      old_rarity: oldRarity,
      new_rarity: newRarity,
    })

    setForm(f => ({ ...f, rarity: newRarity }))
    onSave({ ...character, ...form, rarity: newRarity })
    setSavingRarity(false)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('characters')
      .update({
        rp_name: form.rp_name,
        surname: form.surname,
        universe: form.universe,
        server: form.server,
        player: form.player,
        description: form.description,
        legacy: form.legacy,
        image_url: form.image_url,
        stat_rp: form.stat_rp,
        stat_pvp: form.stat_pvp,
        stat_lor: form.stat_lor,
        stat_imp: form.stat_imp,
        status: form.status,
      })
      .eq('id', character.id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSave({ ...character, ...form })
    }
  }

  const statusColor = {
    pending: '#fbc059',
    approved: '#34D399',
    rejected: '#FF2D55',
  }[form.status] || '#9CA3AF'

  const rarityColor = rarityColors[form.rarity || 'NORMAL'] || '#9CA3AF'

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div
        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => setOpen(o => !o)}
      >
        {form.image_url && (
          <img src={form.image_url} alt={form.rp_name} className="w-8 h-8 rounded-lg object-cover object-top flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-sm truncate" style={{ color: '#ffffff' }}>{form.rp_name}</p>
          <p className="font-mono text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{form.server} · {form.universe}</p>
        </div>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}44` }}>
          {form.status}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Field label="Nom RP" name="rp_name" value={form.rp_name} onChange={handleChange} />
            <Field label="Surnom" name="surname" value={form.surname} onChange={handleChange} />
            <Field label="Univers" name="universe" value={form.universe} onChange={handleChange} options={universes} />
            <Field label="Serveur" name="server" value={form.server} onChange={handleChange} />
            <Field label="Joueur" name="player" value={form.player} onChange={handleChange} />
            <Field label="URL Image" name="image_url" value={form.image_url} onChange={handleChange} />
            <Field label="Statut" name="status" value={form.status} onChange={handleChange} options={statusOptions} />
          </div>

          <div className="mb-3">
            <label style={labelStyle}>Rareté {savingRarity && <span style={{ color: 'rgba(255,255,255,0.3)', textTransform: 'none', letterSpacing: 0 }}>— enregistrement...</span>}</label>
            <select
              value={form.rarity || 'NORMAL'}
              onChange={e => handleRarityChange(e.target.value)}
              disabled={savingRarity}
              style={{ ...inputStyle, color: rarityColor, borderColor: `${rarityColor}44` }}
            >
              {rarityOptions.map(r => <option key={r} value={r} style={{ background: '#0a0a0a', color: '#fff' }}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <Field label="Stat RP" name="stat_rp" value={form.stat_rp} onChange={handleChange} options={statOptions} />
            <Field label="Stat PVP" name="stat_pvp" value={form.stat_pvp} onChange={handleChange} options={statOptions} />
            <Field label="Stat LOR" name="stat_lor" value={form.stat_lor} onChange={handleChange} options={statOptions} />
            <Field label="Stat IMP" name="stat_imp" value={form.stat_imp} onChange={handleChange} options={statOptions} />
          </div>

          <div className="flex flex-col gap-3 mb-3">
            <Field label="Description" name="description" value={form.description} onChange={handleChange} type="textarea" />
            <Field label="Legacy / Histoire RP" name="legacy" value={form.legacy} onChange={handleChange} type="textarea" />
          </div>

          <div className="flex items-center justify-between">
            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>ID : {character.id}</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg font-mono text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ background: saved ? '#34D399' : '#fbc059', color: '#0a0a0a' }}
            >
              {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Admin() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterServer, setFilterServer] = useState('all')
  const [servers, setServers] = useState([])

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
        setIsAdmin(!!adminData)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (user && isAdmin) fetchCharacters()
  }, [user, isAdmin])

  async function fetchCharacters() {
    setLoading(true)
    const { data } = await supabase
      .from('characters')
      .select('*')
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

  if (!isAdmin) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="font-mono text-4xl mb-2" style={{ color: '#FF2D55' }}>Accès refusé</p>
        <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Tu n'as pas les droits pour accéder à cette page.</p>
      </div>
    </div>
  )

  const filtered = characters.filter(c => {
    const matchSearch = !search || c.rp_name?.toLowerCase().includes(search.toLowerCase()) || c.player?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    const matchServer = filterServer === 'all' || c.server === filterServer
    return matchSearch && matchStatus && matchServer
  })

  const counts = {
    all: characters.length,
    pending: characters.filter(c => c.status === 'pending').length,
    approved: characters.filter(c => c.status === 'approved').length,
    rejected: characters.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', color: '#ffffff' }}>
          PANEL <span style={{ color: '#fbc059' }}>ADMIN</span>
        </h1>
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {counts.all} personnages · {counts.pending} en attente · {counts.approved} approuvés · {counts.rejected} refusés
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: '160px' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all" style={{ background: '#0a0a0a' }}>Tous les statuts ({counts.all})</option>
          <option value="pending" style={{ background: '#0a0a0a' }}>En attente ({counts.pending})</option>
          <option value="approved" style={{ background: '#0a0a0a' }}>Approuvés ({counts.approved})</option>
          <option value="rejected" style={{ background: '#0a0a0a' }}>Refusés ({counts.rejected})</option>
        </select>
        <select value={filterServer} onChange={e => setFilterServer(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="all" style={{ background: '#0a0a0a' }}>Tous les serveurs</option>
          {servers.map(s => <option key={s} value={s} style={{ background: '#0a0a0a' }}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="font-mono text-xs text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucun personnage trouvé.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(c => (
            <CharacterRow key={c.id} character={c} adminId={user.id} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin