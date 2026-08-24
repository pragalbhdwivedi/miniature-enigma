// Module 15 — Venue / Wyndham Garden
// Presentation-only enhancement around the existing venue DOM. The approved venue name,
// destination and map URL remain sourced from App/content; this module only adds imagery
// structure, an in-view reveal and one shared accessible full-screen photo viewer.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

const VENUE_IMAGES = [
  {
    src: new URL('../images/destination/wyndham-garden-exterior.webp', import.meta.url).href,
    en: 'Exterior',
    hi: 'बाहरी दृश्य',
    altEn: 'Wyndham Garden exterior',
    altHi: 'Wyndham Garden का बाहरी दृश्य',
  },
  {
    src: new URL('../images/destination/wyndham-garden-glass-hall.webp', import.meta.url).href,
    en: 'Glass Hall',
    hi: 'ग्लास हॉल',
    altEn: 'Wyndham Garden glass hall',
    altHi: 'Wyndham Garden का ग्लास हॉल',
  },
  {
    src: new URL('../images/destination/wyndham-garden-night.webp', import.meta.url).href,
    en: 'Night',
    hi: 'रात्रि दृश्य',
    altEn: 'Wyndham Garden at night',
    altHi: 'रात में Wyndham Garden',
  },
]

const mounted = new Map()
let viewerController = null
let scanQueued = false

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function text(en, hi) {
  return isHindi() ? hi : en
}

function lockPage() {
  const scrollY = window.scrollY || window.pageYOffset || 0
  document.body.dataset.venueScrollY = String(scrollY)
  document.body.classList.add('venue-viewer-open')
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
}

function unlockPage() {
  const scrollY = Number.parseFloat(document.body.dataset.venueScrollY || '0') || 0
  document.body.classList.remove('venue-viewer-open')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  delete document.body.dataset.venueScrollY
  window.scrollTo(0, scrollY)
}

function createViewer() {
  if (viewerController) return viewerController

  const root = document.createElement('div')
  root.className = 'venue-viewer'
  root.setAttribute('aria-hidden', 'true')

  const dialog = document.createElement('div')
  dialog.className = 'venue-viewer__dialog'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', text('Wyndham Garden photography', 'Wyndham Garden की तस्वीरें'))

  const topbar = document.createElement('div')
  topbar.className = 'venue-viewer__topbar'

  const folio = document.createElement('div')
  folio.className = 'venue-viewer__folio'
  folio.textContent = 'WYNDHAM GARDEN · RAMNAGAR'

  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'venue-viewer__close'
  close.setAttribute('aria-label', text('Close venue photo', 'स्थल की तस्वीर बंद करें'))
  close.textContent = '×'
  topbar.append(folio, close)

  const media = document.createElement('div')
  media.className = 'venue-viewer__media'

  const image = document.createElement('img')
  image.className = 'venue-viewer__image'
  image.decoding = 'async'
  image.draggable = false
  media.appendChild(image)

  const footer = document.createElement('div')
  footer.className = 'venue-viewer__footer'

  const prev = document.createElement('button')
  prev.type = 'button'
  prev.className = 'venue-viewer__nav venue-viewer__nav--prev'
  prev.setAttribute('aria-label', text('Previous venue photo', 'पिछली स्थल तस्वीर'))
  prev.textContent = '‹'

  const caption = document.createElement('div')
  caption.className = 'venue-viewer__caption'
  const captionTitle = document.createElement('strong')
  const captionCount = document.createElement('span')
  caption.append(captionTitle, captionCount)

  const next = document.createElement('button')
  next.type = 'button'
  next.className = 'venue-viewer__nav venue-viewer__nav--next'
  next.setAttribute('aria-label', text('Next venue photo', 'अगली स्थल तस्वीर'))
  next.textContent = '›'

  footer.append(prev, caption, next)
  dialog.append(topbar, media, footer)
  root.appendChild(dialog)
  document.body.appendChild(root)

  let index = 0
  let opener = null
  let isOpen = false
  let gesture = null
  let closeTimer = 0

  const render = () => {
    const item = VENUE_IMAGES[index]
    image.src = item.src
    image.alt = isHindi() ? item.altHi : item.altEn
    captionTitle.textContent = isHindi() ? item.hi : item.en
    captionCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(VENUE_IMAGES.length).padStart(2, '0')}`
    dialog.setAttribute('aria-label', text('Wyndham Garden photography', 'Wyndham Garden की तस्वीरें'))
    close.setAttribute('aria-label', text('Close venue photo', 'स्थल की तस्वीर बंद करें'))
    prev.setAttribute('aria-label', text('Previous venue photo', 'पिछली स्थल तस्वीर'))
    next.setAttribute('aria-label', text('Next venue photo', 'अगली स्थल तस्वीर'))
  }

  const setIndex = (nextIndex) => {
    index = (nextIndex + VENUE_IMAGES.length) % VENUE_IMAGES.length
    render()
  }

  const focusables = () => [close, prev, next].filter((node) => !node.disabled)

  const closeViewer = () => {
    if (!isOpen) return
    isOpen = false
    window.clearTimeout(closeTimer)
    root.classList.remove('is-open')
    root.setAttribute('aria-hidden', 'true')
    unlockPage()
    closeTimer = window.setTimeout(() => {
      opener?.focus?.({ preventScroll: true })
      opener = null
    }, reducedMotion ? 0 : 310)
  }

  const openViewer = (nextIndex, source) => {
    window.clearTimeout(closeTimer)
    opener = source instanceof HTMLElement ? source : document.activeElement
    setIndex(nextIndex)
    if (!isOpen) {
      isOpen = true
      lockPage()
      root.setAttribute('aria-hidden', 'false')
      requestAnimationFrame(() => {
        root.classList.add('is-open')
        close.focus({ preventScroll: true })
      })
    }
  }

  const onKeyDown = (event) => {
    if (!isOpen) return

    if (event.key === 'Escape') {
      event.preventDefault()
      closeViewer()
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setIndex(index - 1)
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setIndex(index + 1)
      return
    }
    if (event.key === 'Tab') {
      const nodes = focusables()
      if (!nodes.length) return
      const current = nodes.indexOf(document.activeElement)
      const direction = event.shiftKey ? -1 : 1
      const nextFocus = current < 0
        ? nodes[0]
        : nodes[(current + direction + nodes.length) % nodes.length]
      event.preventDefault()
      nextFocus.focus()
    }
  }

  const onPointerDown = (event) => {
    if (!isOpen || event.pointerType === 'mouse') return
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event) => {
    if (!gesture || gesture.id !== event.pointerId) return
    const dx = event.clientX - gesture.x
    const dy = event.clientY - gesture.y
    gesture = null
    if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy) * 1.15) return
    setIndex(index + (dx < 0 ? 1 : -1))
  }

  close.addEventListener('click', closeViewer)
  prev.addEventListener('click', () => setIndex(index - 1))
  next.addEventListener('click', () => setIndex(index + 1))
  root.addEventListener('click', (event) => {
    if (event.target === root) closeViewer()
  })
  media.addEventListener('pointerdown', onPointerDown, { passive: true })
  media.addEventListener('pointerup', onPointerUp, { passive: true })
  document.addEventListener('keydown', onKeyDown)

  viewerController = {
    open: openViewer,
    close: closeViewer,
    destroy() {
      closeViewer()
      document.removeEventListener('keydown', onKeyDown)
      close.removeEventListener('click', closeViewer)
      media.removeEventListener('pointerdown', onPointerDown)
      media.removeEventListener('pointerup', onPointerUp)
      root.remove()
      viewerController = null
    },
  }

  return viewerController
}

function createHeroTrigger(section, venuePhoto) {
  let trigger = venuePhoto.querySelector(':scope > .venue-photo-trigger')
  if (trigger) return trigger

  trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'venue-photo-trigger'
  trigger.setAttribute('aria-label', text('View Wyndham Garden exterior full screen', 'Wyndham Garden का बाहरी दृश्य पूर्ण स्क्रीन में देखें'))

  const chip = document.createElement('span')
  chip.className = 'venue-photo-trigger__chip'
  const label = document.createElement('span')
  label.textContent = text('View full frame', 'पूरी तस्वीर देखें')
  const icon = document.createElement('i')
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = '↗'
  chip.append(label, icon)
  trigger.appendChild(chip)

  trigger.addEventListener('click', () => createViewer().open(0, trigger))
  venuePhoto.appendChild(trigger)
  return trigger
}

function createDetailGrid(venueCard) {
  let grid = venueCard.querySelector(':scope > .venue-detail-grid')
  if (grid) return grid

  grid = document.createElement('div')
  grid.className = 'venue-detail-grid'

  VENUE_IMAGES.slice(1).forEach((item, offset) => {
    const index = offset + 1
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'venue-detail-frame'
    button.style.setProperty('--venue-detail-image', `url("${item.src.replace(/"/g, '\\"')}")`)
    button.setAttribute('aria-label', `${text('View', 'देखें')} ${isHindi() ? item.hi : item.en}`)

    const label = document.createElement('span')
    label.className = 'venue-detail-frame__label'
    const title = document.createElement('span')
    title.textContent = isHindi() ? item.hi : item.en
    const number = document.createElement('i')
    number.textContent = `0${index + 1}`
    label.append(title, number)
    button.appendChild(label)

    button.addEventListener('click', () => createViewer().open(index, button))
    grid.appendChild(button)
  })

  venueCard.appendChild(grid)
  return grid
}

function mount(section) {
  if (mounted.has(section)) return

  const venuePhoto = section.querySelector(':scope > .venue-photo')
  const venueCard = section.querySelector(':scope > .venue-card')
  if (!venuePhoto || !venueCard) return

  section.classList.add('venue-editorial-ready')
  const heroTrigger = createHeroTrigger(section, venuePhoto)
  const detailGrid = createDetailGrid(venueCard)
  const locationLink = venueCard.querySelector('.text-link')
  locationLink?.classList.add('venue-location-link')

  const observer = new IntersectionObserver(([entry]) => {
    section.classList.toggle('is-venue-visible', entry.isIntersecting)
  }, { threshold: .12, rootMargin: '5% 0px -8% 0px' })
  observer.observe(section)

  if (reducedMotion) section.classList.add('is-venue-visible')

  mounted.set(section, {
    observer,
    destroy() {
      observer.disconnect()
      heroTrigger.remove()
      detailGrid.remove()
      locationLink?.classList.remove('venue-location-link')
      section.classList.remove('venue-editorial-ready', 'is-venue-visible')
    },
  })
}

function unmount(section) {
  mounted.get(section)?.destroy()
  mounted.delete(section)
}

function scan() {
  for (const section of [...mounted.keys()]) {
    if (!section.isConnected || !section.matches('.venue-section')) unmount(section)
  }
  document.querySelectorAll('.venue-section').forEach(mount)
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
