function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Grille décorative */}
      <div
        className="absolute inset-0"
        style={{
          marginLeft: '244px',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gradient bas → haut */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, rgba(251,192,89,0.07) 0%, transparent 50%)`
        }}
      />
    </div>
  )
}

export default Background