---
layout: home

hero:
  name: "Velist"
  text: "Features-first fullstack framework"
  tagline: Build features, not folder structures. Powered by Elysia, Svelte 5, and Bun.
  image:
    src: /logo.svg
    alt: Velist
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/velist-framework/velist

features:
  - icon: 🗂️
    title: Vertical Slicing
    details: One folder = one complete feature. No more jumping between controllers, models, and views.
  
  - icon: ⚡
    title: Blazing Fast
    details: Powered by Bun runtime. Dev server starts in milliseconds. Build times measured in seconds.
  
  - icon: 🔒
    title: Type Safe
    details: End-to-end TypeScript from database schema to UI props. Catch errors at compile time.
  
  - icon: 🎨
    title: Inline Styling
    details: Tailwind CSS utility classes directly in your components. No atomic component abstractions.
  
  - icon: 🔄
    title: Inertia.js
    details: SPA experience without API complexity. Backend renders Svelte pages directly.
  
  - icon: 🚀
    title: Production Ready
    details: Built-in auth, dark mode, database migrations, and E2E testing with Playwright.
---

<style>
:root {
  --vp-home-hero-name-color: #6366F1;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #6366F1 30%, #14B8A6);
  --vp-button-brand-bg: #6366F1;
  --vp-button-brand-hover-bg: #4F46E5;
}
</style>
