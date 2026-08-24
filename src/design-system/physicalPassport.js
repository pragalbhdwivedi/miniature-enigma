// Module 06 — Physical Passport Experience
// Presentation only. React owns React navigation and the raw fallback owns fallback
// navigation. This module must never intercept, synthesize, lock, or disable the
// Open Invitation action.

const mountedHosts = new Set()
const stateByHost = new WeakMap()

function setImportant(element, property, value) {
  element?.style.setProperty(property, value, 'important')
}

function mount(host) {
  if (mountedHosts.has(host)) return
  const content = host.querySelector('.passport-stage-content')
  const cover = host.querySelector('.passport-cover')
  const button = host.querySelector('.primary-cta')
  if (!content || !cover || !button) return

  mountedHosts.add(host)
  stateByHost.set(host, { content, cover, button })
  host.classList.add('passport-physical-ready')
  host.dataset.passportPhase = '1'

  // The retired 3D page-flip left perspective on both ancestors. In Mobile Safari,
  // a perspective ancestor can establish a containing block for positioned descendants.
  // The page-flip no longer exists, so remove that containment while this stage lives.
  host.style.perspective = 'none'
  content.style.perspective = 'none'

  // Mobile Safari exposes multiple viewport concepts as its browser chrome expands and
  // collapses. Keep the passport stage on the stable small viewport and anchor the REAL
  // React/fallback CTA inside that box. This avoids a fixed-position control drifting
  // behind Safari UI while preserving one authoritative click handler.
  setImportant(host, 'height', '100svh')
  setImportant(host, 'min-height', '100svh')
  setImportant(host, 'max-height', '100svh')
  setImportant(host, 'overflow', 'hidden')

  setImportant(content, 'height', '100svh')
  setImportant(content, 'min-height', '100svh')
  setImportant(content, 'max-height', '100svh')
  setImportant(content, 'overflow', 'hidden')
  setImportant(content, 'padding-bottom', 'calc(88px + env(safe-area-inset-bottom, 0px))')

  setImportant(button, 'position', 'absolute')
  setImportant(button, 'left', '50%')
  setImportant(button, 'bottom', 'max(18px, calc(env(safe-area-inset-bottom, 0px) + 10px))')
  setImportant(button, 'width', 'min(calc(100% - 44px), 360px)')
  setImportant(button, 'min-height', '62px')
  setImportant(button, 'margin', '0')
  setImportant(button, 'transform', 'translateX(-50%)')
  setImportant(button, 'z-index', '40')
  setImportant(button, 'pointer-events', 'auto')
  setImportant(button, 'touch-action', 'manipulation')

  // The cover remains visual only. Do not advertise a second tap target that does not
  // own navigation. The single visible Open Invitation control is the real app button.
  setImportant(cover, 'cursor', 'default')
  cover.removeAttribute('role')
  cover.removeAttribute('tabindex')
  cover.removeAttribute('aria-label')
  delete cover.dataset.passportTapTarget

  // Remove any stale Module 06 interior or interaction state left by hot reload/caches.
  host.querySelector(':scope > .passport-cinematic-world')?.remove()
  host.classList.remove('passport-is-opening')
  button.removeAttribute('aria-busy')
  delete button.dataset.opening
}

function unmount(host) {
  const state = stateByHost.get(host)
  state?.content.style.removeProperty('perspective')
  host.style.removeProperty('perspective')
  stateByHost.delete(host)
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
