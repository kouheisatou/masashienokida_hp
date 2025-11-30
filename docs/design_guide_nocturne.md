# Design Guide: Nocturne (夜の独白)

## 1. Design Philosophy
*   **Keywords:** Void, Darkness, Ethereal, Isolation.
*   **Concept:** Visualizes the sensation of a solitary spotlight in a pitch-black concert hall. Information emerges from the darkness. Minimalist, focused on negative space and typography.

## 2. Color System

### Palette
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `color-bg-base` | `#0a0a0a` | Deepest Black (Not #000) |
| `color-bg-surface` | `#111111` | Card hover state |
| `color-text-high` | `#e0e0e0` | Headings (Max brightness) |
| `color-text-med` | `#a0a0a0` | Body text |
| `color-text-low` | `#555555` | Labels, Dates |
| `color-border` | `#333333` | Subtle dividers |
| `color-border-faint` | `#222222` | Very subtle dividers |

### Lighting Rules
*   **Max Brightness:** Never use `#ffffff`. Cap at `#e0e0e0` to reduce eye strain and maintain mood.
*   **Gradient:** `bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]` used over hero images.

## 3. Typography System

**Font Family:** `Noto Serif JP`, serif

| Element | Size (Desktop) | Size (Mobile) | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px` (text-4xl) | `30px` (text-3xl) | `1.2` | `0.5em` | `300` (Light) |
| **Section Label** | `10px` | `10px` | `1.0` | `0.3em` | `400` (Reg) |
| **Body Text** | `20px` (text-xl) | `18px` (text-lg) | `2.0` | `0.05em` | `300` (Light) |
| **List Title** | `20px` (text-xl) | `16px` (text-base) | `1.4` | `0` | `300` (Light) |
| **Meta Data** | `12px` | `12px` | `1.0` | `0.1em` | `400` (Mono) |

## 4. Layout & Spacing

### Global Structure
*   **Max Width:**
    *   Bio: `max-w-2xl` (approx 672px).
    *   Lists: `max-w-5xl` (approx 1024px).
*   **Padding:**
    *   Desktop: `px-32` (128px).
    *   Mobile: `px-8` (32px).
*   **Vertical Rhythm:** `py-32` (128px) standard section padding.

### Navigation
*   **Position:** Fixed Right (`right: 32px`), Vertically centered (`top: 50%`).
*   **Style:** Vertical Dots.
    *   Dot Size: `6px x 6px`.
    *   Gap: `24px`.
    *   Label: `opacity-0` -> `opacity-100` on hover.

## 5. Component Specifications

### 5.1. Hero Section
*   **Image:** Full screen (`h-screen`).
*   **Overlay:** `opacity: 0.2` (20% visibility).
*   **Text Alignment:** Center.
*   **Animation:** Slow fade-in (`duration-1000` or more).

### 5.2. Biography
*   **Layout:** Centered single column.
*   **Text Style:** High leading (`leading-loose`).
*   **History Grid:** 2-column on desktop.
    *   Border: `border-l border-[#333]`.
    *   Padding Left: `16px`.

### 5.3. Concert Tracklist
*   **Structure:** Flex row.
*   **Height:** `72px` (approx) per row.
*   **Borders:** `border-b: 1px solid #222`.
*   **Columns:**
    1.  Index: `w-8` (`01`, `02`...).
    2.  Date: `w-24`.
    3.  Title: `flex-1`.
    4.  Location: `w-32` (Right aligned).
*   **Hover Effect:** Background becomes `#111`, Text becomes `color-text-high`.

### 5.4. Blog List
*   **Layout:** Grid 3 columns.
*   **Card Style:** Minimal.
    *   No background.
    *   Left Border: `border-l: 1px solid #333` (Default) -> `#ffffff` (Hover).
    *   Padding Left: `16px`.
    *   Transition: `border-color 500ms`.

## 6. Interaction States
*   **Transitions:** Slow and smooth. `duration-500` is the baseline.
*   **Hover:** Generally involves brightening text (`#a0a0a0` -> `#ffffff`) or subtle background shifts.

## 7. Assets
*   **Images:** Low key photography required. Bright images must be masked via CSS opacity.
