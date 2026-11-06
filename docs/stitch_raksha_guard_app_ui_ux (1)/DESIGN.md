---
name: Raksha Frontline
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4849'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707979'
  outline-variant: '#bfc8c9'
  surface-tint: '#29676c'
  primary: '#00464a'
  on-primary: '#ffffff'
  primary-container: '#1e5e63'
  on-primary-container: '#99d5db'
  inverse-primary: '#95d1d6'
  secondary: '#595f68'
  on-secondary: '#ffffff'
  secondary-container: '#dae0eb'
  on-secondary-container: '#5d636d'
  tertiary: '#830009'
  on-tertiary: '#ffffff'
  tertiary-container: '#af0010'
  on-tertiary-container: '#ffbab2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1edf3'
  primary-fixed-dim: '#95d1d6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#044f54'
  secondary-fixed: '#dde3ee'
  secondary-fixed-dim: '#c1c7d2'
  on-secondary-fixed: '#161c24'
  on-secondary-fixed-variant: '#414750'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Public Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg:
    fontFamily: Public Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: Public Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  title-lg:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  body-xl:
    fontFamily: Public Sans
    fontSize: 19px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Public Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  label-xl:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  label-lg:
    fontFamily: Public Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  counter-xl:
    fontFamily: Public Sans
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 48px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system is engineered specifically for frontline security personnel operating on Android devices across diverse field conditions—from direct sunlight checkpoints to late-night low-light patrols. The brand personality conveys calm authority, unwavering reliability, operational clarity, and immediate reassurance.

The visual style blends **Tactile Utilitarianism** with **Modern Industrial Minimalism**:
- **High-contrast legibility**: Every operational state, alert, and actionable zone is immediately decipherable at an arm's reach or under glare, catering to varying digital literacy and visual acuity.
- **Physical ergonomics**: Massive touch zones designed for gloved or single-handed thumb reach, eliminating accidental triggers while ensuring zero-hesitation emergency reporting.
- **Zero cognitive ambiguity**: UI patterns prioritize blunt functional clarity over decorative trends. Surfaces, badges, and alerts mirror physical safety instrumentation.

## Colors

The palette is tuned for high-contrast accessibility (exceeding WCAG AAA for core interactions) on low-cost IPS and AMOLED screens:

- **Primary (`#1E5E63` - Deep Sentinel Teal)**: Anchors identity, primary navigation states, and non-critical active elements. Communicates calm authority and vigilance.
- **Secondary (`#121820` - Obsidian Slate)**: Used for high-emphasis typography, critical structural boundaries, and persistent operational anchors.
- **Tertiary / SOS Alert (`#DC2626` - Signal Crimson)**: Exclusively reserved for Emergency/SOS workflows, silent distress, and critical threat flags. Never used for standard validation errors to preserve psychological urgency.
- **Operational Surface & Backgrounds**:
  - Global Canvas: `#F8FAFC` (Slate Tinted Off-White) to curb screen glare under direct sunlight.
  - Raised Surfaces / Action Cards: `#FFFFFF` (Pure White) with subtle structured borders.
  - Surface Subdued: `#F1F5F9` (Muted Foundation) for inactive fields and disabled wells.
- **Functional Semantics**:
  - Success / Active Duty / Check-in: `#15803D` (Field Green)
  - Warning / Shift Impending / Attention: `#B45309` (Amber Alert)
  - Info / Dispatch Notes: `#0369A1` (Direct Blue)

## Typography

The design system uses **Public Sans** uniformly. Built with federal and public-service rigor, its tall x-height, open counters, and robust letterforms prevent ink-bleed and character blurring on low-resolution Android screens.

- **Scale Enforcement**: Baseline minimum for operational body copy is set to `17px`, with field instructions set at `19px` (`body-xl`). Action button labels are fixed at `18px Bold` (`label-xl`) to ensure rapid thumb scanning.
- **Numerical Prominence**: Time-stamps, post check-in counters, and guard ID verification numbers leverage tabular figures with bold weights (`counter-xl`) for zero misinterpretation during audits.
- **Letter Spacing**: Extended tracking (`+0.015em` to `+0.025em`) is applied to capitalized badge indicators and status labels.

## Layout & Spacing

Layout geometry optimizes single-handed thumb zones within lower screen coordinates while fixing informational anchors up top.

- **Grid Model**: 4-column fluid mobile grid anchored by `16px` (`1rem`) outer margins and `16px` gutters. On foldables or rugged tablets, the grid expands to 8 columns with max-width content constraints (`560px` centered for forms).
- **Thumb Zone Hierarchy**:
  - The bottom 40% of the viewport is designated the Primary Action Zone, housing large touch targets (Clock-in, Shift Handover, Incident Log).
  - The middle 40% houses interactive contextual cards (Patrol Checkpoints, Shift Roster).
  - The top 20% is strictly informational (Current Site, Connectivity/GPS status, Guard ID).
- **Physical Padding Rule**: All tap containers maintain a minimum internal padding of `space-md` (`16px`), guaranteeing that touches slightly off-center still register reliably.

## Elevation & Depth

Visual hierarchy uses **Tactile Tonal Layering** combined with crisp structural outlines, eschewing soft blurred shadows that become invisible under sunlight:

- **Level 0 (Floor Canvas)**: `#F8FAFC`. Completely flat background foundation.
- **Level 1 (Operational Cards)**: `#FFFFFF` background bound by a continuous `1.5px` border in `#E2E8F0` with a sharp, low-deflection contact drop: `0px 2px 4px rgba(18, 24, 32, 0.06)`.
- **Level 2 (Active Shifts / Critical Triggers)**: High-priority cards feature a left visual spine (`6px` solid status bar) and elevated offset: `0px 4px 12px rgba(18, 24, 32, 0.12)`.
- **Level 3 (Sticky Bottom Bar & Guarded SOS)**: Heavy structural isolation using `#FFFFFF` with an upper border of `1.5px` in `#CBD5E1` and ambient elevation `0px -4px 16px rgba(18, 24, 32, 0.08)`.

## Shapes

The interface balances friendly approachability with structural discipline using roundedness level `2`:

- **Primary & Operational Cards**: `16px` (`rounded-lg`) corner radii, generating distinct visual separation between discrete shifts or tasks.
- **Interactive Action Buttons**: `12px` to `16px` rounded corners, ensuring the target appears physically depressable like industrial machinery buttons.
- **Status Pills & Micro-Indicators**: Fully rounded pill shapes (`9999px`) for shift badges, GPS sync status, and verification tags.
- **Guarded SOS Trigger**: A dedicated rounded shield container (`20px`) with distinct physical inset styling to visually warn against accidental touch.

## Components

### 1. Buttons & Touch Targets
- **Primary Operational Button (Punch-in / Complete Patrol)**:
  - Height: Minimum `60px` (exceeding standard 48px guidelines).
  - Background: `#1E5E63` default, `#164E52` pressed. High-contrast white label (`label-xl`).
  - Tactile feedback: Visible 2px inset displacement on press, paired with native haptic confirmation.
- **Guarded Emergency / SOS Button**:
  - Visuals: `#DC2626` background with bold warning icons and plain text "EMERGENCY SOS".
  - Interaction Safety: Requires a "Press & Hold for 3 Seconds" circular progress fill mechanism or a continuous horizontal swipe-slider (`64px` height) to trigger, eliminating accidental dispatch.

### 2. Cards & Checkpoint Trackers
- Encased in pure white `#FFFFFF` surfaces with `16px` radius and `1.5px` solid `#E2E8F0` outline.
- Checkpoint items feature prominent tick-targets (`44px x 44px` physical tap area) paired with real-time timestamps in high-contrast slate.

### 3. Form Inputs & Text Fields
- Minimum height of `56px` with 16px horizontal internal clearance.
- Borders: `2px` solid `#CBD5E1` in rest state, transitioning to `2.5px` solid `#1E5E63` on focus with no delicate micro-labels; labels remain pinned above the input in `15px bold` for clear context during quick data entry.

### 4. Checkboxes, Radios & Switches
- Checkbox/Radio size: `28px x 28px` hit targets enclosed in a `48px` minimum bounding touch zone.
- Active states use thick vector checkmarks (`3px` stroke) rendered in `#FFFFFF` on `#1E5E63` or `#15803D`.

### 5. Chips & Shift Badges
- Height: `36px` to `40px` with bold typography (`14px` to `16px`).
- Duty state tags employ high-saturation background tints (e.g., `#DCFCE7` for On-Duty with `#15803D` text) to communicate state instantly across the roster.

### 6. Bottom Navigation Bar
- Fixed height: `72px` (excluding OS navigation inset) housing 4 persistent sections: **Home**, **Schedule**, **Attendance**, and **More**.
- Top border: `1.5px` solid `#CBD5E1`.
- Targets: Symmetrical 25% screen-width tap areas with `28px` dual-tone icons positioned directly above `13px Bold` labels. Active state highlighted with `#1E5E63` icon and text plus an active top-notch indicator.