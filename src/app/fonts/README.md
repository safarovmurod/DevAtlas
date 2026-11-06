# Bundled fonts

Inter and JetBrains Mono are bundled locally with their SIL Open Font License files. They include Latin and Cyrillic glyphs and variable weights. Next.js uses `next/font/local`; development and production builds require no Google Fonts requests.

Downloaded over verified HTTPS from the official `google/fonts` repository:

- `https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf`
- `https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf`

Inter is the same downloaded variable font, converted losslessly from TTF to WOFF2 to reduce transfer size. It uses `font-display: optional` so a slow first visit keeps its fallback for that page instead of shifting content when Inter arrives; cached or fast loads can use Inter immediately. No font family was added.

SHA-256 of the bundled files:

```text
f45042ef1e286a1f01559386ee04a3e10285c601b56f4fc88045c33e478a33c7  Inter.woff2
48715a42ec242c21e9f02692891e147d022299a52e48d5e413e1a942193ffeda  JetBrainsMono.ttf
```

The original downloaded Inter TTF had SHA-256 `29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`.

## Actual glyph coverage (26 October 2026)

The bundled files were inspected with FontTools `TTFont.getBestCmap()`: Inter contains all six Tajik characters `ӣ ӯ ҳ қ ҷ ғ`; the bundled JetBrains Mono has no direct cmap entries for these six. The Chromium shaper can nevertheless compose `ӣ` and `ӯ` from base letters and macrons; the other four require fallback. Code/pre/editor CSS therefore falls back to the bundled Inter for missing glyphs instead of depending only on machine fonts. This fallback is proportional for those glyphs; it does not make JetBrains Mono itself glyph-complete. Both remain SIL OFL.

Neither file contains the tested Japanese/Korean glyphs `日本語한국어`. Body text names Noto Sans CJK, Yu Gothic and Malgun Gothic before generic sans-serif. Actual CJK rendering depends on available system fallback fonts; the full cross-platform CJK/font-comparison audit remains PARTIAL. Local font metadata alone is not rendered accessibility proof.

Windows CI run40319534305 exposed a real difference: Next's automatic Mono fallback selected system Arial for `ҳ` before reaching the explicit Inter fallback. The Mono loader now sets `adjustFontFallback: false`; Inter's body-text metric fallback remains enabled. The built Mono CSS variable contains only the bundled Mono face, so CSS can reach the explicit Inter next. The strict per-character test is retained. Local desktop/mobile glyph checks and build passed; the exact final Windows CI remains the authority for that environment.
