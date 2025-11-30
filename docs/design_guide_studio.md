# Design Guide: Modern Studio (記録とデータ)

## 1. Core Concept
*   **Keywords:** Archive, Data, Spec Sheet, Industrial.
*   **Atmosphere:** Art storage, architectural blueprint, contemporary museum.

## 2. Color Palette
| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#f2f2f2` | Light Gray (Industrial) |
| **Panel Background** | `#ffffff` | Content blocks |
| **Footer Background** | `#111111` | Contrast anchor |
| **Primary Text** | `#111111` | Ink Black |
| **Border** | `#cccccc` | Grid lines (Visible) |

## 3. Typography
*   **Primary Font:** Sans-serif (`Noto Sans JP`).
*   **Data Font:** Monospace (`font-mono`) for labels, dates, tags.
*   **Sizing:** Small text (`text-xs`) is dominant. Headings are bold and tight.

## 4. Layout & Spacing
*   **Header:** Sticky Top, `h-16`, Border bottom.
*   **Grid Structure:** Visible borders separating sections.
    *   Sidebar column: Label (e.g., "01. Profile").
    *   Content column: White background.
*   **Hero:** Split screen (50% Text / 50% Image).

## 5. Component Specifics
*   **Bio Section:**
    *   Looks like a specification sheet.
    *   "EDUCATION" / "WORKS" sections with bold labels.
*   **Concert List:**
    *   Table-row style.
    *   Icon: Arrow Up Right (`ArrowUpRight`) indicating external/action.
*   **Blog:**
    *   Grid of cards with borders (`border border-[#ccc]`).
    *   Tags: Inline block gray background (`bg-[#f2f2f2]`).

## 6. Implementation Rules
*   Borders are essential (`border-[#ccc]`). They define the structure.
*   No rounded corners (`rounded-none`).
*   Images can be grayscale or desaturated.
