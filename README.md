# Lanka Speech — GitHub Pages + Render Setup

Your site is on **GitHub Pages**, which only serves static files — it cannot
run the Node/Express server that talks to Gemini's TTS API. That's why
Generate Speech doesn't work on `amarasena-walker.github.io/LankaSpeech2`.

The fix: host the two halves separately.

```
frontend/   → push these 3 files to your GitHub Pages repo (as you already do)
backend/    → deploy this to Render (free) — it's the only part that needs a server
```

They talk to each other over the internet via a URL, so they don't need to
be on the same host.

---

## Step 1 — Deploy the backend to Render (free)

1. Push the **`backend/`** folder to its own GitHub repo (e.g. `lanka-speech-backend`).
   - Simplest way: create a new repo on GitHub, then from inside `backend/`:
     ```
     git init
     git add .
     git commit -m "Lanka Speech backend"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/lanka-speech-backend.git
     git push -u origin main
     ```
2. Go to https://render.com → sign up/log in (free, no credit card needed for the free tier) → **New +** → **Web Service**.
3. Connect your `lanka-speech-backend` repo.
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` = your key from https://aistudio.google.com/apikey
6. Click **Create Web Service**. Wait for the deploy to finish (2–3 min).
7. Render gives you a URL like `https://lanka-speech-backend-xxxx.onrender.com`.
   Copy it — you need it in Step 2.

   > A `render.yaml` blueprint is included in this zip if you prefer
   > Render's "Blueprint" one-click deploy instead of manual setup — put it
   > at the root of the repo you connect to Render.

   > **Free tier note:** Render's free web services "spin down" after
   > ~15 minutes of no traffic and take ~30–60 seconds to wake back up on
   > the next request. The first Generate click after idle time may be slow
   > — that's normal, not a bug.

## Step 2 — Point your frontend at the backend

1. Open `frontend/script.js`.
2. Near the top, find:
   ```js
   const API_BASE_URL = 'https://YOUR-BACKEND-URL.onrender.com';
   ```
3. Replace it with the real URL Render gave you, e.g.:
   ```js
   const API_BASE_URL = 'https://lanka-speech-backend-xxxx.onrender.com';
   ```
4. Commit and push `index.html`, `styles.css`, and `script.js` to your
   `LankaSpeech2` GitHub Pages repo (same as before).
5. Give GitHub Pages a minute to rebuild, then reload
   `https://amarasena-walker.github.io/LankaSpeech2/`.

That's it — Generate Speech will now call your Render backend, which calls
Gemini, and returns real audio back to the page.

## Built-in fallback

If the backend is asleep, unreachable, or the API key is missing/invalid,
the site automatically speaks the text using your browser's own voice
engine instead of showing a dead error — so it's never a hard failure,
just lower quality until the real backend responds.

## Local testing (optional)

You can still run everything on one machine before deploying:
```
cd backend
npm install
cp .env.example .env   # then paste your GEMINI_API_KEY in
npm start
```
Open http://localhost:3000 — this serves the copy of the frontend bundled
in `backend/public/` directly, with `API_BASE_URL` not needed (same origin).
