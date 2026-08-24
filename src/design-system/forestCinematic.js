// Module 03 — Forest Cinematic Opening
// Adds a staged living-world treatment to intro step 0 only. The existing React
// state machine remains the source of truth, and the screen stays fully usable
// if this enhancement never mounts.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedHosts = new Set()
const timersByHost = new WeakMap()

function createWorld() {
  const world = document.createElement('div')
  world.className = 'forest-cinematic-world'
  world.setAttribute('aria-hidden', 'true')
  world.innerHTML = `
    <div class="forest-cinematic-world__blackout"></div>
    <div class="forest-cinematic-world__depth"></div>
    <div class="forest-cinematic-world__light"></div>
    <div class="forest-cinematic-world__mist forest-cinematic-world__mist--far"></div>
    <div class="forest-cinematic-world__mist forest-cinematic-world__mist--near"></div>
    <div class="forest-cinematic-world__river"></div>
    <div class="forest-cinematic-world__foliage forest-cinematic-world__foliage--left"></div>
    <div class="forest-cinematic-world__foliage forest-cinematic-world__foliage--right"></div>
    <div class="forest-cinematic-world__eyes"></div>
  `
  return world
}

function clearHostTimers(host) {
  const timers = timersByHost.get(host)
  if (!timers) return
  timers.forEach((timer) => window.clearTimeout(timer))
  timersByHost.delete(host)
}

function setPhase(host, phase) {
  if (!host.isConnected || !host.matches('.intro-screen.intro-0')) return
  host.dataset.forestPhase = String(phase)
}

function mount(host) {
  if (mountedHosts.has(host)) return
  mountedHosts.add(host)
  host.classList.add('forest-cinematic-ready')

  if (!host.querySelector(':scope > .forest-cinematic-world')) {
    const world = createWorld()
    const content = host.querySelector('.intro-content')
    host.insertBefore(world, content || null)
  }

  if (reducedMotion) {
    host.dataset.forestPhase = '3'
    return
  }

  host.dataset.forestPhase = '0'
  const timers = [
    window.setTimeout(() => setPhase(host, 1), 620),
    window.setTimeout(() => setPhase(host, 2), 1550),
    window.setTimeout(() => setPhase(host, 3), 2650),
  ]
  timersByHost.set(host, timers)
}

function unmount(host) {
  clearHostTimers(host)
  host.classList.remove('forest-cinematic-ready')
  delete host.dataset.forestPhase
  host.querySelector(':scope > .forest-cinematic-world')?.remove()
  mountedHosts.delete(host)
}

function scan() {
  for (const host of [...mountedHosts]) {
    if (!host.isConnected || !host.matches('.intro-screen.intro-0')) unmount(host)
  }
  document.querySelectorAll('.intro-screen.intro-0').forEach(mount)
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
