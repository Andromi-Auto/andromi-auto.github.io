# andromi-auto.github.io

The website of [Andromi Auto](https://github.com/Andromi-Auto/andromi-auto): Android Auto on the
screen of a Xiaomi EV, straight from a Xiaomi phone. Served by GitHub Pages at
<https://andromi-auto.github.io>.

Plain HTML, CSS and a little JavaScript, no build step:

| File | What it is |
| --- | --- |
| `index.html` | Home: what the app does, features, requirements, download |
| `guide.html` | User guide, including the Interconnectivity and digital key module sections |
| `faq.html` | Frequently asked questions (a link like `faq.html#baidu` opens that answer) |
| `404.html` | Page not found |
| `assets/style.css` | Material 3 look, light and dark colour roles from the app's Xiaomi orange |
| `assets/app.js` | Theme switch, app bar on scroll, latest release line, guide contents |
| `assets/icon.svg`, `favicon.*`, `apple-touch-icon.png` | The app icon |

The download buttons use GitHub's `releases/latest/download/Andromi-Auto-release.apk` link, so they
always point at the newest stable release without editing the site.

## Cache busting

GitHub Pages lets browsers keep CSS and JS for 10 minutes, so a page could load new HTML with an
old stylesheet. Every page links them as `assets/style.css?v=<hash>`; after changing either file,
refresh the hashes:

```sh
python3 - <<'PY'
import hashlib, re, glob
ver = {f: hashlib.sha256(open(f"assets/{f}", "rb").read()).hexdigest()[:8] for f in ("style.css", "app.js")}
for p in glob.glob("*.html"):
    s = open(p).read()
    for f, v in ver.items():
        s = re.sub(r"(assets/" + re.escape(f) + r")(\?v=[0-9a-f]+)?\"", r"\1?v=" + v + '"', s)
    open(p, "w").write(s)
PY
```
