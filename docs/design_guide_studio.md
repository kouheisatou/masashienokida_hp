# Design Guide: Modern Studio (記録とデータ)

## 1. Design Philosophy
*   **Keywords:** Archive, Data, Spec Sheet, Industrial.
*   **Concept:** A digital archive or architectural blueprint. It presents the artist as a professional entity. The design relies on visible grid lines, monospace typography, and a strict information hierarchy.

## 2. Color System

### Palette
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `color-bg-base` | `#f2f2f2` | Industrial Light Gray (Background) |
| `color-bg-panel` | `#ffffff` | Content container background |
| `color-bg-inverse` | `#111111` | Footer / Inverse elements |
| `color-text-primary` | `#111111` | Ink Black |
| `color-text-muted` | `#6b7280` | Gray-500 |
| `color-border` | `#cccccc` | Grid lines (Visible, Mid-gray) |

## 3. Typography System

**Font Family:**
*   **Primary:** `Noto Sans JP`, sans-serif.
*   **Data/Label:** `Noto Sans Mono` or `monospace`.

| Element | Size | Line Height | Tracking | Weight | Style |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `60px` (6xl) | `1.0` | `-0.05em` | `700` | Sans |
| **Section Label** | `12px` (xs) | `1.0` | `0` | `700` | Mono, Uppercase |
| **Body Text** | `16px` | `1.6` | `0` | `400` | Sans |
| **Data Label** | `12px` | `1.4` | `0` | `400` | Mono |
| **Table Cell** | `12px` | `1.4` | `0` | `400` | Mono |

## 4. Layout & Spacing

### Global Structure
*   **Header Height:** `64px` (fixed).
*   **Borders:** `1px solid #cccccc` used everywhere to define the grid.
*   **Containers:**
    *   Full width layout.
    *   No centered max-width containers (except inner text blocks).

### Section Layout (The "Spec Sheet" Pattern)
*   **Grid:** 4-Column Grid (Desktop).
    *   Column 1 (Sidebar): Label / Index (`col-span-1`).
    *   Column 2-4 (Content): Main Data (`col-span-3`).
*   **Min Height:** `50vh` per section.

## 5. Component Specifications

### 5.1. Header
*   **Height:** `64px`.
*   **Padding:** `px-6`.
*   **Border:** Bottom `1px solid #ccc`.
*   **Content:** Flexbox, `justify-between`.
*   **Nav Items:** `padding: 4px 8px`. Hover: `bg-black text-white`.

### 5.2. Hero Section
*   **Layout:** 2-Column Split (50% / 50%).
*   **Left (Text):**
    *   Padding: `48px` (Mobile), `96px` (Desktop).
    *   Border Right: `1px solid #ccc`.
    *   Meta Info: Top aligned, Mono font.
*   **Right (Image):**
    *   Image Filter: `grayscale(100%) opacity(80%)`.
    *   Background: `#cccccc`.

### 5.3. Concert Table
*   **Row:**
    *   Border Bottom: `1px solid #ccc`.
    *   Padding: `32px` (p-8).
    *   Hover: `bg-[#f9f9f9]`.
*   **Columns:**
    *   Date: Fixed width `128px`. Font Mono.
    *   Info: Flex grow.
    *   Icon: Fixed width `32px`. Arrow Up Right.

### 5.4. Blog Grid
*   **Card:**
    *   Background: White.
    *   Border: `1px solid #ccc`.
    *   Padding: `24px`.
    *   Hover: `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)`.
*   **Tags:**
    *   Background: `#f2f2f2`.
    *   Padding: `4px 8px`.
    *   Font: `10px` Mono Uppercase.

### 5.5. Footer
*   **Background:** `#111111`.
*   **Text:** `#ffffff`.
*   **Padding:** `48px`.
*   **Typography:** Mono `12px`.

## 6. Interaction States
*   **Buttons/Links:**
    *   Hard color swap (Black <-> White).
    *   Duration: `150ms` (Fast).
*   **Images:** No zoom effects. Static and stable.

## 7. Assets
*   **Images:** Architectural, structured composition. Grayscale or Desaturated.
