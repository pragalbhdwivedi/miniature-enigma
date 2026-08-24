// Refined production credit shown at the very end of the invitation.
// Loaded in both the React/Vite app and the raw-source fallback.

const CREDIT_MARKUP = `
  <div class="designer-credit__rule" aria-hidden="true"></div>
  <p class="designer-credit__line">
    <span>Designed &amp; made by</span>
    <a href="https://github.com/pragalbhdwivedi" target="_blank" rel="noreferrer">Pragalbh Dwivedi</a>
  </p>
  <p class="designer-credit__meta">
    <a href="https://github.com/pragalbhdwivedi/miniature-enigma" target="_blank" rel="noreferrer">Hosted on GitHub</a>
    <span aria-hidden="true">·</span>
    <span>2026</span>
  </p>
`

function ensureDesignerCredit() {
  const shell = document.querySelector('.site-shell')
  if (!shell || shell.querySelector('.designer-credit')) return

  const credit = document.createElement('footer')
  credit.className = 'designer-credit'
  credit.setAttribute('aria-label', 'Website credit')
  credit.innerHTML = CREDIT_MARKUP

  const nav = shell.querySelector('.bottom-nav')
  if (nav) shell.insertBefore(credit, nav)
  else shell.appendChild(credit)
}

const observer = new MutationObserver(ensureDesignerCredit)
observer.observe(document.documentElement, { childList: true, subtree: true })

ensureDesignerCredit()
window.addEventListener('pageshow', ensureDesignerCredit)
