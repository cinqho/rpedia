import { motion } from "framer-motion"

const draw = (delay = 0) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeOut", delay }
  }
})

export function LeftShape() {
  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-0"
      style={{ width: 'min(24rem, 40%)', height: '16rem', opacity: 'var(--shape-opacity, 1)' }}>
      <svg viewBox="0 0 350 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <motion.polyline points="0,100 140,40 280,70 350,20" stroke="#fbc059" strokeWidth="3" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" variants={draw(0.2)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
        <motion.polyline points="0,100 120,160 250,130 350,180" stroke="#fbc059" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" variants={draw(0.5)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
        <motion.polyline points="140,40 160,10 200,25" stroke="#fbc059" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" variants={draw(0.8)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
        <motion.polyline points="120,160 140,190 180,175" stroke="#fbc059" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" variants={draw(1)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
      </svg>
    </div>
  )
}

export function RightShape() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0"
      style={{ width: 'min(24rem, 40%)', height: '16rem' }}>
      <svg viewBox="0 0 350 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <motion.polyline points="350,100 210,40 70,70 0,20" stroke="#fbc059" strokeWidth="3" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round" variants={draw(0.2)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
        <motion.polyline points="350,100 230,160 100,130 0,180" stroke="#fbc059" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" variants={draw(0.5)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
        <motion.polyline points="210,40 190,10 150,25" stroke="#fbc059" strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" variants={draw(0.8)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
        <motion.polyline points="230,160 210,190 170,175" stroke="#fbc059" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" variants={draw(1)} initial="hidden" whileInView="visible" viewport={{ once: true }} />
      </svg>
    </div>
  )
}