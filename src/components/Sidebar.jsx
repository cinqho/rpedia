import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, PlusCircle, Trophy, Info, Package, LayoutGrid, Menu, X, Shield, Crown, Scale } from 'lucide-react'
import AuthButton from './AuthButton'
import { useState, useEffect } from 'react'
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

function SidebarContent({ onClose, isAdmin, isOwner, isEquilibrage }) {
  return (
    <>
      {/* Ligne décorative */}
      <div style={{
        position: 'absolute', right: '12px', top: '15%',
        width: '1px', height: '30%',
        background: 'linear-gradient(to bottom, transparent, rgba(251,192,89,0.15), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Glow bas */}
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
      </nav>

      {/* Boutons rôles */}
      {(isAdmin || isOwner || isEquilibrage) && (
        <div className="mx-4 mb-3 flex flex-col gap-1" style={{ position: 'relative', zIndex: 10 }}>
          {isEquilibrage && (
            <NavLink
              to="/equilibrage"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide ${isActive ? '' : 'hover:bg-white/5'}`}
              style={({ isActive }) => ({
                color: isActive ? '#38BDF8' : 'rgba(56,189,248,0.6)',
                background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #38BDF8' : '2px solid transparent',
              })}
            >
              <Scale size={16} style={{ color: '#38BDF8', flexShrink: 0 }} />
              Équilibrage
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide ${isActive ? '' : 'hover:bg-white/5'}`}
              style={({ isActive }) => ({
                color: isActive ? '#38BDF8' : 'rgba(56,189,248,0.6)',
                background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #38BDF8' : '2px solid transparent',
              })}
            >
              <Shield size={16} style={{ color: '#38BDF8', flexShrink: 0 }} />
              Admin
            </NavLink>
          )}
          {isOwner && (
            <NavLink
              to="/owner"
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-sm tracking-wide ${isActive ? '' : 'hover:bg-white/5'}`}
              style={({ isActive }) => ({
                color: isActive ? '#ff4ecd' : 'rgba(255,78,205,0.6)',
                background: isActive ? 'rgba(255,78,205,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #ff4ecd' : '2px solid transparent',
              })}
            >
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

function Sidebar() {
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isEquilibrage, setIsEquilibrage] = useState(false)

  async function checkRole(userId) {
    if (!userId) {
      setIsAdmin(false)
      setIsOwner(false)
      setIsEquilibrage(false)
      return
    }
    const { data } = await supabase
      .from('admins')
      .select('role')
      .eq('user_id', userId)
      .single()
    setIsAdmin(!!data)
    setIsOwner(data?.role === 'owner')
    setIsEquilibrage(data?.role === 'equilibrage' || data?.role === 'owner')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      checkRole(data.session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      checkRole(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fbc059' }}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar desktop */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden md:flex fixed left-0 top-0 h-screen w-56 flex-col z-50"
        style={{ ...sidebarStyle, margin: '16px 0px 16px 16px', height: 'calc(100vh - 32px)' }}
      >
        <SidebarContent isAdmin={isAdmin} isOwner={isOwner} isEquilibrage={isEquilibrage} />
      </motion.aside>

      {/* Overlay mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 flex flex-col z-50 md:hidden"
              style={{ ...sidebarStyle, borderRadius: '0 16px 16px 0' }}
            >
              <SidebarContent onClose={() => setOpen(false)} isAdmin={isAdmin} isOwner={isOwner} isEquilibrage={isEquilibrage} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar