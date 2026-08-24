// Lightweight cinematic atmosphere shared by the opening forest and the Pheras stars.
// Corrective pass after Codex review: inactive detached canvases are explicitly
// destroyed, reduced-motion changes are honored live, and the obsolete passport
// engraving canvas / woven handoff are no longer mounted.

const GOLD = '229, 198, 130'
const IVORY = '239, 229, 206'
const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
const pointerQuery = window.matchMedia?.('(pointer: coarse)')
let reducedMotion = motionQuery?.matches ?? false
let coarsePointer = pointerQuery?.matches ?? true
const instances = new WeakMap()
const liveInstances = new Set()

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
    this.destroyed = false
    this.dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.35 : 1.75)

    host.appendChild(this.canvas)
    host.classList.add('has-cinematic-canvas')
    liveInstances.add(this)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(host)

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.active = entry.isIntersecting
      if (this.active && !this.frame && !reducedMotion) {
        this.frame = requestAnimationFrame((time) => this.tick(time))
      }
    }, { rootMargin: '120px 0px' })
    this.intersectionObserver.observe(host)

    this.resize()
    this.handleMotionPreference()
  }

  resize() {
    if (this.destroyed || !this.host.isConnected) return
    const rect = this.host.getBoundingClientRect()
    this.width = Math.max(1, rect.width)
    this.height = Math.max(1, rect.height)
    this.dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.35 : 1.75)
    this.canvas.width = Math.round(this.width * this.dpr)
    this.canvas.height = Math.round(this.height * this.dpr)
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.seed()
    if (reducedMotion) this.draw(0, 0)
  }

  seed() {
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

  handleMotionPreference() {
    if (this.destroyed) return
    if (reducedMotion) {
      if (this.frame) cancelAnimationFrame(this.frame)
      this.frame = null
      this.lastTime = 0
      this.draw(0, 0)
      return
    }

    if (this.active && !this.frame) {
      this.lastTime = 0
      this.frame = requestAnimationFrame((time) => this.tick(time))
    }
  }

  tick(time) {
    this.frame = null
    if (this.destroyed || !this.host.isConnected) return this.destroy()
    if (reducedMotion || !this.active) return

    const dt = Math.min(32, Math.max(0, time - (this.lastTime || time)))
    this.lastTime = time
    this.draw(time, dt)
    this.frame = requestAnimationFrame((next) => this.tick(next))
  }

  draw(time, dt) {
    if (!this.ctx) return
    if (this.kind === 'forest') this.drawForest(time, dt)
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
    if (this.destroyed) return
    this.destroyed = true
    if (this.frame) cancelAnimationFrame(this.frame)
    this.frame = null
    this.resizeObserver?.disconnect()
    this.intersectionObserver?.disconnect()
    this.canvas?.remove()
    this.host?.classList?.remove('has-cinematic-canvas')
    instances.delete(this.host)
    liveInstances.delete(this)
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
  for (const instance of [...liveInstances]) {
    if (!instance.host.isConnected) instance.destroy()
  }

  document.querySelectorAll('.intro-screen').forEach((host) => ensureCanvas(host, 'forest'))
  document.querySelectorAll('.editorial-hero').forEach(markEditorialHero)
  document.querySelectorAll('.event-card h3').forEach((heading) => {
    if (heading.textContent?.trim() !== 'Written in the Stars') return
    const card = heading.closest('.event-card')
    if (!card) return
    card.classList.add('event-card--constellation')
    ensureCanvas(card, 'stars')
  })
}

function handleMotionChange(event) {
  reducedMotion = event.matches
  for (const instance of [...liveInstances]) instance.handleMotionPreference()
}

function handlePointerChange(event) {
  coarsePointer = event.matches
  for (const instance of [...liveInstances]) instance.resize()
}

motionQuery?.addEventListener?.('change', handleMotionChange)
pointerQuery?.addEventListener?.('change', handlePointerChange)

let scanQueued = false
const observer = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
