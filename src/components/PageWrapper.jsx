function PageWrapper({ children, scroll = true }) {
  return (
    <div style={{ padding: '16px 16px 16px 12px', marginLeft: '244px' }}>
      <div style={{
        borderRadius: '16px',
        height: 'calc(100vh - 32px)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Background fixe */}
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backgroundImage: `
              linear-gradient(to top, rgba(251,192,89,0.06) 0%, transparent 50%),
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 60px 60px, 60px 60px',
            pointerEvents: 'none',
            borderRadius: '16px',
          }}
        />
        {/* Liseré gauche */}
        <div style={{ position: 'absolute', left: 0, top: '20%', width: '1px', height: '60%', background: 'linear-gradient(to bottom, transparent, #fbc059, transparent)', opacity: 0.4, zIndex: 1 }} />
        {/* Liseré droit */}
        <div style={{ position: 'absolute', right: 0, top: '20%', width: '1px', height: '60%', background: 'linear-gradient(to bottom, transparent, #fbc059, transparent)', opacity: 0.4, zIndex: 1 }} />
        
        {/* Scan line — désactivé
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
            pointerEvents: 'none',
            borderRadius: '16px',
            zIndex: 2,
          }}
        />
        */}

        {/* Contenu scrollable séparé */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          overflow: scroll ? 'auto' : 'hidden',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default PageWrapper