// Four lightweight cinematic movements for the Corbett invitation.
// Motion language is adapted from MIT-licensed ThreeUI Community concepts:
// Particle Drift, Engraved Certificate, Woven Cloth and Constellation Field.
// This implementation intentionally uses Canvas 2D/CSS rather than shipping Three.js/WebGL
// so the WhatsApp-first mobile invitation stays fast on iPhone and Android.

const GOLD = '229, 198, 130'
const IVORY = '239, 229, 206'
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? true
const instances = new WeakMap()

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

class MotionCanvas {
  constructor(host, kind) {
    this.host = host
    this.kind = kind
    this.canvas = document.createElement('canvas')
    this.canvas.className = `cinematic-canvas movement-${kind}-canvas`
    this.canvas.setAttribute('aria-hidden', 'true')
    this.ctx = this.canvas.getContext('2d', { alpha: true })
    this.nodes = []
    this.active = true
    this.frame = null
    this.lastTime = 0
    this.dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.35 : 1.75)

    host.appendChild(this.canvas)
    host.classList.add('has-cinematic-canvas')

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(host)

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.active = entry.isIntersecting
      if (this.active && !this.frame && !reducedMotion) this.frame = requestAnimationFrame((time) => this.tick(time))
    }, { rootMargin: '120px 0px' })
    this.intersectionObserver.observe(host)

    this.resize()
    if (reducedMotion) this.draw(0, 0)
    else this.frame = requestAnimationFrame((time) => this.tick(time))
  }

  resize() {
    const rect = this.host.getBoundingClientRect()
    this.width = Math.max(1, rect.width)
    this.height = Math.max(1, rect.height)
    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.seed()
    if (reducedMotion) this.draw(0, 0)
  }

  seed() {
    if (this.kind === 'engraving') return
    const base = this.kind === 'stars' ? 34 : 30
    const count = Math.max(18, Math.round(base * Math.min(1.15, this.width / 390)))
    this.nodes = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: randomBetween(this.kind === 'stars' ? 0.7 : 0.8, this.kind === 'stars' ? 2.1 : 2.7),
      vx: randomBetween(-0.055, 0.055),
      vy: this.kind === 'stars' ? randomBetween(-0.025, 0.025) : randomBetween(-0.105, -0.025),
      phase: Math.random() * Math.PI * 2,
    }))
  }

  tick(time) {
    this.frame = null
    if (!this.host.isConnected) return this.destroy()
    if (!this.active) return
    const dt = Math.min(32, Math.max(0, time - (this.lastTime || time)))
    this.lastTime = time
    this.draw(time, dt)
    this.frame = requestAnimationFrame((next) => this.tick(next))
  }

  draw(time, dt) {
    if (!this.ctx) return
    if (this.kind === 'forest') this.drawForest(time, dt)
    else if (this.kind === 'engraving') this.drawEngraving(time)
    else if (this.kind === 'stars') this.drawStars(time, dt)
  }

  drawForest(time, dt) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    const motion = reducedMotion ? 0 : dt

    for (const node of this.nodes) {
      node.x += node.vx * motion
      node.y += node.vy * motion
      if (node.y < -10) { node.y = this.height + 8; node.x = Math.random() * this.width }
      if (node.x < -8) node.x = this.width + 8
      if (node.x > this.width + 8) node.x = -8

      const twinkle = 0.42 + Math.sin(time * 0.0012 + node.phase) * 0.18
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4.8)
      gradient.addColorStop(0, `rgba(${GOLD}, ${0.42 * twinkle})`)
      gradient.addColorStop(0.35, `rgba(${GOLD}, ${0.12 * twinkle})`)
      gradient.addColorStop(1, `rgba(${GOLD}, 0)`)
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * 4.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawEngraving(time) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    const cx = this.width * 0.5
    const cy = this.height * 0.46
    const pulse = reducedMotion ? 0 : Math.sin(time * 0.00075) * 2.5

    ctx.save()
    ctx.translate(cx, cy)
    ctx.strokeStyle = `rgba(${GOLD}, 0.16)`
    ctx.lineWidth = 0.72

    for (let i = 0; i < 13; i += 1) {
      ctx.save()
      ctx.rotate((i - 6) * 0.048)
      const rx = Math.max(38, this.width * (0.17 + i * 0.019)) + pulse
      const ry = Math.max(52, this.height * (0.12 + i * 0.012))
      ctx.setLineDash([1.5 + (i % 3), 4.5 + (i % 4)])
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    ctx.setLineDash([])
    ctx.strokeStyle = `rgba(${IVORY}, 0.07)`
    for (let y = -this.height * 0.34; y < this.height * 0.35; y += 14) {
      ctx.beginPath()
      for (let x = -this.width * 0.44; x <= this.width * 0.44; x += 8) {
        const wave = Math.sin((x + time * 0.012) * 0.038) * 2.1
        if (x === -this.width * 0.44) ctx.moveTo(x, y + wave)
        else ctx.lineTo(x, y + wave)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  drawStars(time, dt) {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    const motion = reducedMotion ? 0 : dt

    for (const node of this.nodes) {
      node.x += node.vx * motion
      node.y += node.vy * motion
      if (node.x < 0 || node.x > this.width) node.vx *= -1
      if (node.y < 0 || node.y > this.height) node.vy *= -1
    }

    for (let i = 0; i < this.nodes.length; i += 1) {
      const a = this.nodes[i]
      for (let j = i + 1; j < this.nodes.length; j += 1) {
        const b = this.nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const distance = Math.hypot(dx, dy)
        const link = Math.min(118, this.width * 0.29)
        if (distance < link) {
          ctx.strokeStyle = `rgba(${GOLD}, ${0.16 * (1 - distance / link)})`
          ctx.lineWidth = 0.7
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    for (const node of this.nodes) {
      const twinkle = 0.66 + Math.sin(time * 0.0016 + node.phase) * 0.28
      ctx.fillStyle = `rgba(${IVORY}, ${Math.max(0.22, twinkle)})`
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fill()
      if (node.radius > 1.6) {
        ctx.strokeStyle = `rgba(${GOLD}, ${0.3 * twinkle})`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(node.x - 5, node.y)
        ctx.lineTo(node.x + 5, node.y)
        ctx.moveTo(node.x, node.y - 5)
        ctx.lineTo(node.x, node.y + 5)
        ctx.stroke()
      }
    }
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame)
    this.frame = null
    this.resizeObserver?.disconnect()
    this.intersectionObserver?.disconnect()
    this.canvas?.remove()
  }
}

function ensureCanvas(host, kind) {
  if (!host || instances.has(host)) return
  const instance = new MotionCanvas(host, kind)
  instances.set(host, instance)
}

function markEditorialHero(hero) {
  if (!hero || hero.dataset.cinematicEditorial === 'true') return
  hero.dataset.cinematicEditorial = 'true'
  requestAnimationFrame(() => hero.classList.add('editorial-motion-in'))
}

function scan() {
  document.querySelectorAll('.intro-screen').forEach((host) => ensureCanvas(host, 'forest'))
  document.querySelectorAll('.passport-cover').forEach((host) => ensureCanvas(host, 'engraving'))
  document.querySelectorAll('.editorial-hero').forEach(markEditorialHero)
  document.querySelectorAll('.event-card h3').forEach((heading) => {
    if (heading.textContent?.trim() !== 'Written in the Stars') return
    const card = heading.closest('.event-card')
    if (!card) return
    card.classList.add('event-card--constellation')
    ensureCanvas(card, 'stars')
  })
}

function runWovenTransition() {
  if (reducedMotion || document.querySelector('.woven-page-transition')) return
  const layer = document.createElement('div')
  layer.className = 'woven-page-transition'
  layer.setAttribute('aria-hidden', 'true')
  layer.innerHTML = '<div class="woven-page-transition__cloth"></div><div class="woven-page-transition__paper"></div>'
  document.body.appendChild(layer)
  window.setTimeout(() => layer.remove(), 1150)
}

document.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.passport-stage .primary-cta')) runWovenTransition()
}, { capture: true })

let scanQueued = false
const observer = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true })
    scan()
  }, { once: true })
}
