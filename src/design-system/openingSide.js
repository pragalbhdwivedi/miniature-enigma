/*
  Opening side-selector interaction choreography.
  Keeps the existing React and raw-source fallback state machines, but adds one
  professional selection beat before navigation so the chosen family is visibly confirmed.
*/

const SIDE_SELECTOR = '.selection-screen:not(.language-screen) .passport-choice'
const TRANSITION_MS = 430
let allowSyntheticClick = false
let transitionLocked = false
let releaseTimer = null

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function syncOpeningCopy(root = document) {
  const bride = root.querySelector?.('.selection-screen:not(.language-screen) .passport-choice.bride small')
  const groom = root.querySelector?.('.selection-screen:not(.language-screen) .passport-choice.groom small')

  if (bride && bride.textContent !== 'द्विवेदी परिवार की ओर से आपका स्वागत है') {
    bride.textContent = 'द्विवेदी परिवार की ओर से आपका स्वागत है'
  }
  if (groom && groom.textContent !== 'पांडेय परिवार की ओर से आपका स्वागत है') {
    groom.textContent = 'पांडेय परिवार की ओर से आपका स्वागत है'
  }

  root.querySelectorAll?.(SIDE_SELECTOR).forEach((button) => {
    if (!button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', 'false')
  })
}

function clearSelectionState(grid) {
  if (!grid) return
  delete grid.dataset.selected
  grid.querySelectorAll('.passport-choice').forEach((card) => {
    card.classList.remove('is-selected', 'is-dimmed')
    card.removeAttribute('aria-disabled')
    card.setAttribute('aria-pressed', 'false')
  })
}

function selectVisually(button) {
  const grid = button.closest('.side-grid')
  if (!grid) return
  const value = button.classList.contains('groom') ? 'groom' : 'bride'
  grid.dataset.selected = value

  grid.querySelectorAll('.passport-choice').forEach((card) => {
    const selected = card === button
    card.classList.toggle('is-selected', selected)
    card.classList.toggle('is-dimmed', !selected)
    card.setAttribute('aria-pressed', selected ? 'true' : 'false')
    card.setAttribute('aria-disabled', 'true')
  })
}

function handleSideSelection(event) {
  const button = event.target.closest?.(SIDE_SELECTOR)
  if (!button) return

  if (allowSyntheticClick) {
    allowSyntheticClick = false
    return
  }

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation?.()

  if (transitionLocked) return
  transitionLocked = true
  selectVisually(button)

  const delay = reducedMotion() ? 40 : TRANSITION_MS
  window.clearTimeout(releaseTimer)
  releaseTimer = window.setTimeout(() => {
    allowSyntheticClick = true
    transitionLocked = false
    button.click()
  }, delay)
}

/* Capture phase is deliberate. It lets the visual confirmation run before either
   React's delegated onClick or the raw fallback root handler advances the stage. */
document.addEventListener('click', handleSideSelection, true)

const observer = new MutationObserver((records) => {
  let sideScreenAdded = false
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue
      if (node.matches?.('.selection-screen:not(.language-screen)') || node.querySelector?.('.selection-screen:not(.language-screen)')) {
        sideScreenAdded = true
        break
      }
    }
    if (sideScreenAdded) break
  }

  if (sideScreenAdded) {
    transitionLocked = false
    allowSyntheticClick = false
    window.clearTimeout(releaseTimer)
    const grid = document.querySelector('.selection-screen:not(.language-screen) .side-grid')
    clearSelectionState(grid)
    syncOpeningCopy(document)
  }
})

observer.observe(document.documentElement, { childList: true, subtree: true })
syncOpeningCopy(document)

window.addEventListener('pagehide', () => {
  window.clearTimeout(releaseTimer)
  observer.disconnect()
}, { once: true })
