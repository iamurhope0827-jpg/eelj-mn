---
name: Ээлж
description: Monochrome, Geist-based interface for a student shift marketplace.
colors:
  background: "#ffffff"
  background-2: "#fafafa"
  hover: "#f2f2f2"
  ink: "#171717"
  muted: "#666666"
  faint: "#8f8f8f"
  line: "#ebebeb"
  line-strong: "#d4d4d4"
  focus-blue: "#006bff"
  demo-red: "#e5484d"
  dark-background: "#0a0a0a"
  dark-ink: "#ededed"
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

A quiet, monochrome developer-tool aesthetic: white (or near-black) canvas, hairline borders, Geist type with tight negative tracking, and Geist Mono for numbers. Color is reserved for meaning, either status badges or the red demo marker. The UI follows the system light/dark preference automatically.

## Color

Every color is a CSS custom property on `:root`, and dark mode redefines the same tokens under `prefers-color-scheme: dark`. Don't hard-code colors in components. Use `--ink`, `--muted`, `--faint`, `--line`, `--line-2`, `--bg-2`, `--hover`, and the badge pairs `--b-{gray,blue,amber,green,red}` / `-t`.

- Primary actions use `--dark-bg`/`--dark-fg`. These invert in dark mode, so the primary button becomes light-on-dark.
- Focus is a 2px blue ring offset by the background (`--focus`).
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
- Don't introduce brand colors for decoration; use hierarchy through weight, size and grey levels.
- Don't rely on color alone for status.
