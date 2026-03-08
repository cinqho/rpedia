import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, PlusCircle, Trophy, Info, Package, LayoutGrid, Menu, X, Shield, Crown, Scale, Bell } from 'lucide-react'
import AuthButton from './AuthButton'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const links = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/characters', label: 'Personnages', icon: Users },
  { path: '/add-character', label: 'Suggérer', icon: PlusCircle },
  { path: '/ranking', label: 'Classements', icon: Trophy },
  { path: '/pack', label: 'Pack', icon: Package },
  { path: '/deck', label: 'Casier', icon: LayoutGrid },
  { path: '/about', label: 'About', icon: Info },
]

const sidebarStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
}

// ─── Composant Notifications ──────────────────────────────────────────────────
function NotificationBell({ userId }) {
  const [notifs, setNotifs] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    if (!userId) return
    fetchNotifs()

    // Realtime : écoute les nouvelles notifs
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifs(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // Fermer en cliquant dehors → supprime toutes les notifs
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target) && open) {
        setOpen(false)
        deleteAllNotifs()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, notifs])

  async function fetchNotifs() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs(data || [])
  }

  async function deleteAllNotifs() {
    if (!notifs.length) return
    const ids = notifs.map(n => n.id)
    await supabase.from('notifications').delete().in('id', ids)
    setNotifs([])
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return "à l'instant"
    if (m < 60) return `il y a ${m}min`
    const h = Math.floor(m / 60)
    if (h < 24) return `il y a ${h}h`
    return `il y a ${Math.floor(h / 24)}j`
  }

  if (!userId) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/5 font-mono text-sm tracking-wide"
        style={{
          color: unread > 0 ? '#fbc059' : 'rgba(255,255,255,0.45)',
          background: open ? 'rgba(251,192,89,0.08)' : 'transparent',
          borderLeft: open ? '2px solid #fbc059' : '2px solid transparent',
          position: 'relative',
        }}
      >
        <Bell size={16} style={{ color: '#fbc059', flexShrink: 0 }} />
        <span className="flex-1 text-left">Notifs</span>
        {unread > 0 && (
          <span style={{
            background: '#FF2D55',
            color: '#fff',
            fontSize: '0.6rem',
            fontWeight: 700,
            borderRadius: '999px',
            padding: '1px 6px',
            minWidth: 18,
            textAlign: 'center',
            lineHeight: '16px',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              zIndex: 100,
              maxHeight: 320,
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Notifications</span>

            </div>

            {notifs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Aucune notification</p>
              </div>
            ) : (
              notifs.map(n => {
                const approved = n.type === 'approved'
                const color = approved ? '#34D399' : '#FF2D55'
                const icon = approved ? '✅' : '❌'
                const label = approved ? 'Approuvé' : 'Refusé'
                return (
                  <div
                    key={n.id}
                    onClick={() => {}}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: n.read ? 'transparent' : 'rgba(255,255,255,0.03)',
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#fff', fontWeight: n.read ? 400 : 700, marginBottom: 2 }}>
                        <span style={{ color }}>{n.character_name}</span>
                      </p>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)' }}>
                        Ton personnage a été <span style={{ color }}>{label.toLowerCase()}</span>
                      </p>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── SidebarContent ───────────────────────────────────────────────────────────
function SidebarContent({ onClose, isAdmin, isOwner, isEquilibrage, userId }) {
  return (
    <>
      <div style={{
        position: 'absolute', right: '12px', top: '15%',
        width: '1px', height: '30%',
        background: 'linear-gradient(to bottom, transparent, rgba(251,192,89,0.15), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px',
        background: 'linear-gradient(to top, rgba(251,192,89,0.04), transparent)',
        pointerEvents: 'none', borderRadius: '0 0 16px 16px',
      }} />

      {/* Logo */}
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <img src="/Logo_RPedia.png" alt="RPedia" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em', fontSize: '2rem' }}>
          <span style={{ color: '#ffffff' }}>RP</span><span style={{ color: '#fbc059' }}>EDIA</span>
        </h1>
        {onClose && (
          <button onClick={onClose} className="ml-auto md:hidden" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1 mt-2">
        {links.map((link, i) => {
          const Icon = link.icon
          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, ease: 'easeOut' }}
            >
              <NavLink
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => `
                  relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide
                  ${isActive ? '' : 'hover:bg-white/5'}
                `}
                style={({ isActive }) => ({
                  color: isActive ? '#fbc059' : 'rgba(255,255,255,0.45)',
                  background: isActive ? 'rgba(251,192,89,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid #fbc059' : '2px solid transparent',
                  boxShadow: isActive ? 'inset 0 0 20px rgba(251,192,89,0.05)' : 'none',
                })}
              >
                <Icon size={16} style={{ color: '#fbc059', flexShrink: 0 }} />
                {link.label}
              </NavLink>
            </motion.div>
          )
        })}

        {/* Notifications juste après les liens nav */}
        <NotificationBell userId={userId} />
      </nav>

      {/* Boutons rôles */}
      {(isAdmin || isOwner || isEquilibrage) && (
        <div className="mx-4 mb-3 flex flex-col gap-1" style={{ position: 'relative', zIndex: 10 }}>
          {isEquilibrage && (
            <NavLink to="/equilibrage" onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide ${isActive ? '' : 'hover:bg-white/5'}`}
              style={({ isActive }) => ({
                color: isActive ? '#38BDF8' : 'rgba(56,189,248,0.6)',
                background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #38BDF8' : '2px solid transparent',
              })}>
              <Scale size={16} style={{ color: '#38BDF8', flexShrink: 0 }} />
              Équilibrage
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide ${isActive ? '' : 'hover:bg-white/5'}`}
              style={({ isActive }) => ({
                color: isActive ? '#38BDF8' : 'rgba(56,189,248,0.6)',
                background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #38BDF8' : '2px solid transparent',
              })}>
              <Shield size={16} style={{ color: '#38BDF8', flexShrink: 0 }} />
              Admin
            </NavLink>
          )}
          {isOwner && (
            <NavLink to="/owner" onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide ${isActive ? '' : 'hover:bg-white/5'}`}
              style={({ isActive }) => ({
                color: isActive ? '#ff4ecd' : 'rgba(255,78,205,0.6)',
                background: isActive ? 'rgba(255,78,205,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #ff4ecd' : '2px solid transparent',
              })}>
              <Crown size={16} style={{ color: '#ff4ecd', flexShrink: 0 }} />
              Owner
            </NavLink>
          )}
        </div>
      )}

      <div className="mx-4 mb-3 p-3 rounded-xl" style={{ background: 'rgba(251,192,89,0.05)', border: '1px solid rgba(251,192,89,0.15)', position: 'relative', zIndex: 10 }}>
        <p className="font-mono text-xs mb-1 font-bold" style={{ color: '#fbc059' }}>DISCORD RPÉDIA</p>
        <p className="font-mono mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', lineHeight: 1.5 }}>
          Débats, réclamations sur les cartes, suggestions et news.
        </p>
        <a
          href="https://discord.gg/AZ4yerMAaa"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all duration-200 hover:opacity-90"
          style={{ background: 'rgba(251,192,89,0.15)', color: '#fbc059', border: '1px solid rgba(251,192,89,0.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          Rejoindre
        </a>
      </div>

      <AuthButton />
    </>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isEquilibrage, setIsEquilibrage] = useState(false)
  const [userId, setUserId] = useState(null)

  async function checkRole(user) {
    if (!user) {
      setIsAdmin(false); setIsOwner(false); setIsEquilibrage(false); setUserId(null)
      return
    }
    setUserId(user.id)
    const { data } = await supabase.from('admins').select('role').eq('user_id', user.id).single()
    setIsAdmin(!!data && data.role !== 'equilibrage')
    setIsOwner(data?.role === 'owner')
    setIsEquilibrage(data?.role === 'equilibrage' || data?.role === 'owner')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => checkRole(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      checkRole(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const sharedProps = { isAdmin, isOwner, isEquilibrage, userId }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fbc059' }}
      >
        <Menu size={20} />
      </button>

      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-56 flex-col z-50"
        style={{ ...sidebarStyle, margin: '16px 0px 16px 16px', height: 'calc(100vh - 32px)' }}
      >
        <SidebarContent {...sharedProps} />
      </motion.aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 flex flex-col z-50 md:hidden"
              style={{ ...sidebarStyle, borderRadius: '0 16px 16px 0' }}
            >
              <SidebarContent onClose={() => setOpen(false)} {...sharedProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar