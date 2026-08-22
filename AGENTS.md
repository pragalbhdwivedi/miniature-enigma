# Codex / AI Implementation Instructions

Before changing this repository, read `PROJECT_SOURCE.md` completely.

## Non-negotiable rules

1. Do not change locked couple names, event names, dates, times, hashtag, destination, domain or side/language logic without explicit project-owner instruction.
2. Do not invent any item listed as TBD in `PROJECT_SOURCE.md`.
3. This is a mobile-only, single-page experience. Design for iPhone / Mobile Safari first, Android Chrome second.
4. Preserve the creative hierarchy: Couple → Wedding → Destination → Forest → Tiger.
5. Use only one major photorealistic tiger reveal. Recurring tiger motifs should be engraved/illustrated.
6. Keep CSS-first animation and avoid heavy WebGL/3D frameworks unless explicitly approved.
7. Respect `prefers-reduced-motion` and keep a visible sound toggle.
8. Side selection changes the full invitation perspective, not only name order.
9. Language selection is shown again on every full refresh.
10. Branded event titles and `#KritiFoundHerHash` remain unchanged in both language modes.
11. Never embed the private guest database in the public React bundle.
12. Generic imagery is temporary. Do not pretend it is final Wyndham Garden or couple photography.

## Before opening a PR

- Run `npm install`
- Run `npm run build`
- Review mobile widths 320, 375, 390, 430 and 480 px
- Check iOS safe areas
- Test Hindi and English
- Test Bride Side and Groom Side
- Test reduced-motion mode
- Test sound on/off
- Test RSVP no-attendance and per-event attendance
- Test WhatsApp share link
- Verify all locked content against `PROJECT_SOURCE.md`

Any visual or technical recommendation that conflicts with `PROJECT_SOURCE.md` must be raised for approval rather than silently implemented.
