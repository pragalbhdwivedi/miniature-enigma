/*
  Opening side-selector presentation helper.
  React and the raw fallback own navigation. This module may decorate the selected
  card and expose transient side context, but it must never delay, cancel, synthesize,
  or lock the guest's real tap.
*/

const SIDE_SELECTOR = '.selection-screen:not(.language-screen) .passport-choice'

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

function rememberSide(button) {
  const grid = button.closest('.side-grid')
  if (!grid) return

  const value = button.classList.contains('groom') ? 'groom' : 'bride'
  grid.dataset.selected = value
  document.documentElement.dataset.weddingSide = value
  window.__weddingOpeningSide = value

  grid.querySelectorAll('.passport-choice').forEach((card) => {
    const selected = card === button
    card.classList.toggle('is-selected', selected)
    card.classList.toggle('is-dimmed', !selected)
    card.setAttribute('aria-pressed', selected ? 'true' : 'false')
  })
}

/* Capture records the selected side before React/fallback replaces the screen, but
   deliberately does not preventDefault or stop propagation. The original click is
   the only navigation event. */
document.addEventListener('click', (event) => {
  const button = event.target.closest?.(SIDE_SELECTOR)
  if (button) rememberSide(button)
}, true)

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
    const grid = document.querySelector('.selection-screen:not(.language-screen) .side-grid')
    clearSelectionState(grid)
    syncOpeningCopy(document)
  }
})

observer.observe(document.documentElement, { childList: true, subtree: true })
syncOpeningCopy(document)

window.addEventListener('pagehide', () => observer.disconnect(), { once: true })
