// Opening corrective pass.
// Sound buttons use action-oriented labels such as "Mute sound" / "Turn sound on".
// `aria-pressed` made VoiceOver announce the opposite semantic state, so the action
// label is kept authoritative and the pressed-state attribute is removed, including
// when React writes it back after a sound-state update.

let scanQueued = false

function scan() {
  document.querySelectorAll('.sound-pill, .sound-float, .site-sound').forEach((button) => {
    if (button.hasAttribute('aria-pressed')) button.removeAttribute('aria-pressed')
  })
}

function scheduleScan() {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
}

const observer = new MutationObserver(scheduleScan)

function start() {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-pressed'],
  })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
