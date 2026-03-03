function PageWrapper({ children, scroll = true }) {
  return (
    <>
      {/* Spacer mobile pour le bouton hamburger */}
      <div className="md:hidden" style={{ height: '60px' }} />

      <div className="md:ml-[244px] p-2 md:p-[16px_16px_16px_12px]">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] md:!h-[calc(100vh-32px)]"
          style={{ height: 'calc(100dvh - 76px)' }}
        >
          {/* Background */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backgroundImage: `
                linear-gradient(to top, rgba(251,192,89,0.06) 0%, transparent 50%),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 60px 60px, 60px 60px',
            }}
          />

          {/* Liserés */}
          <div className="absolute left-0 top-[20%] w-px h-[60%] z-10" style={{ background: 'linear-gradient(to bottom, transparent, #fbc059, transparent)', opacity: 0.4 }} />
          <div className="absolute right-0 top-[20%] w-px h-[60%] z-10" style={{ background: 'linear-gradient(to bottom, transparent, #fbc059, transparent)', opacity: 0.4 }} />

          {/* Contenu */}
          <div className="relative z-10 h-full w-full" style={{ overflow: scroll ? 'auto' : 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default PageWrapper