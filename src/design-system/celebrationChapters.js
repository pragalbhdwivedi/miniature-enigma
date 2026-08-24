// Module 12 — Celebration Event Chapters
// Presentation-only enhancement. Existing React/fallback markup remains the source of
// every event title, type, date and time; this module adds chapter structure and motion.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedCards = new Set()
const visibleCards = new Set()
let activeCard = null
let scrollFrame = 0

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function splitDateTime(card) {
  const content = card.querySelector(':scope > div:nth-child(2)')
  const line = content?.querySelector(':scope > p:last-child')
  if (!line || line.classList.contains('event-chapter-datetime')) return

  const raw = line.textContent?.replace(/\s+/g, ' ').trim() || ''
  if (!raw) return
  const [date, ...timeParts] = raw.split(/\s*·\s*/)
  const time = timeParts.join(' · ')

  line.classList.add('event-chapter-datetime')
  line.setAttribute('aria-label', raw)
  line.textContent = ''

  const dateNode = document.createElement('span')
  dateNode.className = 'event-chapter-datetime__date'
  dateNode.textContent = date
  line.appendChild(dateNode)

  if (time) {
    const timeNode = document.createElement('span')
    timeNode.className = 'event-chapter-datetime__time'
    timeNode.textContent = time
    line.appendChild(timeNode)
  }
}

function createAtmosphere() {
  const node = document.createElement('div')
  node.className = 'event-chapter-atmosphere'
  node.setAttribute('aria-hidden', 'true')
  return node
}

function createFolio(index, total) {
  const node = document.createElement('div')
  node.className = 'event-chapter-folio'
  node.setAttribute('aria-hidden', 'true')
  node.textContent = `CHAPTER ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
  return node
}

function createRail() {
  const node = document.createElement('div')
  node.className = 'event-chapter-rail'
  node.setAttribute('aria-hidden', 'true')
  return node
}

function mountCard(card, index, total) {
  if (mountedCards.has(card)) return
  const heading = card.querySelector('h3')
  if (!heading) return

  mountedCards.add(card)
  card.classList.add('event-chapter-ready')
  card.dataset.eventChapterNumber = String(index + 1).padStart(2, '0')
  if (!card.dataset.chapterTitle) card.dataset.chapterTitle = heading.textContent?.trim() || ''
  card.style.setProperty('--event-progress', '0')

  splitDateTime(card)

  if (!card.querySelector(':scope > .event-chapter-atmosphere')) card.prepend(createAtmosphere())
  if (!card.querySelector(':scope > .event-chapter-folio')) card.appendChild(createFolio(index, total))
  if (!card.querySelector(':scope > .event-chapter-rail')) card.appendChild(createRail())

  chapterObserver.observe(card)
  if (reducedMotion) card.classList.add('is-event-active')
}

function unmountCard(card) {
  chapterObserver.unobserve(card)
  mountedCards.delete(card)
  visibleCards.delete(card)
  if (activeCard === card) activeCard = null
}

function updateChapters() {
  scrollFrame = 0
  if (reducedMotion || visibleCards.size === 0) return

  const viewport = Math.max(window.innerHeight || 0, 1)
  let closest = null
  let closestDistance = Infinity

  for (const card of visibleCards) {
    if (!card.isConnected) continue
    const rect = card.getBoundingClientRect()
    const center = rect.top + rect.height / 2
    const distance = Math.abs(center - viewport * .5)
    if (distance < closestDistance) {
      closest = card
      closestDistance = distance
    }

    const travel = viewport + rect.height
    const progress = clamp((viewport - rect.top) / travel)
    const centered = progress - .5
    const railProgress = clamp((viewport * .82 - rect.top) / Math.max(rect.height * .66, 1))

    card.style.setProperty('--event-photo-y', `${(centered * -18).toFixed(2)}px`)
    card.style.setProperty('--event-copy-y', `${(centered * -10).toFixed(2)}px`)
    card.style.setProperty('--event-decor-y', `${(centered * 16).toFixed(2)}px`)
    card.style.setProperty('--event-progress', railProgress.toFixed(4))
  }

  if (closest !== activeCard) {
    activeCard?.classList.remove('is-event-active')
    activeCard = closest
    activeCard?.classList.add('is-event-active')
  }
}

function requestUpdate() {
  if (scrollFrame || reducedMotion) return
  scrollFrame = requestAnimationFrame(updateChapters)
}

const chapterObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) visibleCards.add(entry.target)
    else visibleCards.delete(entry.target)
  }
  requestUpdate()
}, { rootMargin: '28% 0px 28% 0px', threshold: .02 })

function scan() {
  for (const card of [...mountedCards]) {
    if (!card.isConnected || !card.matches('.event-card')) unmountCard(card)
  }

  document.querySelectorAll('.event-section').forEach((section) => {
    section.classList.add('event-chapters-ready')
    const cards = [...section.querySelectorAll('.event-stack > .event-card')]
    cards.forEach((card, index) => mountCard(card, index, cards.length))
  })

  requestUpdate()
}

let scanQueued = false
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
  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate, { passive: true })
  window.addEventListener('orientationchange', requestUpdate, { passive: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
