// Module 17 follow-up — compact Transport summary + Learn More modal.
// This enhancement moves the existing detailed transport nodes into one accessible modal
// so the main logistics page stays concise without duplicating transport data.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mounted = new WeakMap()
let scanQueued = false

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function copy(en, hi) {
  return isHindi() ? hi : en
}

function lockPage() {
  const scrollY = window.scrollY || window.pageYOffset || 0
  document.body.dataset.transportScrollY = String(scrollY)
  document.body.classList.add('transport-modal-open')
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
}

function unlockPage() {
  const scrollY = Number.parseFloat(document.body.dataset.transportScrollY || '0') || 0
  document.body.classList.remove('transport-modal-open')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  delete document.body.dataset.transportScrollY
  window.scrollTo(0, scrollY)
}

function createElement(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

function mount(panel) {
  if (mounted.has(panel)) return

  const lead = panel.querySelector(':scope > .transport-lead')
  const grid = panel.querySelector(':scope > .transport-grid')
  const actions = panel.querySelector(':scope > .transport-actions')
  if (!lead || !grid || !actions) return

  panel.classList.add('transport-summary-ready')

  const teaser = createElement('div', 'transport-teaser')
  const teaserCopy = createElement('div', 'transport-teaser__copy')
  teaserCopy.append(
    createElement('p', 'logistics-kicker', copy('GUEST TRANSFERS', 'अतिथि ट्रांसफर')),
    createElement('h3', '', copy('Pickup · Drop · Assistance', 'पिकअप · ड्रॉप · सहायता')),
    createElement('p', '', copy(
      'Transfer details will be coordinated after RSVP and travel information are received.',
      'RSVP और यात्रा जानकारी मिलने के बाद ट्रांसफर विवरण समन्वित किए जाएंगे।',
    )),
  )

  const learnMore = createElement('button', 'transport-learn-more', copy('LEARN MORE', 'अधिक जानकारी'))
  learnMore.type = 'button'
  learnMore.setAttribute('aria-haspopup', 'dialog')
  teaser.append(teaserCopy, learnMore)

  const modal = createElement('div', 'transport-modal')
  modal.setAttribute('aria-hidden', 'true')

  const dialog = createElement('div', 'transport-modal__dialog')
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', copy('Transport details', 'परिवहन विवरण'))

  const topbar = createElement('div', 'transport-modal__topbar')
  topbar.append(
    createElement('div', 'transport-modal__folio', copy('TRANSPORT · FIELD NOTES', 'परिवहन · जानकारी')),
  )

  const close = createElement('button', 'transport-modal__close', '×')
  close.type = 'button'
  close.setAttribute('aria-label', copy('Close transport details', 'परिवहन विवरण बंद करें'))
  topbar.appendChild(close)

  const scroll = createElement('div', 'transport-modal__scroll')
  const heading = createElement('header', 'transport-modal__header')
  heading.append(
    createElement('p', 'logistics-kicker', copy('AFTER RSVP', 'RSVP के बाद')),
    createElement('h2', '', copy('Your transfer plan, in one place.', 'आपकी ट्रांसफर योजना, एक जगह।')),
    createElement('p', '', copy(
      'Final pickup points, vehicle allocation and drop schedules remain guest-specific and will be shared after RSVP confirmation.',
      'अंतिम पिकअप स्थान, वाहन आवंटन और ड्रॉप समय अतिथि-विशिष्ट हैं और RSVP पुष्टि के बाद साझा किए जाएंगे।',
    )),
  )

  // Move the existing detailed nodes instead of cloning them. This preserves their links,
  // RSVP button handlers and single source of transport truth.
  scroll.append(heading, lead, grid, actions)
  dialog.append(topbar, scroll)
  modal.appendChild(dialog)
  panel.append(teaser, modal)

  let isOpen = false
  let opener = null
  let closeTimer = 0

  const focusables = () => [...dialog.querySelectorAll('button:not([disabled]), a[href]')]

  const open = () => {
    if (isOpen) return
    isOpen = true
    opener = document.activeElement
    window.clearTimeout(closeTimer)
    lockPage()
    modal.setAttribute('aria-hidden', 'false')
    requestAnimationFrame(() => {
      modal.classList.add('is-open')
      close.focus({ preventScroll: true })
    })
  }

  const closeModal = () => {
    if (!isOpen) return
    isOpen = false
    window.clearTimeout(closeTimer)
    const returnTarget = opener
    opener = null
    modal.classList.remove('is-open')
    unlockPage()
    returnTarget?.focus?.({ preventScroll: true })
    closeTimer = window.setTimeout(() => {
      if (!isOpen) modal.setAttribute('aria-hidden', 'true')
    }, reducedMotion ? 0 : 260)
  }

  const onKeyDown = (event) => {
    if (!isOpen) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeModal()
      return
    }
    if (event.key !== 'Tab') return
    const nodes = focusables()
    if (!nodes.length) return
    const current = nodes.indexOf(document.activeElement)
    const direction = event.shiftKey ? -1 : 1
    const next = current < 0 ? nodes[0] : nodes[(current + direction + nodes.length) % nodes.length]
    event.preventDefault()
    next.focus()
  }

  learnMore.addEventListener('click', open)
  close.addEventListener('click', closeModal)
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal()
  })
  document.addEventListener('keydown', onKeyDown)

  mounted.set(panel, {
    destroy() {
      if (isOpen) closeModal()
      document.removeEventListener('keydown', onKeyDown)
      learnMore.removeEventListener('click', open)
      close.removeEventListener('click', closeModal)
      // Restore transport nodes if this enhancement is torn down while the logistics shell survives.
      if (panel.isConnected) panel.prepend(lead)
      if (panel.isConnected) panel.append(grid, actions)
      teaser.remove()
      modal.remove()
      panel.classList.remove('transport-summary-ready')
      mounted.delete(panel)
    },
  })
}

function scan() {
  document.querySelectorAll('.logistics-panel--transport').forEach(mount)
}

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
