# Design Guide: Royal Classic (静謐なる正統)

## 1. Design Philosophy
*   **Keywords:** Authentic, Vertical (縦書き), Silence, Tradition.
*   **Concept:** A formal invitation letter sent from a prestigious conservatory. It emphasizes white space and vertical rhythm, reminiscent of Japanese traditional writing mixed with Western classical aesthetics.

## 2. Color System

### Palette
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `color-bg-primary` | `#Fdfdfa` | Main background (Warm White/Cream) |
| `color-bg-secondary` | `#f4f4f0` | Section background for contrast |
| `color-text-primary` | `#2b2b2b` | Body text, Headings (Soft Black) |
| `color-text-muted` | `#999999` | Meta data, obscure text |
| `color-accent` | `#ab966d` | Gold/Beige for highlights and selection |
| `color-border` | `#e5e5e5` | Subtle dividers |
| `color-border-dark` | `#d4d4d0` | Stronger dividers |

### Usage Rules
*   **Selection:** `bg-[#ab966d]` with `text-white`.
*   **Images:** All decorative images must apply `grayscale(100%)` and `opacity(90%)` by default.

## 3. Typography System

**Font Family:** `Noto Serif JP`, serif

| Element | Size (Desktop) | Size (Mobile) | Line Height | Tracking | Weight | Style |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Site Title** | `60px` | `36px` | `2.0` | `0.1em` | `500` (Medium) | Vertical |
| **Section Head** | `24px` | `18px` | `1.5` | `0.05em` | `500` (Medium) | - |
| **Body Large** | `18px` | `18px` | `2.0` (Relaxed) | `0` | `300` (Light) | - |
| **Body Normal** | `14px` | `14px` | `1.75` | `0` | `300` (Light) | - |
| **Nav Item** | `12px` | `12px` | `1.0` | `0.3em` | `400` (Regular) | Vertical, Uppercase |
| **Meta/Date** | `14px` | `12px` | `1.0` | `0.05em` | `700` (Bold) | - |

## 4. Layout & Spacing

### Global Structure
*   **Sidebar Navigation:**
    *   Position: Fixed Right (`right: 0`)
    *   Width: `128px` (Desktop), `80px` (Mobile)
    *   Border: `1px solid #e5e5e5` on the left.
    *   Z-Index: `50`
*   **Main Content Area:**
    *   Padding Right: `128px` (Desktop), `80px` (Mobile) to account for sidebar.

### Section Spacing
| Token | Value | Description |
| :--- | :--- | :--- |
| `space-section` | `128px` (py-32) | Standard vertical spacing between major sections |
| `space-inner` | `64px` | Spacing between header and content within a section |
| `space-item` | `48px` | Spacing between list items |

### Grid / Max-Widths
*   **Hero Container:** No max-width, full viewport height (`min-h-screen`).
*   **Text Container:** `max-w-3xl` (approx 768px).
*   **List Container:** `max-w-4xl` (approx 896px).

## 5. Component Specifications

### 5.1. Hero Section
*   **Layout:** Asymmetric overlapping.
*   **Text Block:**
    *   Position: Absolute, `top: 96px`, `left: 96px`.
    *   Orientation: Vertical Writing (`writing-mode: vertical-rl`).
*   **Image Block:**
    *   Aspect Ratio: `4:3` (Desktop), `3:4` (Mobile).
    *   Shadow: `shadow-2xl` (0 25px 50px -12px rgba(0, 0, 0, 0.25)).
    *   Width: `100%` (Mobile), `800px` (Desktop Max).

### 5.2. Concert List Item
*   **Container:** `flex-row` (Desktop), `flex-col` (Mobile).
*   **Border:** `border-b` (`1px solid #d4d4d0`).
*   **Padding:** `padding-bottom: 32px`.
*   **Date Block:**
    *   Width: `128px` fixed.
    *   Color: `color-accent` (#ab966d).
*   **Title:**
    *   Size: `24px`.
    *   Hover: Color transition to `color-accent` (`300ms`).
*   **Action Button:**
    *   Style: Outline.
    *   Border: `1px solid #2b2b2b`.
    *   Padding: `8px 24px`.
    *   Font Size: `12px`.

### 5.3. Biography Block
*   **Layout:** 2-Column (1:2 ratio).
*   **Portrait Image:**
    *   Mix Blend Mode: `multiply`.
    *   Background container: `#f0f0f0`.
*   **History List:**
    *   Border Left: `1px solid #e5e5e5`.
    *   Padding Left: `32px`.
    *   Item Spacing: `16px`.

## 6. Interaction States
*   **Links/Buttons:**
    *   Hover: `bg-[#2b2b2b] text-white` (Invert).
    *   Transition: `all 0.3s ease-in-out`.
*   **Scroll:** Smooth scroll behavior.

## 7. Assets & Graphics
*   **Icons:** Do not use heavy icons. Use minimal text labels or Lucide icons with `stroke-width={1}`.
*   **Logo:** Text-only. "ME." monogram in vertical orientation.
