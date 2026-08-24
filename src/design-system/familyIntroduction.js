// Module 08 — Family Introduction
// Presentation enhancement for the approved familyDetails renderer. It reads the
// family cards already produced by familyDetails.js, so names/order remain owned by
// the source-of-truth dataset instead of being duplicated here.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const observedSections = new WeakSet()
let sectionObserver = null

const META = {
  en: {
    bride: { surname: 'DWIVEDI', side: 'BRIDE FAMILY' },
    groom: { surname: 'PANDEY', side: 'GROOM FAMILY' },
  },
  hi: {
    bride: { surname: 'द्विवेदी', side: 'वधू पक्ष' },
    groom: { surname: 'पांडेय', side: 'वर पक्ष' },
  },
}

function getLang() {
  return document.documentElement.lang === 'hi' ? 'hi' : 'en'
}

function ensureObserver() {
  if (sectionObserver || reducedMotion || !('IntersectionObserver' in window)) return
  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('family-in-view')
      sectionObserver?.unobserve(entry.target)
    })
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
}

function createIntro(section, cards, lang) {
  let intro = section.querySelector(':scope > .family-editorial-intro')
  if (!intro) {
    intro = document.createElement('div')
    intro.className = 'family-editorial-intro'
    intro.setAttribute('aria-hidden', 'true')

    const families = document.createElement('span')
    families.className = 'family-editorial-intro__families'
    const folio = document.createElement('span')
    folio.className = 'family-editorial-intro__folio'

    intro.append(families, folio)
    const heading = section.querySelector(':scope > h2')
    if (heading) heading.insertAdjacentElement('afterend', intro)
    else section.prepend(intro)
  }

  const order = cards.map((card) => card.dataset.familyCard).filter(Boolean)
  const names = order.map((side) => META[lang][side]?.surname).filter(Boolean)
  intro.querySelector('.family-editorial-intro__families').textContent = names.join(' · ')
  intro.querySelector('.family-editorial-intro__folio').textContent = '01 / 02'
}

function enhanceCard(card, index, lang) {
  const side = card.dataset.familyCard === 'groom' ? 'groom' : 'bride'
  const meta = META[lang][side]

  card.classList.toggle('family-card--lead', index === 0)
  card.classList.toggle('family-card--secondary', index !== 0)
  card.dataset.familySurname = meta.surname
  card.dataset.familyEditorialSide = side
  card.style.setProperty('--family-card-index', String(index))

  const title = card.querySelector('.family-card-topline > strong')
  if (title) title.dataset.familySideLabel = meta.side

  card.querySelectorAll('.family-person').forEach((row, rowIndex) => {
    row.dataset.familyRow = String(rowIndex + 1).padStart(2, '0')
    row.style.setProperty('--family-row-index', String(rowIndex))
  })
}

function enhanceSection(section) {
  const grid = section.querySelector('.family-grid')
  const cards = [...(grid?.querySelectorAll('[data-family-card]') || [])]
  if (!grid || cards.length < 2) return

  const lang = getLang()
  const orderSignature = cards.map((card) => card.dataset.familyCard).join('-')
  const signature = `${lang}:${orderSignature}:editorial-v1`
  if (section.dataset.familyEditorialSignature === signature) return

  section.dataset.familyEditorialSignature = signature
  section.dataset.familyPrimary = cards[0]?.dataset.familyCard || 'bride'
  section.classList.add('family-editorial-ready')
  if (!reducedMotion) section.classList.add('family-motion-ready')

  createIntro(section, cards, lang)
  cards.forEach((card, index) => enhanceCard(card, index, lang))

  if (reducedMotion) {
    section.classList.add('family-in-view')
    return
  }

  ensureObserver()
  if (sectionObserver && !observedSections.has(section)) {
    observedSections.add(section)
    sectionObserver.observe(section)
  } else if (!sectionObserver) {
    section.classList.add('family-in-view')
  }
}

function scan() {
  document.querySelectorAll('.family-section').forEach(enhanceSection)
}

let queued = false
const observer = new MutationObserver(() => {
  if (queued) return
  queued = true
  queueMicrotask(() => {
    queued = false
    scan()
  })
})

function start() {
  observer.observe(document.documentElement, { childList: true, subtree: true })
  scan()
  window.addEventListener('pageshow', scan)
}

if (document.documentElement) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
