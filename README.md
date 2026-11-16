# Onyra

[![X @onyraagent](https://img.shields.io/badge/X-@onyraagent-111111?logo=x&logoColor=white)](https://x.com/onyraagent)

## Links

- **Website:** https://onyraai.com
- **X:** https://x.com/onyraagent (@onyraagent)
- **GitHub:** https://github.com/onyraagent-art/onyra
- **$ONYRA CA:** coming soon — only trust @onyraagent and onyraai.com

Marketing site for **Onyra**, the agent that never sleeps. Onyra is pre-release: this site describes the product, it does not offer a download.

The site is static HTML, CSS, and JavaScript. There is no build step.

## Run it locally

From this directory:

```bash
python3 serve.py
```

The server listens on port `47331` and returns `404.html` for unknown paths. Open [http://127.0.0.1:47331](http://127.0.0.1:47331).

`python3 -m http.server 47331` also works. Python’s built-in server will not use `404.html` for missing URLs; GitHub Pages will.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home |
| `/agent/` | Agent |
| `/cloud/` | Cloud |
| `/wallet/` | Wallet |
| `/token/` | Token |
| `/docs/` | Docs |
| `/roadmap/` | Roadmap |
| `/404.html` | Not found |

## Contract address

`$ONYRA` is not launched. Every page reads the address from one file:

```js
// js/config.js
contractAddress: ""
```

Leave it empty and the site shows **CA: coming soon**. When the contract is published, set `contractAddress` to the full address. The footer chip, the home teaser, and the token page all update from that value. The copy button copies the address only after it is set.

The X account is [@onyraagent](https://x.com/onyraagent). The handle and ticker live in the same file (`xHandle` and `xUrl`).

## GitHub Pages

`.github/workflows/pages.yml` deploys the site to GitHub Pages on pushes to `main`.

1. Push this project to a GitHub repository whose default branch is `main`.
2. In the repository settings, set Pages to **GitHub Actions**.
3. The workflow uploads the site (including `CNAME` and `.nojekyll`) and deploys it.
4. Point `onyraai.com` at GitHub Pages and enable HTTPS once DNS has settled. `CNAME` already contains `onyraai.com`.

## Brand files

- `assets/logo.svg` — wordmark and symbol
- `assets/mark.svg` — symbol
- `assets/favicon.svg` — browser icon
- `assets/og.png` — social preview, 1200×630

## Fonts

Fraunces, Outfit, and IBM Plex Mono are self-hosted under `assets/fonts/` and licensed under the SIL Open Font License. The license texts are beside the files.
