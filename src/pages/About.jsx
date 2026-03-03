import { FadeItem, PageTransition } from '../components/PageTransition'
import { LeftShape, RightShape } from '../components/FormShapes'

function About() {
  const team = [
    { role: 'Dev / Technique', members: ['Cinqho'] },
    { role: 'Rédaction', members: ['Azox_Den','Fromlex'] },
    { role: 'Collaborateurs', members: ['WshRenoi'] },
  ]

  return (
    <div className="relative w-full h-full">
      <LeftShape />
      <RightShape />

      <div className="relative z-10 p-8 max-w-2xl mx-auto">
        <PageTransition>

          {/* Header */}
          <FadeItem delay={0.1}>
            <div className="mb-10">
              <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '3rem', letterSpacing: '0.05em', color: '#ffffff' }}>
                À PROPOS <span style={{ color: '#fbc059' }}>DE RPEDIA</span>
              </h1>
              <div style={{ height: '1px', background: 'linear-gradient(to right, #fbc059, transparent)', marginTop: '12px' }} />
            </div>
          </FadeItem>

          {/* Intro */}
          <FadeItem delay={0.2}>
            <div className="rounded-xl p-6 mb-6"
              style={{ background: 'rgba(251,192,89,0.04)', border: '1px solid rgba(251,192,89,0.1)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                RPedia est une encyclopédie communautaire dédiée aux personnages emblématiques du RP manga.
                Ce projet a pour objectif de préserver la mémoire du RP, de raconter les histoires qui ont marqué la communauté,
                et de rendre hommage aux personnages devenus légendaires au fil des serveurs et des époques.
              </p>
            </div>
          </FadeItem>

          {/* Valeurs */}
          <FadeItem delay={0.3}>
            <div className="flex flex-col gap-4 mb-8">
              {[
                { title: 'Mémoire', desc: 'Chaque personnage archivé ici est un bout d\'histoire préservé pour toujours.' },
                { title: 'Communauté', desc: 'RPedia est construit par et pour les joueurs. Chacun peut contribuer.' },
                { title: 'Modération', desc: 'Toutes les soumissions sont vérifiées pour garantir la qualité du contenu.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-6 py-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-1 rounded-full flex-shrink-0 self-stretch"
                    style={{ background: '#fbc059', minHeight: '40px' }} />
                  <div>
                    <h3 className="font-bold tracking-widest uppercase mb-1"
                      style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.1rem', color: '#fbc059' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeItem>

          {/* Comment contribuer */}
          <FadeItem delay={0.4}>
            <div className="rounded-xl p-6 mb-8"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.5rem', color: '#ffffff' }}>
                COMMENT <span style={{ color: '#fbc059' }}>CONTRIBUER ?</span>
              </h2>
              <div className="flex flex-col gap-3">
                {[
                  'Connecte-toi avec ton compte Discord',
                  'Va sur la page "Suggérer" et remplis le formulaire',
                  'Ta suggestion est examinée par l\'équipe RPedia',
                  'Une fois validée, elle apparaît sur le site',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                      style={{ background: 'rgba(251,192,89,0.15)', color: '#fbc059', border: '1px solid rgba(251,192,89,0.3)' }}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeItem>

          {/* Mentions légales / Équipe */}
          <FadeItem delay={0.5}>
            <div className="rounded-xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="mb-6" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.5rem', color: '#ffffff' }}>
                MENTIONS <span style={{ color: '#fbc059' }}>LÉGALES</span>
              </h2>
              <div className="flex flex-col gap-4">
                {team.map((group, i) => (
                  <div key={i} className="flex items-start justify-between py-3"
                    style={{ borderBottom: i < team.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <p className="text-xs font-mono tracking-widest uppercase"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {group.role}
                    </p>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {group.members.map((member, j) => (
                        <span key={j} className="text-xs font-mono px-3 py-1 rounded-full"
                          style={{ background: 'rgba(251,192,89,0.08)', color: '#fbc059', border: '1px solid rgba(251,192,89,0.2)' }}>
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono mt-6 text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>
                © 2026 RPedia — Tous droits réservés
              </p>
            </div>
          </FadeItem>

        </PageTransition>
      </div>
    </div>
  )
}

export default About