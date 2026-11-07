# CVHS Plasma Shop

Student pricing calculator and project gallery for the Crescent Valley HS metals
program. A student picks material, finish, and size, sets a selling price, and sees
what the piece costs to make and what their share of the profit is. Live at
https://mr-mcateer.github.io/authentic-work/

## Architecture

- **Frontend**: HTML5, hand-rolled CSS (`styles.css`, CVHS maroon and gold), vanilla JavaScript (`app.js`)
- **Hosting**: GitHub Pages (static, zero cost)
- **Data**: flat-file `projects.json`, no database
- **Submission**: `mailto:` link to the instructor, nothing stored server-side

## How the price works

The calculator works backwards from the selling price:

```
Cost to Make = ceil( (area x material rate + area x $0.01 consumables) x 1.20 waste + $10 shop fee + finish )
Profit       = Selling Price - Cost to Make
Student Share = 50% of profit    School Fund = 50% of profit
```

- **Waste factor 1.20**: kerf, edge margins, nesting inefficiency
- **Consumables $0.01/sq in**: plasma tips, nozzles, electrodes, shield gas
- **Shop fee $10**: amortized delivery and shearing
- **Finishes**: Bare $0, Paint +$10, Powder Coat +$15, TIG Weld +$25
- Negative profit shows a loss warning instead of earnings

**Material rates** come from one landed price per pound: Ram Steel sales order 1216470 to CVHS,
11/06/2026, 14ga 48x96 hot rolled at $132.64/CWT plus delivery and CAT = **$1.39/lb**.
Rate per sq in = $1.39 x sheet weight (lb/sq ft) / 144.

| Material | lb/sq ft | Rate |
|---|---|---|
| 10ga Steel | 5.625 | $0.054 |
| 11ga Steel | 5.0 | $0.048 |
| 12ga Steel | 4.375 | $0.042 |
| 14ga Steel | 3.125 | $0.030 |
| 16ga Steel | 2.5 | $0.024 |
| 18ga Steel | 2.0 | $0.019 |

History: 10/22/2025 quote $121.60/CWT; 2/17/2026 $127.91/CWT; 11/06/2026 $132.64/CWT.

When Ram re-quotes, change `PRICE_PER_LB` at the top of `app.js` and this table.

## Gallery

Cards load from `projects.json`. "Try this size" loads a past project's dimensions
into the calculator.

```json
{
  "id": "proj-001",
  "title": "Name Plaque with Tank Design",
  "technique": "CNC Plasma Cutting",
  "dimensions": "18x10",
  "material": "16ga Steel",
  "student": "Student Project",
  "img_url": "img/name-plaque-tank.jpg"
}
```

Images go in `/img`. Strip EXIF/GPS before committing; no student last names.

## Deployment

Push to `main`; GitHub Pages serves the repo root. No build step.

## Notes

This is a tax-exempt educational program. Revenue supports student skill-building
and equipment maintenance.
