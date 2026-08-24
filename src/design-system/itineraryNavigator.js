// Module 11 — 24–26 November Itinerary Navigator
// Enhances the existing itinerary DOM. The React/fallback itinerary dataset remains
// the only source for day titles, activities and times.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedSections = new Set()
const stateBySection = new WeakMap()

const FIXED_EVENT_NAMES = [
  'Pind Green Flag',
  'Reels in Real Life',
  'Vitamin We',
  'Splash Before the Shaadi',
  'Wildly Ever After',
  'Written in the Stars',
  'Checkout',
  'चेकआउट',
]

function isHindi(section) {
  return document.documentElement.lang === 'hi' || section.closest('.lang-hi') !== null
}

function text(node) {
  return node?.textContent?.trim() || ''
}

function createNavigator(section, panels) {
  const hindi = isHindi(section)
  const wrapper = document.createElement('div')
  wrapper.className = 'itinerary-navigator'

  const meta = document.createElement('div')
  meta.className = 'itinerary-navigator__meta'
  meta.textContent = hindi ? '24–26 नवम्बर · तीन दिन' : '24–26 NOVEMBER · THREE DAYS'

  const tabs = document.createElement('div')
  tabs.className = 'itinerary-tabs'
  tabs.setAttribute('role', 'tablist')
  tabs.setAttribute('aria-label', hindi ? 'यात्रा का दिन चुनें' : 'Choose itinerary day')
  tabs.style.setProperty('--itinerary-tab-count', String(panels.length))

  panels.forEach((panel, index) => {
    const date = panel.querySelector('.date-block strong')
    const month = panel.querySelector('.date-block span')
    const title = panel.querySelector('.day-content h3')
    const day = text(date)
    const monthText = text(month) || 'NOV'

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'itinerary-tab'
    button.id = `itinerary-tab-${index + 1}`
    button.dataset.itineraryIndex = String(index)
    button.setAttribute('role', 'tab')
    button.setAttribute('aria-controls', `itinerary-panel-${index + 1}`)
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false')
    button.tabIndex = index === 0 ? 0 : -1
    button.innerHTML = `<strong>${escapeHtml(day)}</strong><span>${escapeHtml(monthText)}</span><small>${escapeHtml(hindi ? `दिन ${index + 1}` : `DAY ${String(index + 1).padStart(2, '0')}`)}</small>`
    button.setAttribute('aria-label', `${day} ${monthText}${title ? `, ${text(title)}` : ''}`)
    tabs.appendChild(button)
  })

  const hint = document.createElement('div')
  hint.className = 'itinerary-navigator__hint'
  hint.textContent = hindi ? 'दिन चुनने के लिए टैप या स्वाइप करें' : 'Tap or swipe to change day'

  wrapper.append(meta, tabs, hint)
  return wrapper
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
}

function markFixedItems(panel) {
  panel.querySelectorAll('.timeline-item').forEach((item) => {
    const label = text(item.querySelector('span'))
    const fixed = FIXED_EVENT_NAMES.some((name) => label.toLowerCase() === name.toLowerCase())
    if (fixed) item.dataset.itineraryFixed = 'true'
    else delete item.dataset.itineraryFixed
  })
}

function preparePanels(panels) {
  panels.forEach((panel, index) => {
    panel.id = `itinerary-panel-${index + 1}`
    panel.dataset.itineraryIndex = String(index)
    panel.dataset.itineraryActive = index === 0 ? 'true' : 'false'
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', `itinerary-tab-${index + 1}`)
    panel.tabIndex = 0
    if (index !== 0) panel.hidden = true

    const dateBlock = panel.querySelector('.date-block')
    if (dateBlock) dateBlock.dataset.itineraryFolio = `${String(index + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`
    markFixedItems(panel)
  })
}

function setActive(section, nextIndex, { focusTab = false } = {}) {
  const state = stateBySection.get(section)
  if (!state) return

  const { panels, tabs } = state
  const safeIndex = Math.max(0, Math.min(panels.length - 1, nextIndex))
  const previousIndex = state.activeIndex
  if (safeIndex === previousIndex) {
    if (focusTab) tabs[safeIndex]?.focus()
    return
  }

  state.activeIndex = safeIndex
  section.style.setProperty('--itinerary-active-index', String(safeIndex))

  tabs.forEach((tab, index) => {
    const active = index === safeIndex
    tab.setAttribute('aria-selected', active ? 'true' : 'false')
    tab.tabIndex = active ? 0 : -1
  })

  panels.forEach((panel, index) => {
    const active = index === safeIndex
    panel.dataset.itineraryDirection = safeIndex < previousIndex ? 'back' : 'forward'
    panel.dataset.itineraryActive = active ? 'true' : 'false'
    panel.hidden = !active
  })

  if (focusTab) tabs[safeIndex]?.focus()
}

function bindInteractions(section, navigator, panels) {
  const tabs = [...navigator.querySelectorAll('.itinerary-tab')]
  const state = {
    panels,
    tabs,
    activeIndex: 0,
    touchStartX: 0,
    touchStartY: 0,
  }
  stateBySection.set(section, state)

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActive(section, index))
    tab.addEventListener('keydown', (event) => {
      let next = null
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
      if (event.key === 'Home') next = 0
      if (event.key === 'End') next = tabs.length - 1
      if (next === null) return
      event.preventDefault()
      setActive(section, next, { focusTab: true })
    })
  })

  const stack = section.querySelector('.itinerary-stack')
  stack?.addEventListener('touchstart', (event) => {
    const touch = event.touches?.[0]
    if (!touch) return
    state.touchStartX = touch.clientX
    state.touchStartY = touch.clientY
  }, { passive: true })

  stack?.addEventListener('touchend', (event) => {
    const touch = event.changedTouches?.[0]
    if (!touch) return
    const dx = touch.clientX - state.touchStartX
    const dy = touch.clientY - state.touchStartY
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.25) return
    const next = dx < 0 ? state.activeIndex + 1 : state.activeIndex - 1
    setActive(section, next)
  }, { passive: true })
}

function mount(section) {
  if (mountedSections.has(section)) return
  const stack = section.querySelector(':scope > .itinerary-stack')
  const panels = [...(stack?.querySelectorAll(':scope > .itinerary-day') || [])]
  if (!stack || panels.length < 2) return

  mountedSections.add(section)
  section.classList.add('itinerary-navigator-ready')
  section.style.setProperty('--itinerary-active-index', '0')

  preparePanels(panels)
  const navigator = createNavigator(section, panels)
  stack.before(navigator)
  bindInteractions(section, navigator, panels)

  if (reducedMotion) section.dataset.itineraryReducedMotion = 'true'
}

function unmount(section) {
  mountedSections.delete(section)
  stateBySection.delete(section)
}

function scan() {
  for (const section of [...mountedSections]) {
    if (!section.isConnected || !section.matches('.itinerary-section')) unmount(section)
  }
  document.querySelectorAll('.itinerary-section').forEach(mount)
}

let queued = false
const observer = new MutationObserver(() => {
  if (queued) return
  queued = true
  queueMicrotask(() => {
    queued = false
    scan()
  })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
