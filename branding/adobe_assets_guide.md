# Kaeluma Adobe Creative Suite Asset Guide

This guide is designed for **Jayson** (kids' media producer and creator) utilizing **Adobe Creative Suite** (Photoshop, Illustrator, Premiere Pro, After Effects) to customize, polish, and export Kaeluma's brand assets.

---

## 🎨 1. Graphic Design Standards & Setup

### Color Spaces
*   **Target Web/Screen:** **sRGB IEC61966-2.1** (Never use CMYK or Adobe RGB for exporting web assets, as it will distort Kaeluma's glowing neon purples, seedling greens, and cyans on mobile screens).
*   **Photoshop/Illustrator Settings:** Go to *Edit > Color Settings* and verify your Working Spaces RGB is set to **sRGB**.

### Resolution
*   All pre-generated marketing templates in `branding/` are output as 300 DPI master files to allow vector scaling and crisp text rasterization.
*   **Export Settings:** When saving from Photoshop, use *File > Export > Export As...*, select **PNG**, and ensure **Embed Color Profile (sRGB)** is checked.

---

## 🖌️ 2. Photoshop (PSD) Layer Templates

When building launch campaigns, open the base template PNGs in Photoshop, set your canvas size, and organize your layer structure as follows:

```
[Layer Folder] Overlay Graphics & Banners
  ├── [Layer] CTA Text & Headline (Outfit ExtraBold, White)
  ├── [Layer] Supporting Copy (Inter Regular, Muted Silver #94a3b8)
  ├── [Layer] Vector Logo SVG (Imported Link from logo_main.svg)
  ├── [Layer Group] Glowing Delighters
  │     ├── [Layer] Gold Coin Graphic (coin.png - isolated layer)
  │     └── [Layer] Glowing aura overlay (Blend Mode: Screen, Opacity: 40%)
  └── [Base Layer] Template Canvas (e.g. app_store_feature.png or banner.png)
```

### Banner & Layout Specifications

1.  **Open Graph Card (`og_share_card.png` - 1200×630)**
    *   **Adobe Margin Setup:** Create guides 100px from all outer edges. Ensure the central sun logo is kept inside the safe zone so messaging isn't clipped in chat bubbles.
2.  **App Store Feature Graphic (`app_store_feature.png` - 1280×720)**
    *   Place device screenshots or child dashboard renders in the right 60% of the canvas.
    *   Keep app title and CTA (Sticker chart alternative!) in the left 40%.
3.  **Social Feed Post (`social_square_post.png` - 1080×1080)**
    *   Center-aligned hierarchy. Perfect for high-contrast quotes or parent testimony text overlays.
4.  **Email Hero (`email_hero.png` - 600×300)**
    *   Set text sizes to 36pt or higher for high readability on small mobile screens.

---

## 📐 3. Illustrator (AI) Logo Editing

Use the vector SVG logo versions (`logo_main.svg`, `logo_icon.svg`, `logo_main_vertical.svg`) in Illustrator for high-resolution print or resizing.

### Importing & Editing SVG Logo Assets
1.  **Open in Illustrator**: Open `logo_main.svg` directly in Illustrator.
2.  **Verify Gradients**: The gradient on the "Kaeluma" wordmark is pre-coded to transition from Purple (`#a855f7`) to Cyan (`#38bdf8`). Adjust the Gradient tool handles to change the light incidence angle.
3.  **Text Conversion**: If sharing the vector file with external developers or printers, select the "Kaeluma" text layer and run **Type > Create Outlines** (`Ctrl+Shift+O`). This converts the text into vector shapes, preserving the exact "Outfit" letter outlines even on computers without the font.

---

## 🎬 4. Video Production (Premiere Pro & After Effects)

Use the dynamic assets in Premiere Pro or After Effects to create high-engaging Shorts, Reels, and TikToks.

### Video Template Overlay (`video_bg.png` - 1080×1920, 9:16)
This vertical frame features a transparent middle area, a glowing space border, and the footer logo.
1.  **Import Asset**: Drag `video_bg.png` into your Premiere Pro bin.
2.  **Timeline Setup**: Place your gameplay B-roll or talking-head video on Track V1. Place `video_bg.png` on Track V2 directly above it.
3.  **Safe Zone Guidelines**: Position captions and text in the center third of the screen to prevent overlap with the borders or the Kaeluma branding.

### Coin Animation Layer (`coin.png` - 512×512, 1:1)
An isolated 3D gold coin graphic.
1.  **After Effects Setup**: Import `coin.png` into After Effects.
2.  **Keyframe Idle Float**:
    *   Apply a simple Expression to the *Position* property to make the coin float:
        ```javascript
        amplitude = 12; // vertical float height
        frequency = 1.5; // speed of float
        value + [0, Math.sin(time * frequency * Math.PI * 2) * amplitude];
        ```
    *   Apply a *Rotation* keyframe looping from 0 to 360 degrees to simulate spinning rewards.
