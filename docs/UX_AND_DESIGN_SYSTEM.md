# UX Design System and Aesthetics (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the "Magical Journal" design system, token derivation, and user experience (UX) philosophies that define the visual sanctuary of Ruang Aksara.

## 1. The "Magical Journal" Philosophy

Ruang Aksara is not a social network; it is a **Digital Sanctuary**. Our design system reflects this through high-density white space, serif typography, and tactile HSL-based color palettes.

### 1.1 Tactile Depth & The "Paper" Metaphor
We treat the browser viewport as a physical piece of parchment.
- **Layering**: We avoid harsh "Drop Shadows" in favor of subtle border-radius (8px - 16px) and high-contrast focus states.
- **Immersion**: When a user enters the `ChapterPage`, we remove unnecessary navigational noise, allowing the literature to "Breathe."

## 2. HSL Design Token System

We utilize a centralized HSL (Hue, Saturation, Lightness) token system to ensure consistency across the dark and light modes of the sanctuary.

### 2.1 The Core Palette
- **Primary Sanctuary (Cream)**: `hsl(34, 45%, 90%)`. This is our "Parchment" mode. It is mathematically tuned to reduce eye strain by minimizing the blue-light spectrum.
- **Midnight (Dark Mode)**: `hsl(210, 15%, 10%)`. A charcoal-based dark mode that maintains high legibility without the harshness of pure black (`#000`).
- **Accent (Gold/Tan)**: `hsl(43, 60%, 45%)`. Used sparingly for call-to-action buttons (Publish, Follow) to signify "Sacred" interaction.

### 2.2 Typography Hierarchy
- **The Literary Voice (Serif)**: We utilize `IBM Plex Serif` for all long-form reading content. It is a typeface that balances historical authority with modern digital clarity.
- **The Interface Voice (Sans)**: We utilize `Inter` for all UI elements (labels, tags, numbers). `Inter` is chosen for its exceptional x-height and readability at small sizes.

## 3. Responsive UX Orchestration

A "Sanctuary" must feel good on every device.

### 3.1 Mobile-First Interactions
Given that 70% of readers consume novels on mobile devices, our UX priorities are:
- **Thumb-Zone Navigation**: Primary actions (Next Chapter, Bookmark) are placed in the lower third of the screen.
- **Haptic Feedback (PWA)**: On mobile, transitions between chapters use smooth ease-in-out transforms to mimic the turning of a physical page.

### 3.2 Desktop "Focus" Mode
On larger screens, we leverage the extra real-estate to provide "Side-Car" metadata:
- **Left Column**: Author profile and quick-stats.
- **Main Column**: The narrative content (Max width: 800px to maintain optimal characters-per-line).
- **Right Column**: Threaded social engagement (Goresan Diskusi).

## 4. Accessibility & Inclusive Design

The sanctuary is for everyone.
- **Contrast Ratios**: All text-to-background combinations meet WCAG 2.1 AAA standards for the "Cream" and "Dark" modes.
- **Dynamic Sizing**: As documented in `FEATURES.md`, the user has full control over root font size. Our layout is engineered with `rem` units, ensuring that increasing text size does not break the container layout.

## 5. Micro-Animations & Cognitive Load

We use motion to provide "Cognitive Satisfaction."
- **Skeleton States**: During parallel data fetching, we use pulsed skeleton loaders to provide an immediate "Shape" of the page, reducing perceived wait times to almost zero.
- **Revalidation Smoothness**: When a comment is submitted, a subtle "Fade-in" animation signals success, preventing the user from needing to hunt for their newly created content in the thread.

Document Version: 1.0.0