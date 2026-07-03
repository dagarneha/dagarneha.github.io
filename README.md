# Creative Designer Portfolio

A high-end, animated portfolio site for a creative designer/freelancer.

## Design system

- **Palette ([Color Hunt](https://colorhunt.co/palette/e5d9f2f5efffcdc1ffa594f9)):** `#f5efff`, `#e5d9f2`, `#cdc1ff`, `#a594f9`
- **Accent:** Lavender purple `#a594f9`
- **Background:** Soft lilac `#f5efff` / `#e5d9f2`
- **Headlines:** Sora
- **Body:** Inter

## Features

- Custom cursor with hover states
- Page loader with SVG progress ring
- Animated navigation (slide-in, hide on scroll down, glass on scroll)
- Hero with staggered title reveal, stat counters, floating badge
- Infinite marquee
- Glassmorphism cards with animated dotted borders
- Scroll-triggered reveals
- Magnetic buttons/links
- 3D tilt on portfolio cards
- Testimonial slider
- Contact form with success state
- Fully responsive with mobile menu
- **Projects showcase** (`#work` on `index.html`) — filterable grid, search, modal case studies, load more

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
cd portfolio
python3 -m http.server 8080
```

Then visit http://localhost:8080 — scroll to **Work** for the full project showcase.

## Customize

- Portfolio branded for **Neha Dagar** — update email, social links, and copy in `index.html` as needed
- Swap Unsplash image URLs with your own work
- Update email and social links in the contact section
- Adjust colors in `:root` in `styles.css`
- Edit project data in `initProjectsShowcase()` inside `script.js`
