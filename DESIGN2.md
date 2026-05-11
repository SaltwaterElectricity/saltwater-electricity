---
name: AlonKuryente Visual Language
colors:
  surface: "#f7f9fb"
  surface-dim: "#d8dadc"
  surface-bright: "#f7f9fb"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f4f6"
  surface-container: "#eceef0"
  surface-container-high: "#e6e8ea"
  surface-container-highest: "#e0e3e5"
  on-surface: "#191c1e"
  on-surface-variant: "#434654"
  inverse-surface: "#2d3133"
  inverse-on-surface: "#eff1f3"
  outline: "#737685"
  outline-variant: "#c3c6d6"
  surface-tint: "#0c56d0"
  primary: "#003d9b"
  on-primary: "#ffffff"
  primary-container: "#0052cc"
  on-primary-container: "#c4d2ff"
  inverse-primary: "#b2c5ff"
  secondary: "#006688"
  on-secondary: "#ffffff"
  secondary-container: "#00c1fd"
  on-secondary-container: "#004b65"
  tertiary: "#004d3d"
  on-tertiary: "#ffffff"
  tertiary-container: "#006753"
  on-tertiary-container: "#22edc3"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#dae2ff"
  primary-fixed-dim: "#b2c5ff"
  on-primary-fixed: "#001848"
  on-primary-fixed-variant: "#0040a2"
  secondary-fixed: "#c2e8ff"
  secondary-fixed-dim: "#75d1ff"
  on-secondary-fixed: "#001e2b"
  on-secondary-fixed-variant: "#004d67"
  tertiary-fixed: "#42fdd3"
  tertiary-fixed-dim: "#00e0b8"
  on-tertiary-fixed: "#002019"
  on-tertiary-fixed-variant: "#005141"
  background: "#f7f9fb"
  on-background: "#191c1e"
  surface-variant: "#e0e3e5"
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: "600"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  h1:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.2"
  h2:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: "500"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system establishes a visual dialogue between the kinetic energy of the ocean and the precision of modern electrical infrastructure. The aesthetic is anchored in **Scientific Minimalism**—a philosophy that prioritizes data clarity while maintaining a high-tech, eco-conscious atmosphere.

The style utilizes **Glassmorphism** as its primary structural metaphor. Panels are treated as frosted crystalline surfaces that "float" over a clean, white environment, subtly reflecting the vibrant blue gradients beneath. This creates a sense of depth and transparency, reinforcing the brand's core values of trust and clarity. The overall mood is "Eco-Tech": a sophisticated blend of natural fluid motion and rigid engineering excellence.

## Colors

The palette is derived from the various depths of the Pacific. A pristine white base (#FFFFFF) provides a sterile, scientific foundation, while the **Ocean Gradient**—spanning from a brilliant Sky Blue to a Deep Maritime Blue—is used for interactive elements and primary data visualizations.

- **Primary Deep Blue**: Used for critical information, headers, and authoritative UI elements.
- **Secondary Sky Blue**: Used for action states and highlighting "flow" or active energy.
- **Tertiary Seafoam**: Used sparingly for "optimal status" indicators and eco-friendly metrics.
- **Glass Surfaces**: Low-opacity whites with high saturation blurs to maintain legibility against dynamic backgrounds.

## Typography

The typographic system utilizes a dual-font approach to balance technical precision with modern accessibility.

**Space Grotesk** is used for headlines and hero data points. Its geometric, slightly quirky terminals evoke a "scientific-futuristic" feel that aligns with the engineering aspect of energy monitoring.

**Inter** is the workhorse for all body copy and interface labels. Its neutral, highly legible design ensures that complex data tables and technical descriptions remain digestible at any scale. We emphasize generous line heights and tracking on labels to maintain an "airy" feel.

## Layout & Spacing

This design system employs a **fixed-fluid hybrid grid**. Main dashboard containers utilize a 12-column grid with wide 24px gutters to prevent visual clutter.

The rhythm is intentionally "Airy." We prioritize white space (negative space) to separate distinct data modules, avoiding heavy dividers. Margins are generous (32px+) to ensure the glass panels have room to "breathe" and cast their soft shadows without overlapping. Padding within components should never drop below 24px for primary containers.

## Elevation & Depth

Depth is achieved through **Backdrop Blurs** rather than traditional dark shadows.

1.  **Level 0 (Base):** Solid neutral white or very light gray.
2.  **Level 1 (Panels):** Semi-transparent white (70% opacity) with a 20px backdrop blur and a 1px solid white inner stroke.
3.  **Level 2 (Popovers/Modals):** Increased blur (40px) and a very soft, large-radius blue-tinted shadow (e.g., `rgba(0, 82, 204, 0.08)`) to suggest a higher floating plane.

Avoid pitch-black shadows. All "elevation" should feel like light passing through water and glass.

## Shapes

The shape language is defined by **expansive, friendly radii**. Large panels and primary containers use a 20px corner radius to soften the technical nature of the data. Smaller interactive elements like buttons and input fields use a 12px radius.

Curves should feel intentional and organic—reminiscent of smoothed sea glass. Avoid sharp 90-degree angles entirely to maintain the approachable, futuristic eco-tech aesthetic.

## Components

### Buttons

Primary buttons use the **Ocean Gradient** with white text. They should have a subtle "glow" hover effect (a soft blue shadow). Secondary buttons are "Ghost" style with a 1px blue border and glass-blur background.

### Glass Cards

The core container for data. These must feature the 20px rounded corners and a 1px white border at 40% opacity. Content within cards should follow the 24px internal padding rule.

### Data Visualizations

Charts should use "Glow Lines"—thick, 3px strokes in Sky Blue or Seafoam with a soft outer glow. Area charts should use a vertical gradient fill that fades to 0% opacity.

### Inputs & Form Fields

Fields are rendered as "hollow" glass panels. On focus, the 1px border transitions from white to Primary Blue, and the background opacity increases slightly.

### Energy Status Chips

Small, pill-shaped indicators. Use high-saturation Seafoam for "Active/Generating" and Sky Blue for "Standby." These should appear semi-translucent against the glass panels.
