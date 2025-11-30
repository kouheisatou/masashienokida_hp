# Design Guide: Grand Stage (幕開けの緊張)

## 1. Design Philosophy
*   **Keywords:** Theater, Passion, Velvet, Drama.
*   **Concept:** The view from the audience seat. Deep reds, heavy shadows, and elegant framing. It mimics the printed program of a grand opera or symphony concert.

## 2. Color System

### Palette
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `color-bg-base` | `#1a0000` | Deep Bordeaux/Black Mix |
| `color-bg-secondary` | `#260505` | Slightly lighter red-black |
| `color-bg-accent` | `#500000` | Button hover / Borders |
| `color-text-primary` | `#e0e0e0` | Off-white (Paper color) |
| `color-text-accent` | `#cc9999` | Pale Red/Pinkish Gray (Gold-ish) |
| `color-border` | `#550000` | Frame borders |
| `color-line` | `#880000` | Separator lines |

### Gradients & Shadows
*   **Vignette:** `box-shadow: inset 0 0 100px #000000` (Simulates lighting focus).
*   **Overlay:** `mix-blend-multiply` with `#1a0000` over images.

## 3. Typography System

**Font Family:**
*   **Headings:** `Noto Serif JP`, serif.
*   **Body:** `Noto Sans JP`, sans-serif.

| Element | Size | Tracking | Weight | Style |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `96px` (8xl) | `-0.025em` | `500` | Serif |
| **Section Title** | `30px` (3xl) | `0` | `500` | Serif Italic |
| **Subtitle/Label** | `12px` | `0.2em` | `700` | Sans Uppercase |
| **Body Text** | `16px` | `0.05em` | `300` | Sans Light |
| **Concert Date** | `20px` (xl) | `0` | `700` | Serif |

## 4. Layout & Spacing

### Global Structure
*   **Frame:** Content often enclosed in `border-double` frames.
*   **Alignment:** Center-heavy layout (`text-center`).
*   **Padding:** `px-6`.
*   **Section Spacing:** `py-32` (128px).

### Navigation
*   **Position:** Absolute Top Center.
*   **Style:** Horizontal List.
*   **Item:** Uppercase, Tracking `0.2em`, Border Bottom (transparent -> white).

## 5. Component Specifications

### 5.1. Hero Section
*   **Height:** `100vh`.
*   **Background:** Full image with `opacity-40` + Red overlay.
*   **Decoration:**
    *   Horizontal Line: `w-16 h-2px bg-[#800]` below title.
    *   Shadow: Heavy inset shadow on container.

### 5.2. Concert Program List
*   **Container:** `max-w-4xl`, centered.
*   **Style:** Boxed with border.
    *   Border: `4px double #550000`.
    *   Padding: `64px` (p-16).
    *   Background: `#1a0000`.
*   **Item:**
    *   Border Bottom: `1px solid #330a0a`.
    *   Padding Bottom: `32px`.
    *   Layout: Flex row (Desktop), stacked (Mobile).

### 5.3. Buttons
*   **Style:** Ghost/Outline.
*   **Border:** `1px solid #550000`.
*   **Text:** Uppercase, `10px`, Tracking `0.2em`.
*   **Hover:** `bg-[#500000] text-white`.

### 5.4. News List
*   **Alignment:** Center.
*   **Item:**
    *   Border Left: `2px solid transparent` (Default) -> `#800` (Hover).
    *   Background: Transparent -> `#260505` (Hover).
    *   Padding: `16px`.

## 6. Interaction States
*   **Hover:** Subtle glow or background color shift to slightly lighter red.
*   **Focus:** Strong contrasts.

## 7. Assets
*   **Images:** Concert halls, Stage curtains, Instruments. Warm/Red tones preferred.
