// Module 10 — Jim Corbett Destination Chapter
// Enhances the existing destination section without changing locked copy or the
// React/fallback data model. All added DOM is decorative/editorial structure.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedSections = new Set()
const visibleSections = new Set()
let scrollFrame = 0

function createAtmosphere() {
  const atmosphere = document.createElement('div')
  atmosphere.className = 'destination-atmosphere'
  atmosphere.setAttribute('aria-hidden', 'true')
  atmosphere.innerHTML = `
    <div class="destination-mist destination-mist--one"></div>
    <div class="destination-mist destination-mist--two"></div>
    <div class="destination-foliage">
      <i class="destination-leaf destination-leaf--one"></i>
      <i class="destination-leaf destination-leaf--two"></i>
      <i class="destination-leaf destination-leaf--three"></i>
      <i class="destination-leaf destination-leaf--four"></i>
    </div>
  `
  return atmosphere
}

function createWordmark() {
  const wordmark = document.createElement('div')
  wordmark.className = 'destination-wordmark'
  wordmark.textContent = 'CORBETT'
  wordmark.setAttribute('aria-hidden', 'true')
  return wordmark
}

function createPassageMark() {
  const mark = document.createElement('div')
  mark.className = 'destination-passage-mark'
  mark.setAttribute('aria-hidden', 'true')
  return mark
}

function wrapLocation(copy) {
  if (copy.querySelector(':scope > .destination-location-lockup')) return
  const venue = copy.querySelector(':scope > strong')
  const destination = copy.querySelector(':scope > span')
  if (!venue || !destination) return

  const lockup = document.createElement('div')
  lockup.className = 'destination-location-lockup'
  venue.before(lockup)
  lockup.append(venue, destination)
}

function mount(section) {
  if (mountedSections.has(section)) return
  const image = section.querySelector(':scope > .destination-image')
  const copy = section.querySelector(':scope > .destination-copy')
  if (!image || !copy) return

  mountedSections.add(section)
  section.classList.add('destination-world-ready')
  copy.classList.add('destination-editorial-copy')
  image.setAttribute('aria-hidden', 'true')

  if (!section.querySelector(':scope > .destination-wordmark')) {
    section.insertBefore(createWordmark(), copy)
  }
  if (!section.querySelector(':scope > .destination-atmosphere')) {
    section.insertBefore(createAtmosphere(), copy)
  }
  if (!section.querySelector(':scope > .destination-passage-mark')) {
    section.insertBefore(createPassageMark(), copy)
  }

  wrapLocation(copy)
  destinationObserver.observe(section)

  if (reducedMotion) section.classList.add('destination-in-view')
}

function unmount(section) {
  destinationObserver.unobserve(section)
  mountedSections.delete(section)
  visibleSections.delete(section)
  section.classList.remove('destination-world-ready', 'destination-in-view')
  section.style.removeProperty('--destination-photo-y')
  section.style.removeProperty('--destination-word-y')
  section.style.removeProperty('--destination-near-y')
  section.style.removeProperty('--destination-far-y')
}

const destinationObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const section = entry.target
    if (entry.isIntersecting) {
      visibleSections.add(section)
      section.classList.add('destination-in-view')
      requestScrollUpdate()
    } else {
      visibleSections.delete(section)
    }
  }
}, { rootMargin: '12% 0px 12% 0px', threshold: .08 })

function updateParallax() {
  scrollFrame = 0
  if (reducedMotion) return

  const viewport = Math.max(window.innerHeight || 0, 1)
  for (const section of visibleSections) {
    if (!section.isConnected) continue
    const rect = section.getBoundingClientRect()
    const total = viewport + rect.height
    const progress = Math.min(1, Math.max(0, (viewport - rect.top) / total))
    const centered = progress - .5

    const photoY = centered * -20
    const wordY = centered * 16
    const nearY = centered * -12
    const farY = centered * 8

    section.style.setProperty('--destination-photo-y', `${photoY.toFixed(2)}px`)
    section.style.setProperty('--destination-word-y', `${wordY.toFixed(2)}px`)
    section.style.setProperty('--destination-near-y', `${nearY.toFixed(2)}px`)
    section.style.setProperty('--destination-far-y', `${farY.toFixed(2)}px`)
  }
}

function requestScrollUpdate() {
  if (scrollFrame || reducedMotion) return
  scrollFrame = requestAnimationFrame(updateParallax)
}

function scan() {
  for (const section of [...mountedSections]) {
    if (!section.isConnected || !section.matches('.destination-section')) unmount(section)
  }
  document.querySelectorAll('.destination-section').forEach(mount)
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
  window.addEventListener('scroll', requestScrollUpdate, { passive: true })
  window.addEventListener('resize', requestScrollUpdate, { passive: true })
  window.addEventListener('orientationchange', requestScrollUpdate, { passive: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
