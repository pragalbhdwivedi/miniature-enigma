// Module 22 — Closing Wedding Screen
// Enhances the existing closing footer in place. Locked couple names, hashtag, dates and
// closing copy remain sourced from the existing React / fallback DOM.

const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
const mounted = new WeakMap()
let scanQueued = false

const PARTICLES = [
  [8, 74, 0.0, 8.4, 1.2],
  [18, 48, 1.8, 9.2, 1.0],
  [29, 82, 4.2, 10.6, 1.4],
  [39, 61, 2.7, 8.9, 1.0],
  [49, 88, 6.0, 11.4, 1.3],
  [58, 52, 0.9, 9.8, 1.0],
  [67, 76, 4.9, 10.1, 1.2],
  [76, 44, 2.1, 8.7, 1.0],
  [86, 84, 6.7, 11.1, 1.4],
  [92, 58, 3.5, 9.5, 1.0],
  [34, 35, 7.2, 10.8, 1.0],
  [63, 29, 5.3, 9.1, 1.0],
]

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

function buildAtmosphere() {
  const atmosphere = element('div', 'closing-cinematic__atmosphere')
  atmosphere.setAttribute('aria-hidden', 'true')

  const glow = element('span', 'closing-cinematic__glow')
  const horizon = element('span', 'closing-cinematic__horizon')
  const particles = element('div', 'closing-cinematic__particles')

  PARTICLES.forEach(([x, y, delay, duration, size]) => {
    const particle = element('i', '')
    particle.style.setProperty('--closing-particle-x', `${x}%`)
    particle.style.setProperty('--closing-particle-y', `${y}%`)
    particle.style.setProperty('--closing-particle-delay', `${delay}s`)
    particle.style.setProperty('--closing-particle-duration', `${duration}s`)
    particle.style.setProperty('--closing-particle-size', `${size}px`)
    particles.appendChild(particle)
  })

  atmosphere.append(glow, horizon, particles)
  return atmosphere
}

function buildMedallion(sourceCrest) {
  const medallion = element('div', 'closing-cinematic__medallion')
  medallion.setAttribute('aria-hidden', 'true')

  const inner = element('div', 'closing-cinematic__medallion-inner')
  if (sourceCrest) {
    const clone = sourceCrest.cloneNode(true)
    clone.classList.add('closing-cinematic__crest')
    clone.removeAttribute('aria-label')
    clone.setAttribute('aria-hidden', 'true')
    inner.appendChild(clone)
  }

  medallion.appendChild(inner)
  return medallion
}

function mount(footer) {
  if (mounted.has(footer)) return

  const crest = footer.querySelector(':scope > .tiger-crest')
  const title = footer.querySelector(':scope > h2')
  const names = footer.querySelector(':scope > p')
  const hashtag = footer.querySelector(':scope > strong')
  const dateLine = footer.querySelector(':scope > span')

  if (!title || !names || !hashtag || !dateLine) return

  footer.classList.add('closing-cinematic-ready')
  crest?.classList.add('closing-cinematic__source-crest')
  title.classList.add('closing-cinematic__title')
  names.classList.add('closing-cinematic__names')
  hashtag.classList.add('closing-cinematic__hashtag')
  dateLine.classList.add('closing-cinematic__date')

  const atmosphere = buildAtmosphere()
  const kicker = element('p', 'closing-cinematic__kicker', 'THE CORBETT WEDDING')
  kicker.setAttribute('aria-hidden', 'true')
  const medallion = buildMedallion(crest)
  const rule = element('span', 'closing-cinematic__rule')
  rule.setAttribute('aria-hidden', 'true')
  const finalMark = element('span', 'closing-cinematic__final-mark', '✦')
  finalMark.setAttribute('aria-hidden', 'true')

  footer.prepend(atmosphere, kicker, medallion)
  dateLine.insertAdjacentElement('beforebegin', rule)
  footer.appendChild(finalMark)

  let observer = null
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        footer.classList.toggle('is-closing-visible', entry.isIntersecting && entry.intersectionRatio > 0.14)
      })
    }, { threshold: [0, 0.14, 0.32] })
    observer.observe(footer)
  } else {
    footer.classList.add('is-closing-visible')
  }

  if (reducedMotion) footer.classList.add('is-closing-visible')

  mounted.set(footer, {
    destroy() {
      observer?.disconnect()
      atmosphere.remove()
      kicker.remove()
      medallion.remove()
      rule.remove()
      finalMark.remove()
      crest?.classList.remove('closing-cinematic__source-crest')
      title.classList.remove('closing-cinematic__title')
      names.classList.remove('closing-cinematic__names')
      hashtag.classList.remove('closing-cinematic__hashtag')
      dateLine.classList.remove('closing-cinematic__date')
      footer.classList.remove('closing-cinematic-ready', 'is-closing-visible')
      mounted.delete(footer)
    },
  })
}

function scan() {
  document.querySelectorAll('.closing-section').forEach(mount)
}

const mutationObserver = new MutationObserver((records) => {
  const relevant = records.some((record) => [...record.addedNodes].some((node) => {
    if (!(node instanceof Element)) return false
    return node.matches?.('.closing-section, .site-shell') || node.querySelector?.('.closing-section')
  }))
  if (!relevant || scanQueued) return

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
