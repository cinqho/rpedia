import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, PlusCircle, Trophy, Info, Package, LayoutGrid, Menu, X } from 'lucide-react'
import AuthButton from './AuthButton'
import { useState } from 'react'

const links = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/characters', label: 'Personnages', icon: Users },
  { path: '/add-character', label: 'Suggérer', icon: PlusCircle },
  { path: '/ranking', label: 'Classements', icon: Trophy },
  { path: '/pack', label: 'Pack', icon: Package },
  { path: '/deck', label: 'Mon Deck', icon: LayoutGrid },
  { path: '/about', label: 'About', icon: Info },
]

const sidebarStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
}

function SidebarContent({ onClose }) {
  return (
    <>
      {/* Kanji décoratif */}
      <div style={{
        position: 'absolute', bottom: '80px', right: '8px',
        fontFamily: 'Bebas Neue, sans-serif', pointerEvents: 'none',
        userSelect: 'none', lineHeight: 1, display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: '4px',
      }}>
        <span style={{ fontSize: '5rem', color: 'rgba(251,192,89,1)' }}>流</span>
        <span style={{ fontSize: '5rem', color: 'rgba(251,192,89,1)' }}>編</span>
      </div>

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
        {/* Croix fermeture mobile */}
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

      <AuthButton />
    </>
  )
}

function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Bouton hamburger — mobile seulement */}
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
        <SidebarContent />
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
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar