# Design Guide: Grand Stage (幕開けの緊張)

## 1. Core Concept
*   **Keywords:** Theater, Passion, Velvet, Drama.
*   **Atmosphere:** Inside a concert hall, heavy curtains, program booklet.

## 2. Color Palette
| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#1a0000` | Deep Bordeaux/Black |
| **Alt Background** | `#260505` | Section background |
| **Accent Red** | `#880000` | Lines, Highlights |
| **Text Primary** | `#e0e0e0` | Off-white |
| **Text Muted** | `#cc9999` | Pale Red/Pinkish Gray |
| **Border** | `#550000` | Frames |

## 3. Typography
*   **Headings:** Serif (`font-medium`), Elegant.
*   **Subheadings:** Uppercase Sans (`tracking-widest`).
*   **Body:** Sans-serif, Light weight.

## 4. Layout & Spacing
*   **Navigation:** Top Centered.
*   **Hero:** Centered alignment.
    *   Background: Image with `mix-blend-multiply` red overlay.
    *   Vignette: `shadow-[inset_0_0_100px_#000]`.
*   **Container:** Framed content (`border-4 double border-[#500]`).

## 5. Component Specifics
*   **Concert List:**
    *   "Program" style list.
    *   Centered text or split justify.
    *   Buttons: Small, uppercase, outlined.
*   **Decorations:**
    *   Double borders.
    *   Thin horizontal lines (`h-[2px] bg-[#800]`).

## 6. Implementation Rules
*   Maintain the "Red" tint throughout.
*   Use shadows to create depth (stage lighting feel).
*   Text should feel like it is printed on a dark program.
