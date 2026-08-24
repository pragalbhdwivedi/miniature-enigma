// Module 13 — Event Photography Interaction
// Reuses the six approved local event images as tactile stacked editorial prints.
// No event copy, dates, times or React/fallback source data are changed here.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

const EVENT_PHOTO_SOURCES = [
  ['mood-botanical', new URL('../images/bride/bride-mehendi.webp', import.meta.url).href],
  ['mood-cinema', new URL('../images/groom/groom-sangeet.webp', import.meta.url).href],
  ['mood-sun', new URL('../images/bride/bride-haldi.webp', import.meta.url).href],
  ['mood-water', new URL('../images/destination/wyndham-garden-pool.webp', import.meta.url).href],
  ['mood-wine', new URL('../images/bride/bride-jaimal.webp', import.meta.url).href],
  ['mood-stars', new URL('../images/groom/groom-pheras.webp', import.meta.url).href],
  ['event-card--constellation', new URL('../images/groom/groom-pheras.webp', import.meta.url).href],
]

const mountedCards = new Map()
let openedController = null
let scanQueued = false

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function sourceFor(card) {
  for (const [className, source] of EVENT_PHOTO_SOURCES) {
    if (card.classList.contains(className)) return source
  }
  return null
}

function createDeck(card, index) {
  const source = sourceFor(card)
  if (!source) return null

  const title = card.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim() || `Event ${index + 1}`

  const deck = document.createElement('div')
  deck.className = 'event-photo-deck'
  deck.style.setProperty('--event-photo-source', `url("${source.replace(/"/g, '\\"')}")`)

  const back = document.createElement('div')
  back.className = 'event-photo-sheet event-photo-sheet--back'
  back.setAttribute('aria-hidden', 'true')

  const front = document.createElement('button')
  front.type = 'button'
  front.className = 'event-photo-sheet event-photo-sheet--front'
  front.setAttribute('aria-label', `Photo / तस्वीर · ${title}`)
  front.setAttribute('aria-pressed', 'false')

  const grip = document.createElement('span')
  grip.className = 'event-photo-grip'
  grip.setAttribute('aria-hidden', 'true')
  grip.textContent = '↔'
  front.appendChild(grip)

  const counter = document.createElement('div')
  counter.className = 'event-photo-counter'
  counter.setAttribute('aria-hidden', 'true')
  counter.textContent = '01 / 02'

  deck.append(back, front, counter)
  card.appendChild(deck)

  return { deck, front, counter }
}

function bindInteraction(card, deck, front, counter, index) {
  let isOpen = false
  let gesture = null
  let suppressClick = false
  let frame = 0
  let pendingTransform = null
  const defaultDirection = index % 2 === 0 ? -1 : 1

  const paint = () => {
    frame = 0
    if (!pendingTransform) return
    deck.style.setProperty('--photo-drag-x', `${pendingTransform.x.toFixed(2)}px`)
    deck.style.setProperty('--photo-drag-y', `${pendingTransform.y.toFixed(2)}px`)
    deck.style.setProperty('--photo-rotate', `${pendingTransform.rotate.toFixed(2)}deg`)
    pendingTransform = null
  }

  const requestPaint = (x, y, rotate) => {
    pendingTransform = { x, y, rotate }
    if (!frame) frame = requestAnimationFrame(paint)
  }

  const resetDrag = () => {
    pendingTransform = null
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    deck.style.setProperty('--photo-drag-x', '0px')
    deck.style.setProperty('--photo-drag-y', '0px')
    deck.style.setProperty('--photo-rotate', '0deg')
    deck.classList.remove('is-photo-dragging')
  }

  const setOpen = (next, direction = defaultDirection) => {
    if (reducedMotion) return

    if (next && openedController && openedController !== controller) {
      openedController.close()
    }

    isOpen = next
    deck.classList.toggle('is-photo-peek-open', isOpen)
    front.setAttribute('aria-pressed', String(isOpen))
    counter.textContent = isOpen ? '02 / 02' : '01 / 02'

    if (isOpen) {
      const resolvedDirection = direction < 0 ? -1 : 1
      deck.style.setProperty('--photo-open-x', `${resolvedDirection * 42}px`)
      deck.style.setProperty('--photo-open-rotate', `${resolvedDirection * 5}deg`)
      openedController = controller
    } else if (openedController === controller) {
      openedController = null
    }
  }

  const finishGesture = (event, cancelled = false) => {
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const { dragging, dx, max, verticalCancelled } = gesture

    if (dragging) {
      try {
        if (front.hasPointerCapture(event.pointerId)) front.releasePointerCapture(event.pointerId)
      } catch {
        // Pointer capture support differs slightly across older Mobile Safari builds.
      }

      const shouldOpen = !cancelled && Math.abs(dx) >= max * .55
      const direction = dx < 0 ? -1 : 1
      suppressClick = true
      resetDrag()
      setOpen(shouldOpen, direction)
      window.setTimeout(() => { suppressClick = false }, 0)
    } else if (verticalCancelled || cancelled) {
      suppressClick = true
      window.setTimeout(() => { suppressClick = false }, 0)
    }

    gesture = null
  }

  const onPointerDown = (event) => {
    if (reducedMotion) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    if (isOpen) setOpen(false)

    const max = Math.min(58, Math.max(36, card.clientWidth * .145))
    gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      max,
      dragging: false,
      verticalCancelled: false,
    }
  }

  const onPointerMove = (event) => {
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.verticalCancelled) return

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    gesture.dx = dx
    gesture.dy = dy

    if (!gesture.dragging) {
      if (Math.hypot(dx, dy) < 6) return
      if (Math.abs(dy) > Math.abs(dx) + 3) {
        gesture.verticalCancelled = true
        return
      }

      gesture.dragging = true
      deck.classList.add('is-photo-dragging')
      try { front.setPointerCapture(event.pointerId) } catch { /* optional enhancement */ }
    }

    event.preventDefault()
    const x = clamp(dx, -gesture.max, gesture.max)
    const y = clamp(dy * .16, -7, 7)
    const rotate = (x / gesture.max) * 4.2
    requestPaint(x, y, rotate)
  }

  const onPointerUp = (event) => finishGesture(event, false)
  const onPointerCancel = (event) => finishGesture(event, true)

  const onClick = (event) => {
    if (reducedMotion) return
    if (suppressClick) {
      event.preventDefault()
      return
    }
    setOpen(!isOpen, defaultDirection)
  }

  const onKeyDown = (event) => {
    if (reducedMotion) return

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setOpen(true, -1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      setOpen(true, 1)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const onBlurWindow = () => {
    if (!gesture) return
    resetDrag()
    gesture = null
  }

  front.addEventListener('pointerdown', onPointerDown)
  front.addEventListener('pointermove', onPointerMove)
  front.addEventListener('pointerup', onPointerUp)
  front.addEventListener('pointercancel', onPointerCancel)
  front.addEventListener('click', onClick)
  front.addEventListener('keydown', onKeyDown)
  window.addEventListener('blur', onBlurWindow)

  if (reducedMotion) {
    front.disabled = true
    front.tabIndex = -1
    front.setAttribute('aria-hidden', 'true')
  }

  const controller = {
    close: () => setOpen(false),
    updateFocusability: () => {
      if (reducedMotion) return
      front.tabIndex = card.classList.contains('is-event-active') ? 0 : -1
    },
    destroy: () => {
      if (frame) cancelAnimationFrame(frame)
      front.removeEventListener('pointerdown', onPointerDown)
      front.removeEventListener('pointermove', onPointerMove)
      front.removeEventListener('pointerup', onPointerUp)
      front.removeEventListener('pointercancel', onPointerCancel)
      front.removeEventListener('click', onClick)
      front.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('blur', onBlurWindow)
      if (openedController === controller) openedController = null
    },
  }

  controller.updateFocusability()
  return controller
}

function mountCard(card, index) {
  if (mountedCards.has(card)) {
    mountedCards.get(card)?.updateFocusability()
    return
  }

  const created = createDeck(card, index)
  if (!created) return

  card.classList.add('event-photo-ready')
  const controller = bindInteraction(card, created.deck, created.front, created.counter, index)
  mountedCards.set(card, controller)
}

function unmountCard(card) {
  mountedCards.get(card)?.destroy()
  mountedCards.delete(card)
}

function scan() {
  for (const card of [...mountedCards.keys()]) {
    if (!card.isConnected || !card.matches('.event-card')) unmountCard(card)
  }

  document.querySelectorAll('.event-stack > .event-card').forEach((card, index) => {
    mountCard(card, index)
    mountedCards.get(card)?.updateFocusability()
  })
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
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
