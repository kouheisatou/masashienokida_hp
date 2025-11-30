# Design Guide: Harmony & Nature (原風景)

## 1. Design Philosophy
*   **Keywords:** Organic, Raw, Stone, Collage.
*   **Concept:** A physical sketchbook or scrapbook on a wooden table. Uses natural textures (implied by color), matte finishes, and organic layouts. It connects the artist's roots (Kobayashi City) to their music.

## 2. Color System

### Palette
| Token | Hex Value | Description |
| :--- | :--- | :--- |
| `color-bg-base` | `#e6e2dd` | Light Stone / Beige (Main) |
| `color-bg-alt` | `#dedad5` | Darker Stone (Bio section) |
| `color-bg-dark` | `#3a3836` | Charcoal (Blog/Footer) |
| `color-text-primary` | `#2c2a28` | Soft Black |
| `color-text-body` | `#4a4744` | Dark Earth Brown |
| `color-text-light` | `#787572` | Stone Gray |
| `color-white` | `#ffffff` | Card background |

### Texture
*   **Shadows:** Soft, diffuse shadows `shadow-lg` or `shadow-xl`. No sharp drop shadows.
*   **Finish:** Matte. No gradients.

## 3. Typography System

**Font Family:**
*   **Headings:** `Noto Serif JP`, serif. Often lowercase.
*   **Body:** `Noto Sans JP`, sans-serif.

| Element | Size | Line Height | Tracking | Weight | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Name** | `72px` (7xl) | `1.1` | `-0.025em` | `500` | Primary |
| **Section Title** | `14px` (sm) | `1.0` | `0.1em` | `700` | Light Gray (#999) |
| **Card Title** | `20px` (xl) | `1.4` | `0` | `500` | Primary |
| **Body Text** | `16px` | `1.75` | `0` | `400` | Body |

## 4. Layout & Spacing

### Global Structure
*   **Padding:** `px-8` (Mobile), `px-16` (Desktop).
*   **Section Spacing:** `py-24` (96px). Not as huge as other themes, more intimate.
*   **Max Width:** `max-w-4xl` for lists.

### Header
*   **Height:** Auto padding `py-8`.
*   **Layout:** Flex row, `justify-between`, `items-baseline`.
*   **Nav:** Simple row, gap `32px`.

## 5. Component Specifications

### 5.1. Hero Section
*   **Grid:** 2-Column (Image / Text).
*   **Image:**
    *   Aspect Ratio: `1:1` (Square).
    *   Corner Radius: `2px` (rounded-sm).
    *   Shadow: `shadow-xl`.
*   **Text:**
    *   Position: Relative.
    *   Style: Mixed Serif Heading + Sans Body.

### 5.2. Concert Cards
*   **Container:** Grid 3-column.
*   **Card:**
    *   Background: `#ffffff`.
    *   Padding: `32px`.
    *   Radius: `2px`.
    *   Hover: `shadow-lg` (Lift effect).
*   **Typography:** Date (Small Sans), Title (Med Serif), Loc (Small Sans).

### 5.3. Blog Section
*   **Background:** `#3a3836` (Charcoal).
*   **Text Color:** `#e6e2dd` (Beige).
*   **List Item:**
    *   Border Bottom: `1px solid #555`.
    *   Padding Bottom: `32px`.
    *   Hover: `translate-x-2` (Horizontal shift).

### 5.4. Footer
*   **Padding:** `py-12`.
*   **Style:** Minimal text flex row.
*   **Color:** `#999999`.

## 6. Interaction States
*   **Hover:** Physical movement (Translation) or Lift (Shadow).
*   **Speed:** Moderate `duration-300` or `duration-500`.

## 7. Assets
*   **Images:** Natural light, earthy tones.
*   **Shapes:** Rectangles with very slight rounding (`rounded-sm`).
