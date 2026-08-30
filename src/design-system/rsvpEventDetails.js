// RSVP event-detail enhancer.
// Keeps React / fallback event buttons authoritative and adds stable metadata plus
// fallback accessibility state used by CSS/tests for the event choices.

import { events } from '../content.js'

let queued = false

function findEvent(button) {
  const value = button.textContent?.replace(/^[✓+]/, '').trim() || ''
  return events.find((event) => value.startsWith(event.title)) || null
}

function decorate(button) {
  const event = findEvent(button)
  if (!event) return

  // React already owns aria-pressed. The raw fallback historically exposed only
  // the selected class, so mirror that state when ARIA is otherwise absent.
  if (!button.hasAttribute('aria-pressed')) {
    button.setAttribute('aria-pressed', button.classList.contains('selected') ? 'true' : 'false')
  }

  const signature = `${event.id}|${event.type}|${event.date}|${event.time}`
  if (button.dataset.rsvpEventSignature === signature) return

  button.dataset.rsvpEventSignature = signature
  button.dataset.rsvpEventType = `(${event.type})`
  button.dataset.rsvpEventWhen = `${event.date} · ${event.time}`
  button.setAttribute('aria-label', `${event.title} (${event.type}), ${event.date}, ${event.time}`)
}

function scan() {
  document.querySelectorAll('.rsvp-form .event-checks button').forEach(decorate)
}

const observer = new MutationObserver((records) => {
  const relevant = records.some((record) => [...record.addedNodes].some((node) => {
    if (!(node instanceof Element)) return false
    return node.matches?.('.event-checks, .event-checks button, .rsvp-form') || node.querySelector?.('.event-checks, .event-checks button, .rsvp-form')
  }))
  if (!relevant || queued) return
  queued = true
  queueMicrotask(() => {
    queued = false
    scan()
  })
})

function start() {
  observer.observe(document.body, { childList: true, subtree: true })
  scan()
}

if (document.body) start()
else document.addEventListener('DOMContentLoaded', start, { once: true })
