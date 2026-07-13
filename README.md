# LineCraft Tile & Floors website

A responsive, single-page business website for LineCraft Tile & Floors, focused on bathroom tile, shower tile, kitchen backsplashes, flooring, caulking, trim, and finishing work in Philadelphia, Bucks County, and Montgomery County.

## Preview

Open `index.html` directly, or run a local server from this folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Production checklist

1. Confirm the final phone number, email address, and service-area language in `index.html`.
2. Confirm the final domain, then update canonical, Open Graph, schema, `robots.txt`, and `sitemap.xml`.
3. Keep portfolio images compressed to WebP or AVIF with descriptive filenames and alt text.
4. Add confirmed license, Pennsylvania contractor registration, insurance, warranty, and business-hour information if applicable.
5. Deploy on Netlify with Forms detection enabled so the estimate form appears in the Netlify Forms dashboard.
6. Validate the LocalBusiness schema with Google Rich Results Test.
7. Add Google Search Console, analytics, conversion tracking, and a privacy policy before running ads.

## Main files

- `index.html` — page content, SEO metadata, portfolio copy, contact form, and LocalBusiness schema
- `styles.css` — responsive design system
- `script.js` — mobile menu, project filters, reveal effects, Netlify form submission, and current-year footer
- `assets/` — logo files, hero/about visuals, and optimized portfolio photography
- `tools/validate_site.py` — dependency-free structural and SEO validation

Run the validation pass with:

```powershell
python tools/validate_site.py
```

## Brand system

- Deep Charcoal: `#252525`
- Copper Brown: `#A76F3D`
- Slate Gray: `#6F777D`
- Warm Sand: `#D8C3A5`
- Soft Ivory: `#F7F3EC`
- Headings: Poppins
- Brand details: Montserrat
- Body: Inter
- Accent: Merriweather Italic
