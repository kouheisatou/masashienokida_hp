# Design Guide: Nocturne (夜の独白)

## 1. Core Concept
*   **Keywords:** Void, Darkness, Ethereal, Isolation.
*   **Atmosphere:** A spotlight in a dark hall, inner monologue, ambient.

## 2. Color Palette
| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#0a0a0a` | Deepest Black |
| **Card Background** | `#111111` | Hover states |
| **Primary Text** | `#e0e0e0` | Headings |
| **Body Text** | `#a0a0a0` | Main content |
| **Muted Text** | `#555555` | Labels, Dates |
| **Border** | `#333333` | Dividers (thin) |

## 3. Typography
*   **Font Family:** Serif (`Noto Serif JP`) for almost everything.
*   **Headings:** Light weight (`font-light`), Wide tracking (`tracking-[0.5em]`).
*   **Body:** Light weight, smaller size.
*   **Labels:** Uppercase, tracking `0.3em`.

## 4. Layout & Spacing
*   **Navigation:** Fixed Right, Vertical Dots.
    *   Indicator: `w-1.5 h-1.5 bg-[#333]`.
*   **Container:** Narrower max-width (`max-w-2xl` for bio, `max-w-5xl` for lists).
*   **Spacing:** Large negative space. `py-32`.
*   **Hero:**
    *   Image opacity: `opacity-20` (Very dark).
    *   Vignette: Radial or vertical gradient fade to black.

## 5. Component Specifics
*   **Concert List:**
    *   Style: Tracklist (like a CD back cover).
    *   Lines: Thin borders (`border-b border-[#222]`).
    *   Hover: Subtle brighten (`hover:bg-[#111]`).
*   **Blog Cards:**
    *   Minimal. Left border indicator only (`border-l`).
    *   No background cards, just text in void.

## 6. Implementation Rules
*   Never use pure white (`#ffffff`). Max brightness `#e0e0e0`.
*   Images must always be dimmed or masked.
*   Animations should be slow fades (`duration-500` or more).
