// Visible cinematic upgrade inspired by the MIT-licensed ThreeUI Community
// Sylva Living World scene and Article Headings / TextAnimationCollection.
// We adapt the motion language to this wedding site instead of shipping Three.js.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? true
const rafState = { scheduled: false }
const preparedHeadings = new WeakSet()
const decodedHeadings = new WeakSet()

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function createSylvaWorld(section) {
  if (!section || section.dataset.sylvaReady === 'true') return
  section.dataset.sylvaReady = 'true'
  section.classList.add('sylva-destination')

  const world = document.createElement('div')
  world.className = 'sylva-world'
  world.setAttribute('aria-hidden', 'true')

  const ghost = document.createElement('div')
  ghost.className = 'sylva-world__ghost'
  ghost.textContent = 'CORBETT'

  const rays = document.createElement('div')
  rays.className = 'sylva-world__rays'

  const mist = document.createElement('div')
  mist.className = 'sylva-world__mist'

  const pollen = document.createElement('div')
  pollen.className = 'sylva-world__pollen'
  const pollenCount = coarsePointer ? 15 : 24
  for (let index = 0; index < pollenCount; index += 1) {
    const mote = document.createElement('i')
    mote.style.setProperty('--x', `${6 + Math.random() * 88}%`)
    mote.style.setProperty('--y', `${10 + Math.random() * 80}%`)
    mote.style.setProperty('--size', `${1 + Math.random() * 3.2}px`)
    mote.style.setProperty('--delay', `${-Math.random() * 9}s`)
    mote.style.setProperty('--duration', `${7 + Math.random() * 8}s`)
    pollen.appendChild(mote)
  }

  const leftLeaves = document.createElement('div')
  leftLeaves.className = 'sylva-world__foliage sylva-world__foliage--left'
  const rightLeaves = document.createElement('div')
  rightLeaves.className = 'sylva-world__foliage sylva-world__foliage--right'

  for (let side = 0; side < 2; side += 1) {
    const host = side === 0 ? leftLeaves : rightLeaves
    for (let index = 0; index < 13; index += 1) {
      const leaf = document.createElement('i')
      leaf.style.setProperty('--leaf-index', index)
      leaf.style.setProperty('--leaf-y', `${-4 + index * 8.1}%`)
      leaf.style.setProperty('--leaf-rot', `${(side === 0 ? -1 : 1) * (20 + (index % 5) * 9)}deg`)
      leaf.style.setProperty('--leaf-scale', `${0.72 + (index % 4) * 0.13}`)
      host.appendChild(leaf)
    }
  }

  world.append(rays, mist, ghost, pollen, leftLeaves, rightLeaves)
  section.prepend(world)

  const update = () => {
    rafState.scheduled = false
    if (!section.isConnected) return
    const rect = section.getBoundingClientRect()
    const viewport = window.innerHeight || 1
    const progress = clamp((viewport - rect.top) / (viewport + rect.height))
    const centered = clamp((viewport * 0.5 - rect.top) / Math.max(rect.height, 1), -0.5, 1.5)
    section.style.setProperty('--sylva-progress', progress.toFixed(4))
    section.style.setProperty('--sylva-depth', centered.toFixed(4))
  }

  const requestUpdate = () => {
    if (rafState.scheduled) return
    rafState.scheduled = true
    requestAnimationFrame(update)
  }

  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate, { passive: true })

  if (!coarsePointer) {
    section.addEventListener('pointermove', (event) => {
      const rect = section.getBoundingClientRect()
      const x = clamp((event.clientX - rect.left) / Math.max(rect.width, 1)) - 0.5
      const y = clamp((event.clientY - rect.top) / Math.max(rect.height, 1)) - 0.5
      section.style.setProperty('--sylva-pointer-x', x.toFixed(3))
      section.style.setProperty('--sylva-pointer-y', y.toFixed(3))
    }, { passive: true })
  }

  const observer = new IntersectionObserver(([entry]) => {
    section.classList.toggle('is-sylva-visible', entry.isIntersecting)
    if (entry.isIntersecting) requestUpdate()
  }, { threshold: 0.12 })
  observer.observe(section)
  requestUpdate()
}

function splitHeading(element, variant = 'editorial') {
  if (!element || preparedHeadings.has(element)) return
  const original = element.textContent?.replace(/\s+/g, ' ').trim() || ''
  if (!original) return

  preparedHeadings.add(element)
  element.dataset.kinetic = variant
  element.dataset.kineticGhost = original.toUpperCase()
  element.setAttribute('aria-label', original)
  element.textContent = ''

  original.split(/(\s+)/).forEach((token, index) => {
    if (/^\s+$/.test(token)) {
      element.appendChild(document.createTextNode(' '))
      return
    }
    const outer = document.createElement('span')
    outer.className = 'kinetic-word'
    outer.style.setProperty('--word-index', String(index))
    outer.setAttribute('aria-hidden', 'true')

    const ink = document.createElement('span')
    ink.className = 'kinetic-word__ink'
    ink.textContent = token
    outer.appendChild(ink)
    element.appendChild(outer)
  })
}

const DECODE_POOL = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789✦'

function decodeHeading(element) {
  if (reducedMotion || decodedHeadings.has(element) || element.dataset.kinetic !== 'decode') return
  decodedHeadings.add(element)

  const words = [...element.querySelectorAll('.kinetic-word__ink')]
  words.forEach((word, wordIndex) => {
    const original = word.textContent || ''
    const start = performance.now() + wordIndex * 95
    const duration = 520

    const frame = (now) => {
      const raw = clamp((now - start) / duration)
      if (now < start) {
        requestAnimationFrame(frame)
        return
      }
      const progress = 1 - Math.pow(1 - raw, 2.4)
      const revealed = Math.floor(progress * original.length)
      let output = ''
      for (let index = 0; index < original.length; index += 1) {
        const char = original[index]
        if (index < revealed || char === ' ') output += char
        else if (Math.random() < 0.3) output += char
        else output += DECODE_POOL[(Math.random() * DECODE_POOL.length) | 0]
      }
      word.textContent = raw >= 1 ? original : output
      if (raw < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })
}

function prepareTypography() {
  const editorialSelectors = [
    '.story-layout h2',
    '.destination-copy h2',
    '.itinerary-section > h2',
    '.venue-card h2',
    '.gallery-section > h2',
    '.rsvp-section > h2',
  ]
  editorialSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((heading) => splitHeading(heading, 'editorial'))
  })

  document.querySelectorAll('.event-card h3').forEach((heading) => splitHeading(heading, 'decode'))

  document.querySelectorAll('[data-kinetic]').forEach((heading) => {
    if (heading.dataset.kineticObserved === 'true') return
    heading.dataset.kineticObserved = 'true'
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      heading.classList.add('is-kinetic-visible')
      decodeHeading(heading)
      observer.disconnect()
    }, { threshold: 0.45, rootMargin: '0px 0px -8% 0px' })
    observer.observe(heading)
  })
}

function upgradeEventChapters() {
  document.querySelectorAll('.event-card').forEach((card, index) => {
    if (card.dataset.chapterReady === 'true') return
    card.dataset.chapterReady = 'true'
    card.style.setProperty('--chapter-index', String(index))
    const heading = card.querySelector('h3')
    if (heading) card.dataset.chapterTitle = heading.textContent?.trim() || ''

    const chapterLine = document.createElement('div')
    chapterLine.className = 'event-chapter-line'
    chapterLine.setAttribute('aria-hidden', 'true')
    chapterLine.innerHTML = '<i></i><span>THE CORBETT WEDDING</span><i></i>'
    card.appendChild(chapterLine)
  })
}

function scan() {
  createSylvaWorld(document.querySelector('.destination-section'))
  upgradeEventChapters()
  prepareTypography()
}

let queued = false
const mutationObserver = new MutationObserver(() => {
  if (queued) return
  queued = true
  queueMicrotask(() => {
    queued = false
    scan()
  })
})

function start() {
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
else start()
