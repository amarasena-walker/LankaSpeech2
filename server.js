/**
 * Lanka Speech — Backend Server
 * Serves the frontend AND provides a real /api/tts endpoint powered by
 * Google's Gemini TTS models via the @google/genai SDK.
 *
 * Run with:
 *   npm install
 *   npm start
 * Then open: http://localhost:3000
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// ── Middleware ────────────────────────────────────────────────
app.use(cors()); // allow requests from any origin (also covers file:// testing)
app.use(express.json({ limit: '2mb' }));

// Serve the static frontend (index.html, styles.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// ── Gemini client (only created if a key is present) ───────────
let ai = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    '\n⚠️  No GEMINI_API_KEY found in .env — /api/tts will return an error until you add one.\n' +
    '   Get a free key at https://aistudio.google.com/apikey and put it in a .env file:\n' +
    '   GEMINI_API_KEY=your_key_here\n'
  );
}

// Map the voice names used by the site's UI directly to Gemini's
// prebuilt voice names (they already match: Kore, Charon, Puck, Zephyr, Fenrir).
const VALID_VOICES = new Set(['Kore', 'Charon', 'Puck', 'Zephyr', 'Fenrir']);

// Style/emotion is applied as a natural-language instruction prefix,
// since Gemini TTS follows tone instructions in the prompt itself.
const TONE_INSTRUCTIONS = {
  cheerful: 'Say the following cheerfully and warmly',
  professional: 'Say the following in a clear, professional, neutral tone',
  calm: 'Say the following calmly and gently',
  dramatic: 'Say the following in a dramatic, expressive, cinematic voice',
};

/**
 * Converts raw 16-bit PCM audio (as returned by Gemini TTS) into a
 * playable WAV file by prepending a standard RIFF/WAV header.
 */
function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // audio format = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/** Parses the sample rate out of a mimeType like "audio/L16;codec=pcm;rate=24000" */
function parseSampleRate(mimeType) {
  const match = /rate=(\d+)/.exec(mimeType || '');
  return match ? parseInt(match[1], 10) : 24000;
}

// Rough estimate of speech duration (used for the UI timeline before
// the browser reports the real <audio> duration).
function estimateDurationSeconds(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round((words / 150) * 60)); // ~150 wpm
}

// ── TTS endpoint ─────────────────────────────────────────────
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice, tone } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'No text provided.' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ success: false, error: 'Text exceeds 5000 character limit.' });
    }

    const voiceName = VALID_VOICES.has(voice) ? voice : 'Kore';

    if (!ai) {
      return res.status(500).json({
        success: false,
        error: 'Server is missing GEMINI_API_KEY. Add it to your .env file and restart the server.',
      });
    }

    const instruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.cheerful;
    const prompt = `${instruction}: ${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
    });

    const part = response?.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (!audioData) {
      throw new Error('No audio returned from Gemini TTS.');
    }

    const pcmBuffer = Buffer.from(audioData, 'base64');
    const sampleRate = parseSampleRate(mimeType);
    const wavBuffer = pcmToWav(pcmBuffer, sampleRate);

    // Return the audio inline as a base64 data URL so the frontend can
    // play/download it immediately without needing a file server.
    const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

    res.json({
      success: true,
      audioUrl,
      duration: estimateDurationSeconds(text),
      voice: voiceName,
    });
  } catch (err) {
    console.error('TTS generation error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Speech generation failed. ' + (err.message || 'Unknown error.'),
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(API_KEY) });
});

app.listen(PORT, () => {
  console.log(`\n✅ Lanka Speech server running at http://localhost:${PORT}\n`);
});
