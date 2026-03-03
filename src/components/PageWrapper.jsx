function PageWrapper({ children, scroll = true }) {
  return (
    <div className="md:ml-[244px] p-2 md:p-[16px_16px_16px_12px] pt-14 md:pt-4">
      <div style={{
        borderRadius: '16px',
        height: 'calc(100vh - 72px)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      className="md:h-[calc(100vh-32px)]"
      >
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

        {/* Contenu scrollable */}
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