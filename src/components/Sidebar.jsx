import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Users, PlusCircle, Trophy, Info, Package, LayoutGrid } from 'lucide-react'
import AuthButton from './AuthButton'

const links = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/characters', label: 'Personnages', icon: Users },
  { path: '/add-character', label: 'Suggérer', icon: PlusCircle },
  { path: '/ranking', label: 'Classements', icon: Trophy },
  { path: '/pack', label: 'Pack', icon: Package },
  { path: '/deck', label: 'Mon Deck', icon: LayoutGrid },
  { path: '/about', label: 'About', icon: Info },
]

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-50"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        margin: '16px 0px 16px 16px',
        height: 'calc(100vh - 32px)',
      }}
    >

      {/* Décoration fond sidebar */}

      {/* Kanji décoratif en bas */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '8px',
        fontFamily: 'Bebas Neue, sans-serif',
        pointerEvents: 'none',
        userSelect: 'none',
        lineHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span style={{ fontSize: '5rem', color: 'rgba(251,192,89,1)' }}>流</span>
        <span style={{ fontSize: '5rem', color: 'rgba(251,192,89,1)' }}>編</span>
      </div>

      {/* Ligne décorative verticale */}
      <div style={{
        position: 'absolute',
        right: '12px',
        top: '15%',
        width: '1px',
        height: '30%',
        background: 'linear-gradient(to bottom, transparent, rgba(251,192,89,0.15), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Glow en bas */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '150px',
        background: 'linear-gradient(to top, rgba(251,192,89,0.04), transparent)',
        pointerEvents: 'none',
        borderRadius: '0 0 16px 16px',
      }} />

      {/* Logo */}
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <img
          src="/Logo_RPedia.png"
          alt="RPedia"
          style={{ width: '36px', height: '36px', objectFit: 'contain' }}
        />
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em', fontSize: '2rem' }}>
          <span style={{ color: '#ffffff' }}>RP</span><span style={{ color: '#fbc059' }}>EDIA</span>
        </h1>
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
    </motion.aside>
  )
}

export default Sidebar