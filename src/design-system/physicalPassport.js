// Module 06 — Physical Passport Experience
// Presentation only. React owns React navigation and the raw fallback owns fallback
// navigation. This module must never intercept, synthesize, lock, position, or disable
// the Open Invitation action.

const mountedHosts = new Set()
const contentByHost = new WeakMap()

function mount(host) {
  if (mountedHosts.has(host)) return
  const content = host.querySelector('.passport-stage-content')
  if (!content) return

  mountedHosts.add(host)
  contentByHost.set(host, content)
  host.classList.add('passport-physical-ready')
  host.dataset.passportPhase = '1'

  // The retired 3D page flip no longer owns the composition.
  host.style.perspective = 'none'
  content.style.perspective = 'none'

  // Remove stale enhancement artifacts or interaction state from older cached builds.
  host.querySelector(':scope > .passport-cinematic-world')?.remove()
  host.classList.remove('passport-is-opening')

  const button = host.querySelector('.primary-cta')
  if (button) {
    button.removeAttribute('aria-busy')
    delete button.dataset.opening
  }

  const cover = host.querySelector('.passport-cover')
  if (cover) {
    cover.removeAttribute('role')
    cover.removeAttribute('tabindex')
    cover.removeAttribute('aria-label')
    delete cover.dataset.passportTapTarget
  }
}

function unmount(host) {
  const content = contentByHost.get(host)
  content?.style.removeProperty('perspective')
  host.style.removeProperty('perspective')
  contentByHost.delete(host)
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
