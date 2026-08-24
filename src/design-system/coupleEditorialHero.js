// Module 07 — Main Couple Hero / Formal Invitation
// Enhances the existing editorial hero in both React and raw fallback render paths.
// Content/state remain owned by the app; this module only restructures the visible
// name treatment and adds restrained entrance/parallax behavior.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mounted = new Set()
const cleanupByHost = new WeakMap()

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
}

function splitNames(heading) {
  const raw = heading?.textContent?.replace(/\s+/g, ' ').trim() || ''
  const parts = raw.split('&').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2) return { raw, first: parts[0], second: parts.slice(1).join(' & ') }
  return { raw, first: raw, second: '' }
}

function buildEditorialWorld(host) {
  const eyebrow = host.querySelector('.hero-copy .eyebrow')?.textContent?.trim() || 'THE CORBETT WEDDING'
  const datePart = eyebrow.includes('·') ? eyebrow.split('·').slice(1).join('·').trim() : ''

  const world = document.createElement('div')
  world.className = 'hero-editorial-world'
  world.setAttribute('aria-hidden', 'true')
  world.innerHTML = `
    <div class="hero-editorial-world__frame"></div>
    <div class="hero-editorial-world__folio">${escapeHtml(datePart || eyebrow)}</div>
    <div class="hero-editorial-world__index">THE CORBETT WEDDING</div>
    <div class="hero-editorial-world__rule"></div>
    <div class="hero-editorial-world__page-edge"></div>
  `
  return world
}

function structureNames(host) {
  const heading = host.querySelector('.hero-copy h1')
  if (!heading || heading.dataset.editorialNames === 'true') return
  const names = splitNames(heading)
  if (!names.first || !names.second) return

  heading.dataset.editorialNames = 'true'
  heading.dataset.originalLabel = names.raw
  heading.setAttribute('aria-label', names.raw)
  heading.innerHTML = `
    <span class="hero-name-mask"><span class="hero-name-text">${escapeHtml(names.first)}</span></span>
    <span class="hero-amp" aria-hidden="true">&amp;</span>
    <span class="hero-name-mask"><span class="hero-name-text">${escapeHtml(names.second)}</span></span>
  `
}

function mount(host) {
  if (mounted.has(host)) return
  const photo = host.querySelector('.hero-photo')
  const copy = host.querySelector('.hero-copy')
  if (!photo || !copy) return

  mounted.add(host)
  host.classList.add('couple-editorial-ready')
  structureNames(host)

  if (!host.querySelector(':scope > .hero-editorial-world')) {
    host.appendChild(buildEditorialWorld(host))
  }

  let active = false
  let scrollFrame = 0
  const timers = []

  const setPhase = (phase) => {
    if (host.isConnected) host.dataset.heroPhase = String(phase)
  }

  const updateParallax = () => {
    scrollFrame = 0
    if (!active || reducedMotion || !host.isConnected) return
    const rect = host.getBoundingClientRect()
    const viewport = window.innerHeight || document.documentElement.clientHeight || 800
    const progress = Math.max(0, Math.min(1, (viewport - rect.top) / (viewport + rect.height)))
    const y = (progress - 0.5) * 14
    host.style.setProperty('--hero-parallax-y', `${y.toFixed(2)}px`)
  }

  const requestParallax = () => {
    if (scrollFrame || reducedMotion) return
    scrollFrame = requestAnimationFrame(updateParallax)
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    active = Boolean(entry?.isIntersecting)
    host.classList.toggle('hero-in-view', active)
    if (active) requestParallax()
  }, { rootMargin: '16% 0px 16% 0px', threshold: 0.01 })

  observer.observe(host)
  window.addEventListener('scroll', requestParallax, { passive: true })
  window.addEventListener('resize', requestParallax, { passive: true })

  if (reducedMotion) {
    setPhase(3)
  } else {
    setPhase(0)
    timers.push(window.setTimeout(() => setPhase(1), 120))
    timers.push(window.setTimeout(() => setPhase(2), 560))
    timers.push(window.setTimeout(() => setPhase(3), 1040))
  }

  cleanupByHost.set(host, () => {
    timers.forEach((timer) => window.clearTimeout(timer))
    observer.disconnect()
    window.removeEventListener('scroll', requestParallax)
    window.removeEventListener('resize', requestParallax)
    if (scrollFrame) cancelAnimationFrame(scrollFrame)
    host.style.removeProperty('--hero-parallax-y')
    host.classList.remove('couple-editorial-ready', 'hero-in-view')
    delete host.dataset.heroPhase
    mounted.delete(host)
    cleanupByHost.delete(host)
  })
}

function unmount(host) {
  cleanupByHost.get(host)?.()
}

function scan() {
  for (const host of [...mounted]) {
    if (!host.isConnected || !host.matches('.editorial-hero')) unmount(host)
  }
  document.querySelectorAll('.editorial-hero').forEach(mount)
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

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
