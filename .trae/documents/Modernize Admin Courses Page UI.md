## Goals
- Elevate `app/(admin)/admin/dashboard/courses/page.jsx` to a modern, professional admin UI.
- Meet accessibility (contrast, focus states), responsiveness, performance and consistency with the reference page styling.

## Color & Theming
- Define a cohesive palette aligned to existing brand:
  - Primary: `red-600/700` (actions), Secondary: `blue-600/700`, Success: `green-600/700`, Warning: `yellow-600/700`, Neutral: `gray-50–900`.
- Enforce WCAG contrast ratios by adjusting text/background combinations (e.g., light text on `dark:bg-*` and dark text on `bg-white`).
- Provide consistent focus rings (`focus:ring-2 focus:ring-red-500`) and hover states.

## Typography & Spacing
- Establish hierarchy using Tailwind utilities:
  - Headers: `text-3xl font-bold`, section titles: `text-xl font-semibold`, labels: `text-sm font-medium`.
- Normalize spacing (8px grid) via Tailwind: `space-y-6`, `gap-6`, `px-6 py-3` across cards and controls.

## Components & Interactions
- Cards: Convert all gradient cards to consistent elevated cards using `bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700` (matching reference).
- Inputs: Use styled inputs with icon-leading search (`relative` + icon) and consistent borders.
- Buttons: Keep the primary CTA styling, add subtle motion (`transition-colors`, scale via `hover:scale-[1.01]` where appropriate).
- Badges: Standardize status pills with semantic colors and accessible text.
- Replace `alert()` error messages with `react-toastify` toasts (ToastContainer already present in admin layout).

## Responsiveness
- Ensure layouts collapse gracefully:
  - Header: two-column → one-column stack on `<md`.
  - Stats: maintain `grid-cols-1 md:grid-cols-3`.
  - Table: keep `overflow-x-auto` with sticky headers on larger screens.
- Make pagination controls touch-friendly with larger hit areas.

## Advanced Styling (CSS Module)
- Introduce a local CSS module `courses.module.css` (scoped to this page) for tasteful modern effects:
  - Glassmorphism (optional, light touch): `.glass` with backdrop-blur and subtle translucent borders for panels where appropriate.
  - Motion utilities (reduced-motion aware) and fine-grained shadows.
- Apply module classes selectively to header wrapper and filter bar to enhance visual quality without overusing effects.

## Performance
- Debounce the search term (300ms) to reduce fetches.
- Memoize table columns and derived UI values to avoid re-renders.
- Optimize stats fetching:
  - Avoid a second `listCourses` call on every fetch when possible; fetch once on mount (size=200) and cache counts in state.
- Prefer CSS transforms for hover animations to minimize layout reflow.

## Loading & Error Visuals
- Replace full-screen spinner with:
  - Stats skeleton cards (animated shimmer).
  - Table skeleton rows (5–8 placeholder rows) while fetching.
- Error card component for fetch errors with retry button and helpful copy.

## Accessibility
- Add `aria-label`s on icon-only controls: view, edit, delete, pagination.
- Maintain visible focus indicators on interactive elements.
- Ensure semantic headers for table and proper button roles.

## Code Changes (High-Level)
1. Update card, header, and input/button classes to consistent styling used across admin pages.
2. Add `toast.error`/`toast.success` to replace `alert()` on edit/delete failures/success.
3. Implement debounced search with `useEffect` and a `setTimeout` (cancellable) feeding `fetchCourses`.
4. Add lightweight skeletons and an error card inline within the page component (no external deps).
5. Add optional CSS module `courses.module.css` and import it into `page.jsx` for scoped advanced effects; apply to header/filter containers.
6. Adjust pagination to ensure disabled states and accessible labeling.
7. Memoize `columns` via `useMemo` (already present); ensure dependency array excludes unstable references.

## Acceptance Criteria Mapping
- 1/2/5/7: Palette, elevation cards, consistent typography and optional glassmorphism via CSS module.
- 3: Buttons/inputs/table rows get `transition-*` and transform-based hover.
- 4: Grid and table remain responsive; header stacks on mobile.
- 8: Debounced search; memoization; fewer reflows.
- 9: Skeletons and error card; toasts for operations.
- 10: Visual quality matches or exceeds current reference page styling.

## Delivery
- Modify `courses/page.jsx` classes and logic.
- Create `courses.module.css` co-located and apply selective classes.
- No new external libraries; Tailwind and existing components only.

Please confirm, and I will implement these changes directly, updating `courses/page.jsx` and adding the scoped CSS module with the enhancements described.