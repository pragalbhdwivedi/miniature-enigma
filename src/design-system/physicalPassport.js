// Module 06 — Physical Passport Experience
// Corrective pass: the passport remains a tactile cover, but opening it no longer
// inserts or waits on an intermediate ivory editorial page. The original React /
// raw-fallback click is allowed to continue immediately, so the passport can never
// become a blocking state between the cover and the real invitation.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedHosts = new Set()
const handlersByHost = new WeakMap()
let handoffCleanupTimer = 0

function beginHandoff(duration = 620) {
  document.body.classList.add('passport-handoff-active')
  window.clearTimeout(handoffCleanupTimer)
  handoffCleanupTimer = window.setTimeout(() => {
    document.body.classList.remove('passport-handoff-active')
  }, duration)
}

function mount(host) {
  if (mountedHosts.has(host)) return
  const cover = host.querySelector('.passport-cover')
  const button = host.querySelector('.primary-cta')
  if (!cover || !button) return

  mountedHosts.add(host)
  host.classList.add('passport-physical-ready')
  host.dataset.passportPhase = '1'

  // Remove any stale Module 06 interior left by a hot reload or source fallback.
  host.querySelector(':scope > .passport-cinematic-world')?.remove()

  const handler = () => {
    if (host.classList.contains('passport-is-opening')) return
    host.classList.add('passport-is-opening')
    button.dataset.opening = 'true'
    button.setAttribute('aria-busy', 'true')
    beginHandoff(reducedMotion ? 180 : 620)

    // Deliberately do not preventDefault / stopPropagation here. React and the
    // dependency-free fallback remain authoritative and receive this same click
    // synchronously, moving straight to the real invitation.
  }

  button.addEventListener('click', handler)
  handlersByHost.set(host, { button, handler })
}

function unmount(host) {
  const bound = handlersByHost.get(host)
  if (bound) bound.button.removeEventListener('click', bound.handler)
  handlersByHost.delete(host)
  host.querySelector(':scope > .passport-cinematic-world')?.remove()
  host.classList.remove('passport-physical-ready', 'passport-is-opening')
  delete host.dataset.passportPhase
  mountedHosts.delete(host)
}

function scan() {
  for (const host of [...mountedHosts]) {
    if (!host.isConnected || !host.matches('.passport-stage')) unmount(host)
  }
  document.querySelectorAll('.passport-stage').forEach(mount)
}

let scanQueued = false
const observer = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
