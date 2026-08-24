// Module 16 — Glass Architecture Transition
// Inserts one decorative venue-to-logistics passage between the existing Wyndham venue
// and utility sections. It reuses the approved glass-hall image and changes no logistics.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const glassHall = new URL('../images/destination/wyndham-garden-glass-hall.webp', import.meta.url).href

let instance = null
let scanQueued = false
let frame = 0
let active = false
let lastPaint = 0

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1
  const x = clamp((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function createNode(className, tag = 'div') {
  const node = document.createElement(tag)
  node.className = className
  return node
}

function createTransition() {
  const section = createNode('glass-architecture-transition', 'section')
  section.setAttribute('aria-hidden', 'true')
  section.style.setProperty('--glass-hall-image', `url("${glassHall.replace(/"/g, '\\"')}")`)

  const sticky = createNode('glass-architecture-sticky')
  const base = createNode('glass-architecture-base')
  const panes = ['a', 'b', 'c', 'd'].map((name) => createNode(`glass-architecture-pane glass-architecture-pane--${name}`))
  const refraction = createNode('glass-architecture-refraction')
  const frost = createNode('glass-architecture-frost')
  const folio = createNode('glass-architecture-folio')
  const kicker = createNode('glass-architecture-kicker', 'p')
  const title = createNode('glass-architecture-title', 'p')
  const paper = createNode('glass-architecture-paper')

  folio.textContent = '06½ · PASSAGE'
  kicker.textContent = isHindi() ? 'ग्लास हॉल से आगे' : 'FROM THE GLASS HALL'
  title.textContent = isHindi() ? 'ठहराव · यात्रा · परिवहन' : 'STAY · TRAVEL · TRANSPORT'

  frost.append(kicker, title)
  sticky.append(base, ...panes, refraction, folio, frost, paper)
  section.appendChild(sticky)

  return { section, sticky }
}

function applyProgress(section, progress) {
  const split = smoothstep(.08, .58, progress)
  const copy = smoothstep(.26, .58, progress)
  const frostIn = smoothstep(.18, .44, progress)
  const frostOut = 1 - smoothstep(.72, .92, progress)
  const frost = frostIn * frostOut
  const paper = smoothstep(.70, .98, progress)
  const refraction = .12 + split * .42 - paper * .24
  const goldLine = smoothstep(.12, .78, progress)

  section.style.setProperty('--glass-pane-a-x', `${(-18 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-a-y', `${(7 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-b-x', `${(-7 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-b-y', `${(-10 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-c-x', `${(8 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-c-y', `${(11 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-d-x', `${(19 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-d-y', `${(-6 * split).toFixed(2)}px`)
  section.style.setProperty('--glass-pane-rotate-a', `${(-.55 * split).toFixed(3)}deg`)
  section.style.setProperty('--glass-pane-rotate-b', `${(.38 * split).toFixed(3)}deg`)
  section.style.setProperty('--glass-pane-rotate-c', `${(-.42 * split).toFixed(3)}deg`)
  section.style.setProperty('--glass-pane-rotate-d', `${(.62 * split).toFixed(3)}deg`)
  section.style.setProperty('--glass-image-scale', (1.018 + progress * .047).toFixed(4))
  section.style.setProperty('--glass-image-opacity', (1 - paper * .82).toFixed(3))
  section.style.setProperty('--glass-refraction-opacity', clamp(refraction, .08, .56).toFixed(3))
  section.style.setProperty('--glass-frost-opacity', frost.toFixed(3))
  section.style.setProperty('--glass-frost-y', `${((1 - frostIn) * 18 - smoothstep(.72, .94, progress) * 9).toFixed(2)}px`)
  section.style.setProperty('--glass-copy-opacity', copy.toFixed(3))
  section.style.setProperty('--glass-copy-y', `${((1 - copy) * 16).toFixed(2)}px`)
  section.style.setProperty('--glass-paper-opacity', paper.toFixed(3))
  section.style.setProperty('--glass-gold-line-width', `${(goldLine * 100).toFixed(1)}%`)
}

function paint(now = performance.now()) {
  frame = 0
  if (!instance || !active || reducedMotion) return

  if (now - lastPaint < 24) {
    frame = requestAnimationFrame(paint)
    return
  }
  lastPaint = now

  const { section } = instance
  if (!section.isConnected) return

  const rect = section.getBoundingClientRect()
  const viewport = Math.max(window.innerHeight || 0, 1)
  const travel = Math.max(rect.height - viewport, 1)
  const progress = clamp((-rect.top) / travel)
  applyProgress(section, progress)
}

function requestPaint() {
  if (!instance || reducedMotion || !active || frame) return
  frame = requestAnimationFrame(paint)
}

function destroy() {
  if (!instance) return
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  active = false
  instance.observer.disconnect()
  instance.section.remove()
  instance = null
}

function mount() {
  const venue = document.querySelector('.venue-section')
  const utility = document.querySelector('#stay.utility-section, .utility-section#stay')
  if (!venue || !utility) return

  if (instance) {
    if (instance.section.isConnected && instance.section.previousElementSibling === venue) return
    destroy()
  }

  const created = createTransition()
  venue.insertAdjacentElement('afterend', created.section)

  const observer = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting
    if (active) requestPaint()
  }, { rootMargin: '80px 0px 80px 0px', threshold: .01 })
  observer.observe(created.section)

  instance = { ...created, observer }

  if (reducedMotion) {
    applyProgress(created.section, .72)
  } else {
    requestPaint()
  }
}

function scan() {
  if (instance && (!instance.section.isConnected || !document.querySelector('.venue-section') || !document.querySelector('#stay.utility-section, .utility-section#stay'))) {
    destroy()
  }
  mount()
}

const mutationObserver = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('scroll', requestPaint, { passive: true })
  window.addEventListener('resize', requestPaint, { passive: true })
  window.addEventListener('orientationchange', requestPaint, { passive: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
