# Design Guide: Royal Classic (静謐なる正統)

## 1. Core Concept
*   **Keywords:** Authentic, Vertical (縦書き), Silence, Tradition.
*   **Atmosphere:** A formal invitation letter or a classical program. Minimal distractions.

## 2. Color Palette
| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#Fdfdfa` | Main background (Warm White) |
| **Alt Background** | `#f4f4f0` | Section background (Concerts) |
| **Primary Text** | `#2b2b2b` | Body text, Headings |
| **Accent Gold** | `#ab966d` | Highlights, Selection, Hover states |
| **Border/Lines** | `#e5e5e5` | Dividers, Sidebar border |

## 3. Typography
*   **Font Family:** Serif (`Noto Serif JP`, `serif`) for everything.
*   **Vertical Writing:** Used for Site Title (`ME.`, `榎田 雅志`) and Navigation.
    *   Class: `writing-vertical-rl`
*   **Letter Spacing:** Extremely wide.
    *   Nav: `tracking-[0.3em]`
    *   Hero Name: `tracking-widest`

## 4. Layout & Spacing
*   **Navigation:** Fixed Sidebar on the **Right**.
    *   Width: `w-20` (mobile), `w-32` (desktop).
    *   Background: `#Fdfdfa` with `opacity-90` & `backdrop-blur`.
*   **Container padding:** `px-6` (mobile), `px-24` (desktop).
*   **Section Spacing:** `py-32` (128px) for major sections.
*   **Hero Section:**
    *   Image Aspect Ratio: `3/4` (vertical portrait orientation).
    *   Text Overlay: Absolute positioned `top-12 left-12`.

## 5. Component Specifics
*   **Images:** Grayscale filter (`grayscale`) with reduced opacity (`opacity-90`).
*   **Concert List:**
    *   Layout: Horizontal flex row.
    *   Date: `text-sm font-bold text-[#ab966d]`.
    *   Border: Bottom border `#d4d4d0`.
*   **Buttons:**
    *   Style: Outline or Solid Dark.
    *   Hover: Swap colors (Bg `#2b2b2b` / Text White).

## 6. Implementation Rules
*   Do NOT use gradients or shadows.
*   Keep text justified (`text-justify`) for biography blocks.
*   No catchphrases. Only factual names and dates.
