function PageWrapper({ children, scroll = true }) {
  return (
    <div className="md:ml-[244px] p-2 pt-14 md:pt-2 md:pr-4 md:pb-4 md:pl-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.08]"
        style={{ height: 'calc(100dvh - 72px)' }}
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
  )
}

export default PageWrapper