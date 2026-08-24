// Module 06 — Physical Passport Experience
// Enhances the existing passport stage without replacing the React/fallback state
// machine. The original Open Invitation click is delayed until the physical object
// has opened, then replayed so both rendering paths keep their existing logic.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedHosts = new Set()
const timersByHost = new WeakMap()
const handlersByHost = new WeakMap()

function text(node, fallback = '') {
  return node?.textContent?.trim() || fallback
}

function createWorld(host) {
  const cover = host.querySelector('.passport-cover')
  const names = [...(cover?.querySelectorAll('.passport-names strong') || [])].map((node) => text(node)).filter(Boolean)
  const journey = text(host.querySelector('.journey-copy'), 'Welcome to our journey')

  const world = document.createElement('div')
  world.className = 'passport-cinematic-world'
  world.setAttribute('aria-hidden', 'true')
  world.innerHTML = `
    <div class="passport-cinematic-world__shadow"></div>
    <div class="passport-cinematic-world__paper">
      <div class="passport-cinematic-world__editorial">
        <div class="passport-cinematic-world__editorial-kicker">THE CORBETT WEDDING</div>
        <div>
          <div class="passport-cinematic-world__editorial-title">${escapeHtml(journey)}</div>
          <div class="passport-cinematic-world__editorial-rule"></div>
        </div>
        <div class="passport-cinematic-world__editorial-meta">
          <div>${escapeHtml(names.join(' & '))}<br>24–26 NOVEMBER 2026</div>
          <div class="passport-cinematic-world__stamp">JIM<br>CORBETT</div>
        </div>
      </div>
    </div>
    <div class="passport-cinematic-world__spine"></div>
    <div class="passport-cinematic-world__glint"></div>
  `
  return world
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
}

function syncGeometry(host) {
  const cover = host.querySelector('.passport-cover')
  if (!cover?.isConnected) return
  const hostRect = host.getBoundingClientRect()
  const rect = cover.getBoundingClientRect()
  host.style.setProperty('--passport-x', `${Math.max(0, rect.left - hostRect.left)}px`)
  host.style.setProperty('--passport-y', `${Math.max(0, rect.top - hostRect.top)}px`)
  host.style.setProperty('--passport-w', `${rect.width}px`)
  host.style.setProperty('--passport-h', `${rect.height}px`)
}

function clearTimers(host) {
  const timers = timersByHost.get(host)
  if (timers) timers.forEach((timer) => window.clearTimeout(timer))
  timersByHost.delete(host)
}

function setPhase(host, phase) {
  if (!host.isConnected || !host.matches('.passport-stage')) return
  host.dataset.passportPhase = String(phase)
}

function replayOriginalClick(host, button) {
  if (!host.isConnected || !button?.isConnected) return
  button.dataset.passportBypass = 'true'
  button.click()
}

function beginOpen(host, button, event) {
  if (button.dataset.passportBypass === 'true') {
    delete button.dataset.passportBypass
    return
  }

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation?.()

  if (host.classList.contains('passport-is-opening')) return
  host.classList.add('passport-is-opening')
  button.setAttribute('aria-busy', 'true')
  button.dataset.opening = 'true'
  clearTimers(host)

  if (reducedMotion) {
    setPhase(host, 4)
    document.body.classList.add('passport-handoff-active')
    const timers = [
      window.setTimeout(() => replayOriginalClick(host, button), 120),
      window.setTimeout(() => document.body.classList.remove('passport-handoff-active'), 760),
    ]
    timersByHost.set(host, timers)
    return
  }

  setPhase(host, 2)
  const timers = [
    window.setTimeout(() => setPhase(host, 3), 360),
    window.setTimeout(() => setPhase(host, 4), 1080),
    window.setTimeout(() => document.body.classList.add('passport-handoff-active'), 1480),
    window.setTimeout(() => replayOriginalClick(host, button), 1710),
    window.setTimeout(() => document.body.classList.remove('passport-handoff-active'), 2420),
  ]
  timersByHost.set(host, timers)
}

function mount(host) {
  if (mountedHosts.has(host)) return
  const cover = host.querySelector('.passport-cover')
  const button = host.querySelector('.primary-cta')
  if (!cover || !button) return

  mountedHosts.add(host)
  host.classList.add('passport-physical-ready')

  if (!host.querySelector(':scope > .passport-cinematic-world')) {
    host.appendChild(createWorld(host))
  }

  const handler = (event) => beginOpen(host, button, event)
  button.addEventListener('click', handler)
  handlersByHost.set(host, { button, handler })

  requestAnimationFrame(() => {
    syncGeometry(host)
    if (reducedMotion) setPhase(host, 1)
    else {
      setPhase(host, 0)
      const timers = [window.setTimeout(() => setPhase(host, 1), 170)]
      timersByHost.set(host, timers)
    }
  })
}

function unmount(host) {
  clearTimers(host)
  const bound = handlersByHost.get(host)
  if (bound) bound.button.removeEventListener('click', bound.handler)
  handlersByHost.delete(host)
  host.querySelector(':scope > .passport-cinematic-world')?.remove()
  host.classList.remove('passport-physical-ready', 'passport-is-opening')
  host.style.removeProperty('--passport-x')
  host.style.removeProperty('--passport-y')
  host.style.removeProperty('--passport-w')
  host.style.removeProperty('--passport-h')
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

let resizeFrame = 0
function handleResize() {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    for (const host of mountedHosts) syncGeometry(host)
  })
}

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('orientationchange', handleResize, { passive: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
