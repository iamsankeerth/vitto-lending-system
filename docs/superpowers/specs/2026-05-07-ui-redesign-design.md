# Vitto Lending — UI Redesign Spec

**Date:** 2026-05-07
**Topic:** Frontend UI redesign (no feature changes)
**Design direction:** C — Bold & Modern

## Overview

Redesign the Vitto Lending Decision System frontend UI. Zero feature changes. Zero API changes. No component restructuring — same React components (`App.jsx`, `ApplicationForm.jsx`, `DecisionResult.jsx`), completely restyled with Tailwind CSS. Target: warm, confident fintech feel for MSME loan applicants.

## Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Amber primary | `#f59e0b` → `#d97706` | Buttons, accents, highlights, focus rings |
| Amber light | `#fefce8` | Warning metric cards, highlighted chips |
| Slate dark | `#0f172a` → `#1e293b` | Header background, card text |
| Slate mid | `#475569` | Labels, secondary text |
| Slate light | `#f8fafc` → `#fafbfc` | Page background, input backgrounds |
| Slate border | `#e2e8f0` | Input borders, separators |
| Success | `#16a34a` / bg `#f0fdf4` | Approved status bar, healthy metrics |
| Danger | `#dc2626` / bg `#fef2f2` | Rejected status bar, error borders, at-risk metrics |
| White | `#fff` | Card backgrounds |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Page heading | Georgia, serif | 700 | `text-2xl` (1.5rem) |
| Card headings | Inter, sans-serif | 700 | `text-base` |
| Labels | Inter, sans-serif | 600 | `text-xs` uppercase tracking |
| Body text | Inter, sans-serif | 400 | `text-sm`/`text-base` |
| Score number | Courier New, monospace | 700 | `text-3xl` |
| Brand badge | Inter, sans-serif | 800 | `text-xs` |

### Shapes & Spacing

- Card border radius: `rounded-xl` (12px)
- Input border radius: `rounded-lg` (8px)
- Button border radius: `rounded-xl` (12px)
- Chip border radius: `rounded-full`
- Base gap: `gap-3` (12px) for grids, `gap-4` (16px) for sections

### Shadows

- Card: `shadow-md` (0 4px 6px rgba(0,0,0,0.07))
- Button (amber): `shadow-lg shadow-amber-500/40`
- Subtle: `shadow-sm`

## Layout

Single-page scroll layout (no wizard steps, no side-by-side). All content in a centered container (`max-w-2xl mx-auto`).

### Section Order (top to bottom)

1. **Header** — dark gradient banner with logo, heading, subtext, amber glow orb (desktop only)
2. **Business Profile card** — connected via timeline dot (amber = active step)
3. **Loan Details card** — connected via timeline dot (gray = pending step)
4. **Action buttons** — gradient submit + outlined reset, side-by-side on desktop, stacked on mobile
5. **Decision Result card** — appears below buttons only after submission (concealed otherwise)
6. **Error/State cards** — appear inline when applicable

### Visual Connector

A vertical timeline line + dots connect the two form cards:
- Line: `2px`, gradient amber→slate, positioned `left: 16px`
- Dot: `18px` circle, amber for active, slate for pending
- Hidden on mobile (`hidden sm:block`)

## Components

### Header

- Full-width dark gradient background: `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`
- Amber glow orb: `radial-gradient` circle, positioned top-right, `hidden sm:block`
- Logo: 34px amber square with "V" + "VITTO" brand text
- Heading: `text-2xl font-extrabold` white, max-width 450px
- Subtext: `text-sm text-slate-400`
- Padding: `p-8 sm:p-12`

### Form Cards

Each card has:
- Left-positioned timeline dot (absolute positioned)
- Card heading: bold, dark slate, step label below
- 2-column grid (`grid grid-cols-1 sm:grid-cols-2 gap-4`)
- Background: white, `rounded-xl`, `shadow-md`, `p-6`

### Input Fields

- Label: `text-xs font-semibold text-slate-600 mb-1`
- Input: `border-[1.5px] border-slate-200 rounded-lg bg-slate-50 px-3 py-2.5 text-sm`
- Focus: `border-amber-500 ring-2 ring-amber-500/20 outline-none transition-colors duration-200`
- Error: `border-red-500 text-red-600`, error message: `text-xs text-red-600 mt-1`
- Placeholder: `text-slate-400`

### Select Fields

Same styling as inputs. Options rendered from constants (`BUSINESS_TYPES`, `PURPOSES`).

### Submit Button

- Full gradient: `bg-gradient-to-r from-amber-500 to-amber-600`
- Hover: `from-amber-600 to-amber-700`, scale(1.02), shadow expansion
- Text: `text-white font-bold px-6 py-4 rounded-xl shadow-lg shadow-amber-500/40`
- Disabled: `opacity-60 cursor-not-allowed`
- Loading: spinner replaces text, button text changes to "Processing..."

### Reset Button

- Outlined: `border border-slate-200 bg-white text-slate-500 font-semibold rounded-xl`
- Hover: `border-slate-300 bg-slate-50 transition-colors duration-150`
- Padding: `px-6 py-4`

### Decision Result Card

Two variants: approved (green) and rejected (red).

**Status Bar (top of card):**
- Full-width colored bar: `bg-green-600` or `bg-red-600`
- Left: status text ("Approved" / "Rejected")
- Right: score badge (`bg-white/20 rounded-lg px-3 py-1 font-bold text-sm`)
- Padding: `px-6 py-4`

**Metrics Grid:**
- 2-col on all sizes (`grid grid-cols-2 gap-3`)
- Each metric: colored background (`bg-green-50` for healthy, `bg-red-50` for at-risk, `bg-amber-50` for warning, `bg-slate-50` for neutral)
- Each: `p-4 rounded-xl`, label `text-xs text-slate-500`, value `font-bold text-base`

**Reason Codes:**
- Row of chips, wrapped with flex-wrap
- Each chip: solid background color matching severity, `rounded-full px-3 py-1.5 text-xs font-bold`

## States

### Initial / Empty
- Dashed border placeholder card below form: "No application yet" with pen icon
- Subtext: "Fill in your business profile and loan details above to receive an instant credit decision."

### Loading
- Spinner (`animate-spin`) inside submit button
- Button text: "Processing..."
- Progress hint below buttons: "Creating profile → Submitting application → Evaluating..."
- All inputs and reset button: `disabled` + `opacity-50`

### Validation Error (Client-side)
- Error summary banner at top of first card: red bg, count of errors, warning icon
- Each invalid field: red border, red label text, error message below field
- Optional: animate-shake on offending fields (300ms, once)

### Validation Error (Server-side)
- Error details from server merged into form: same visual treatment as client-side
- Server error message text parsed from structured error response

### Server / Network Error
- Error card: white card with red circle icon + heading "Something went wrong"
- Message below heading
- "Try Again" button (outlined style) to retry submission

### Success
- Result card slides in below buttons: `animate-slide-up` (400ms, translateY(16px)→0 + opacity 0→1)
- Score donut animates fill from 0deg (700ms CSS transition)
- Score number counts up from 0 (useEffect counter)
- Reason chips fade in staggered (50ms stagger per chip)
- Form stays filled (user can adjust and re-submit)

## Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| < 640px (mobile) | Form: single column. Metrics: 2 columns. Header glow: hidden. Buttons: stacked full-width. Timeline dots: hidden. Container: `px-4`. Score donut: 100px. |
| ≥ 640px (tablet+) | Form: 2 columns. Metrics: 2 columns. Header glow: visible. Buttons: side-by-side. Timeline dots: visible. Container: `max-w-2xl`. Score donut: 130px. |

## Animations & Micro-interactions

### Custom Tailwind Animations (added to config)

```js
keyframes: {
  'slide-up': {
    '0%': { opacity: '0', transform: 'translateY(16px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'shake': {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-4px)' },
    '75%': { transform: 'translateX(4px)' },
  },
}
```

### Animation Rules

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Result card | slide-up | 400ms | On decision received |
| Score donut fill | conic-gradient CSS transition | 700ms | On decision received |
| Score number | count-up (JS interval) | 700ms | On decision received |
| Reason chips | opacity 0→1, staggered | 50ms/chip | On decision received |
| Input focus | border + ring color change | 200ms | On focus |
| Button hover | scale(1.02) + shadow expand | 150ms | On hover |
| Error shake | translateX oscillation | 300ms | On validation fail (once) |

### Reduced Motion

All animations wrapped in `motion-safe:` or checked via `matchMedia('prefers-reduced-motion')`. When reduced motion is preferred, all transitions are instant (duration-0).

## Implementation Scope

### Files Changed

| File | Change |
|------|--------|
| `frontend/package.json` | Add `tailwindcss`, `postcss`, `autoprefixer` as devDependencies |
| `frontend/tailwind.config.js` | New file: custom colors, fonts, keyframes |
| `frontend/postcss.config.js` | New file: tailwind + autoprefixer |
| `frontend/src/index.css` | Replace `styles.css`: Tailwind directives + base layer |
| `frontend/src/App.jsx` | Tailwind classes on container, header |
| `frontend/src/features/application/ApplicationForm.jsx` | Tailwind classes on form cards, inputs, buttons, error states |
| `frontend/src/features/application/DecisionResult.jsx` | Tailwind classes on result card, score, metrics, chips |
| `frontend/src/styles.css` | Deleted (replaced by Tailwind) |

### Files NOT Changed

| File | Reason |
|------|--------|
| `frontend/src/lib/api/client.js` | No API changes |
| `frontend/src/lib/validation/pan.js` | No validation logic changes |
| `frontend/src/main.jsx` | Unchanged entry point |
| `backend/**` | UI redesign only |
| `docker-compose.yml` | No infra changes |

### New Dependencies

Only Tailwind CSS v3 utility stack:
- `tailwindcss`
- `postcss`
- `autoprefixer`

## Non-Goals

- No feature additions or removals
- No API changes
- No backend changes
- No new components (same React component tree)
- No routing changes
- No database schema changes
- No testing changes (existing test suite runs as-is)

## Edge Cases Preserved

All existing edge case handling from the original implementation is preserved:
- Missing fields: client + server validation with structured errors
- Invalid formats (PAN, negative numbers): red border + field message
- Conflicting data: valid request accepted, decision rejected with reason codes
- Database failures: graceful error response (unchanged)
- Rate limiting: 429 responses (unchanged backend)
