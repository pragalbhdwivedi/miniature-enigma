// Module 06 — Physical Passport Experience
// The passport remains a tactile cover, but opening it no longer inserts or waits on
// an intermediate ivory editorial page. The visible cover itself is also an accessible
// activation target so short Mobile Safari viewports cannot strand the guest.

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

function activateButton(button) {
  if (!button || button.disabled) return
  button.click()
}

function mount(host) {
  if (mountedHosts.has(host)) return
  const content = host.querySelector('.passport-stage-content')
  const cover = host.querySelector('.passport-cover')
  const button = host.querySelector('.primary-cta')
  if (!content || !cover || !button) return

  mountedHosts.add(host)
  host.classList.add('passport-physical-ready')
  host.dataset.passportPhase = '1'

  // The retired 3D page-flip left perspective on both ancestors. In Mobile Safari,
  // a perspective ancestor establishes a containing block for fixed descendants,
  // which can pull the viewport-fixed Open Invitation CTA below the visible screen.
  // The page-flip no longer exists, so remove that containment while this stage lives.
  host.style.perspective = 'none'
  content.style.perspective = 'none'

  // Remove any stale Module 06 interior left by a hot reload or source fallback.
  host.querySelector(':scope > .passport-cinematic-world')?.remove()

  const buttonHandler = () => {
    if (host.classList.contains('passport-is-opening')) return
    host.classList.add('passport-is-opening')
    button.dataset.opening = 'true'
    button.setAttribute('aria-busy', 'true')
    beginHandoff(reducedMotion ? 180 : 620)

    // Deliberately do not preventDefault / stopPropagation here. React and the
    // dependency-free fallback remain authoritative and receive this same click
    // synchronously, moving straight to the real invitation.
  }

  const coverClickHandler = (event) => {
    // The cover is decorative content with no nested controls today. Keep this guard
    // future-safe so a later real link/button inside the cover keeps its own action.
    if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea')) return
    activateButton(button)
  }

  const coverKeyHandler = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    activateButton(button)
  }

  const label = (button.textContent || 'Open invitation').replace(/\s+/g, ' ').trim()
  cover.setAttribute('role', 'button')
  cover.setAttribute('tabindex', '0')
  cover.setAttribute('aria-label', label)
  cover.dataset.passportTapTarget = 'true'

  button.addEventListener('click', buttonHandler)
  cover.addEventListener('click', coverClickHandler)
  cover.addEventListener('keydown', coverKeyHandler)
  handlersByHost.set(host, {
    content,
    button,
    cover,
    buttonHandler,
    coverClickHandler,
    coverKeyHandler,
  })
}

function unmount(host) {
  const bound = handlersByHost.get(host)
  if (bound) {
    bound.button.removeEventListener('click', bound.buttonHandler)
    bound.cover.removeEventListener('click', bound.coverClickHandler)
    bound.cover.removeEventListener('keydown', bound.coverKeyHandler)
    bound.cover.removeAttribute('role')
    bound.cover.removeAttribute('tabindex')
    bound.cover.removeAttribute('aria-label')
    delete bound.cover.dataset.passportTapTarget
    bound.content.style.removeProperty('perspective')
  }
  host.style.removeProperty('perspective')
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
