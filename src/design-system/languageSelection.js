/*
  Language-selection presentation helper.
  React and the raw fallback own navigation. This module adds the selected-family
  origin panel and visual selection state, but never delays, cancels, synthesizes,
  or locks the guest's real language tap.
*/

const LANGUAGE_SELECTOR = '.language-screen .language-card'

function inferLanguage(button) {
  if (button.dataset.value === 'hi' || button.dataset.value === 'en') return button.dataset.value
  return button.classList.contains('wine') ? 'en' : 'hi'
}

function currentSide() {
  const memorySide = window.__weddingOpeningSide
  if (memorySide === 'groom' || memorySide === 'bride') return memorySide
  const side = document.documentElement.dataset.weddingSide
  return side === 'groom' ? 'groom' : side === 'bride' ? 'bride' : null
}

function originCopy(side) {
  if (side === 'groom') {
    return {
      kicker: 'YOUR WEDDING PARTY · वर पक्ष',
      family: 'PANDEY FAMILY',
      sideLabel: 'पांडेय परिवार की ओर से आपका स्वागत है',
    }
  }

  return {
    kicker: 'YOUR WEDDING PARTY · वधू पक्ष',
    family: 'DWIVEDI FAMILY',
    sideLabel: 'द्विवेदी परिवार की ओर से आपका स्वागत है',
  }
}

function makeOriginPanel(side) {
  const copy = originCopy(side)
  const panel = document.createElement('div')
  panel.className = 'language-origin'
  panel.dataset.side = side
  panel.setAttribute('aria-label', `${copy.family}. ${copy.sideLabel}`)
  panel.innerHTML = `
    <span class="language-origin__medallion" aria-hidden="true"></span>
    <span class="language-origin__copy">
      <small>${copy.kicker}</small>
      <strong>${copy.family}</strong>
      <span>${copy.sideLabel}</span>
    </span>
  `
  return panel
}

function resetLanguageState(screen) {
  if (!screen) return
  screen.classList.remove('is-language-confirming')
  const grid = screen.querySelector('.language-grid')
  if (grid) delete grid.dataset.selected

  screen.querySelectorAll('.language-card').forEach((card) => {
    card.classList.remove('is-selected', 'is-dimmed')
    card.removeAttribute('aria-disabled')
    card.setAttribute('aria-pressed', 'false')
  })
}

function enhanceLanguageScreen(screen) {
  if (!screen) return
  const side = currentSide()

  if (side) {
    screen.dataset.originSide = side
    if (!screen.querySelector('.language-origin')) {
      const monogram = screen.querySelector('.monogram')
      const origin = makeOriginPanel(side)
      if (monogram) monogram.insertAdjacentElement('afterend', origin)
      else screen.querySelector('.selection-content')?.prepend(origin)
    }
  }

  screen.querySelectorAll('.language-card').forEach((card) => {
    if (!card.hasAttribute('aria-pressed')) card.setAttribute('aria-pressed', 'false')
  })

  const grid = screen.querySelector('.language-grid')
  if (grid && !grid.getAttribute('role')) grid.setAttribute('role', 'group')
  resetLanguageState(screen)
}

function decorateLanguageSelection(button) {
  const screen = button.closest('.language-screen')
  const grid = button.closest('.language-grid')
  if (!screen || !grid) return

  const language = inferLanguage(button)
  document.documentElement.dataset.weddingLanguage = language
  grid.dataset.selected = language
  screen.classList.add('is-language-confirming')

  grid.querySelectorAll('.language-card').forEach((card) => {
    const selected = card === button
    card.classList.toggle('is-selected', selected)
    card.classList.toggle('is-dimmed', !selected)
    card.setAttribute('aria-pressed', selected ? 'true' : 'false')
  })
}

/* Record presentation state in capture phase, then allow the original click to flow
   untouched to React or the raw fallback. */
document.addEventListener('click', (event) => {
  const button = event.target.closest?.(LANGUAGE_SELECTOR)
  if (button) decorateLanguageSelection(button)
}, true)

const languageObserver = new MutationObserver((records) => {
  let languageScreen = null
  let sideScreenReturned = false

  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue

      if (!languageScreen) {
        if (node.matches?.('.language-screen')) languageScreen = node
        else languageScreen = node.querySelector?.('.language-screen') || null
      }

      if (node.matches?.('.selection-screen:not(.language-screen)') || node.querySelector?.('.selection-screen:not(.language-screen)')) {
        sideScreenReturned = true
      }
    }
  }

  if (languageScreen) enhanceLanguageScreen(languageScreen)

  if (sideScreenReturned) {
    delete document.documentElement.dataset.weddingLanguage
    resetLanguageState(document.querySelector('.language-screen'))
  }
})

languageObserver.observe(document.documentElement, { childList: true, subtree: true })
enhanceLanguageScreen(document.querySelector('.language-screen'))

window.addEventListener('pagehide', () => languageObserver.disconnect(), { once: true })
