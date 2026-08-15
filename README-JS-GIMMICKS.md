# The JS gimmicks, explained

This site loads eight scripts (in this order, from `layout.blade.php`):

```
imagesloaded.pkgd.min.js → anime.min.js → charming.min.js →
binary.js → pieces.js → main.js → keyboard.js → bootstrap.offcanvas.js
```

Plus a ninth, `app.js`, which is **on disk but never loaded by the page** —
see the note at the end.

Below is what each one actually does, based on reading the source rather
than guessing from the filename.

---

## The libraries (third-party, unmodified)

**`imagesloaded.pkgd.min.js`** — [imagesLoaded](https://imagesloaded.desandro.com/)
by David DeSandro. Fires a callback once every image (including CSS
`background-image`s) on the page has finished loading. `main.js` uses this
to hold off starting any animation until the header logo image is actually
in the browser — otherwise the shatter effect would run against a blank
image for a frame or two.

**`anime.min.js`** — [anime.js](https://animejs.com/), the animation engine.
Everything that moves smoothly on this page — tile translation, opacity
fades, scale-in/out on menu switches — runs through it. It's the only
animation library on the page; nothing here uses CSS `@keyframes` for the
big effects (those are reserved for the flicker/glitch text, which *is*
plain CSS).

**`charming.min.js`** — [Charming](https://github.com/lukehaas/charming).
Takes a text node and wraps every individual character in its own
`<span>`. On its own it does nothing visible — it just hands `main.js` and
`keyboard.js` a set of per-letter targets they can animate independently
(stagger a fade-in letter by letter, for instance).

**`bootstrap.offcanvas.js`** — a jQuery-dependent fork of Bootstrap's navbar
collapse plugin that swaps the usual dropdown collapse for a full slide-out
"offcanvas" panel. This is what powers the mobile hamburger menu
(`data-toggle="offcanvas"` on the navbar button). Needs jQuery to be loaded
first, which is why it's last in the script order.

---

## The actual gimmicks (custom, written for this site)

### `pieces.js` — the header logo shatter

Defines a `Pieces` class that slices a background image into a grid of
absolutely-positioned tile `<div>`s (via CSS `background-position` offsets —
the classic sprite-slicing trick) and exposes an `.animate()` method with
per-tile delay/translate/opacity control.

It's instantiated directly in `layout.blade.php`'s inline `<script>` block,
targeting `.content .tiles` (the div carrying
`background-image: url(/img/brandheader.png)`), configured for a **14×12
grid** (168 tiles). Clicking **"Programación"** calls `piecesObj.animate()`
with a *distance-based delay function*: it measures each tile's distance
from the stage's center and staggers the animation so tiles ripple outward
from the middle, flying off in the direction of their quadrant
(`anime.random(-400,0)` for the left half, `anime.random(0,400)` for the
right, same idea vertically). Clicking **"Diseño"** reverses it — tiles fly
back to their stored `data-centerx`/`data-centery` coordinates.

### `main.js` — a second, independent shatter system

This is a Codrops demo file (credited in the header comment) with its own
complete, self-contained implementation: a `PieceMaker` class and a
`GlitchFx` class. Confusingly, **it duplicates what `pieces.js` already
does**, but targets a *different* element — the empty
`<div class="pieces"></div>` in `header.blade.php`, not the `.tiles` div.

- `PieceMaker` builds its own 14×10-ish tile grid and, once images finish
  loading (via `imagesLoaded`), starts a continuous `loopFx()` — randomly
  flickering individual tiles to transparent and back, forever, as an
  ambient background effect.
- `GlitchFx` is what actually drives the **flicker on `[data-glitch]`
  elements** you'll see on the title, the "Work with us" link, and the
  binary labels: every 4–6 seconds it nudges each one through a short burst
  of random `translate3d()` jitters and class swaps.
- Clicking **"Diseño"/"Programación"** is *also* wired up here
  independently (`main.js` listens on the same `.switch` element that
  `layout.blade.php`'s inline script does). So a single click actually
  triggers **two unrelated animation systems on two different DOM
  elements at once** — `pieces.js`'s tile-shatter on `.tiles`, and
  `main.js`'s letter-by-letter menu swap (via Charming) plus its own tile
  system on `.pieces`. Whether that was intentional layering or a
  copy-pasted demo that never got cleaned up, the net effect is the dense,
  slightly chaotic decrypt-terminal feel the page has.

### `binary.js` — the binary → word decode

This is the piece behind "the binary code changes into words." It's a
small jQuery plugin, `$.fn.ticker()`, applied to every `.binary` element
(the little stacks of `· diseño ·` / `101010101` / `· design ·`).

For each character position, it doesn't just swap the text — it **cycles
through a character set** (`01101011011100ABCDEFGHIJKLMNÑOPQRSTUVXYZ`) on a
`setInterval`, advancing one character at a time until it lands on the
correct letter for the next phrase in the rotation, exactly like the
"decrypting text" effect popularized around the same era. It fires two
ways: on click, and automatically every 7 seconds via
`window.setInterval(flipText, 7000)`.

### `keyboard.js` — letter-by-letter reveal on the benefit cards

Not a typing simulator — the name refers to the *effect*, not the
mechanism. It uses Charming to split each benefit card's description
(`.item_content` inside "Alcance" / "Posicionamiento" / "Productividad")
into individual letter spans, then on `mouseenter`/`touchstart`, fades each
letter in with an increasing per-letter delay (`(i+5) * 30ms`) — so hovering
a card makes its description materialize left to right, like it's being
typed out.

---

## The file that does nothing: `app.js`

`public/js/app.js` is the default webpack-bundled output from Laravel's
stock front-end scaffold — you can tell from the webpack bootstrap
boilerplate at the top of the file. **It's never referenced in
`layout.blade.php`'s script tags** (only the eight files above are), so it
just sits in `public/js/` unused. Same story for `public/css/app.css`,
which is explicitly commented out in the `<head>`. Both are harmless to
delete if you're cleaning the repo up, since nothing links to them.

---

## What changed in this rebuild

- Added `html { scroll-behavior: smooth; }` (with a
  `prefers-reduced-motion` guard) purely in CSS — no scroll-hijacking JS,
  so it can't step on any of the animation systems above, which all
  animate individual elements rather than the page's scroll position.
- Added `index-en.html`, a faithful English translation with an EN/ES
  toggle in the nav. Only text nodes were translated — every class, `id`,
  `data-*` attribute, and script tag is identical to `index.html`, so all
  the gimmicks above work exactly the same way in both languages.
