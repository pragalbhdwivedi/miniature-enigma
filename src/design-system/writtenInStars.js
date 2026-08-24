// Module 14 — Written in the Stars / Pheras Cinematic
// Builds on the existing Canvas 2D star field. This module adds a deterministic SVG
// constellation and repositions the existing rendered date/time into the celestial stage.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mounted = new Map()
const visible = new Set()
let frame = 0
let lastPaint = 0
let scanQueued = false

function createSvgElement(name, attributes = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name)
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value)
  return node
}

function createOrbit() {
  const svg = createSvgElement('svg', {
    class: 'written-stars-orbit',
    viewBox: '0 0 100 100',
    'aria-hidden': 'true',
  })

  svg.append(
    createSvgElement('circle', { class: 'written-stars-orbit__ring', cx: '50', cy: '50', r: '43' }),
    createSvgElement('circle', { class: 'written-stars-orbit__ring', cx: '50', cy: '50', r: '31' }),
    createSvgElement('path', { class: 'written-stars-orbit__axis', d: 'M8 50 H92 M50 8 V92' }),
    createSvgElement('path', { class: 'written-stars-orbit__axis', d: 'M20 20 L80 80 M80 20 L20 80' }),
  )

  return svg
}

function createConstellation() {
  const svg = createSvgElement('svg', {
    class: 'written-stars-constellation',
    viewBox: '0 0 100 100',
    'aria-hidden': 'true',
  })

  const mainLine = createSvgElement('path', {
    class: 'written-stars-constellation__line',
    d: 'M18 68 L29 54 L42 58 L53 43 L67 48 L79 31 L86 45',
  })
  const softLineOne = createSvgElement('path', {
    class: 'written-stars-constellation__line written-stars-constellation__line--soft',
    d: 'M29 54 L25 35 L42 24 L53 43',
  })
  const softLineTwo = createSvgElement('path', {
    class: 'written-stars-constellation__line written-stars-constellation__line--soft',
    d: 'M42 58 L55 72 L70 66 L67 48',
  })

  const points = [
    [18, 68, 1.35, false],
    [29, 54, 1.10, true],
    [42, 58, 1.42, false],
    [53, 43, 1.62, true],
    [67, 48, 1.26, false],
    [79, 31, 1.52, true],
    [86, 45, 1.05, false],
    [42, 24, 1.18, true],
  ]

  svg.append(mainLine, softLineOne, softLineTwo)
  for (const [cx, cy, r, gold] of points) {
    svg.appendChild(createSvgElement('circle', {
      class: `written-stars-constellation__point${gold ? ' written-stars-constellation__point--gold' : ''}`,
      cx: String(cx),
      cy: String(cy),
      r: String(r),
    }))
  }

  return svg
}

function findDateTime(card) {
  const content = card.querySelector(':scope > div:nth-child(2)')
  if (!content) return null

  const split = content.querySelector(':scope > .event-chapter-datetime')
  if (split) return split

  const fallback = content.querySelector(':scope > p:last-child')
  if (!fallback) return null
  fallback.classList.add('event-chapter-datetime')
  return fallback
}

function createStage(card) {
  const stage = document.createElement('div')
  stage.className = 'written-stars-stage'

  const orbit = createOrbit()
  const constellation = createConstellation()
  const midnight = document.createElement('div')
  midnight.className = 'written-stars-midnight-mark'

  const dateTime = findDateTime(card)
  let dateTimeRestore = null
  if (dateTime) {
    const parent = dateTime.parentNode
    const next = dateTime.nextSibling
    dateTimeRestore = () => {
      if (!parent?.isConnected || !dateTime.isConnected) return
      if (next?.parentNode === parent) parent.insertBefore(dateTime, next)
      else parent.appendChild(dateTime)
    }
    midnight.appendChild(dateTime)
  }

  stage.append(orbit, constellation, midnight)
  card.appendChild(stage)

  return { stage, dateTimeRestore }
}

function mount(card) {
  if (mounted.has(card)) return

  const created = createStage(card)
  card.classList.add('written-stars-ready')
  card.style.setProperty('--stars-rotation', '0deg')
  card.style.setProperty('--stars-constellation-rotation', '0deg')
  card.style.setProperty('--stars-depth-y', '0px')
  card.style.setProperty('--stars-copy-y', '0px')

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      visible.add(card)
      card.classList.add('is-written-stars-active')
      requestPaint()
    } else {
      visible.delete(card)
      card.classList.remove('is-written-stars-active')
    }
  }, { threshold: .28, rootMargin: '4% 0px -5% 0px' })

  observer.observe(card)

  mounted.set(card, {
    observer,
    stage: created.stage,
    restoreDateTime: created.dateTimeRestore,
    destroy() {
      observer.disconnect()
      visible.delete(card)
      created.dateTimeRestore?.()
      created.stage.remove()
      card.classList.remove('written-stars-ready', 'is-written-stars-active')
      card.style.removeProperty('--stars-rotation')
      card.style.removeProperty('--stars-constellation-rotation')
      card.style.removeProperty('--stars-depth-y')
      card.style.removeProperty('--stars-copy-y')
    },
  })

  if (reducedMotion) card.classList.add('is-written-stars-active')
}

function unmount(card) {
  mounted.get(card)?.destroy()
  mounted.delete(card)
}

function paint(now) {
  frame = 0
  if (reducedMotion || visible.size === 0) return
  if (now - lastPaint < 32) {
    frame = requestAnimationFrame(paint)
    return
  }
  lastPaint = now

  const viewport = Math.max(window.innerHeight || 0, 1)
  for (const card of visible) {
    if (!card.isConnected) continue
    const rect = card.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)))
    const centered = progress - .5
    const slowTime = now * .000035
    const rotation = Math.sin(slowTime) * 1.18 + centered * .72
    const constellationRotation = Math.cos(slowTime * .72) * -.52 - centered * .32
    const depth = centered * -7
    const copy = centered * -4

    card.style.setProperty('--stars-rotation', `${rotation.toFixed(3)}deg`)
    card.style.setProperty('--stars-constellation-rotation', `${constellationRotation.toFixed(3)}deg`)
    card.style.setProperty('--stars-depth-y', `${depth.toFixed(2)}px`)
    card.style.setProperty('--stars-copy-y', `${copy.toFixed(2)}px`)
  }

  frame = requestAnimationFrame(paint)
}

function requestPaint() {
  if (reducedMotion || frame || visible.size === 0) return
  frame = requestAnimationFrame(paint)
}

function scan() {
  for (const card of [...mounted.keys()]) {
    if (!card.isConnected || !card.matches('.event-card.mood-stars, .event-card.event-card--constellation')) unmount(card)
  }

  document.querySelectorAll('.event-card.mood-stars, .event-card.event-card--constellation').forEach(mount)
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
  mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
  window.addEventListener('resize', requestPaint, { passive: true })
  window.addEventListener('orientationchange', requestPaint, { passive: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
