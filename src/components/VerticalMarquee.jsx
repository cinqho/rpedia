const items = [
  "RPEDIA",
  "·",
  "忍",
  "·",
  "RP MANGA",
  "·",
  "龍",
  "·",
  "GARRY'S MOD",
  "·",
  "神",
  "·",
  "ENCYCLOPÉDIE",
  "·",
  "魂",
  "·",
  "COMMUNAUTÉ",
  "·",
  "剣",
  "·",
  "LEGACY",
  "·",
  "英雄",
  "·",
]

function VerticalMarquee() {
  return (
    <div className="absolute top-0 bottom-0 overflow-hidden flex flex-col items-center"
      style={{
        right: '16px',
        width: '90px',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
        zIndex: 5,
      }}>

      {/* Dégradés haut et bas */}
      <div className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.9), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)' }} />

      {/* Contenu qui défile */}
      <div className="flex flex-col gap-8 animate-marquee-vertical whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="font-mono tracking-widest"
            style={{
              writingMode: 'vertical-rl',
              color: item === '·' ? '#fbc059' : 'rgba(255,255,255,0.25)',
              fontSize: item === '·' ? '1.2rem' : '1rem',
              fontFamily: 'Bebas Neue, sans-serif',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default VerticalMarquee