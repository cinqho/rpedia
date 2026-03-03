import KanjiBackground from '../components/KanjiBackground'
import Logo3D from '../components/Logo3D'

function Home() {
  return (
    <section className="relative flex items-center px-4 md:px-8 overflow-hidden" style={{ height: '100%' }}>
      <KanjiBackground />
      <img
        src="manga-bg.png"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top',
          borderRadius: '16px',
          opacity: 0.04,
          filter: 'sepia(1) saturate(3) hue-rotate(5deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-2">

        {/* Texte gauche */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 border text-xs font-mono px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6"
            style={{ background: 'rgba(251,192,89,0.05)', borderColor: 'rgba(251,192,89,0.3)', color: '#fbc059' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#fbc059' }} />
            <span className="hidden sm:inline">Encyclopédie communautaire · </span>RP Manga
          </div>

          <h1 className="font-bold text-white leading-tight mb-3 md:mb-4"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(3.5rem, 15vw, 8rem)',
              letterSpacing: '0.05em',
            }}>
            RP<span style={{ color: '#fbc059' }}>EDIA</span>
          </h1>

          <p className="text-gray-300 text-sm md:text-lg mb-2">
            Préserve la mémoire du RP. Honore les légendes.
          </p>
          <p className="text-xs md:text-base max-w-md mb-6 md:mb-8 mx-auto md:mx-0"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            RPedia est une encyclopédie communautaire dédiée aux personnages emblématiques du RP manga. Chacun peut contribuer et enrichir cette bibliothèque vivante.
          </p>

          <div className="flex flex-row gap-3 md:gap-4 justify-center md:justify-start">
            <a href="/characters"
              className="px-5 py-3 md:px-8 md:py-4 rounded-full text-black font-semibold text-sm transition-all duration-200 hover:opacity-90 whitespace-nowrap"
              style={{ background: '#fbc059' }}>
              Explorer les personnages
            </a>
            <a href="/add-character"
              className="px-5 py-3 md:px-8 md:py-4 rounded-full text-white font-semibold text-sm transition-all duration-200 hover:bg-white/10 whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Ajouter un personnage
            </a>
          </div>
        </div>

        {/* Côté droit — desktop seulement */}
        <div className="hidden md:flex justify-center relative" style={{ width: '600px', flexShrink: 0 }}>
          <Logo3D />
        </div>

      </div>
    </section>
  )
}

export default Home