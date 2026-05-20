# SkinChem

A skincare ingredient compatibility and risk-scoring app. Pick the actives and ingredients in your routine and SkinChem tells you which ones play nicely, which ones conflict, and how irritating or barrier-stressing the combination is likely to be.

## Features

- **Ingredient search** — browse and filter a catalog of skincare ingredients by name or family.
- **Compatibility engine** — checks every pair of selected ingredients against a rules table (synergies and conflicts).
- **Risk scoring** — aggregates irritation weight and barrier-stress weight across your selection so you can spot routines that are too aggressive.
- **Product recommendations** — surfaces products that fit your selected ingredient profile.
- **Subscription page** — placeholder for paid tiers.
- **Mobile-ready** — Capacitor projects for iOS and Android ship in `/ios` and `/android`.

## Tech stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Data fetching:** TanStack Query
- **Backend / DB:** Supabase (tables: `ingredients`, `compatibility_rules`)
- **Platform SDK:** Base44 SDK (`@base44/sdk`)
- **Mobile shell:** Capacitor 8 (iOS + Android)
- **Forms / validation:** React Hook Form + Hookform resolvers
- **Icons:** lucide-react

## Getting started

```bash
# install dependencies
npm install

# run the dev server
npm run dev

# production build
npm run build

# preview the production build
npm run preview

# lint
npm run lint
```

## Environment

The app reads Supabase credentials from environment variables. Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The Supabase database needs two tables:

- `ingredients` — at minimum: `id`, `name`, `family`, `irritation_weight`, `barrier_stress_weight`
- `compatibility_rules` — at minimum: `ingredient_1_name`, `ingredient_2_name`, plus the rule type (synergy / conflict) and any notes

## Project structure

```
src/
  api/              Supabase client
  components/       UI components (shadcn/ui)
  hooks/            Custom React hooks
  lib/              Utilities
  pages/            Home, ProductRecommendations, Subscription, Layout
  utils/            Helpers
  App.jsx           Root component
  main.jsx          Entry point
android/            Capacitor Android project
ios/                Capacitor iOS project
```

## Mobile builds

```bash
# build the web bundle, then sync into the native projects
npm run build
npx cap sync

# open the native IDE
npx cap open ios
npx cap open android
```

## License

Private — all rights reserved.
