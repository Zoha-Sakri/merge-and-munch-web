# Web Full Game Plan

## Product
Merge & Munch Web is the playable reference for an original farming-city game. Grow crops, collect cattle goods, merge ingredients, serve citizen orders, earn coins/stars/happiness, upgrade community buildings and restaurants, decorate the valley, and explore the Ancient City.

## Loop
Farm production -> market merge board -> customer order -> reward -> town upgrade -> new unlock. Every action must provide clear feedback and persist important progress in local storage.

## Web Systems
Use React state and existing components in `src/main.tsx`; use shared merge contracts in `shared/`; add rule tests in `tests/`. Implement crop/animal readiness, board movement/merges, orders with patience and quantity, building levels/costs/benefits, happiness, decorations, tunnel depth, daily goals, and save migrations.

## UX Bar
Use Fredoka for display and Nunito Sans for readable interface text. Make icons labeled, popups actionable, buttons touch-friendly, responsive, accessible, and visually consistent with the fresh green/citrus market direction. Support reduced motion and contrast preferences.

## Originality
Do not copy Farm City or any other game's protected branding, assets, writing, characters, maps, exact layouts, item catalogs, or progression. All content must be original.

## Agent Process
Identify the state owner, make a small change, run the focused test/build, then review narrow and wide layouts. Do not hide errors or claim unrun checks.

## Validation
`npm test && npm run build`; finish with `git diff --check`.
