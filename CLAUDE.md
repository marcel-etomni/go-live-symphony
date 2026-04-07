# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ET Omni is a static marketing/landing page website for a sales consultancy firm. It is built with Vite + TypeScript and styled with Tailwind CSS v4.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check with `tsc` then build with Vite
- `npm run preview` — Preview the production build

There are no tests or linting configured.

## Architecture

This is a single-page static site. The page content lives directly in `index.html` as semantic HTML sections (header, hero, about, industries, services, why-us, contact, footer). There is no SPA framework or client-side routing.

- **`index.html`** — Contains all page markup. Sections are identified by `id` attributes (`#hero`, `#about`, `#industries`, `#services`, `#why-us`, `#contact`).
- **`src/main.ts`** — Entry point. Currently only imports `style.css` (Vite starter boilerplate is commented out).
- **`src/style.css`** — Single `@import "tailwindcss"` (Tailwind v4 style).
- **`vite.config.ts`** — Uses `@tailwindcss/vite` plugin.

## Conventions

- Tailwind CSS v4 is used via the Vite plugin (`@tailwindcss/vite`), not PostCSS. Styles are applied with utility classes directly in HTML.
- Layout uses `data-slot` attributes for semantic component identification (e.g., `data-slot="section-header"`, `data-slot="section-col"`).
- Responsive breakpoints follow Tailwind defaults: `md:` (768px), `lg:` (1024px), `sm:` (640px).
- Max content width is `max-w-screen-2xl` with consistent horizontal padding (`px-6 md:px-8 lg:px-10`).
- Brand color: `#253a86` (dark blue, used for buttons/CTAs). Background: `#fafbfd`.
- Icons are inline SVGs (Heroicons style), not an icon library.
- TypeScript strict mode is enabled with `noUnusedLocals` and `noUnusedParameters`.
