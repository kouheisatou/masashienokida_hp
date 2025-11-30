# Design Guide: Editorial Classic (現代のポートフォリオ)

## 1. Design Philosophy
*   **Keywords:** Brutalist, High Contrast, Asymmetry, Typography-driven.
*   **Concept:** Inspired by international art magazines and fashion editorials. The design treats text as a graphic element. It uses extreme scale contrast and layering to create a dynamic visual rhythm.

## 2. Color System

### Palette
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `color-bg-primary` | `#ffffff` | Pure White |
| `color-bg-alt` | `#f9fafb` | Gray-50 (Subtle tint for contrast) |
| `color-text-primary` | `#000000` | Pure Black |
| `color-text-secondary` | `#4b5563` | Gray-600 |
| `color-border` | `#000000` | 1px Solid Black |

### Blend Modes
*   **Exclusion/Difference:** Essential for text overlapping images.
    *   `mix-blend-mode: difference` (White text on black, Black on white).
    *   `mix-blend-mode: exclusion` (Similar to difference but lower contrast).

## 3. Typography System

**Font Family:**
*   **Display:** `Noto Sans JP`, sans-serif (Bold/Black weights).
*   **Serif:** `Noto Serif JP`, serif (Regular/Italic).
*   **Mono:** `Courier New`, monospace (System mono).

| Element | Size (Desktop) | Size (Mobile) | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Graphic** | `15vw` (approx 200px+) | `15vw` | `0.8` | `-0.05em` | `700` (Bold) |
| **Section Title** | `14px` | `12px` | `1.0` | `0.1em` | `700` (Bold) |
| **Concert Date** | `96px` (text-8xl) | `60px` (text-6xl) | `1.0` | `-0.05em` | `700` (Bold) |
| **Concert Title** | `48px` (text-5xl) | `30px` (text-3xl) | `1.1` | `0` | `400` (Italic) |
| **Body Text** | `24px` (text-2xl) | `20px` (text-xl) | `1.6` | `0` | `400` (Serif) |
| **Meta Data** | `12px` | `10px` | `1.4` | `0` | `400` (Mono) |

## 4. Layout & Spacing

### Grid System
*   **Columns:** 12-column Grid.
*   **Gaps:** `48px` (3rem) standard gap.
*   **Margins:** `48px` (Desktop), `24px` (Mobile) outer margin.

### Section Spacing
| Token | Value | Description |
| :--- | :--- | :--- |
| `space-section` | `128px` | Vertical spacing between sections |
| `space-element` | `48px` | Spacing between elements within section |

## 5. Component Specifications

### 5.1. Navigation
*   **Position:** Fixed Top (`top: 0`, `left: 0`, `w-full`).
*   **Padding:** `24px` (Mobile/Desktop).
*   **Z-Index:** `50`.
*   **Styling:** Text color depends on background (use `mix-blend-difference`).

### 5.2. Hero Section
*   **Height:** `100vh`.
*   **Image Layer:**
    *   Position: Absolute Right (`right: 0`).
    *   Width: `50%` (Desktop), `100%` (Mobile - placed behind text).
    *   Filter: `grayscale(100%) contrast(125%)`.
*   **Text Layer:**
    *   Z-Index: `10` (Above image).
    *   Blend Mode: `exclusion` or `difference`.

### 5.3. Concert List Row
*   **Layout:** Flex row (Desktop).
*   **Borders:** `border-b: 1px solid black`.
*   **Padding:** `48px` top/bottom.
*   **Negative Margin:** `-48px` (Desktop) horizontal to extend hover bg to edges.
*   **Interaction:**
    *   Default: White bg, Black text.
    *   Hover: Black bg, White text.
    *   Date Opacity: `0.1` -> `1.0` on hover.

### 5.4. Blog Grid (Brutalist)
*   **Borders:** Top borders only (`border-t: 1px solid black`).
*   **Aspect Ratio:** No forced aspect ratio, distinct heights allowed.
*   **Spacing:** `gap-4` (16px).
*   **Hover:** `bg-gray-200` (Immediate change, no fade).

### 5.5. Footer
*   **Typography:** Giant "CONTACT" text (`10vw`).
*   **Layout:** Flex row, `justify-between`, `items-end`.
*   **Border:** Top `1px solid black`.

## 6. Interaction States
*   **Hover:** Sharp transitions (0ms or 150ms max). Avoid soft fades.
*   **Cursor:** Default system cursor.

## 7. Assets
*   **Images:** High contrast B&W preferred.
*   **Graphic Elements:** None. The typography is the graphic.
