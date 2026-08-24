// Opening corrective pass.
// Sound buttons use action-oriented labels such as "Mute sound" / "Turn sound on".
// `aria-pressed` made VoiceOver announce the opposite semantic state, so the action
// label is kept authoritative and the pressed-state attribute is removed.

let scanQueued = false

function scan() {
  document.querySelectorAll('.sound-pill, .sound-float, .site-sound').forEach((button) => {
    button.removeAttribute('aria-pressed')
  })
}

const observer = new MutationObserver(() => {
  if (scanQueued) return
  scanQueued = true
  queueMicrotask(() => {
    scanQueued = false
    scan()
  })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
