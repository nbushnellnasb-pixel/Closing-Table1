'use strict';
/*
 * Closing Table: final expense sales league.
 * Zero-dependency Node server (Node 18 or newer). Data is stored in one JSON file.
 *
 * Environment variables:
 *   PORT            port to listen on (default 3000)
 *   DATA_DIR        folder for db.json (default ./data). Point this at a persistent disk.
 *   ADMIN_PASSWORD  host password. If unset, one is generated on first start and printed in the log.
 *   SESSION_SECRET  optional secret for login cookies. Generated and stored if unset.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const COOKIE = 'ct';
const SESSION_DAYS = 30;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- storage ---------- */
const TEAM_NAMES = ['Blue Team', 'Orange Team', 'Aqua Team', 'Gold Team', 'Rose Team', 'Green Team'];
let db;
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { db = null; }
if (!db) {
  db = {
    secret: crypto.randomBytes(32).toString('hex'),
    adminPassword: null,
    teams: TEAM_NAMES.map((name, i) => ({ id: 't' + (i + 1), name, leader: 'Leader ' + (i + 1), order: i + 1 })),
    puzzleState: {},
    agents: {},
    results: {}
  };
}
if (process.env.SESSION_SECRET) db.secret = process.env.SESSION_SECRET;
if (!process.env.ADMIN_PASSWORD && !db.adminPassword) {
  db.adminPassword = crypto.randomBytes(6).toString('base64url');
  console.log('\n  No ADMIN_PASSWORD set. Generated host password: ' + db.adminPassword + '\n');
}
const adminPassword = () => process.env.ADMIN_PASSWORD || db.adminPassword;

/* puzzles come from puzzles.json; only the open/closed flag is stored */
let PUZZLES = [];
function loadPuzzles() {
  PUZZLES = JSON.parse(fs.readFileSync(path.join(__dirname, 'puzzles.json'), 'utf8'));
  PUZZLES.forEach(p => { if (!(p.id in db.puzzleState)) db.puzzleState[p.id] = { open: true }; });
}
loadPuzzles();
const puzzleById = id => PUZZLES.find(p => p.id === id);

let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const tmp = DB_FILE + '.tmp';
    fs.writeFile(tmp, JSON.stringify(db), err => {
      if (err) { console.error('save failed', err); return; }
      fs.rename(tmp, DB_FILE, e => { if (e) console.error('rename failed', e); });
    });
  }, 150);
}
function saveNow() { try { fs.writeFileSync(DB_FILE, JSON.stringify(db)); } catch (e) { console.error(e); } }
saveNow();
process.on('SIGTERM', () => { saveNow(); process.exit(0); });
process.on('SIGINT', () => { saveNow(); process.exit(0); });

/* ---------- helpers ---------- */
const sha = s => crypto.createHash('sha256').update(s).digest();
const safeEq = (a, b) => crypto.timingSafeEqual(sha(String(a)), sha(String(b)));
function newCode() {
  const used = new Set(Object.values(db.agents).map(a => a.code));
  for (;;) {
    const b = crypto.randomBytes(6); let c = '';
    for (let i = 0; i < 6; i++) c += CODE_ALPHABET[b[i] % CODE_ALPHABET.length];
    if (!used.has(c)) return c;
  }
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', db.secret).update(body).digest('base64url');
  return body + '.' + mac;
}
function verify(token) {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const good = crypto.createHmac('sha256', db.secret).update(body).digest('base64url');
  if (!safeEq(mac, good)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return p.exp > Date.now() ? p : null;
  } catch (e) { return null; }
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(kv => { const i = kv.indexOf('='); if (i > 0) out[kv.slice(0, i).trim()] = decodeURIComponent(kv.slice(i + 1).trim()); });
  return out;
}
function session(req) {
  const m = /^Bearer\s+(\S+)/i.exec(req.headers.authorization || '');
  return verify(m ? m[1] : cookies(req)[COOKIE]);
}
function setCookie(req, res, payload) {
  const token = payload ? sign(Object.assign({ exp: Date.now() + SESSION_DAYS * 86400 * 1000 }, payload)) : '';
  const secure = (req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https' || process.env.COOKIE_SECURE === '1';
  const age = SESSION_DAYS * 86400;
  res.setHeader('Set-Cookie', COOKIE + '=' + encodeURIComponent(token) +
    '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (payload ? age : 0) + (secure ? '; Secure' : ''));
  return token;
}
const clientIp = req => ((req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';

const fails = new Map();
function tooMany(ip) { const f = fails.get(ip); return f && f.until > Date.now() && f.n >= 10; }
function noteFail(ip) { const f = fails.get(ip); if (!f || f.until < Date.now()) fails.set(ip, { n: 1, until: Date.now() + 10 * 60 * 1000 }); else f.n++; }
function noteOk(ip) { fails.delete(ip); }

function send(res, status, body, headers) {
  const data = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}));
  res.end(data);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > 200000) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new Error('bad json')); } });
    req.on('error', reject);
  });
}

/* ---------- puzzles: public view and scoring ---------- */
const maxOf = p => p.max || 100;
function publicPuzzle(p) {
  const o = { id: p.id, n: p.n, title: p.title, cat: p.cat, format: p.format, max: maxOf(p), file: p.file || [], story: p.story, prompt: p.prompt };
  if (p.format === 'choice' || p.format === 'multi') o.options = p.options.map(x => ({ t: x.t }));
  else if (p.format === 'order') o.steps = p.steps.map(s => ({ id: s.id, t: s.t }));
  else if (p.format === 'text') o.minWords = p.minWords || 12;
  else if (p.format === 'angle') o.groups = p.groups.map(g => ({ key: g.key, label: g.label, pick: g.pick, hint: g.hint, options: g.options.map(x => ({ t: x.t })) }));
  return o;
}
const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const uniqInts = (arr, len) => Array.isArray(arr) && arr.every(i => Number.isInteger(i) && i >= 0 && i < len) && new Set(arr).size === arr.length;

/* returns { answer, points } or null when the answer is not valid */
function scoreAnswer(p, a) {
  const max = maxOf(p);
  if (p.format === 'choice') {
    if (!Number.isInteger(a) || a < 0 || a >= p.options.length) return null;
    return { answer: a, points: p.options[a].pts };
  }
  if (p.format === 'multi') {
    if (!uniqInts(a, p.options.length) || !a.length) return null;
    const pts = a.reduce((s, i) => s + p.options[i].pts, 0);
    return { answer: a.slice().sort((x, y) => x - y), points: Math.max(0, Math.min(max, pts)) };
  }
  if (p.format === 'angle') {
    if (!Array.isArray(a) || a.length !== p.groups.length) return null;
    let pts = 0;
    for (let g = 0; g < p.groups.length; g++) {
      const grp = p.groups[g];
      if (!uniqInts(a[g], grp.options.length) || a[g].length !== grp.pick) return null;
      a[g].forEach(i => { pts += grp.options[i].pts; });
    }
    return { answer: a.map(x => x.slice().sort((m, n) => m - n)), points: Math.max(0, Math.min(max, pts)) };
  }
  if (p.format === 'order') {
    if (!Array.isArray(a) || a.length !== p.steps.length) return null;
    const ids = new Set(p.steps.map(s => s.id));
    if (!a.every(id => ids.has(id)) || new Set(a).size !== a.length) return null;
    let ok = 0;
    a.forEach((id, i) => { const s = p.steps.find(x => x.id === id); if (s.pos === i + 1) ok++; });
    return { answer: a.slice(), points: Math.round(ok / p.steps.length * max) };
  }
  if (p.format === 'text') {
    if (typeof a !== 'string') return null;
    const text = a.trim().slice(0, 1200);
    if (words(text) < (p.minWords || 12)) return null;
    const low = text.toLowerCase();
    let pts = 0;
    p.rubric.forEach(r => { if (r.keys.some(k => low.indexOf(String(k).toLowerCase()) !== -1)) pts += r.pts; });
    return { answer: text, points: Math.min(max, pts) };
  }
  return null;
}

/* ---------- public scoreboard ---------- */
function board() {
  const per = {};
  Object.keys(db.results).forEach(k => {
    const r = db.results[k];
    if (!db.agents[r.agentId] || !puzzleById(r.puzzleId)) return;
    const s = per[r.agentId] || (per[r.agentId] = { points: 0, done: 0, last: 0, per: {} });
    s.points += r.points; s.done++; s.last = Math.max(s.last, r.at || 0); s.per[r.puzzleId] = r.points;
  });
  return {
    teams: db.teams,
    puzzles: PUZZLES.map(p => ({ id: p.id, n: p.n, title: p.title, cat: p.cat, format: p.format, max: maxOf(p), open: db.puzzleState[p.id].open })),
    agents: Object.values(db.agents).map(a => Object.assign({ id: a.id, name: a.name, teamId: a.teamId, points: 0, done: 0, last: 0, per: {} }, per[a.id] || {}))
  };
}

/* ---------- routes ---------- */
const api = {};
const route = (method, pattern, fn) => { (api[method] = api[method] || []).push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), names: (pattern.match(/:(\w+)/g) || []).map(s => s.slice(1)), fn }); };

const agentOf = req => { const s = session(req); return s && s.t === 'a' && db.agents[s.id] ? db.agents[s.id] : null; };
const isAdmin = req => { const s = session(req); return !!(s && s.t === 'admin'); };
const me = a => ({ id: a.id, name: a.name, teamId: a.teamId });

route('GET', '/api/state', (req, res) => {
  const body = JSON.stringify(board());
  const etag = '"' + crypto.createHash('md5').update(body).digest('hex') + '"';
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag, 'Cache-Control': 'no-store' }); return res.end(); }
  send(res, 200, body, { ETag: etag });
});

route('POST', '/api/login', async (req, res) => {
  const ip = clientIp(req);
  if (tooMany(ip)) return send(res, 429, { error: 'Too many attempts. Wait a few minutes and try again.' });
  const b = await readBody(req);
  const code = String(b.code || '').trim().toUpperCase().replace(/[\s-]/g, '');
  const agent = code && Object.values(db.agents).find(a => a.code === code);
  if (!agent) { noteFail(ip); return send(res, 401, { error: 'That code was not found. Check it with your team leader.' }); }
  noteOk(ip);
  const token = setCookie(req, res, { t: 'a', id: agent.id });
  send(res, 200, { agent: me(agent), token });
});
route('POST', '/api/logout', (req, res) => { setCookie(req, res, null); send(res, 200, { ok: true }); });
route('GET', '/api/me', (req, res) => {
  const a = agentOf(req);
  send(res, 200, { agent: a ? me(a) : null, admin: isAdmin(req) });
});

route('GET', '/api/puzzles/:id', (req, res, p) => {
  const a = agentOf(req); if (!a) return send(res, 401, { error: 'Sign in first.' });
  const pz = puzzleById(p.id); if (!pz) return send(res, 404, { error: 'No such puzzle.' });
  const r = db.results[a.id + '_' + pz.id];
  if (r) return send(res, 200, { puzzle: pz, result: { points: r.points, max: r.max, answer: r.answer } });
  if (!db.puzzleState[pz.id].open) return send(res, 403, { error: 'This puzzle is not open yet.' });
  send(res, 200, { puzzle: publicPuzzle(pz) });
});
route('POST', '/api/puzzles/:id/answer', async (req, res, p) => {
  const a = agentOf(req); if (!a) return send(res, 401, { error: 'Sign in first.' });
  const pz = puzzleById(p.id); if (!pz) return send(res, 404, { error: 'No such puzzle.' });
  const key = a.id + '_' + pz.id;
  if (!db.results[key]) {
    if (!db.puzzleState[pz.id].open) return send(res, 403, { error: 'This puzzle is not open yet.' });
    const b = await readBody(req);
    const scored = scoreAnswer(pz, b.answer);
    if (!scored) return send(res, 400, { error: 'That answer is incomplete. Check every section and try again.' });
    db.results[key] = { agentId: a.id, puzzleId: pz.id, points: scored.points, max: maxOf(pz), answer: scored.answer, at: Date.now() };
    save();
  }
  const r = db.results[key];
  send(res, 200, { puzzle: pz, result: { points: r.points, max: r.max, answer: r.answer } });
});

/* ---------- host ---------- */
route('POST', '/api/admin/login', async (req, res) => {
  const ip = clientIp(req);
  if (tooMany(ip)) return send(res, 429, { error: 'Too many attempts. Wait a few minutes and try again.' });
  const b = await readBody(req);
  if (!safeEq(String(b.password || ''), adminPassword())) { noteFail(ip); return send(res, 401, { error: 'That password is not right.' }); }
  noteOk(ip);
  const token = setCookie(req, res, { t: 'admin' });
  send(res, 200, { ok: true, token });
});
const admin = (method, pattern, fn) => route(method, pattern, async (req, res, p) => {
  if (!isAdmin(req)) return send(res, 401, { error: 'Host sign-in required.' });
  return fn(req, res, p);
});

const agentRow = a => ({ id: a.id, name: a.name, teamId: a.teamId, code: a.code });
admin('GET', '/api/admin/agents', (req, res) => send(res, 200, { agents: Object.values(db.agents).sort((x, y) => x.name.localeCompare(y.name)).map(agentRow) }));

function findTeam(text) {
  const t = String(text || '').trim().toLowerCase(); if (!t) return null;
  return db.teams.find(x => x.id === t || String(x.order) === t || x.name.toLowerCase() === t || (x.leader || '').toLowerCase() === t) || null;
}
admin('POST', '/api/admin/agents', async (req, res) => {
  const b = await readBody(req);
  const def = db.teams.find(t => t.id === b.teamId) || null;
  const created = [], problems = [];
  String(b.lines || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 500).forEach(line => {
    const parts = line.split(',').map(s => s.trim());
    const name = parts[0].slice(0, 60);
    let team = def;
    if (parts.length > 1 && parts[1]) { team = findTeam(parts[1]); if (!team) { problems.push(line + ' (team not found)'); return; } }
    if (!name) return;
    if (!team) { problems.push(line + ' (choose a team)'); return; }
    if (Object.values(db.agents).some(a => a.name.toLowerCase() === name.toLowerCase() && a.teamId === team.id)) { problems.push(line + ' (already on this team)'); return; }
    const id = 'a' + crypto.randomBytes(5).toString('hex');
    db.agents[id] = { id, name, teamId: team.id, code: newCode() };
    created.push(agentRow(db.agents[id]));
  });
  save();
  send(res, 200, { created, problems });
});
admin('PATCH', '/api/admin/agents/:id', async (req, res, p) => {
  const a = db.agents[p.id]; if (!a) return send(res, 404, { error: 'No such agent.' });
  const b = await readBody(req);
  if (typeof b.name === 'string' && b.name.trim()) a.name = b.name.trim().slice(0, 60);
  if (b.teamId && db.teams.some(t => t.id === b.teamId)) a.teamId = b.teamId;
  if (b.newCode) a.code = newCode();
  save(); send(res, 200, { agent: agentRow(a) });
});
admin('DELETE', '/api/admin/agents/:id', (req, res, p) => {
  if (!db.agents[p.id]) return send(res, 404, { error: 'No such agent.' });
  delete db.agents[p.id];
  Object.keys(db.results).forEach(k => { if (db.results[k].agentId === p.id) delete db.results[k]; });
  save(); send(res, 200, { ok: true });
});
admin('PATCH', '/api/admin/teams/:id', async (req, res, p) => {
  const t = db.teams.find(x => x.id === p.id); if (!t) return send(res, 404, { error: 'No such team.' });
  const b = await readBody(req);
  if (typeof b.name === 'string' && b.name.trim()) t.name = b.name.trim().slice(0, 40);
  if (typeof b.leader === 'string') t.leader = b.leader.trim().slice(0, 40);
  save(); send(res, 200, { team: t });
});
admin('POST', '/api/admin/puzzles/open', async (req, res) => {
  const b = await readBody(req);
  PUZZLES.forEach(p => { if (b.cat === '*' || p.cat === b.cat) db.puzzleState[p.id].open = !!b.open; });
  save(); send(res, 200, { ok: true });
});
admin('PATCH', '/api/admin/puzzles/:id', async (req, res, p) => {
  if (!puzzleById(p.id)) return send(res, 404, { error: 'No such puzzle.' });
  const b = await readBody(req);
  db.puzzleState[p.id].open = !!b.open;
  save(); send(res, 200, { ok: true });
});
admin('POST', '/api/admin/reset', async (req, res) => {
  const b = await readBody(req);
  let n = 0;
  Object.keys(db.results).forEach(k => { if (!b.agentId || db.results[k].agentId === b.agentId) { delete db.results[k]; n++; } });
  save(); send(res, 200, { cleared: n });
});
admin('GET', '/api/admin/export.csv', (req, res) => {
  const b = board(), teamName = id => (db.teams.find(t => t.id === id) || {}).name || '';
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [['Agent', 'Team', 'Total points', 'Puzzles done'].concat(b.puzzles.map(p => 'P' + p.n + ' ' + p.title))];
  b.agents.sort((x, y) => y.points - x.points).forEach(a => rows.push([a.name, teamName(a.teamId), a.points, a.done].concat(b.puzzles.map(p => a.per[p.id] === undefined ? '' : a.per[p.id]))));
  send(res, 200, rows.map(r => r.map(q).join(',')).join('\n'), { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="closing-table-scores.csv"' });
});

/* ---------- server ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const pathname = url.pathname;
    if (pathname === '/healthz') return send(res, 200, { ok: true });
    if (pathname.startsWith('/api/') || pathname === '/embed.js') {
      /* lets the game be embedded on another website. Set ALLOWED_ORIGIN to your site's address to restrict it. */
      res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, If-None-Match');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Expose-Headers', 'ETag');
      res.setHeader('Vary', 'Origin');
      if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    }
    if (pathname.startsWith('/api/')) {
      const list = api[req.method] || [];
      for (const r of list) {
        const m = r.re.exec(pathname);
        if (m) {
          const params = {}; r.names.forEach((n, i) => { params[n] = decodeURIComponent(m[i + 1]); });
          return await r.fn(req, res, params);
        }
      }
      return send(res, 404, { error: 'Not found.' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed.' });
    if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.join(PUBLIC_DIR, rel);
    if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'Forbidden.' });
    fs.readFile(file, (err, data) => {
      if (err) return send(res, 404, { error: 'Not found.' });
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  } catch (e) {
    if (e && e.message === 'bad json') return send(res, 400, { error: 'That request was not understood.' });
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Something went wrong. Try again.' });
  }
});
server.listen(PORT, () => console.log('Closing Table running on port ' + PORT + ' (data in ' + DATA_DIR + ')'));
