// Module 24 — Global Motion Design System
// One lightweight runtime owns motion preference, page visibility and section activity.
// It does not replace module-specific choreography or add scroll hijacking.

const root = document.documentElement
const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
const coarsePointerQuery = window.matchMedia?.('(pointer: coarse)')

const SECTION_SELECTOR = [
  '.editorial-hero',
  '.family-section',
  '.story-section',
  '.destination-section',
  '.itinerary-section',
  '.event-section',
  '.venue-section',
  '.utility-section',
  '.gallery-section',
  '.rsvp-section',
  '.closing-section',
].join(',')

const NAV_TARGETS = ['home', 'events', 'stay', 'travel', 'rsvp']
const observedSections = new Set()
let scanQueued = false

function applyMotionPreference() {
  root.dataset.motion = reducedMotionQuery?.matches ? 'reduced' : 'full'
}

function applyPointerProfile() {
  root.dataset.motionInput = coarsePointerQuery?.matches ? 'coarse' : 'fine'
}

function applyPageVisibility() {
  root.dataset.motionPage = document.hidden ? 'hidden' : 'visible'
}

function handleReducedNavigation(event) {
  if (!reducedMotionQuery?.matches) return
  const button = event.target instanceof Element ? event.target.closest('.bottom-nav > button') : null
  if (!button) return

  const nav = button.closest('.bottom-nav')
  if (!nav) return
  const buttons = [...nav.querySelectorAll(':scope > button')].slice(0, NAV_TARGETS.length)
  const index = buttons.indexOf(button)
  if (index < 0) return

  const target = document.getElementById(NAV_TARGETS[index])
  if (!target) return

  event.preventDefault()
  event.stopPropagation()
  target.scrollIntoView({ behavior: 'auto', block: 'start' })
}

const sectionObserver = typeof IntersectionObserver === 'function'
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target
        if (!section.isConnected) return
        const active = entry.isIntersecting
        section.dataset.motionVisibility = active ? 'active' : 'idle'
        if (active) section.dataset.motionSeen = 'true'
      })
    }, {
      rootMargin: '18% 0px 18% 0px',
      threshold: 0.01,
    })
  : null

function mountSection(section) {
  if (observedSections.has(section)) return
  observedSections.add(section)
  section.dataset.motionSection = 'true'

  if (sectionObserver) {
    section.dataset.motionVisibility = 'idle'
    sectionObserver.observe(section)
  } else {
    section.dataset.motionVisibility = 'active'
    section.dataset.motionSeen = 'true'
  }
}

function unmountSection(section) {
  sectionObserver?.unobserve(section)
  observedSections.delete(section)
  delete section.dataset.motionSection
  delete section.dataset.motionVisibility
  delete section.dataset.motionSeen
}

function scan() {
  for (const section of [...observedSections]) {
    if (!section.isConnected || !section.matches(SECTION_SELECTOR)) unmountSection(section)
  }
  document.querySelectorAll(SECTION_SELECTOR).forEach(mountSection)
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
  root.classList.add('motion-system-ready')
  applyMotionPreference()
  applyPointerProfile()
  applyPageVisibility()

  reducedMotionQuery?.addEventListener?.('change', applyMotionPreference)
  coarsePointerQuery?.addEventListener?.('change', applyPointerProfile)
  document.addEventListener('visibilitychange', applyPageVisibility, { passive: true })
  document.addEventListener('click', handleReducedNavigation, true)

  mutationObserver.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
