# Kritica & Ashish Digital Wedding Invitation — Locked Source

This file is the implementation source of truth for this repository. Do not change locked content without explicit project-owner approval.

## Objective

Create one exceptional **mobile-only, single-page, cinematic destination wedding invitation** for **Kritica Dwivedi & Ashish Pandey**.

- Destination: **Wyndham Garden, Ramnagar, Jim Corbett National Park**
- Dates: **24–26 November 2026**
- Domain: **kritica.in**
- Stack: **React + Vite**
- Hosting: **GitHub Pages**
- Distribution: **WhatsApp-first**
- Implementation: **Codex**
- Independent audit: **Gemini**

## Creative direction

**Luxury Indian Jungle × Jim Corbett × Fashion Editorial × Travel Passport × Cinematic Wedding Experience**

Palette direction: dark olive, deep forest green, burgundy/wine, antique/warm gold, warm ivory/aged paper.

The exterior feels like a bespoke luxury travel passport. The interior evolves into a fashion-editorial publication. It must not look like a literal government passport, generic wedding template, wildlife tourism site, cartoon jungle, desktop-first website or WebGL showcase.

## Entry logic

Every refresh begins with:

1. Bride Side / वधू पक्ष OR Groom Side / वर पक्ष
2. Hindi OR English

Side selection changes name order, family priority, invitation perspective, contact priority when contacts are added, and RSVP wording/order.

Bride side: **Kritica Dwivedi & Ashish Pandey**

Groom side: **Ashish Pandey & Kritica Dwivedi**

After language selection the entire interface follows that language, while branded event names and hashtag remain unchanged.

## Opening sequence

- Dark forest
- River / forest ambience
- Foliage movement
- Tiger snort
- Brief tiger presence
- One photorealistic tiger reveal only
- Tiger transforms into engraved tiger crest
- Bespoke Corbett wedding passport appears
- Guest opens invitation

Tiger hierarchy: **Couple → Wedding → Destination → Forest → Tiger**. No repeated photorealistic tiger imagery, no mascot/cartoon treatment.

## Sound

Use subtle forest/river atmosphere plus tiger snort. After the passport opens, final production may transition into subtle cinematic Indian instrumental music. Final music asset is TBD. Sound must have an accessible mute control and begin only after user interaction.

## Passport cover

- **THE CORBETT WEDDING**
- Side-aware couple name order
- **24–26 NOVEMBER 2026**
- **RAMNAGAR · JIM CORBETT**
- Engraved tiger crest

Do not rely on the literal word PASSPORT; the object should communicate the reference visually.

## Hashtag

**#KritiFoundHerऐश**

## Locked events

| Ceremony | Branded title | Date | Time |
|---|---|---|---|
| Mehendi | **Pind Green Flag** | 24 Nov 2026 | 3:00 PM |
| Sangeet | **Reels in Real Life** | 24 Nov 2026 | 7:00 PM |
| Haldi | **Vitamin We** | 25 Nov 2026 | 10:00 AM |
| Pool Party | **Splash Before the Shaadi** | 25 Nov 2026 | 12:00 PM |
| Reception / Jaimal | **Wildly Ever After** | 25 Nov 2026 | 7:00 PM |
| Pheras | **Written in the Stars** | 26 Nov 2026 | 12:00 Midnight |

Pheras are the midnight immediately following the 25 November evening celebration. Do not duplicate them as a separate 25 November event.

## Itinerary structure

### 24 November
- Arrival / check-in
- Welcome lunch
- 3 PM Pind Green Flag
- High Tea
- 7 PM Reels in Real Life
- Gala Dinner

### 25 November
- Breakfast
- 10 AM Vitamin We
- 12 PM Splash Before the Shaadi
- Lunch following Pool Party
- High Tea
- 7 PM Wildly Ever After
- Gala Dinner
- Transition toward Pheras

### 26 November
- 12 Midnight Written in the Stars
- Post-Phera refreshments
- Breakfast
- 11 AM checkout

Only locked ceremony times and checkout are fixed. Other meal timings remain TBD.

## Single-page content order

1. Side Selection
2. Language Selection
3. Cinematic Forest Opening
4. Tiger Reveal
5. Invitation / Passport Cover
6. Couple Introduction
7. Formal Invitation Message
8. Family Introduction
9. Couple Story
10. Destination Overview
11. Full Itinerary
12. Individual Event Experiences
13. Venue
14. Accommodation
15. Travel Information
16. Transport Information
17. Gallery
18. RSVP
19. Closing Message

## Navigation

Fixed bottom navigation:

**Home · Events · Stay · Travel · RSVP**

No conventional hamburger menu as the primary navigation.

## RSVP

RSVP must support:

- WhatsApp prefilled response/share
- Structured data storage once backend provider is selected
- Attendance status
- Guest count
- Per-event attendance
- Guest-specific opaque code support

Do not ship private guest data inside the public React bundle.

## Performance

Primary target: iPhone / Mobile Safari. Secondary: Android Chrome.

Use CSS-first transforms, opacity, masks, clip-path, gradients, layered textures and restrained parallax. Prefer compressed WebP/AVIF assets and lazy loading. Respect `prefers-reduced-motion`. Avoid heavy WebGL and unnecessary video/GIF payloads.

## Current placeholders / TBD

Do not fabricate:

- exact final colour hex codes beyond current design tokens
- final font decision
- final monogram/logo
- final translated copy approval
- family names/details
- couple-story biographical details
- dress codes
- final couple photography
- exact meal timings
- room allocations
- guest travel data
- pickup/drop schedules
- contact people
- WhatsApp destination number
- structured RSVP provider/endpoint
- guest list
- exact resort sub-venues
- final music track
- final tiger media asset
- final map configuration
- final Wyndham Garden imagery

Current generic imagery in the first build is deliberately temporary and must be replaced with approved assets before final launch.

## Master creative statement

The guest should feel that a private destination-wedding journey has begun before arriving in Jim Corbett. The forest establishes place, the tiger creates one memorable cinematic moment, the tiger becomes an engraved emblem, the passport opens into an editorial wedding story, each event becomes a chapter, logistics stay easy to find, and RSVP stays simple.
