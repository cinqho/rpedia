import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import { LeftShape, RightShape } from '../components/FormShapes'
import { useLocation } from 'react-router-dom'

const universes = ['Naruto', 'One Piece', 'Bleach', 'Dragon Ball', 'Autre']

const statOptions = [
  { value: 'S+', label: 'S+ — Divin' },
  { value: 'S',  label: 'S — Légendaire' },
  { value: 'S-', label: 'S- — Mythique' },
  { value: 'A+', label: 'A+ — Maître' },
  { value: 'A',  label: 'A — Excellent' },
  { value: 'A-', label: 'A- — Très bon' },
  { value: 'B+', label: 'B+ — Compétent' },
  { value: 'B',  label: 'B — Solide' },
  { value: 'B-', label: 'B- — Correct' },
  { value: 'C+', label: 'C+ — Moyen +' },
  { value: 'C',  label: 'C — Moyen' },
  { value: 'C-', label: 'C- — Moyen -' },
  { value: 'D+', label: 'D+ — Limite' },
  { value: 'D',  label: 'D — Faible' },
  { value: 'D-', label: 'D- — Inexistant' },
]

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#ffffff',
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontFamily: 'monospace',
  outline: 'none',
}

const labelStyle = {
  color: '#fbc059',
  fontSize: '0.7rem',
  fontFamily: 'monospace',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '8px',
}

function AddCharacter() {
  const location = useLocation()
  const [form, setForm] = useState({
    rp_name: '', surname: '', universe: '', server: '',
    player: '', description: '', legacy: '', image_url: '',
    stat_rp: 'C', stat_pvp: 'C', stat_lor: 'C', stat_imp: 'C',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [accepted, setAccepted] = useState(false)
  const [user, setUser] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [servers, setServers] = useState([])
  const [customServer, setCustomServer] = useState(false)

  const [nameStatus, setNameStatus] = useState(null)
  const debounceRef = useRef(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setError("Image trop lourde (max 5MB).")
    setImageUploading(true)
    setError(null)
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "RPedia")
    data.append("cloud_name", "dzll8uy9f")
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dzll8uy9f/image/upload", { method: "POST", body: data })
      const json = await res.json()
      if (json.secure_url) {
        setForm(f => ({ ...f, image_url: json.secure_url }))
        setImagePreview(json.secure_url)
      } else { setError("Erreur upload image.") }
    } catch { setError("Erreur upload image.") }
    setImageUploading(false)
  }

  useEffect(() => {
    setSuccess(false)
    setPendingCount(0)
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchPendingCount(u.id)
    })
    fetchServers()
  }, [location.key])

  async function fetchServers() {
    const { data } = await supabase
      .from('characters')
      .select('server')
      .eq('status', 'approved')
    const unique = [...new Set((data || []).map(c => c.server?.trim()).filter(Boolean))].sort()
    setServers(unique)
  }

  async function fetchPendingCount(userId) {
    const { count } = await supabase
      .from('characters')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('status', 'pending')
    setPendingCount(count ?? 0)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })

    if (name === 'rp_name') {
      setNameStatus(null)
      clearTimeout(debounceRef.current)
      if (value.trim().length < 2) return
      setNameStatus('checking')
      debounceRef.current = setTimeout(async () => {
        const { data } = await supabase
          .rpc('check_rp_name_exists', { p_name: value.trim() })
        setNameStatus(data === true ? 'taken' : 'free')
      }, 500)
    }
  }

  function handleServerSelect(e) {
    const val = e.target.value
    if (val === '__custom__') {
      setCustomServer(true)
      setForm({ ...form, server: '' })
    } else {
      setCustomServer(false)
      setForm({ ...form, server: val })
    }
  }

  async function handleSubmit() {
    if (!user) return setError("Tu dois être connecté avec Discord pour proposer un personnage.")
    if (!accepted) return setError("Tu dois accepter la modération.")
    if (!form.rp_name || !form.universe || !form.server.trim()) return setError("Nom RP, univers et serveur sont obligatoires.")
    if (pendingCount >= 5) return setError("Tu as déjà 5 suggestions en attente. Attends qu'elles soient traitées.")
    if (nameStatus === 'taken') return setError("Ce nom RP existe déjà dans la base.")

    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('characters')
      .insert([{ ...form, server: form.server.trim(), status: 'pending', author_id: user.id }])

    if (error) setError(error.message)
    else {
      await fetchPendingCount(user.id)
      setSuccess(true)
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <LeftShape /><RightShape />
        </div>
        <div className="text-center relative" style={{ zIndex: 1 }}>
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#fbc059' }}>Connexion requise</h2>
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Connecte-toi avec Discord via la sidebar pour proposer un personnage.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <LeftShape /><RightShape />
        </div>
        <div className="text-center relative" style={{ zIndex: 1 }}>
          <h2 className="text-4xl mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#fbc059' }}>Proposition envoyée !</h2>
          <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Ton personnage sera examiné avant publication. ({pendingCount}/5 slots utilisés)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <LeftShape /><RightShape />
      </div>
      <div className="relative p-8 max-w-2xl mx-auto" style={{ zIndex: 1 }}>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', letterSpacing: '0.05em', color: '#ffffff' }}>
              PROPOSER UN <span style={{ color: '#fbc059' }}>PERSONNAGE</span>
            </h1>
            <p className="font-mono text-xs tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Ta proposition sera examinée avant d'être publiée.
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="font-mono text-xs" style={{ color: pendingCount >= 5 ? '#FF2D55' : '#fbc059' }}>
              {5 - pendingCount} slot{5 - pendingCount > 1 ? 's' : ''} disponible{5 - pendingCount > 1 ? 's' : ''}
            </p>
            <div className="flex gap-1 mt-1 justify-end">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{ background: i < pendingCount ? '#FF2D55' : 'rgba(251,192,89,0.3)' }} />
              ))}
            </div>
          </div>
        </div>

        {pendingCount >= 5 ? (
          <div className="flex items-center justify-center h-40 rounded-xl"
            style={{ background: 'rgba(255,45,85,0.05)', border: '1px solid rgba(255,45,85,0.2)' }}>
            <p className="font-mono text-sm text-center px-4" style={{ color: '#FF2D55' }}>
              Tu as 5 suggestions en attente.<br />Attends qu'elles soient traitées pour en soumettre une nouvelle.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">

            <div>
              <label style={labelStyle}>Nom RP *</label>
              <div style={{ position: 'relative' }}>
                <input
                  name="rp_name"
                  value={form.rp_name}
                  onChange={handleChange}
                  placeholder="ex: Sasuke Uchiha"
                  style={{
                    ...inputStyle,
                    borderColor: nameStatus === 'taken' ? '#FF2D55' : nameStatus === 'free' ? '#34D399' : 'rgba(255,255,255,0.12)',
                    paddingRight: '40px',
                  }}
                />
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem' }}>
                  {nameStatus === 'checking' && <span style={{ color: 'rgba(255,255,255,0.3)' }}>···</span>}
                  {nameStatus === 'free'     && <span style={{ color: '#34D399' }}>✓</span>}
                  {nameStatus === 'taken'    && <span style={{ color: '#FF2D55' }}>✗</span>}
                </div>
              </div>
              {nameStatus === 'taken' && (
                <p className="font-mono text-xs mt-2" style={{ color: '#FF2D55' }}>Ce nom RP existe déjà dans la base de données.</p>
              )}
              {nameStatus === 'free' && (
                <p className="font-mono text-xs mt-2" style={{ color: '#34D399' }}>Nom disponible.</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Surnom</label>
              <input name="surname" value={form.surname} onChange={handleChange} placeholder="ex: Sasuke" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Univers *</label>
              <select name="universe" value={form.universe} onChange={handleChange} style={inputStyle}>
                <option value="" style={{ background: '#0a0a0a' }}>Choisir un univers</option>
                {universes.map(u => <option key={u} value={u} style={{ background: '#0a0a0a' }}>{u}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Serveur *</label>
              <select
                value={customServer ? '__custom__' : form.server}
                onChange={handleServerSelect}
                style={inputStyle}
              >
                <option value="" style={{ background: '#0a0a0a' }}>Choisir un serveur</option>
                {servers.map(s => <option key={s} value={s} style={{ background: '#0a0a0a' }}>{s}</option>)}
                <option value="__custom__" style={{ background: '#0a0a0a' }}>✏️ Autre serveur...</option>
              </select>
              {customServer && (
                <input
                  name="server"
                  value={form.server}
                  onChange={handleChange}
                  placeholder="Nom du serveur"
                  style={{ ...inputStyle, marginTop: '8px' }}
                  autoFocus
                />
              )}
            </div>

            <div>
              <label style={labelStyle}>Joueur (pseudo)</label>
              <input name="player" value={form.player} onChange={handleChange} placeholder="ex: Cinqho" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Description courte</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Résume le personnage en quelques mots..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
            </div>

            <div>
              <label style={labelStyle}>Histoire RP / Legacy</label>
              <textarea name="legacy" value={form.legacy} onChange={handleChange}
                placeholder="Raconte l'histoire de ce personnage sur le serveur..." rows={5} style={{ ...inputStyle, resize: 'none' }} />
            </div>

            <div>
              <label style={labelStyle}>Image</label>

              {/* Upload depuis le PC */}
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                padding: '14px', borderRadius: '12px', cursor: 'pointer',
                border: '1px dashed rgba(251,192,89,0.3)',
                background: 'rgba(251,192,89,0.04)',
                color: imageUploading ? 'rgba(255,255,255,0.3)' : '#fbc059',
                fontFamily: 'monospace', fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={imageUploading} />
                {imageUploading ? '⏳ Upload en cours...' : '📁 Choisir un fichier depuis mon PC'}
              </label>

              {/* Préview */}
              {imagePreview && (
                <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(251,192,89,0.2)' }} />
                  <button onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image_url: '' })) }}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}>
                    ✕
                  </button>
                </div>
              )}

              {/* Séparateur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>OU</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* URL manuelle */}
              <input name="image_url" value={form.image_url} onChange={e => { handleChange(e); setImagePreview(e.target.value) }} placeholder="Coller une URL imgur / autre..." style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Stats proposées</label>
              <p className="font-mono text-xs mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Ces stats seront vérifiées et ajustées par le modérateur.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'stat_rp',  label: 'RP — Qualité du roleplay' },
                  { name: 'stat_pvp', label: 'PVP — Combat' },
                  { name: 'stat_lor', label: 'LOR — Lore / Histoire' },
                  { name: 'stat_imp', label: 'IMP — Impact serveur' },
                ].map(stat => (
                  <div key={stat.name}>
                    <label style={{ ...labelStyle, fontSize: '0.6rem' }}>{stat.label}</label>
                    <select name={stat.name} value={form[stat.name]} onChange={handleChange} style={inputStyle}>
                      {statOptions.map(o => (
                        <option key={o.value} value={o.value} style={{ background: '#0a0a0a' }}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAccepted(!accepted)}>
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                style={{ background: accepted ? '#fbc059' : 'transparent', border: `1px solid ${accepted ? '#fbc059' : 'rgba(255,255,255,0.2)'}` }}>
                {accepted && <span style={{ color: '#0a0a0a', fontSize: '0.7rem' }}>✓</span>}
              </div>
              <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
                J'accepte que mon contenu soit modéré avant publication.
              </p>
            </div>

            {error && <p className="text-xs font-mono" style={{ color: '#FF2D55' }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading || nameStatus === 'taken' || nameStatus === 'checking'}
              className="w-full py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ background: '#fbc059', color: '#0a0a0a' }}
            >
              {loading ? 'Envoi en cours...' : 'Proposer le personnage'}
            </button>

          </div>
        )}
      </div>
    </div>
  )
}

export default AddCharacter