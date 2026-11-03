---
name: Ээлж
description: Monochrome, Geist-based interface for a student shift marketplace.
colors:
  palette: ["#FFFFFF white", "#BBBFBF mist", "#878787 grey", "#05AD98 teal"]
  background: "#FFFFFF"
  background-2: "#F6F7F7"
  ink: "#1C1F1F"
  muted: "#5E6262"
  faint: "#6B6F6F"
  line: "#E4E6E6"
  line-strong: "#BBBFBF"
  primary: "#05AD98 (text #062A25)"
  teal-text: "#048A79"
  accent-tint: "#DDF4F0 (text #03695D)"
  demo-red: "#D93F45"
  dark-background: "#121414"
  dark-surface: "#1A1D1D"
  dark-ink: "#F2F4F4"
typography:
  headings: "Oswald (variable, self-hosted), weight 600, near-zero tracking"
  body: "Roboto (variable, self-hosted)"
  top-bar: "Geist (variable, self-hosted)"
  mono: "Geist Mono (variable, self-hosted)"
  display:
    fontSize: "clamp(40px, 6.4vw, 76px)"
    fontWeight: 600
    lineHeight: 1.05
  body-size: "14–16px, line-height 1.6"
rounded:
  control: "6px"
  card: "12px"
  pill: "999px"
---

# Design System: Ээлж

## Overview

A quiet developer-tool layout in a white, grey and teal palette: white canvas with ring-shadow cards, hairline borders, Geist type with tight negative tracking, and Geist Mono for numbers. Color is reserved for meaning, either status badges or the red demo marker. The UI follows the system light/dark preference automatically.

## Color

Every color is a CSS custom property on `:root`, and dark mode redefines the same tokens under `prefers-color-scheme: dark`. Don't hard-code colors in components.

- Teal `#05AD98` is the primary color: main buttons, the logo mark, the hero glow and text selection. White text on this teal is only 2.8:1, so buttons use dark text `#062A25`, which gives 5.5:1.
- Teal as text (the "Ээлж." heading, the focus ring) uses `--teal-text` `#048A79`, which keeps 3:1 or better for large text on white.
- Greys: `#BBBFBF` for strong borders and control outlines, `#878787` for the headline gradient and the hero grid. Small grey text uses `--muted` `#5E6262` and `--faint` `#6B6F6F`, because `#878787` is only 3.6:1 on white.
- Teal tint `--accent` (`#DDF4F0` with `#03695D` text) marks active filter chips, the nav count and the selected status.
- Status badges also use semantic amber, blue and red tints. Red marks the demo state.

## Typography

- **Headings** (h1–h4, job titles, dialog and page titles) use Oswald through `--display`. It is already condensed, so letter-spacing stays near zero. Don't apply the old negative tracking.
- **Body text**, buttons, labels and forms use Roboto through `--font`. Roboto includes ₮.
- **The top bar** (logo, nav, account button) uses Geist so it matches the published header.
- **Numbers** (pay, times, counts, step indices, demo pills) use Geist Mono with tabular figures. Geist has no ₮, so a `Tugrik` face supplies that glyph from Fira Sans.
- Fonts are self-hosted from `assets/fonts/`, as Latin and Cyrillic subsets loaded by `unicode-range`. Any new font must include basic Cyrillic (U+0400–045F) plus Өө (U+04E8/04E9) and Үү (U+04AE/04AF). Fjalla One, for example, lacks basic Cyrillic and can't be used.

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
