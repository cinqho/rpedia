function Logo3D() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: '600px', height: '600px' }}>

      {/* Glow principal */}
      <div className="absolute rounded-full blur-3xl"
        style={{ width: '400px', height: '400px', background: 'rgba(251,192,89,0.08)' }} />

      {/* Glow secondaire décalé */}
      <div className="absolute rounded-full blur-2xl"
        style={{ width: '300px', height: '300px', background: 'rgba(251,192,89,0.05)', transform: 'translate(40px, -40px)' }} />

      {/* Cercle décoratif externe */}
      <div className="absolute rounded-full"
        style={{ width: '500px', height: '500px', border: '1px solid rgba(251,192,89,0.06)' }} />

      {/* Cercle décoratif interne */}
      <div className="absolute rounded-full"
        style={{ width: '380px', height: '380px', border: '1px solid rgba(251,192,89,0.1)', borderStyle: 'dashed' }} />

      {/* Logo */}
      <img
        src="/src/assets/Logo_RPedia.png"
        alt="RPedia"
        className="relative z-10"
        style={{ width: '600px', height: '600px', objectFit: 'contain' }}
      />

    </div>
  )
}

export default Logo3D