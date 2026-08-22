# Gemini Independent Audit Prompt

Audit this repository as an independent senior frontend engineer, mobile UX reviewer, accessibility reviewer and performance reviewer.

Read these files first:

1. `PROJECT_SOURCE.md` — canonical product requirements
2. `AGENTS.md` — implementation guardrails
3. `src/content.js` — locked content data
4. `src/App.jsx` — experience and interaction logic
5. `src/styles.css` — visual system
6. `.github/workflows/deploy-pages.yml` — deployment

Do not redesign based on your own taste. The canonical source wins whenever your preference conflicts with a locked requirement.

## Audit dimensions

Score each area from 0–10 and give concrete evidence:

### 1. Requirement fidelity
- Couple names and spelling
- Dates/times
- Event titles
- Hashtag
- Jim Corbett / Wyndham Garden identity
- Bride-side and Groom-side perspective behaviour
- Language behaviour
- Single-page mobile-only objective
- Tiger usage hierarchy

### 2. Mobile UX
Review 320, 375, 390, 430 and 480 px widths.
Check:
- safe areas
- touch targets
- content clipping
- fixed navigation
- input usability
- Hindi wrapping
- button labels
- accidental horizontal scrolling

### 3. Visual fidelity
Assess whether the implementation feels like:
Luxury Indian Jungle × Jim Corbett × Fashion Editorial × Travel Passport × Cinematic Wedding Experience.

Flag anything that feels like:
- generic wedding template
- tourism website
- cartoon jungle
- government passport imitation
- overly dark horror aesthetic
- ordinary Bootstrap/card UI

### 4. Performance
Identify:
- oversized imagery
- render-blocking assets
- unnecessary repaints
- animation jank
- excessive DOM
- layout shift
- remote asset risk
- opportunities for WebP/AVIF/local optimisation

Give specific fixes ranked P0/P1/P2.

### 5. Accessibility
Check:
- semantic interactions
- keyboard behaviour
- contrast
- reduced-motion support
- sound controls
- form labels
- focus visibility
- ARIA correctness
- information availability without animation/audio

### 6. React/code quality
Check:
- state management
- effects and cleanup
- AudioContext lifecycle
- event handlers
- data duplication
- error handling
- brittle browser assumptions
- security/privacy risks
- maintainability

### 7. RSVP/privacy
Review:
- WhatsApp URL generation
- structured endpoint hook
- guest code handling
- localStorage behaviour
- risk of private guest data leaking into the public bundle
- validation and abuse considerations

### 8. GitHub Pages/deployment
Check:
- Vite base path
- CNAME handling
- GitHub Actions workflow
- build reproducibility
- custom-domain assumptions

### 9. Browser compatibility
Prioritise:
1. iPhone / Mobile Safari
2. Android Chrome

Pay special attention to:
- Web Audio
- `100svh`
- backdrop-filter
- CSS `min()` / env safe-area usage
- autoplay policies
- font loading

### 10. Source deviations
Create a final table:

| Requirement | Status | Evidence | Required fix |
|---|---|---|---|

Use only these statuses:
- PASS
- PARTIAL
- FAIL
- TBD-BY-SOURCE

Do not mark intentional placeholders as failures when `PROJECT_SOURCE.md` explicitly says they are TBD. Mark them `TBD-BY-SOURCE`.

## Final output

Return:
1. Executive summary
2. Scorecard
3. P0 blockers
4. P1 improvements
5. P2 polish
6. Source-deviation table
7. Exact code-level recommendations
8. Final verdict: SHIP / SHIP AFTER P0 / DO NOT SHIP
