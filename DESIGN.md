---
name: Ээлж
description: Monochrome, Geist-based interface for a student shift marketplace.
colors:
  palette: ["#F5E9E7 blush", "#ECC5C6 rose", "#C1C0C2 mist", "#8A9DB1 slate", "#837D68 olive"]
  background: "#F5E9E7"
  surface: "#FBF6F5"
  background-2: "#F0E2DF"
  ink: "#2B2924"
  muted: "#655F4C"
  faint: "#6E6854"
  line: "#E6D7D4"
  line-strong: "#C1C0C2"
  accent: "#ECC5C6"
  focus-slate: "#4F657D"
  demo-red: "#B23A44"
  dark-background: "#1B1A17"
  dark-surface: "#23211D"
  dark-ink: "#F5E9E7"
  dark-primary: "#ECC5C6"
typography:
  sans: "Geist (variable, self-hosted), Fira Sans for ₮ only"
  mono: "Geist Mono (variable, self-hosted)"
  display:
    fontSize: "clamp(40px, 6.4vw, 76px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.055em"
  page-title:
    fontSize: "36px"
    fontWeight: 600
    letterSpacing: "-0.05em"
  body:
    fontSize: "14–16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "6px"
  card: "12px"
  pill: "999px"
---

# Design System: Ээлж

## Overview

A quiet developer-tool layout in a soft five-color palette (blush, rose, mist, slate, olive): blush canvas with lighter card surfaces, hairline borders, Geist type with tight negative tracking, and Geist Mono for numbers. Color is reserved for meaning, either status badges or the red demo marker. The UI follows the system light/dark preference automatically.

## Color

Every color is a CSS custom property on `:root`, and dark mode redefines the same tokens under `prefers-color-scheme: dark`. Don't hard-code colors in components. Use `--ink`, `--muted`, `--faint`, `--line`, `--line-2`, `--bg-2`, `--hover`, and the badge pairs `--b-{gray,blue,amber,green,red}` / `-t`.

- The page is `--bg` (blush); cards, inputs, dialogs and the search bar use `--surface`.
- Rose (`--accent`) is the highlight: active filter chips, the nav count, text selection and the hero glow. Slate tints the hero glow and gradient.
- Text uses darkened olive (`--muted`, `--faint`) because the raw palette olive and slate fall below 4.5:1 on blush.
- Primary actions use `--dark-bg`/`--dark-fg`: warm ink on blush in light mode, and a rose button with ink text in dark mode.
- Focus is a 2px dark-slate ring offset by the background (`--focus`).
- Red only marks the prototype/demo state.

## Typography

- Headings: weight 600 with negative letter-spacing (−0.04em to −0.055em). The hero headline uses a subtle top-to-bottom ink gradient.
- Numbers (pay, times, counts, step indices, metadata) use Geist Mono with tabular figures.
- Geist lacks ₮, so a `Tugrik` face loads Fira Sans for U+20AE only.

## Layout

The content column is 1200px max, with 24px gutters (16px on phones). The header is sticky with a blurred translucent background and a bottom hairline. The hero greets the student ("Өдрийн мэнд!" plus the name saved from their last application, if any), centered over a faded 56px grid and left-aligned on phones.

## Surfaces

- Cards use the `--shadow` ring (a 1px shadow, no border) with a 12px radius: the job list, application list, guide steps, summary stats and role options.
- Lists inside cards are separated by 1px `--line` rules; rows get `--bg-2` on hover.
- Floating elements (search bar, toast) use `--shadow-lg`.
- The details/apply sheet slides in from the right (560px), with a dimmed, blurred backdrop.

## Components

- Buttons: 40px tall (36px in rows, 32px in the header and management rows), 6px radius, 14px/500. Variants: `button-dark` (primary) and `button-outline`/`button-soft` (inset 1px ring).
- Inputs/selects: 40px, inset 1px ring, ink ring plus a soft halo on focus.
- Badges: 22px pill, tinted background, always with text.
- Tabs: muted text; the selected tab is ink with a 2px underline. Counts appear in mono pills.

## Do's and Don'ts

- Do keep pay, time, district and status in the same columns across rows.
- Do keep the demo labels visible (header pill, sheet pill, employer notice).
- Do use tokens so dark mode keeps working.
- Don't add colors outside the palette; build hierarchy through weight, size and tone.
- Don't rely on color alone for status.
