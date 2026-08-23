// Preserve the guest's place while RSVP controls update.
// The raw-source fallback re-renders its page and historically forced scrollY to 0.

let pendingScrollY = null
let pendingAt = 0

const isRsvpControl = (target) => Boolean(target?.closest?.('.event-checks button, .status-toggle button'))

function rememberScroll(event) {
  if (!isRsvpControl(event.target)) return
  pendingScrollY = window.scrollY
  pendingAt = performance.now()
}

function restoreScroll(event) {
  if (!isRsvpControl(event.target) || pendingScrollY === null) return
  const targetY = pendingScrollY
  const capturedAt = pendingAt

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (capturedAt !== pendingAt || performance.now() - capturedAt > 1200) return
      if (Math.abs(window.scrollY - targetY) > 4) {
        window.scrollTo({ top: targetY, left: 0, behavior: 'auto' })
      }
      pendingScrollY = null
    })
  })
}

document.addEventListener('pointerdown', rememberScroll, { capture: true, passive: true })
document.addEventListener('touchstart', rememberScroll, { capture: true, passive: true })
document.addEventListener('click', restoreScroll, { capture: true })
