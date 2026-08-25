// Module 18 — Wedding Gallery
// Native mobile-first depth carousel with automatic slideshow behavior and a 5-second
// full-screen enlargement. Final WebP images can be dropped into /public/gallery using
// gallery-01.webp ... gallery-20.webp without editing React or this module.

const MAX_GALLERY_IMAGES = 20
const AUTO_ADVANCE_MS = 6500
const LIGHTBOX_MS = 5000
const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

const mounted = new Map()
const pending = new WeakSet()
let scanQueued = false

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function copy(en, hi) {
  return isHindi() ? hi : en
}

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

function extractBackgroundUrl(value) {
  if (!value || value === 'none') return null
  const match = value.match(/url\(["']?(.*?)["']?\)/)
  return match?.[1] || null
}

function fallbackImages(section) {
  const grid = section.querySelector('.gallery-grid')
  if (!grid) return []
  return [...grid.querySelectorAll('.gallery-photo')]
    .map((node) => extractBackgroundUrl(getComputedStyle(node).backgroundImage))
    .filter(Boolean)
}

async function resourceExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    return response.ok
  } catch {
    return false
  }
}

function galleryRoots() {
  const roots = [
    new URL('./gallery/', document.baseURI).href,
    new URL('./public/gallery/', document.baseURI).href,
  ]
  return [...new Set(roots)]
}

async function discoverUploadedImages() {
  for (const root of galleryRoots()) {
    const first = `${root}gallery-01.webp`
    if (!(await resourceExists(first))) continue

    const images = [first]
    for (let index = 2; index <= MAX_GALLERY_IMAGES; index += 1) {
      const name = `gallery-${String(index).padStart(2, '0')}.webp`
      const url = `${root}${name}`
      if (!(await resourceExists(url))) break
      images.push(url)
    }
    return images
  }
  return []
}

function lockPage() {
  const scrollY = window.scrollY || window.pageYOffset || 0
  document.body.dataset.galleryScrollY = String(scrollY)
  document.body.classList.add('gallery-lightbox-open')
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  return scrollY
}

function unlockPage() {
  const scrollY = Number.parseFloat(document.body.dataset.galleryScrollY || '0') || 0
  document.body.classList.remove('gallery-lightbox-open')
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  delete document.body.dataset.galleryScrollY
  window.scrollTo(0, scrollY)
}

function createLightbox(images, onStateChange) {
  const root = element('div', 'wedding-gallery-lightbox')
  root.setAttribute('aria-hidden', 'true')

  const dialog = element('div', 'wedding-gallery-lightbox__dialog')
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-label', copy('Enlarged wedding photograph', 'बड़ी विवाह तस्वीर'))

  const topbar = element('div', 'wedding-gallery-lightbox__topbar')
  const folio = element('span', 'wedding-gallery-lightbox__folio', 'THE CORBETT WEDDING · GALLERY')
  const close = element('button', 'wedding-gallery-lightbox__close', '×')
  close.type = 'button'
  close.setAttribute('aria-label', copy('Close enlarged photo', 'बड़ी तस्वीर बंद करें'))
  topbar.append(folio, close)

  const stage = element('div', 'wedding-gallery-lightbox__stage')
  const image = element('img', 'wedding-gallery-lightbox__image')
  image.decoding = 'async'
  image.draggable = false
  stage.appendChild(image)

  const footer = element('div', 'wedding-gallery-lightbox__footer')
  const count = element('strong', 'wedding-gallery-lightbox__count')
  const autoReturn = element('span', 'wedding-gallery-lightbox__return')
  footer.append(count, autoReturn)

  const progress = element('div', 'wedding-gallery-lightbox__progress')
  const progressBar = element('span', '')
  progress.appendChild(progressBar)

  dialog.append(topbar, stage, footer, progress)
  root.appendChild(dialog)
  document.body.appendChild(root)

  let isOpen = false
  let opener = null
  let closeTimer = 0
  let countdownTimer = 0
  let closeTransitionTimer = 0
  let openedAt = 0
  let activeIndex = 0

  const updateCountdown = () => {
    if (!isOpen) return
    const elapsed = performance.now() - openedAt
    const seconds = Math.max(0, Math.ceil((LIGHTBOX_MS - elapsed) / 1000))
    autoReturn.textContent = copy(`AUTO RETURN · ${seconds}s`, `स्वतः वापसी · ${seconds}s`)
  }

  const clearTimers = () => {
    window.clearTimeout(closeTimer)
    window.clearTimeout(closeTransitionTimer)
    window.clearInterval(countdownTimer)
  }

  const closeLightbox = () => {
    if (!isOpen) return
    isOpen = false
    clearTimers()
    root.classList.remove('is-open')
    progressBar.classList.remove('is-running')
    unlockPage()
    const returnTarget = opener
    opener = null
    returnTarget?.focus?.({ preventScroll: true })
    onStateChange?.(false)
    closeTransitionTimer = window.setTimeout(() => {
      if (!isOpen) root.setAttribute('aria-hidden', 'true')
    }, reducedMotion ? 0 : 280)
  }

  const openLightbox = (index, source) => {
    activeIndex = Math.max(0, Math.min(images.length - 1, index))
    opener = source instanceof HTMLElement ? source : document.activeElement
    clearTimers()
    image.src = images[activeIndex]
    image.alt = copy(`Wedding photograph ${activeIndex + 1} of ${images.length}`, `विवाह तस्वीर ${activeIndex + 1} / ${images.length}`)
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`
    openedAt = performance.now()
    updateCountdown()

    if (!isOpen) {
      isOpen = true
      lockPage()
      root.setAttribute('aria-hidden', 'false')
      onStateChange?.(true)
      requestAnimationFrame(() => {
        root.classList.add('is-open')
        close.focus({ preventScroll: true })
        progressBar.classList.remove('is-running')
        void progressBar.offsetWidth
        if (!reducedMotion) progressBar.classList.add('is-running')
      })
    }

    countdownTimer = window.setInterval(updateCountdown, 250)
    closeTimer = window.setTimeout(closeLightbox, LIGHTBOX_MS)
  }

  const onKeyDown = (event) => {
    if (!isOpen) return
    if (event.key === 'Escape') {
      event.preventDefault()
      closeLightbox()
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      close.focus()
    }
  }

  close.addEventListener('click', closeLightbox)
  root.addEventListener('click', (event) => {
    if (event.target === root) closeLightbox()
  })
  document.addEventListener('keydown', onKeyDown)

  return {
    open: openLightbox,
    close: closeLightbox,
    isOpen: () => isOpen,
    destroy() {
      clearTimers()
      if (isOpen) closeLightbox()
      close.removeEventListener('click', closeLightbox)
      document.removeEventListener('keydown', onKeyDown)
      root.remove()
    },
  }
}

function createCarousel(section, images) {
  const shell = element('div', 'wedding-gallery-shell')
  shell.setAttribute('data-gallery-count', String(images.length))

  const meta = element('div', 'wedding-gallery-meta')
  const metaLeft = element('div', 'wedding-gallery-meta__left')
  metaLeft.append(
    element('span', 'wedding-gallery-meta__kicker', copy('SWIPE · TAP · ENLARGE', 'स्वाइप · टैप · बड़ा करें')),
    element('strong', 'wedding-gallery-meta__title', copy('A few frames from us.', 'हमारी कुछ तस्वीरें।')),
  )
  const counter = element('div', 'wedding-gallery-counter')
  const current = element('strong', '', '01')
  const total = element('span', '', `/ ${String(images.length).padStart(2, '0')}`)
  counter.append(current, total)
  meta.append(metaLeft, counter)

  const viewport = element('div', 'wedding-gallery-viewport')
  viewport.tabIndex = 0
  viewport.setAttribute('role', 'region')
  viewport.setAttribute('aria-roledescription', 'carousel')
  viewport.setAttribute('aria-label', copy('Wedding photo gallery', 'विवाह फोटो गैलरी'))

  const track = element('div', 'wedding-gallery-track')
  const slides = images.map((src, index) => {
    const slide = element('button', 'wedding-gallery-slide')
    slide.type = 'button'
    slide.dataset.index = String(index)
    slide.setAttribute('aria-label', copy(
      `Enlarge wedding photograph ${index + 1} of ${images.length} for five seconds`,
      `विवाह तस्वीर ${index + 1} / ${images.length} पाँच सेकंड के लिए बड़ी करें`,
    ))

    const frame = element('span', 'wedding-gallery-slide__frame')
    const image = element('img', 'wedding-gallery-slide__image')
    image.src = src
    image.alt = copy(`Wedding photograph ${index + 1}`, `विवाह तस्वीर ${index + 1}`)
    image.decoding = 'async'
    image.loading = index < 2 ? 'eager' : 'lazy'
    image.fetchPriority = index === 0 ? 'high' : 'auto'
    image.draggable = false

    const number = element('span', 'wedding-gallery-slide__number', String(index + 1).padStart(2, '0'))
    const hint = element('span', 'wedding-gallery-slide__hint', copy('TAP TO ENLARGE · 5 SEC', 'बड़ा देखें · 5 सेकंड'))
    frame.append(image, number, hint)
    slide.appendChild(frame)
    track.appendChild(slide)
    return slide
  })

  viewport.appendChild(track)

  const controls = element('div', 'wedding-gallery-controls')
  const prev = element('button', 'wedding-gallery-control wedding-gallery-control--prev', '‹')
  const next = element('button', 'wedding-gallery-control wedding-gallery-control--next', '›')
  prev.type = 'button'
  next.type = 'button'
  prev.setAttribute('aria-label', copy('Previous gallery image', 'पिछली गैलरी तस्वीर'))
  next.setAttribute('aria-label', copy('Next gallery image', 'अगली गैलरी तस्वीर'))

  const rail = element('div', 'wedding-gallery-rail')
  const railFill = element('span', '')
  rail.appendChild(railFill)
  controls.append(prev, rail, next)

  shell.append(meta, viewport, controls)

  let activeIndex = 0
  let frame = 0
  let autoplayTimer = 0
  let sectionVisible = false
  let modalOpen = false
  let dragged = false
  let pointerStart = null

  const lightbox = createLightbox(images, (open) => {
    modalOpen = open
    if (open) window.clearTimeout(autoplayTimer)
    else scheduleAutoplay()
  })

  const scrollTargetFor = (index) => {
    const slide = slides[index]
    if (!slide) return 0
    return slide.offsetLeft - ((viewport.clientWidth - slide.clientWidth) / 2)
  }

  const scrollToIndex = (index, behavior = reducedMotion ? 'auto' : 'smooth') => {
    if (!slides.length) return
    const nextIndex = (index + slides.length) % slides.length
    viewport.scrollTo({ left: scrollTargetFor(nextIndex), behavior })
  }

  const updatePresentation = () => {
    frame = 0
    const viewCenter = viewport.scrollLeft + viewport.clientWidth / 2
    let closest = 0
    let closestDistance = Number.POSITIVE_INFINITY

    slides.forEach((slide, index) => {
      const center = slide.offsetLeft + slide.clientWidth / 2
      const normalized = Math.min(Math.abs(center - viewCenter) / Math.max(viewport.clientWidth * .72, 1), 1)
      if (Math.abs(center - viewCenter) < closestDistance) {
        closestDistance = Math.abs(center - viewCenter)
        closest = index
      }
      slide.style.setProperty('--gallery-scale', (1 - normalized * .085).toFixed(4))
      slide.style.setProperty('--gallery-y', `${(normalized * 13).toFixed(2)}px`)
      slide.style.setProperty('--gallery-opacity', (1 - normalized * .34).toFixed(3))
      slide.style.setProperty('--gallery-rotate', `${((index < activeIndex ? -1 : 1) * normalized * 1.2).toFixed(3)}deg`)
    })

    if (closest !== activeIndex) {
      activeIndex = closest
      current.textContent = String(activeIndex + 1).padStart(2, '0')
      railFill.style.width = `${((activeIndex + 1) / slides.length) * 100}%`
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === activeIndex)
        if (index === activeIndex) slide.setAttribute('aria-current', 'true')
        else slide.removeAttribute('aria-current')
      })
    }
  }

  const requestUpdate = () => {
    if (frame) return
    frame = requestAnimationFrame(updatePresentation)
  }

  const scheduleAutoplay = () => {
    window.clearTimeout(autoplayTimer)
    if (reducedMotion || !sectionVisible || modalOpen || document.hidden || slides.length < 2) return
    autoplayTimer = window.setTimeout(() => scrollToIndex(activeIndex + 1), AUTO_ADVANCE_MS)
  }

  const onScroll = () => {
    requestUpdate()
    scheduleAutoplay()
  }

  const onPointerDown = (event) => {
    pointerStart = { x: event.clientX, y: event.clientY }
    dragged = false
    window.clearTimeout(autoplayTimer)
  }

  const onPointerMove = (event) => {
    if (!pointerStart) return
    const dx = Math.abs(event.clientX - pointerStart.x)
    const dy = Math.abs(event.clientY - pointerStart.y)
    if (dx > 7 || dy > 7) dragged = true
  }

  const onPointerEnd = () => {
    pointerStart = null
    window.setTimeout(() => { dragged = false }, 0)
    scheduleAutoplay()
  }

  slides.forEach((slide, index) => {
    slide.addEventListener('click', (event) => {
      if (dragged) {
        event.preventDefault()
        return
      }
      lightbox.open(index, slide)
    })
  })

  prev.addEventListener('click', () => {
    scrollToIndex(activeIndex - 1)
    scheduleAutoplay()
  })
  next.addEventListener('click', () => {
    scrollToIndex(activeIndex + 1)
    scheduleAutoplay()
  })

  viewport.addEventListener('scroll', onScroll, { passive: true })
  viewport.addEventListener('pointerdown', onPointerDown, { passive: true })
  viewport.addEventListener('pointermove', onPointerMove, { passive: true })
  viewport.addEventListener('pointerup', onPointerEnd, { passive: true })
  viewport.addEventListener('pointercancel', onPointerEnd, { passive: true })
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollToIndex(activeIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollToIndex(activeIndex + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      scrollToIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      scrollToIndex(slides.length - 1)
    }
  })

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    sectionVisible = entry.isIntersecting && entry.intersectionRatio >= .2
    if (sectionVisible) scheduleAutoplay()
    else window.clearTimeout(autoplayTimer)
  }, { threshold: [0, .2, .55] })
  visibilityObserver.observe(section)

  const onVisibilityChange = () => scheduleAutoplay()
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', requestUpdate, { passive: true })
  window.addEventListener('orientationchange', requestUpdate, { passive: true })

  requestAnimationFrame(() => {
    scrollToIndex(0, 'auto')
    updatePresentation()
    railFill.style.width = `${100 / slides.length}%`
  })

  return {
    shell,
    destroy() {
      window.clearTimeout(autoplayTimer)
      if (frame) cancelAnimationFrame(frame)
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('orientationchange', requestUpdate)
      viewport.removeEventListener('scroll', onScroll)
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', onPointerEnd)
      viewport.removeEventListener('pointercancel', onPointerEnd)
      lightbox.destroy()
      shell.remove()
    },
  }
}

async function mount(section) {
  if (mounted.has(section) || pending.has(section)) return
  pending.add(section)

  const fallback = fallbackImages(section)
  let images = fallback
  if (!images.length) {
    const uploaded = await discoverUploadedImages()
    images = uploaded
  }

  pending.delete(section)
  if (!section.isConnected || mounted.has(section) || !images.length) return

  const controller = createCarousel(section, images.slice(0, MAX_GALLERY_IMAGES))
  const grid = section.querySelector('.gallery-grid')
  const heading = section.querySelector('h2')
  const placeholder = section.querySelector(':scope > .placeholder-note')

  if (heading) heading.insertAdjacentElement('afterend', controller.shell)
  else section.appendChild(controller.shell)

  section.classList.add('wedding-gallery-ready')
  grid?.setAttribute('aria-hidden', 'true')
  placeholder?.setAttribute('aria-hidden', 'true')

  mounted.set(section, {
    destroy() {
      controller.destroy()
      section.classList.remove('wedding-gallery-ready')
      grid?.removeAttribute('aria-hidden')
      placeholder?.removeAttribute('aria-hidden')
      mounted.delete(section)
    },
  })
}

function unmount(section) {
  mounted.get(section)?.destroy()
}

function scan() {
  for (const section of [...mounted.keys()]) {
    if (!section.isConnected || !section.matches('.gallery-section')) unmount(section)
  }
  document.querySelectorAll('.gallery-section').forEach((section) => mount(section))
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
