// Module 04 — One Wild Moment
// Progressive enhancement for intro step 1. The React/fallback state machine remains
// responsible for navigation; this module only choreographs the single hero reveal.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedHosts = new Set()
const timersByHost = new WeakMap()

function createWorld() {
  const world = document.createElement('div')
  world.className = 'tiger-cinematic-world'
  world.setAttribute('aria-hidden', 'true')
  world.innerHTML = `
    <div class="tiger-cinematic-world__blackout"></div>
    <div class="tiger-cinematic-world__light"></div>
    <div class="tiger-cinematic-world__breath"></div>
    <div class="tiger-cinematic-world__canopy tiger-cinematic-world__canopy--left"></div>
    <div class="tiger-cinematic-world__canopy tiger-cinematic-world__canopy--right"></div>
    <div class="tiger-cinematic-world__grain"></div>
    <div class="tiger-cinematic-world__frame"></div>
  `
  return world
}

function clearTimers(host) {
  const timers = timersByHost.get(host)
  if (!timers) return
  timers.forEach((timer) => window.clearTimeout(timer))
  timersByHost.delete(host)
}

function setPhase(host, phase) {
  if (!host.isConnected || !host.matches('.intro-screen.intro-1')) return
  host.dataset.tigerPhase = String(phase)
}

function normalizeFallbackLabel(host) {
  const label = host.querySelector('.tiger-reveal-label')
  const heading = host.querySelector('.intro-content > h1')
  if (!label || !heading) return

  // branchFallback historically rendered the English label even in its Hindi path.
  // Detect Devanagari copy locally so the enhancement stays bilingual without
  // coupling itself to fallback implementation state.
  if (/\p{Script=Devanagari}/u.test(heading.textContent || '')) {
    label.textContent = 'एक अनोखा पल'
  }
}

function mount(host) {
  if (mountedHosts.has(host)) return
  mountedHosts.add(host)
  host.classList.add('tiger-cinematic-ready')
  normalizeFallbackLabel(host)

  if (!host.querySelector(':scope > .tiger-cinematic-world')) {
    const world = createWorld()
    const content = host.querySelector('.intro-content')
    host.insertBefore(world, content || null)
  }

  if (reducedMotion) {
    host.dataset.tigerPhase = '3'
    return
  }

  host.dataset.tigerPhase = '0'
  const timers = [
    window.setTimeout(() => setPhase(host, 1), 260),
    window.setTimeout(() => setPhase(host, 2), 920),
    window.setTimeout(() => setPhase(host, 3), 1540),
  ]
  timersByHost.set(host, timers)
}

function unmount(host) {
  clearTimers(host)
  host.classList.remove('tiger-cinematic-ready')
  delete host.dataset.tigerPhase
  host.querySelector(':scope > .tiger-cinematic-world')?.remove()
  mountedHosts.delete(host)
}

function scan() {
  for (const host of [...mountedHosts]) {
    if (!host.isConnected || !host.matches('.intro-screen.intro-1')) unmount(host)
  }
  document.querySelectorAll('.intro-screen.intro-1').forEach(mount)
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
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })