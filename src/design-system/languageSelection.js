/*
  Language-selection interaction choreography.
  Enhances both React and raw-source fallback rendering without owning either state machine.
*/

const LANGUAGE_SELECTOR = '.language-screen .language-card'
const LANGUAGE_TRANSITION_MS = 410
let allowSyntheticLanguageClick = false
let languageTransitionLocked = false
let languageReleaseTimer = null

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function inferLanguage(button) {
  if (button.dataset.value === 'hi' || button.dataset.value === 'en') return button.dataset.value
  return button.classList.contains('wine') ? 'en' : 'hi'
}

function currentSide() {
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

function selectLanguageVisually(button) {
  const screen = button.closest('.language-screen')
  const grid = button.closest('.language-grid')
  if (!screen || !grid) return null

  const language = inferLanguage(button)
  document.documentElement.dataset.weddingLanguage = language
  grid.dataset.selected = language
  screen.classList.add('is-language-confirming')

  grid.querySelectorAll('.language-card').forEach((card) => {
    const selected = card === button
    card.classList.toggle('is-selected', selected)
    card.classList.toggle('is-dimmed', !selected)
    card.setAttribute('aria-pressed', selected ? 'true' : 'false')
    card.setAttribute('aria-disabled', 'true')
  })

  return language
}

function handleLanguageSelection(event) {
  const button = event.target.closest?.(LANGUAGE_SELECTOR)
  if (!button) return

  if (allowSyntheticLanguageClick) {
    allowSyntheticLanguageClick = false
    return
  }

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation?.()

  if (languageTransitionLocked) return
  languageTransitionLocked = true
  selectLanguageVisually(button)

  const delay = prefersReducedMotion() ? 35 : LANGUAGE_TRANSITION_MS
  window.clearTimeout(languageReleaseTimer)
  languageReleaseTimer = window.setTimeout(() => {
    allowSyntheticLanguageClick = true
    languageTransitionLocked = false
    button.click()
  }, delay)
}

/* Capture phase ensures the visual confirmation occurs before React/fallback changes stage. */
document.addEventListener('click', handleLanguageSelection, true)

const languageObserver = new MutationObserver((records) => {
  let languageScreen = null
  let sideScreenReturned = false
  let introAdded = false

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

      if (node.matches?.('.intro-screen') || node.querySelector?.('.intro-screen')) {
        introAdded = true
      }
    }
  }

  if (languageScreen) {
    languageTransitionLocked = false
    allowSyntheticLanguageClick = false
    window.clearTimeout(languageReleaseTimer)
    enhanceLanguageScreen(languageScreen)
  }

  if (sideScreenReturned) {
    delete document.documentElement.dataset.weddingLanguage
    languageTransitionLocked = false
    allowSyntheticLanguageClick = false
    window.clearTimeout(languageReleaseTimer)
  }

  if (introAdded) {
    languageTransitionLocked = false
    allowSyntheticLanguageClick = false
    window.clearTimeout(languageReleaseTimer)
  }
})

languageObserver.observe(document.documentElement, { childList: true, subtree: true })
enhanceLanguageScreen(document.querySelector('.language-screen'))

window.addEventListener('pagehide', () => {
  window.clearTimeout(languageReleaseTimer)
  languageObserver.disconnect()
}, { once: true })
