// Module 05 — Tiger → Engraved Crest Transformation
// The single photoreal tiger carries into this step, then the approved engraved WebP
// takes over. React / fallback remain authoritative; this module only choreographs
// the visual handoff and never clones a second tiger crest into the same frame.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedHosts = new Set()
const timersByHost = new WeakMap()

function createWorld() {
  const world = document.createElement('div')
  world.className = 'crest-transition-world'
  world.setAttribute('aria-hidden', 'true')
  world.innerHTML = `
    <div class="crest-transition-world__art">
      <div class="crest-transition-world__photo"></div>
      <div class="crest-transition-world__engraved"></div>
      <div class="crest-transition-world__etch"></div>
    </div>
    <div class="crest-transition-world__wash"></div>
    <div class="crest-transition-world__halo"></div>
    <div class="crest-transition-world__grain"></div>
    <div class="crest-transition-world__burnish"></div>
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
  if (!host.isConnected || !host.matches('.intro-screen.intro-2')) return
  host.dataset.crestPhase = String(phase)
}

function mount(host) {
  if (mountedHosts.has(host)) return
  mountedHosts.add(host)
  host.classList.add('crest-transition-ready')

  if (!host.querySelector(':scope > .crest-transition-world')) {
    const world = createWorld()
    const content = host.querySelector('.intro-content')
    host.insertBefore(world, content || null)
  }

  if (reducedMotion) {
    host.dataset.crestPhase = '3'
    return
  }

  host.dataset.crestPhase = '0'
  const timers = [
    window.setTimeout(() => setPhase(host, 1), 380),
    window.setTimeout(() => setPhase(host, 2), 1260),
    window.setTimeout(() => setPhase(host, 3), 2200),
  ]
  timersByHost.set(host, timers)
}

function unmount(host) {
  clearTimers(host)
  host.classList.remove('crest-transition-ready')
  delete host.dataset.crestPhase
  host.querySelector(':scope > .crest-transition-world')?.remove()
  mountedHosts.delete(host)
}

function scan() {
  for (const host of [...mountedHosts]) {
    if (!host.isConnected || !host.matches('.intro-screen.intro-2')) unmount(host)
  }
  document.querySelectorAll('.intro-screen.intro-2').forEach(mount)
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