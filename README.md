# Lanka Speech — Setup Guide

This package fixes the issues you ran into and makes the **Generate Speech**
button actually work, with two layers:

1. **Real AI voices (Gemini TTS)** — needs a free Google API key + Node running.
2. **Instant fallback** — if the server/API key isn't set up yet, the site
   automatically uses your browser's built-in speech engine instead of
   showing a dead "offline demo" alert. So the button works either way.

## What was wrong before

- `package.json` was empty → `npm install`/`npm run dev` failed instantly.
- The requested `@google/genai` version didn't exist on npm → install failed.
  Fixed by pinning to `^2.11.0` (currently the latest published version).
- There was no CORS handling and the page was being opened as
  `file:///.../index.html`, which browsers block from calling `localhost`.
- `script.js` was guessing the API host based on `file:` vs `http:` — fragile.
- PowerShell's execution policy blocked npm scripts on Windows.

## What this package does differently

Instead of patching around `file://`, the server now **hosts the whole site
itself** (HTML/CSS/JS + the API) on `http://localhost:3000`. That removes
the CORS/file-protocol problem entirely — you never open `index.html`
directly again, you open the server's URL.

## Setup (Windows, Mac, or Linux)

1. **Install Node.js 18+** if you don't have it: https://nodejs.org (LTS version).

2. **Open a terminal in this folder.**
   - On Windows, if PowerShell blocks scripts with a `PSSecurityException`,
     use **Command Prompt (cmd.exe)** instead of PowerShell, or run
     PowerShell as Administrator and execute:
     ```
     Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
     ```

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Add your Gemini API key** (only needed for real AI voices — the site
   still works without this, using the browser fallback):
   - Copy `.env.example` to `.env`
   - Get a free key at https://aistudio.google.com/apikey
   - Paste it in: `GEMINI_API_KEY=your_key_here`

5. **Start the server:**
   ```
   npm start
   ```

6. **Open the site:** http://localhost:3000

That's it — press "Generate Speech" and it will call Gemini's TTS model
and play/download a real WAV file. If the key is missing or the request
fails for any reason, the browser's own speech synthesis speaks the text
instead, so the button is never a dead end.

## Notes

- Voice names in the UI (Nethmi, Dinithi, Yasara, Kavindu, Tharindu) map
  directly to Gemini's prebuilt voices `Kore`, `Charon`, `Puck`, `Zephyr`,
  and `Fenrir`.
- The "Emotion" dropdown is sent to Gemini as a style instruction
  (e.g. "Say the following calmly and gently: ...").
- Real Gemini audio is returned as a `data:audio/wav;base64,...` URL, so
  no extra file storage/cleanup is needed on the server.
- The browser fallback uses `speechSynthesis`, so voice quality/availability
  (especially for Sinhala) depends on the voices installed on your OS/browser.
  Chrome and Edge on Windows generally have the widest voice coverage.
