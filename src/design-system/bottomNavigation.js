// Module 19 — Bottom Navigation + Scroll Progress
// Enhances the existing five locked nav buttons in-place. React remains responsible for
// navigation clicks; this module only tracks location, moves the active pill and reports
// global page progress.

const TARGET_IDS = ['home', 'events', 'stay', 'travel', 'rsvp']
const mounted = new Map()
let scanQueued = false

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function currentTargets() {
  return TARGET_IDS.map((id) => document.getElementById(id))
}

function mount(nav) {
  if (mounted.has(nav)) return

  const buttons = [...nav.querySelectorAll(':scope > button')].slice(0, TARGET_IDS.length)
  if (buttons.length !== TARGET_IDS.length) return

  nav.classList.add('nav-system-ready')

  const pill = document.createElement('span')
  pill.className = 'bottom-nav__pill'
  pill.setAttribute('aria-hidden', 'true')

  const progress = document.createElement('span')
  progress.className = 'bottom-nav__progress'
  progress.setAttribute('aria-hidden', 'true')
  const progressFill = document.createElement('span')
  progress.appendChild(progressFill)

  nav.append(pill, progress)

  buttons.forEach((button, index) => {
    button.dataset.navTarget = TARGET_IDS[index]
  })

  let activeIndex = -1
  let frame = 0
  let resizeFrame = 0

  const setActive = (index, force = false) => {
    const safeIndex = Math.max(0, Math.min(buttons.length - 1, index))
    if (!force && safeIndex === activeIndex) return
    activeIndex = safeIndex

    buttons.forEach((button, buttonIndex) => {
      if (buttonIndex === safeIndex) button.setAttribute('aria-current', 'location')
      else button.removeAttribute('aria-current')
    })

    const button = buttons[safeIndex]
    nav.style.setProperty('--nav-pill-x', `${button.offsetLeft}px`)
    nav.style.setProperty('--nav-pill-w', `${button.offsetWidth}px`)
  }

  const chooseActive = () => {
    const targets = currentTargets()
    const viewportAnchor = Math.max(window.innerHeight || 0, 1) * .46
    let candidate = 0

    targets.forEach((target, index) => {
      if (!target) return
      const rect = target.getBoundingClientRect()
      if (rect.top <= viewportAnchor) candidate = index
    })

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    if (window.scrollY >= maxScroll - 10) candidate = TARGET_IDS.length - 1
    return candidate
  }

  const paint = () => {
    frame = 0
    if (!nav.isConnected) return

    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    const progressValue = clamp(window.scrollY / maxScroll)
    nav.style.setProperty('--nav-progress', progressValue.toFixed(4))
    setActive(chooseActive())
  }

  const requestPaint = () => {
    if (frame) return
    frame = requestAnimationFrame(paint)
  }

  const updateGeometry = () => {
    resizeFrame = 0
    if (activeIndex < 0) setActive(chooseActive(), true)
    else setActive(activeIndex, true)
    requestPaint()
  }

  const requestGeometry = () => {
    if (resizeFrame) return
    resizeFrame = requestAnimationFrame(updateGeometry)
  }

  const clickHandlers = buttons.map((button, index) => {
    const handler = () => setActive(index)
    button.addEventListener('click', handler)
    return handler
  })

  const resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(requestGeometry)
    : null
  resizeObserver?.observe(nav)

  window.addEventListener('scroll', requestPaint, { passive: true })
  window.addEventListener('resize', requestGeometry, { passive: true })
  window.addEventListener('orientationchange', requestGeometry, { passive: true })

  mounted.set(nav, {
    destroy() {
      if (frame) cancelAnimationFrame(frame)
      if (resizeFrame) cancelAnimationFrame(resizeFrame)
      resizeObserver?.disconnect()
      window.removeEventListener('scroll', requestPaint)
      window.removeEventListener('resize', requestGeometry)
      window.removeEventListener('orientationchange', requestGeometry)
      buttons.forEach((button, index) => {
        button.removeEventListener('click', clickHandlers[index])
        button.removeAttribute('aria-current')
        delete button.dataset.navTarget
      })
      pill.remove()
      progress.remove()
      nav.classList.remove('nav-system-ready')
      nav.style.removeProperty('--nav-pill-x')
      nav.style.removeProperty('--nav-pill-w')
      nav.style.removeProperty('--nav-progress')
    },
  })

  updateGeometry()
}

function unmount(nav) {
  mounted.get(nav)?.destroy()
  mounted.delete(nav)
}

function scan() {
  for (const nav of [...mounted.keys()]) {
    if (!nav.isConnected || !nav.matches('.bottom-nav')) unmount(nav)
  }
  document.querySelectorAll('.bottom-nav').forEach(mount)
}

const mutationObserver = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
