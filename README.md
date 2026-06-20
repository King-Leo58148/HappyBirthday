# For Sandra — Setup & Deploy

## 0. Set your password (do this before anything else)
The site is locked behind a password screen so only people you give the link
*and* password to can see it — search engines and randoms with the link can't
get in.

Pick a password (something Sandra would guess easily, like an inside joke or
a meaningful date), then generate its hash:

**Option A — using this sandbox's Python (if you're running commands here):**
```bash
python3 -c "import hashlib; print(hashlib.sha256('YOUR-PASSWORD-HERE'.encode()).hexdigest())"
```

**Option B — in any browser console (F12 → Console tab), paste:**
```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR-PASSWORD-HERE'))
  .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')));
```

Copy the long hex string it prints, then open `script.js`, find this line near the top
(search for `PASSWORD_HASH`):
```js
const PASSWORD_HASH = "a268e47c2aabfd8c9e6eac615564d426d33f08bcd7fd2789315517676987a97f"; // placeholder for "CHANGE-ME"
```
Replace the hash string with your new one. Save the file.

**Important:** don't just put your real password in a comment next to it — the
hash is the only thing that should appear in the file. Keep the actual password
somewhere private (text yourself, etc.) so you remember what to tell Sandra.

This isn't bank-vault security — anyone determined enough to read the JS file
and brute-force or look up the hash could get in. But it fully blocks search
engines, link-sharing accidents, and anyone casually browsing your GitHub repo.

**One more thing:** the password gate only protects the *live website*. If your
GitHub repo is public, anyone could still find the photos by browsing the repo's
files directly on github.com (not just the deployed site). If that matters to
you, make the repo **private** in Settings → General → Danger Zone → Change
visibility. GitHub Pages still works fine with private repos on a personal
GitHub account.

## 1. Add Sandra's photos (do this first)
Inside the `images` folder, replace the 6 placeholder files with real photos of Sandra —
**keep the exact same filenames**: `sandra-1.jpg`, `sandra-2.jpg`, ... `sandra-6.jpg`.

If a photo isn't a `.jpg`, just rename it to end in `.jpg` (works fine even if it's
actually a png/jpeg under the hood — browsers don't care for this purpose).

Have more or fewer than 6? Open `index.html`, find the `<div class="gallery-grid">`
block, and copy/delete `<figure class="gallery-item ...">` blocks to match.

## 2. Personalize the captions (optional but worth it)
In `index.html`, each photo has `<figcaption>add a caption here</figcaption>` —
swap those for things like "the day you sent me this and made my whole week" etc.

## 3. (Optional) Add music
Drop an mp3 at `audio/song.mp3`, then in `script.js` uncomment the two `bgAudio` lines
and the `if (playing) {...}` line near the bottom (search for "bgAudio").

## 4. Deploy to GitHub Pages (5 minutes)
```bash
# from inside this folder
git init
git add .
git commit -m "happy birthday sandra"
git branch -M main
git remote add origin https://github.com/King-Leo58148/sandra-birthday.git
git push -u origin main
```
Then on GitHub: go to the repo → **Settings → Pages** → under "Build and deployment",
set **Source: Deploy from a branch**, branch **main**, folder **/ (root)** → Save.

Your site will be live in ~1 minute at:
`https://king-leo58148.github.io/sandra-birthday/`

(If you'd rather keep the repo private, GitHub Pages still works on private repos
as long as you're on GitHub Free for a personal account — public repos are simplest though.)

## 5. Send it to her
Just send her the link tomorrow morning. That's it 🩷

---
### What's interactive on the site
- **Same Sky** — drag the moon around, tap the glowing stars for hidden notes
- **Gallery** — scroll-reveal animation as photos come into view
- **Blow Out the Candles** — she blows into her phone mic and the flames go out for
  real (uses live mic volume detection). If she doesn't want to grant mic access,
  tapping each candle works too. Either way confetti fires once all 5 are out.
- **Constellation of Us** — tap each star to read a memory in sequence
- **The Letter** — tap the envelope to open and reveal your message
- Sound toggle top-right (silent until you add an mp3, see step 3)

Everything's responsive — looks right on her phone too.

### A heads up on the candle-blowing feature
Mobile browsers require **https** for microphone access (a plain http GitHub Pages
link is fine — GitHub Pages serves over https automatically, so no extra setup
needed there). If she's on iPhone, Safari will show a one-time permission popup —
that's normal. If she taps "don't allow," the candles still work by tapping them
directly, so nothing breaks either way.

