import { useEffect, useRef } from 'react'

function MangaBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let frame = 0
    const dots = []
    const cols = Math.floor(canvas.width / 20)
    const rows = Math.floor(canvas.height / 20)

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        dots.push({
          x: x * 20 + 10,
          y: y * 20 + 10,
          offset: Math.random() * Math.PI * 2,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame += 0.02

      dots.forEach(dot => {
        const scale = (Math.sin(frame + dot.offset) + 1) / 2
        const radius = scale * 2.5
        const alpha = scale * 0.15

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 192, 89, ${alpha})`
        ctx.fill()
      })

      requestAnimationFrame(draw)
    }

    draw()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ borderRadius: '16px', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

export default MangaBackground