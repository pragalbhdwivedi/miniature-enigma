// Local production media uploaded for Kritica & Ashish.
// `new URL(..., import.meta.url)` works in both Vite builds and the raw-source fallback.

export const assets = {
  tiger: {
    brideMedallion: new URL('./images/tiger/tiger-medallion-bride.webp', import.meta.url).href,
    groomMedallion: new URL('./images/tiger/tiger-medallion-groom.webp', import.meta.url).href,
    frontMedallion: new URL('./images/tiger/tiger-medallion-front.webp', import.meta.url).href,
    forestPeek: new URL('./images/tiger/tiger-forest-peek.webp', import.meta.url).href,
    riverProfile: new URL('./images/tiger/tiger-river-profile.webp', import.meta.url).href,
    revealFront: new URL('./images/tiger/tiger-reveal-front.webp', import.meta.url).href,
    transitionEngraved: new URL('./images/tiger/tiger-transition-engraved.webp', import.meta.url).href,
  },
  bride: {
    portraitMain: new URL('./images/bride/bride-portrait-main.webp', import.meta.url).href,
    portraitDetail: new URL('./images/bride/bride-portrait-detail.webp', import.meta.url).href,
    familyIntro: new URL('./images/bride/bride-family-intro.webp', import.meta.url).href,
    mehendi: new URL('./images/bride/bride-mehendi.webp', import.meta.url).href,
    haldi: new URL('./images/bride/bride-haldi.webp', import.meta.url).href,
    jaimal: new URL('./images/bride/bride-jaimal.webp', import.meta.url).href,
  },
  groom: {
    portraitMain: new URL('./images/groom/groom-portrait-main.webp', import.meta.url).href,
    portraitDetail: new URL('./images/groom/groom-portrait-detail.webp', import.meta.url).href,
    familyIntro: new URL('./images/groom/groom-family-intro.webp', import.meta.url).href,
    sangeet: new URL('./images/groom/groom-sangeet.webp', import.meta.url).href,
    jaimal: new URL('./images/groom/groom-jaimal.webp', import.meta.url).href,
    pheras: new URL('./images/groom/groom-pheras.webp', import.meta.url).href,
  },
  couple: {
    hero: new URL('./images/couple/couple-hero.webp', import.meta.url).href,
    story01: new URL('./images/couple/couple-story-01.webp', import.meta.url).href,
    story02: new URL('./images/couple/couple-story-02.webp', import.meta.url).href,
    gallery: [
      new URL('./images/couple/couple-gallery-01.webp', import.meta.url).href,
      new URL('./images/couple/couple-gallery-02.webp', import.meta.url).href,
      new URL('./images/couple/couple-gallery-03.webp', import.meta.url).href,
      new URL('./images/couple/couple-gallery-04.webp', import.meta.url).href,
    ],
  },
  destination: {
    exterior: new URL('./images/destination/wyndham-garden-exterior.webp', import.meta.url).href,
    glassHall: new URL('./images/destination/wyndham-garden-glass-hall.webp', import.meta.url).href,
    night: new URL('./images/destination/wyndham-garden-night.webp', import.meta.url).href,
    pool: new URL('./images/destination/wyndham-garden-pool.webp', import.meta.url).href,
  },
}
