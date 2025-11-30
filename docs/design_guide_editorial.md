# Design Guide: Editorial Classic (現代のポートフォリオ)

## 1. Core Concept
*   **Keywords:** Brutalist, High Contrast, Asymmetry, Typography-driven.
*   **Atmosphere:** International art magazine, Fashion editorial.

## 2. Color Palette
| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#ffffff` | Main background |
| **Alt Background** | `#f9fafb` (gray-50) | Blog section |
| **Primary Text** | `#000000` | Headings, Body |
| **Secondary Text** | `#4b5563` (gray-600) | Meta data |
| **Blend Modes** | `mix-blend-difference` | Navigation, Hero overlays |

## 3. Typography
*   **Headings:** Sans-serif (`Noto Sans JP`), Massive scale.
    *   Hero Size: `text-[15vw]`
    *   Line Height: `leading-[0.8]`
*   **Body:** Serif for contrast (`font-serif`).
*   **Meta Data:** Monospace (`font-mono`) for dates and categories.

## 4. Layout & Spacing
*   **Grid System:** 12-column grid (`grid-cols-12`).
    *   Asymmetry example: Image `col-span-4`, Text `col-span-5 col-start-7`.
*   **Navigation:** Top Fixed, Minimal.
    *   Font size: `text-[10px]` or `text-xs`.
*   **Section Spacing:** `py-32` (128px).

## 5. Component Specifics
*   **Hero Image:**
    *   Position: Absolute right `w-1/2`.
    *   Effect: `grayscale`, `contrast-125`.
*   **Concert List:**
    *   Typography: Date is huge (`text-6xl` to `text-8xl`), opacity low (`opacity-10`) until hover.
    *   Interaction: Whole row hover turns black (`bg-black text-white`).
*   **Blog Grid:**
    *   Style: Brutalist borders (`border-t border-black`).
    *   No gaps visually, simple lines.

## 6. Implementation Rules
*   Use `mix-blend-mode` for text over images to ensure readability and style.
*   Typography must touch or overlap edges/other elements.
*   Avoid rounded corners (`rounded-none`).
