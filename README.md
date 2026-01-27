# Authentic Work Portal v1.0

A minimalist, high-utility web portal for school-based engineering enterprises. Features a real-time estimator, mastery gallery, and stateless application system.

## Architecture

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES6+)
- **Hosting**: GitHub Pages (Static, zero-cost)
- **Data Strategy**: Flat-file JSON (no database)
- **State Management**: Stateless (client-side only)
- **Communication**: mailto: URI Scheme for lead capture

## Features

### Module A: The High-Fidelity Estimator
Real-time calculator using a "Safety-First" coefficient for sheet metal fabrication.

**Formula**: `Price = ⌈((L × W × Rate) × 1.5) + $20⌉`

**Material Rates (2026)**:
- 12ga Steel: $0.08/sq in
- 14ga Steel: $0.07/sq in
- 16ga Steel: $0.06/sq in
- 18ga Steel: $0.05/sq in
- Aluminum: $0.25/sq in

**Base Fee**: $20.00 (covers $10 shop consumables + $10 student design time)

### Module B: The "Mastery" Gallery
Dynamic grid of student projects loaded from `projects.json`. Each card includes:
- Project image (lazy-loaded)
- Title, dimensions, material, student name
- Brief fabrication challenge/success description
- "Apply This Style" button to auto-inject dimensions into the estimator

### Module C: Stateless Application System
Students package their estimate into a formal email-based application:
- Auto-populates with calculator state
- Validates dimensions and description
- Generates mailto: link for submission
- No server-side storage (security & privacy by design)

## Getting Started

### Local Development
1. Open `index.html` in a web browser
2. The estimator calculates prices in real-time
3. Gallery loads from `projects.json`
4. Submit button opens email client with pre-filled application

### Adding Projects
Edit `projects.json` with your project data:

```json
{
  "id": "unique-id",
  "title": "Project Name",
  "dimensions": "12x12",
  "material": "16ga Steel",
  "student": "Initial. Last.",
  "description": "Fabrication challenge/success",
  "img_url": "img/your-image.jpg"
}
```

### Adding Images
1. Place images in the `/img` directory
2. Update `img_url` in `projects.json` to point to your images
3. Commit and push to GitHub

## Deployment

This site is deployed on GitHub Pages. To set it up:

1. Push code to `main` branch
2. In GitHub repo Settings → Pages, select `main` branch as source
3. Site will be live at `https://username.github.io/authentic-work`

## Design Guidelines

- **Aesthetic**: Shop-Floor Brutalism (monospace fonts, stark contrast)
- **Color Palette**:
  - White (#FFFFFF)
  - Slate (#F8FAFC)
  - Black (#000000)
  - Safety Orange (#F97316) for primary actions
- **Responsive**: Mobile-first design (optimized for Instagram in-app browser)

## Legal Notice

This is a tax-exempt educational program. All revenue supports student skill-sharing and equipment maintenance. Students manage 80% of this workflow.

## Success Criteria

- ✅ Zero-cost hosting (GitHub Pages)
- ✅ Stateless architecture (no user data stored)
- ✅ Low friction (price estimate in <15 seconds)
- ✅ Mobile-responsive design
- ✅ Zero build overhead (CDN-based CSS/fonts)

## Support

For questions about this portal or to submit projects, contact your Project Lead or engineering instructor.
