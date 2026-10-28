
# Site

Hopefully helpful tools and a bit of a playground for experiments. The site uses Jekyll, a static site generator, on Ruby. DNS and SSL by Cloudflare. It also uses GitHub actions, GitHub issues, and Python for extensive automation.

## Configuration

There are several optional settings for you to configure. Use the `_config.yml` file in the repo.

## Running locally

Needs Ruby 3.3 (see `.ruby-version`) and Node 24.

```sh
npm install          # third-party browser libraries, pinned in package.json
bundle install       # Jekyll and plugins, installed into vendor/bundle
npm run serve        # copies libraries into assets/vendor, then serves on http://localhost:4002
```

`npm test` runs the unit tests for tool logic and the vendor script.

## How the site is organised

- `_tools/<slug>/` – one folder per tool: `index.html` (front matter and the markup inside the tool window), `app.js`, and any logic modules. Pages keep their URL through `permalink`.
- `_layouts/tool.html` – wraps a tool in the window frame and renders the How to use, About and Questions sections from front matter.
- `_data/categories.yml` – the groups on the home page; `_data/elsewhere.yml` – feeds, apps and other sites.
- `assets/css/site.css` – the one stylesheet, built on CSS variables.
- `package.json` – every third-party library, at an exact version. `npm run vendor` copies them into `assets/vendor/`, writes `_data/vendor.json` and the CycloneDX `sbom.json`. Dependabot keeps them up to date.
- `.github/workflows/pages.yml` – builds and deploys the site with GitHub Actions.

Documents (templates, policies, role profiles) live in `_pages/` as Markdown on the `doc` layout, with `category` and `group` front matter for the home and templates pages.
