# Design Guide: Harmony & Nature (原風景)

## 1. Core Concept
*   **Keywords:** Organic, Raw, Stone, Collage.
*   **Atmosphere:** A sketchbook, natural materials, calm morning.

## 2. Color Palette
| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#e6e2dd` | Stone / Beige |
| **Alt Background** | `#dedad5` | Darker Stone |
| **Dark Block** | `#3a3836` | Charcoal (Footer/Blog) |
| **Text Primary** | `#4a4744` | Dark Earth |
| **Text Light** | `#787572` | Stone Gray |

## 3. Typography
*   **Headings:** Serif (`font-serif`), lowercase often used for style.
*   **Body:** Sans-serif (`font-sans`), clean and legible.
*   **Labels:** Small, Bold, Uppercase (`text-[#999]`).

## 4. Layout & Spacing
*   **Grid:** Loose collage style. Images slightly offset or standard grid.
*   **Padding:** Generous (`px-8 md:px-16`).
*   **Hero:**
    *   Image: Square aspect ratio (`aspect-square`).
    *   Soft shadows (`shadow-xl`).

## 5. Component Specifics
*   **Concert Cards:**
    *   White cards on beige background.
    *   Rounded corners: Small (`rounded-sm`).
*   **Blog List:**
    *   Dark section (`bg-[#3a3836]`).
    *   Text color: Light stone (`#e6e2dd`).
    *   Hover: Simple translate (`translate-x-2`).

## 6. Implementation Rules
*   Colors should be matte/flat, no high gloss.
*   Images should feel like photos placed on a table.
*   Avoid pure black. Use `#2c2a28` or `#3a3836`.
