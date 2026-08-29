// Use the approved uploaded K/A monogram everywhere a textual .monogram is rendered.
// This runs in both the normal React/Vite app and the raw-source fallback.

const logoUrl = new URL('./images/logo.ico', import.meta.url).href

function applyLogoBranding() {
  document.querySelectorAll('.monogram').forEach((node) => {
    if (node.querySelector('img[data-ka-logo]')) return

    const img = document.createElement('img')
    img.src = logoUrl
    img.alt = ''
    img.setAttribute('aria-hidden', 'true')
    img.setAttribute('data-ka-logo', 'true')
    // The approved ICO is intrinsically square (256×256). Publishing that geometry
    // before decode prevents Mobile Safari/WebKit from shifting the opening cards when
    // the image element replaces the immediate CSS-background placeholder.
    img.width = 256
    img.height = 256
    img.decoding = 'async'
    img.draggable = false

    node.replaceChildren(img)
    node.setAttribute('aria-label', 'Kritica and Ashish')
    node.classList.add('monogram--image')
  })
}

const observer = new MutationObserver(applyLogoBranding)
observer.observe(document.documentElement, { childList: true, subtree: true })

applyLogoBranding()
window.addEventListener('pageshow', applyLogoBranding)
