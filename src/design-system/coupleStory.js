// Module 09 — Couple Story
// Presentation-only enhancement. It preserves the story title/body/hashtag already
// rendered by React or the raw fallback and never invents biographical copy.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mountedSections = new Set()
const visibilityObservers = new WeakMap()
const activeSections = new Set()

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
}

function splitSentences(value = '') {
  const matches = String(value).trim().match(/[^.!?।]+[.!?।]?/g)
  return (matches || [value]).map((part) => part.trim()).filter(Boolean)
}

function createMedia() {
  const media = document.createElement('div')
  media.className = 'story-editorial-media'
  media.setAttribute('aria-hidden', 'true')
  media.innerHTML = `
    <div class="story-editorial-media__plate">
      <div class="story-editorial-media__photo"></div>
    </div>
    <div class="story-editorial-media__index">01 / 01</div>
    <div class="story-editorial-media__crop"></div>
  `
  return media
}

function createFoot() {
  const foot = document.createElement('div')
  foot.className = 'story-editorial-foot'
  foot.setAttribute('aria-hidden', 'true')
  foot.innerHTML = '<span>K &amp; A · 2026</span>'
  return foot
}

function decorateTitle(title) {
  if (!title || title.querySelector('.story-title-mask')) return
  const value = title.textContent?.trim()
  if (!value) return
  title.textContent = ''
  const mask = document.createElement('span')
  mask.className = 'story-title-mask'
  const inner = document.createElement('span')
  inner.textContent = value
  mask.appendChild(inner)
  title.appendChild(mask)
}

function decorateCopy(paragraph) {
  if (!paragraph || paragraph.querySelector('.story-copy-line')) return
  const value = paragraph.textContent?.trim()
  if (!value) return

  paragraph.textContent = ''
  splitSentences(value).forEach((sentence) => {
    const line = document.createElement('span')
    line.className = 'story-copy-line'
    line.textContent = sentence
    paragraph.appendChild(line)
  })
}

function observeVisibility(section) {
  if (reducedMotion || visibilityObservers.has(section)) {
    section.classList.add('story-is-visible')
    return
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target !== section) continue
      if (entry.isIntersecting) {
        activeSections.add(section)
        section.classList.add('story-is-visible')
      } else {
        activeSections.delete(section)
      }
    }
  }, { threshold: .16, rootMargin: '0px 0px -8% 0px' })

  observer.observe(section)
  visibilityObservers.set(section, observer)
}

function mount(section) {
  if (mountedSections.has(section)) return
  const layout = section.querySelector('.story-layout')
  const title = layout?.querySelector('h2')
  const paragraph = layout?.querySelector(':scope > p')
  const hashtag = layout?.querySelector('blockquote')
  if (!layout || !title || !paragraph || !hashtag) return

  mountedSections.add(section)
  section.classList.add('story-editorial-ready')
  section.dataset.storyEnhanced = 'true'

  if (!section.querySelector(':scope > .story-editorial-media')) {
    const sectionNumber = section.querySelector(':scope > .section-number')
    const media = createMedia()
    if (sectionNumber?.nextSibling) section.insertBefore(media, sectionNumber.nextSibling)
    else section.insertBefore(media, layout)
  }

  if (!section.querySelector(':scope > .story-editorial-foot')) section.appendChild(createFoot())

  decorateTitle(title)
  decorateCopy(paragraph)

  requestAnimationFrame(() => {
    section.classList.add('story-motion-ready')
    observeVisibility(section)
  })
}

function unmount(section) {
  visibilityObservers.get(section)?.disconnect()
  visibilityObservers.delete(section)
  activeSections.delete(section)
  mountedSections.delete(section)
}

function scan() {
  for (const section of [...mountedSections]) {
    if (!section.isConnected || !section.matches('.story-section')) unmount(section)
  }
  document.querySelectorAll('.story-section').forEach(mount)
}

let scrollFrame = 0
function updateParallax() {
  scrollFrame = 0
  if (reducedMotion) return
  const viewport = window.innerHeight || document.documentElement.clientHeight || 800

  for (const section of [...activeSections]) {
    if (!section.isConnected) {
      activeSections.delete(section)
      continue
    }
    const rect = section.getBoundingClientRect()
    const progress = Math.min(1, Math.max(0, (viewport - rect.top) / (viewport + rect.height)))
    const shift = Math.max(-11, Math.min(11, (progress - .5) * 22))
    section.style.setProperty('--story-shift', `${shift.toFixed(2)}px`)
  }
}

function requestParallax() {
  if (scrollFrame || reducedMotion) return
  scrollFrame = requestAnimationFrame(updateParallax)
}

let scanQueued = false
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
  if (!reducedMotion) {
    window.addEventListener('scroll', requestParallax, { passive: true })
    window.addEventListener('resize', requestParallax, { passive: true })
  }
  scan()
  requestParallax()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
