// Module 23 — Designer / Hosting Footer
// A compact production colophon shared by the React/Vite app and the raw-source fallback.
// Visible credit wording is intentionally unchanged.

const CREDIT_MARKUP = `
  <div class="designer-credit__rule" aria-hidden="true"></div>
  <p class="designer-credit__line">
    <span class="designer-credit__label">Designed &amp; made by</span>
    <a class="designer-credit__maker" href="https://github.com/pragalbhdwivedi" target="_blank" rel="noopener noreferrer">Pragalbh Dwivedi</a>
  </p>
  <p class="designer-credit__meta">
    <a class="designer-credit__host" href="https://github.com/pragalbhdwivedi/miniature-enigma" target="_blank" rel="noopener noreferrer">Hosted on GitHub</a>
    <span aria-hidden="true">·</span>
    <span class="designer-credit__year">2026</span>
  </p>
`

let scanQueued = false

function isHindi() {
  return document.documentElement.lang === 'hi'
}

function labelCredit(credit) {
  const hi = isHindi()
  credit.setAttribute('aria-label', hi ? 'डिज़ाइन और होस्टिंग क्रेडिट' : 'Design and hosting credits')

  const maker = credit.querySelector('.designer-credit__maker')
  const host = credit.querySelector('.designer-credit__host')
  maker?.setAttribute('aria-label', hi ? 'Pragalbh Dwivedi का GitHub प्रोफ़ाइल, नए टैब में खुलेगा' : 'Pragalbh Dwivedi on GitHub, opens in a new tab')
  host?.setAttribute('aria-label', hi ? 'GitHub पर वेबसाइट रिपॉज़िटरी, नए टैब में खुलेगी' : 'Website repository on GitHub, opens in a new tab')
}

function ensureDesignerCredit() {
  const shell = document.querySelector('.site-shell')
  if (!shell) return

  let credit = shell.querySelector('.designer-credit')
  if (!credit) {
    credit = document.createElement('footer')
    credit.className = 'designer-credit'
    credit.innerHTML = CREDIT_MARKUP
  }

  labelCredit(credit)

  // Keep the colophon immediately after the cinematic closing frame so Module 22's
  // dark-paper handoff remains structurally deterministic in React and raw fallback.
  const closing = shell.querySelector('.closing-section')
  if (closing && closing.nextElementSibling !== credit) {
    closing.insertAdjacentElement('afterend', credit)
  } else if (!credit.isConnected) {
    const nav = shell.querySelector('.bottom-nav')
    if (nav) shell.insertBefore(credit, nav)
    else shell.appendChild(credit)
  }
}

function scheduleEnsure() {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    ensureDesignerCredit()
  })
}

const observer = new MutationObserver(scheduleEnsure)
observer.observe(document.documentElement, { childList: true, subtree: true })

ensureDesignerCredit()
window.addEventListener('pageshow', scheduleEnsure)
