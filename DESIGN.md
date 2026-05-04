# Saltwater Electricity Design System Guide

This document serves as the foundational style guide for the Saltwater Electricity platform. All future component generations and refactors must strictly adhere to these rules to maintain visual and structural consistency.

## 1. Color Palette

The palette is built on a "Scientific Minimalism" aesthetic, reflecting ocean depths and electrical precision.

| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `primary` | `#003d9b` | Primary brand color |
| `primary-container` | `#0052cc` | Primary accent container |
| `on-primary-container` | `#c4d2ff` | Text on primary container |
| `secondary` | `#006688` | Secondary brand color |
| `secondary-container` | `#00c1fd` | Secondary accent container (Sky Blue) |
| `tertiary` | `#004d3d` | Tertiary color (Seafoam) |
| `tertiary-fixed` | `#42fdd3` | High-saturation Seafoam |
| `background` | `#f7f9fb` | Main application background |
| `surface` | `#f7f9fb` | Surface background |
| `surface-container` | `#eceef0` | Default surface container |
| `surface-container-low` | `#f2f4f6` | Low elevation container |
| `surface-container-high` | `#e6e8ea` | High elevation container |
| `surface-container-highest` | `#e0e3e5` | Highest elevation container |
| `surface-container-lowest` | `#ffffff` | Pure white background |
| `on-surface` | `#191c1e` | High-contrast text |
| `on-surface-variant` | `#434654` | Medium-contrast text |
| `outline` | `#737685` | Borders and dividers |
| `outline-variant` | `#c3c6d6` | Subtle borders |
| `error` | `#ba1a1a` | Error state color |
| `error-container` | `#ffdad6` | Error container background |

---

## 2. 8-Point Grid & Spacing

All layout measurements (padding, margin, gaps) and typography sizing follow a base unit of **8px**.

### Spacing Tokens
| Token | Value | Base Unit Calculation |
| :--- | :--- | :--- |
| `xs` | `4px` | unit * 0.5 |
| `unit` | `8px` | **Base Unit** |
| `sm` | `12px` | unit * 1.5 |
| `md` | `24px` | unit * 3 |
| `gutter` | `24px` | unit * 3 |
| `margin` | `32px` | unit * 4 |
| `lg` | `48px` | unit * 6 |
| `xl` | `80px` | unit * 10 |

### Typography Tokens
| Token | Font Family | Size | Weight |
| :--- | :--- | :--- | :--- |
| `display` | Space Grotesk | `48px` | 600 |
| `h1` | Space Grotesk | `32px` | 600 |
| `h2` | Space Grotesk | `24px` | 500 |
| `body-lg` | Inter | `18px` | 400 |
| `body-md` | Inter | `16px` | 400 |
| `label-sm` | Inter | `13px` | 600 |

---

## 3. Reusable CSS Components

### Glassmorphism (.glass-panel)
Standard structure for cards, panels, and sidebars.
```css
.glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 20px;
}
```

### Ocean Gradient (.ocean-gradient)
Used for primary actions, buttons, and decorative elements.
```css
.ocean-gradient {
    background: linear-gradient(135deg, #0052cc 0%, #00c1fd 100%);
}
```

### Glow Line (.glow-line)
Used for data visualizations to suggest "active" energy flow.
```css
.glow-line {
    filter: drop-shadow(0 0 4px rgba(0, 193, 253, 0.6));
}
```

---

## 4. Visual Language Rules

1.  **Typography:** Use **Space Grotesk** for all headers (Display, H1, H2) and data points. Use **Inter** for all body copy, labels, and technical descriptions.
2.  **Elevation:** depth is achieved through **Backdrop Blurs** and subtle white borders rather than heavy black shadows.
3.  **Shapes:** Maintain expansive radii (12px to 20px) to suggest sea glass. Avoid sharp 90-degree corners.
4.  **Rhythm:** Prioritize negative space. Components should breathe with a minimum of 24px padding (`p-md`).
