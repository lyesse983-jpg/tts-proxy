// ============ index.js ============

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json({ limit: '10mb' }));

// ====== 改这里 ======
const VOICE_SETTINGS = {
  stability: 0.28,
  similarity_boost: 0.9,
  style: 0.9
};
const SPEED = 1.32;
// ====================

app.get('/', (req, res) => res.json({ status: 'ok', service: 'tts-proxy' }));

app.all('/*', async (req, res) => {
  try {
    const url = `https://api.elevenlabs.io/v1${req.path}`;

    const headers = {};
    if (req.headers['xi-api-key']) headers['xi-api-key'] = req.headers['xi-api-key'];

    const opts = { method: req.method, headers };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = { ...req.body };
      if (req.path.includes('/text-to-speech')) {
        body.voice_settings = VOICE_SETTINGS;
        body.speed = SPEED;
      }
      opts.body = JSON.stringify(body);
      headers['content-type'] = 'application/json';
    }

    const resp = await fetch(url, opts);
    res.status(resp.status);
    resp.headers.forEach((v, k) => {
      if (k !== 'transfer-encoding' && k !== 'content-encoding') {
        res.setHeader(k, v);
      }
    });
    resp.body.pipe(res);
  } catch (e) {
    console.error('Proxy error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('TTS proxy running');
});


