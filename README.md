# buburo.com

Static site. No build step, no dependencies. Google Fonts is the only external request; icons are inline SVG.

## Pages

| URL                | File                        |
|--------------------|-----------------------------|
| `/`                | `index.html`                |
| `/work/`           | `work/index.html`           |
| `/webink/`         | `webink/index.html`         |
| `/webink/install/` | `webink/install/index.html` |
| `/about/`          | `about/index.html`          |
| `/terms/`          | `terms/index.html`          |
| `/privacy/`        | `privacy/index.html`        |

`webink.html`, `terms.html` and `privacy.html` at the root are redirect stubs for the old URLs — the Play Store listing
points at some of them. Do not delete.

## Assets

- `css/main.css` — one stylesheet, design tokens at the top, light + dark.
- `js/site.js` — mobile menu, work filter, install OS tabs, carousel.
- `img/` — site-wide artwork, Buburo branding, and other project cards.
- `img/webink/` — Webink branding, screenshots, source logos, flags, and download badges.

Paths are absolute from the site root, so preview through a server:

    python3 -m http.server 8000
    # http://localhost:8000/

## Things that are hand-maintained

These are static text in the HTML — nothing fetches them:

- **Webink version** (`webink/index.html`, the meta table) — currently `1.2.3 (115)`. Update when you release.
- **Language line counts** (`webink/index.html`, the Languages section) — Dart 34,914 / Rust 186 / JS 165 / Swift+Kotlin
  104, plus the bar percentages. Recount with `git ls-files '*.dart' | xargs wc -l` in the webink repo.

## Analytics

Off. `js/site.js` has `GA_MEASUREMENT_ID = ''` at the top — put a GA4 id there and it switches on for every page. While
empty, the site makes no third-party request and sets no cookies.

The consent banner is built in and appears **only when an id is set** — with no analytics there is nothing to consent
to, so the site sets no cookies and asks nothing. Nothing is requested from Google until a visitor accepts.

The visitor's choice is stored in `localStorage` under `buburo.consent`, not in a cookie. Clearing cookies alone will
not reset it; clear site data, or run
`localStorage.removeItem('buburo.consent')`.

To see the banner without switching analytics on, add `?cookie-preview` to any URL, or run `showCookieBanner()` in the
console. In preview the buttons only close it — nothing is stored.

## To fill in before pushing

- **`webink/source.json`** — holds a placeholder version entry (`0.0.0`,
  `size: 0`, `vFILL_ME`). Replace with the first real release.
- **`.dmg` download link** on the Webink releases row — currently points at
  `github.com/buburod/webink-releases`, which does not exist yet. The webink repo is private and private release assets
  404 anonymously, so the binaries need a public repo. See `docs/RELEASING.md` in the webink repo.
- `img/bruno.jpg` — About page portrait.
- About page bio and experience rows.
- SideStore source URL on the install page (step 5).
