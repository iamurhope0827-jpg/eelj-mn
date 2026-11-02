---
name: Ээлж
description: Ulaanbaatar wayfinding for a student shift marketplace.
colors:
  signal-yellow: "#f8d818"
  graphite: "#232428"
  enamel: "#f8f8f6"
  secondary-ink: "#62646e"
  rule: "#d9dadd"
  soft-surface: "#eeefed"
  demo-red: "#cf3531"
typography:
  display:
    fontFamily: "Fira, Arial, sans-serif"
    fontSize: "clamp(40px, 4.05vw, 66px)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Fira, Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Fira, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  control: "9px"
  sign: "18px"
  badge: "4px"
spacing:
  compact: "8px"
  related: "12px"
  control: "16px"
  group: "24px"
  section: "55px"
components:
  button-primary:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.enamel}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "#404145"
  button-secondary:
    backgroundColor: "{colors.soft-surface}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.control}"
    padding: "13px 22px"
---

# Design System: Ээлж

## Overview

**Creative North Star: “Ulaanbaatar Wayfinding”**

Signal yellow directs attention to the search task. Graphite lettering, an enamel ground, simple arrows, and ruled rows make shifts easy to compare. Employer and student screens share the same type, controls, and spacing.

**Key Characteristics:**

- Bold direction signs with legible Mongolian Cyrillic.
- Open, ruled lists that expose pay, time, and location.
- Compact controls and clear feedback for practical tasks.

## Colors

Yellow anchors search and selected highlights. Graphite carries primary text and actions; secondary ink carries context. Red identifies demonstration mode. Received, reviewing, selected, declined, and withdrawn statuses use individual tinted badges and explicit text.

**The Signal Rule.** Reserve the strongest yellow areas for search or a meaningful detail such as shift pay. Keep long reading surfaces enamel.

## Typography

Self-hosted Fira Sans supplies regular, medium, bold, and bold italic. The wordmark uses bold italic. Desktop job titles are 27px, reducing to 23–25px at narrower breakpoints. Workspace headings are 44px desktop and 33px phone. Small labels range from 12 to 14px.

**The Comparison Rule.** Keep pay, time, district, and status labels consistent across listings. Use tabular numerals for counts and financial details.

## Layout

Main content has 42px side margins, then 24px below 1100px and 20px below 760px, with a 1536px maximum. Listings use a desktop grid, a four-column intermediate layout, and two-column metadata under a full-width title on phones. Employer rows stack at 760px.

The search sign has two halves on desktop and stacks on phones. Dialogs use a 620px right-side sheet and fill narrow screens. Fields use two columns with full-width descriptions.

## Elevation & Depth

The search sign has a low ambient shadow; toasts have a diffuse shadow. Other lists and sections use rules. A modal sheet has a darkened backdrop with 2px blur.

## Shapes

The sign uses a 6px graphite border and 18px radius, reducing to 4px and 13px on phones. Controls use 9px corners; status badges use 4px corners. Circular demo markers and workflow numbers have specific semantic roles.

## Components

- Primary buttons use graphite with enamel text, at least 48px height by default. Hover changes the surface to `#404145`; press moves the button 1px.
- Secondary buttons use a soft fill or thin outline. Bookmark controls show a saved state with yellow fill and `aria-pressed`.
- Inputs have a thin neutral border, white fill, and at least 48px height. Search selects sit on the yellow sign.
- Navigation uses a yellow active underline. Employer tabs use a graphite rule and support arrow keys.
- Status badges always include text; color is supplementary.
- Native dialogs support focus trapping, Escape dismissal, and a labeled close button. Their entrance lasts 300ms with the shared ease curve; reduced motion removes the animation.

## Do's and Don'ts

- Do preserve the yellow search sign as the home page's visual anchor.
- Do show specific time, pay, and district information together.
- Do use Mongolian copy and self-hosted fonts with Cyrillic coverage.
- Do keep demonstration labels visible.
- Don't hide core job information in decorative cards.
- Don't rely only on color for statuses or selected controls.
