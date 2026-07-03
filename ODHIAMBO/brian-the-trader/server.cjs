'use strict';
// Minimal API server — persists admin settings to Replit Database so every
// browser/device gets the same configuration.  In production (NODE_ENV=production)
// it also serves the static build from dist/ so a single process handles everything.
const http = require('http');
const path = require('path');
const fs   = require('fs');

const PORT          = Number(process.env.API_PORT || 3001);
const REPLIT_DB_URL = process.env.REPLIT_DB_URL || '';
const IS_PROD       = process.env.NODE_ENV === 'production';
const DIST_DIR      = path.join(__dirname, 'dist');

// ── Replit DB helpers (Node 20 built-in fetch) ──────────────────────────────
async function dbGet(key) {
    if (!REPLIT_DB_URL) return null;
    try {
        const r = await fetch(`${REPLIT_DB_URL}/${encodeURIComponent(key)}`);
        if (!r.ok) return null;
        const text = await r.text();
        return text ? JSON.parse(decodeURIComponent(text)) : null;
    } catch { return null; }
}

async function dbSet(key, value) {
    if (!REPLIT_DB_URL) return false;
    try {
        const r = await fetch(REPLIT_DB_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`,
        });
        return r.ok;
    } catch { return false; }
}

// ── Static file serving (production only) ──────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.woff': 'font/woff',
    '.ttf':  'font/ttf',
    '.xml':  'application/xml',
};

function serveStatic(req, res) {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.resolve(DIST_DIR, '.' + urlPath);
    if (!filePath.startsWith(DIST_DIR)) { res.writeHead(403); res.end(); return; }
    const ext = path.extname(filePath).toLowerCase();
    fs.stat(filePath, (err, stat) => {
        if (err || !stat?.isFile()) {
            // SPA fallback → index.html
            const idx = path.join(DIST_DIR, 'index.html');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
            fs.createReadStream(idx).pipe(res);
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    });
}

// ── Request handler ─────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const urlPath = req.url.split('?')[0];

    // GET /api/settings
    if (req.method === 'GET' && urlPath === '/api/settings') {
        const data = await dbGet('admin_settings');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // POST /api/settings
    if (req.method === 'POST' && urlPath === '/api/settings') {
        const chunks = [];
        req.on('data', c => chunks.push(c));
        req.on('end', async () => {
            try {
                const body = JSON.parse(Buffer.concat(chunks).toString());
                const ok = await dbSet('admin_settings', body);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false }));
            }
        });
        return;
    }

    // Serve static files in production; 404 otherwise
    if (IS_PROD) { serveStatic(req, res); return; }
    res.writeHead(404); res.end('Not found');
});

server.listen(IS_PROD ? 5000 : PORT, '0.0.0.0', () => {
    const p = IS_PROD ? 5000 : PORT;
    console.log(`[Empire API] Listening on :${p}${IS_PROD ? ' (production — also serving static files)' : ' (dev)' }`);
    if (!REPLIT_DB_URL) console.warn('[Empire API] REPLIT_DB_URL not set — settings will not persist across restarts');
});
