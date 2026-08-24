// Module 05 — Tiger → Engraved Crest Transformation
// Corrective pass: the single photoreal tiger still carries into this step, but the
// engraved phase now reuses the existing inline TigerCrest vector instead of loading
// another multi-megabyte PNG. React / fallback remain authoritative.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedHosts = new Set()
const timersByHost = new WeakMap()

function createWorld(host) {
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

  const source = host.querySelector('.crest-transform .tiger-crest')
  const engraved = world.querySelector('.crest-transition-world__engraved')
  if (source && engraved) {
    const vector = source.cloneNode(true)
    vector.classList.add('crest-transition-world__engraved-svg')
    engraved.appendChild(vector)
  }

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
    const world = createWorld(host)
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
