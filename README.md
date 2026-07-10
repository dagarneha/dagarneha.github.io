# Neha Dagar — Graphic Designer Portfolio

Portfolio site for **Neha Dagar**, Graphic Designer at ProofHub.

## Design system (Option A — Warm Coral & Charcoal)

| Role | Color |
|------|-------|
| Background | `#FAF8F5` |
| Surface | `#F3EDE8` |
| Accent | `#E8553A` |
| Text | `#1A1714` |
| Muted | `#6B6560` |

- **Headlines:** Fraunces
- **Body:** Plus Jakarta Sans

## Features

- Custom cursor (desktop)
- Filterable/searchable project grid with modal case studies
- In-page “Load More Projects” pagination
- Contact form opens a pre-filled email draft via `mailto:`
- Certifications, timeline, testimonials, FAQ
- Fully responsive mobile navigation

## Run locally

```bash
python3 -m http.server 8080
```

Visit http://localhost:8080 — use Cursor’s **Ports** panel to forward port 8080 if opening from your local browser.

## Site versions

| Page | Theme |
|------|-------|
| `index.html` | Warm coral & charcoal (default) |
| `index-pastel.html` | Pastel dream — thistle, petal pink, baby pink, icy & sky blue |
| `homepage-v2.html` | Experimental dark Awwwards-style (not in main nav) |

### Pastel palette (`index-pastel.html`)

| Token | Color |
|-------|-------|
| Thistle | `#CDB4DB` |
| Pastel petal | `#FFC8DD` |
| Baby pink | `#FFAFCC` |
| Icy blue | `#BDE0FE` |
| Sky blue | `#A2D2FF` |

Theme overrides live in `css/theme-pastel.css`.

## Customize

- Edit project data in `initProjectsShowcase()` inside `script.js`
- Swap hero and project images with your real ProofHub / client work
- Adjust colors in `:root` in `styles.css`
- Update copy and links in `index.html`
