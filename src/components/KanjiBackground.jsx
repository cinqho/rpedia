import { useEffect, useState } from 'react'

const kanjiList = ['忍', '力', '夢', '魂', '剣', '闇', '光', '風', '火', '水', '雷', '伝', '説', '英', '雄', '戦', '士', '龍', '鬼', '神']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function KanjiBackground() {
  const [kanjis, setKanjis] = useState([])

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      char: kanjiList[Math.floor(Math.random() * kanjiList.length)],
      x: Math.random() > 0.5 ? randomBetween(75, 95) : randomBetween(2, 20),
      y: Math.random() > 0.5 ? randomBetween(75, 95) : randomBetween(2, 20),
      size: randomBetween(20, 60),
      duration: randomBetween(6, 14),
      delay: randomBetween(0, 6),
      opacity: randomBetween(0.04, 0.1),
    }))
    setKanjis(generated)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {kanjis.map(k => (
        <div
          key={k.id}
          style={{
            position: 'absolute',
            left: `${k.x}%`,
            top: `${k.y}%`,
            fontSize: `${k.size}px`,
            color: '#fbc059',
            opacity: k.opacity,
            fontFamily: 'Bebas Neue, sans-serif',
            animation: `kanjiFloat ${k.duration}s ease-in-out ${k.delay}s infinite alternate`,
            userSelect: 'none',
          }}
        >
          {k.char}
        </div>
      ))}
      <style>{`
        @keyframes kanjiFloat {
          0% { transform: translateY(0px) rotate(-5deg); }
          100% { transform: translateY(-30px) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}

export default KanjiBackground