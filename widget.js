(function(){
'use strict';
/* ---------- mount: works as a full page or pasted into any site ---------- */
var script = document.currentScript;
var API = (window.CLOSING_TABLE_API || (script && script.src ? new URL(script.src).origin : '')).replace(/\/+$/, '');
var mount = document.getElementById('closing-table');
if(!mount){ mount = document.createElement('div'); mount.id = 'closing-table'; if(script && script.parentNode){ script.parentNode.insertBefore(mount, script); } else { document.body.appendChild(mount); } }
if(!document.getElementById('ct-fonts')){
  var lk = document.createElement('link'); lk.id = 'ct-fonts'; lk.rel = 'stylesheet';
  lk.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Public+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(lk);
}
var root = mount.attachShadow ? mount.attachShadow({mode:'open'}) : mount;
root.innerHTML = '<style>' + __CSS__ + '</style>' + __MARKUP__;
var TOKEN_KEY = 'closing-table-token-v1', token = null;
try { token = localStorage.getItem(TOKEN_KEY); } catch(e){}
function setToken(t){ token = t || null; try { if(t){ localStorage.setItem(TOKEN_KEY, t); } else { localStorage.removeItem(TOKEN_KEY); } } catch(e){} }
function authHeaders(h){ h = h || {}; if(token){ h['Authorization'] = 'Bearer ' + token; } return h; }

var $ = function(s){ return root.querySelector(s); };
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
var FMT = {choice:'Multiple choice', multi:'Select all that apply', order:'Put in order', text:'Written answer', angle:'Build the angle'};

var S = {
  board:null, etag:null, me:null, admin:false, view:'board', mode:'teams', openTeam:null, q:'', showAll:false,
  openId:null, cur:null, drafts:{}, notice:null, submitting:false, loadErr:null,
  host:{agents:null, added:null, msg:'', confirm:null, q:''}
};

function api(method, url, body){
  return fetch(API + url, {method:method, headers:authHeaders(body ? {'Content-Type':'application/json'} : {}), body:body ? JSON.stringify(body) : undefined})
    .then(function(r){
      return r.json().catch(function(){ return {}; }).then(function(j){
        if(!r.ok){ var e = new Error(j.error || 'Something went wrong. Try again.'); e.status = r.status; throw e; }
        return j;
      });
    });
}
function words(s){ return String(s).trim().split(/\s+/).filter(Boolean).length; }
function teamOf(id){ return S.board && S.board.teams.find(function(t){ return t.id === id; }); }
function teamColor(t){ return 'var(--t' + ((t && t.order) || 1) + ')'; }
function fmtN(n){ return Math.round(n).toLocaleString(); }

/* ---------- scoreboard maths ---------- */
function stats(){
  var b = S.board, open = b.puzzles.filter(function(p){ return p.open; });
  var maxPer = Math.max(1, open.reduce(function(a, p){ return a + p.max; }, 0));
  var teams = b.teams.map(function(t){
    var mem = b.agents.filter(function(a){ return a.teamId === t.id; }), total = 0, answers = 0, playing = 0, pp = {};
    mem.forEach(function(a){
      total += a.points; answers += a.done; if(a.done){ playing++; }
      Object.keys(a.per).forEach(function(id){ var c = pp[id] || (pp[id] = {sum:0, n:0}); c.sum += a.per[id]; c.n++; });
    });
    var n = mem.length;
    return {t:t, mem:mem, n:n, total:total, answers:answers, playing:playing, avg:n ? total / n : 0, pp:pp};
  });
  var sorted = teams.slice().sort(function(a, b2){ return b2.avg - a.avg || b2.total - a.total || a.t.order - b2.t.order; });
  sorted.forEach(function(r, i){ r.rank = (i > 0 && Math.abs(sorted[i-1].avg - r.avg) < 1e-9) ? sorted[i-1].rank : i + 1; });
  var ag = b.agents.slice().sort(function(a, b2){ return b2.points - a.points || (a.last || 1e15) - (b2.last || 1e15) || a.name.localeCompare(b2.name); });
  ag.forEach(function(r, i){ r.rank = (i > 0 && ag[i-1].points === r.points) ? ag[i-1].rank : i + 1; });
  return {open:open, maxPer:maxPer, teams:teams, sorted:sorted, agents:ag};
}

/* ---------- header / views ---------- */
function renderHeader(){
  var tabs = [['board','Leaderboard'],['play','Play']];
  if(S.admin){ tabs.push(['host','Host']); }
  $('#nav').innerHTML = tabs.map(function(t){
    return '<button type="button" role="tab" aria-selected="' + (S.view === t[0]) + '" data-act="view" data-v="' + t[0] + '">' + t[1] + '</button>';
  }).join('');
  var h = '';
  if(S.me){
    var t = teamOf(S.me.teamId);
    h = '<span class="sw" style="--c:' + teamColor(t) + '"></span><span>' + esc(S.me.name) + (t ? ' &middot; ' + esc(t.name) : '') + '</span><button type="button" class="link" data-act="signout">Sign out</button>';
  } else if(S.admin){
    h = '<span>Host</span><button type="button" class="link" data-act="hostout">Sign out</button>';
  }
  $('#pill').innerHTML = h;
}
function syncViews(){
  ['board','play','host'].forEach(function(k){ $('#v-' + k).hidden = S.view !== k; });
  renderHeader();
  if(S.view === 'play'){ renderPlay(); }
  if(S.view === 'host'){ renderHost(); }
  if(S.view === 'board'){ renderBoard(); }
}
function renderBanner(){
  var b = $('#banner');
  b.innerHTML = S.loadErr ? '<p class="notice err" role="alert">' + esc(S.loadErr) + '</p>' : '';
  b.style.marginBottom = S.loadErr ? '20px' : '0';
}

/* ---------- leaderboard ---------- */
function renderBoard(){
  var el = $('#v-board');
  if(!S.board){ el.innerHTML = '<p class="skeleton">Loading scores...</p>'; return; }
  var b = S.board;
  if(!b.teams.length || !b.puzzles.length){ el.innerHTML = '<div class="card"><p class="hint">The game has not been set up yet.</p></div>'; return; }
  var st = stats(), answersIn = b.agents.reduce(function(a, x){ return a + x.done; }, 0);
  var playing = b.agents.filter(function(a){ return a.done > 0; }).length;
  var top = st.sorted.filter(function(r){ return r.rank === 1; }), headline;
  if(!top.length || top[0].avg === 0){ headline = 'No scores yet'; }
  else if(top.length === 1){ headline = esc(top[0].t.name) + ' leads with ' + fmtN(top[0].avg) + ' per agent'; }
  else { headline = top.map(function(r){ return esc(r.t.name); }).join(' and ') + ' tied at ' + fmtN(top[0].avg); }
  var star = st.agents[0], starLine = star && star.points > 0
    ? '<p class="hint" style="margin-top:8px">Top agent: <b>' + esc(star.name) + '</b> (' + esc((teamOf(star.teamId) || {}).name || '') + ') with ' + fmtN(star.points) + ' points</p>' : '';

  var h = '<div class="hero"><div><p class="eyebrow">Standings</p><h1>' + headline + '</h1>' + starLine + '</div>' +
    '<dl class="pulse"><div><dd>' + playing + ' of ' + b.agents.length + '</dd><dt>Agents playing</dt></div>' +
    '<div><dd>' + st.open.length + ' of ' + b.puzzles.length + '</dd><dt>Puzzles open</dt></div>' +
    '<div><dd>' + answersIn.toLocaleString() + '</dd><dt>Answers in</dt></div></dl></div>';

  h += '<div class="seg" role="tablist" aria-label="View"><button type="button" role="tab" aria-selected="' + (S.mode === 'teams') + '" data-act="mode" data-m="teams">Teams</button>' +
    '<button type="button" role="tab" aria-selected="' + (S.mode === 'agents') + '" data-act="mode" data-m="agents">Agents</button></div>';

  if(S.mode === 'teams'){ h += teamsHTML(st); } else { h += agentsHTML(st); }

  h += '<h2 class="sec">Puzzle by puzzle</h2><p class="hint">Each cell is the average score of the agents on that team who have answered, with how many have answered.</p>';
  h += '<div class="mwrap"><table class="matrix"><thead><tr><th class="pl" scope="col">Puzzle</th>' + b.teams.map(function(t){
    return '<th scope="col"><span class="sw" style="background:' + teamColor(t) + '"></span>' + esc(t.name) + '</th>';
  }).join('') + '</tr></thead><tbody>';
  b.puzzles.forEach(function(p){
    h += '<tr class="' + (p.open ? '' : 'shut') + '"><th scope="row" class="pl"><small>' + p.n + '</small>' + esc(p.title) + (p.open ? '' : ' (not open)') + '</th>';
    st.teams.slice().sort(function(x, y){ return x.t.order - y.t.order; }).forEach(function(r){
      var c = r.pp[p.id];
      if(c && c.n){ var avg = c.sum / c.n; h += '<td class="cell' + (avg >= 60 ? ' hi' : '') + '" style="--p:' + avg.toFixed(1) + '" title="' + c.n + ' of ' + r.n + ' agents answered"><b>' + fmtN(avg) + '</b><small>' + c.n + '/' + r.n + '</small></td>'; }
      else { h += '<td class="none">' + (p.open ? 'waiting' : '-') + '</td>'; }
    });
    h += '</tr>';
  });
  h += '</tbody><tfoot><tr><th scope="row" class="pl">Average per agent</th>' + st.teams.slice().sort(function(x, y){ return x.t.order - y.t.order; }).map(function(r){ return '<td>' + fmtN(r.avg) + '</td>'; }).join('') + '</tr></tfoot></table></div>';
  h += '<div class="scale"><span>0</span><i></i><span>100 points</span></div>';
  el.innerHTML = h;
}

function teamsHTML(st){
  var h = '<ol class="standings">' + st.sorted.map(function(r){
    var pct = Math.min(100, r.avg / st.maxPer * 100), open = S.openTeam === r.t.id;
    var row = '<li class="srow' + (r.rank === 1 && r.avg > 0 ? ' first' : '') + '" style="--c:' + teamColor(r.t) + '">' +
      '<span class="rk">' + r.rank + '</span>' +
      '<div class="who"><span class="sw"></span><div><button type="button" class="rowbtn" data-act="team" data-id="' + esc(r.t.id) + '" aria-expanded="' + open + '"><b>' + esc(r.t.name) + '</b></button><span class="sub">' + esc(r.t.leader || '') + '</span></div></div>' +
      '<div class="meter"><div class="track"><i style="width:' + pct.toFixed(1) + '%"></i></div><p class="mline">' + r.playing + ' of ' + r.n + ' agents playing &middot; ' + fmtN(r.total) + ' total points</p></div>' +
      '<div class="pts"><b>' + fmtN(r.avg) + '</b><span>avg per agent</span></div></li>';
    if(open){
      var mem = r.mem.slice().sort(function(a, b2){ return b2.points - a.points || a.name.localeCompare(b2.name); });
      row += '<li class="drill"><table class="mini"><thead><tr><th>Agent</th><th>Puzzles done</th><th>Points</th></tr></thead><tbody>' +
        (mem.length ? mem.map(function(a){ return '<tr><td>' + esc(a.name) + '</td><td>' + a.done + ' of ' + S.board.puzzles.length + '</td><td>' + fmtN(a.points) + '</td></tr>'; }).join('') : '<tr><td colspan="3">No agents on this team yet.</td></tr>') +
        '</tbody></table></li>';
    }
    return row;
  }).join('') + '</ol>';
  h += '<p class="legend-note">Teams are ranked by average points per agent, counting every agent on the roster, so teams of different sizes compare fairly and every agent who plays helps. Select a team to see its agents. The bar shows the average against the ' + fmtN(st.maxPer) + ' points available per agent in open puzzles.</p>';
  return h;
}

function agentRowsHTML(st){
  var q = S.q.trim().toLowerCase();
  var list = st.agents.filter(function(a){ return !q || a.name.toLowerCase().indexOf(q) !== -1 || ((teamOf(a.teamId) || {}).name || '').toLowerCase().indexOf(q) !== -1; });
  var total = list.length, shown = (S.showAll || q) ? list : list.slice(0, 40);
  if(!total){ return '<p class="hint" style="padding:16px 20px">No agents match.</p>'; }
  return '<ol class="standings agents">' + shown.map(function(a){
    var t = teamOf(a.teamId);
    var pips = S.board.puzzles.map(function(p){
      var got = a.per[p.id] !== undefined;
      return '<i class="' + (got ? 'on' : (p.open ? '' : 'shut')) + '" title="Puzzle ' + p.n + (got ? ': ' + a.per[p.id] + ' pts' : '') + '"></i>';
    }).join('');
    return '<li class="srow arow' + (a.rank === 1 && a.points > 0 ? ' first' : '') + '" style="--c:' + teamColor(t) + '"><span class="rk">' + a.rank + '</span>' +
      '<div class="who"><span class="sw"></span><div><b>' + esc(a.name) + '</b><span class="sub">' + esc(t ? t.name : '') + '</span></div></div>' +
      '<div class="meter"><div class="pips">' + pips + '</div></div>' +
      '<div class="pts"><b>' + fmtN(a.points) + '</b><span>' + a.done + ' of ' + S.board.puzzles.length + ' puzzles</span></div></li>';
  }).join('') + '</ol>' + (total > shown.length ? '<p style="margin-top:12px"><button type="button" class="btn ghost" data-act="showall">Show all ' + total + ' agents</button></p>' : '');
}
function agentsHTML(st){
  return '<div class="searchrow"><label for="q" class="sr">Search agents</label><input type="text" id="q" placeholder="Search by agent or team" value="' + esc(S.q) + '" autocomplete="off"></div><div id="alist">' + agentRowsHTML(st) + '</div>';
}

/* ---------- play ---------- */
function renderPlay(){
  var el = $('#v-play');
  if(!S.me){
    if(el.dataset.mode === 'signin'){ return; }
    el.dataset.mode = 'signin';
    el.innerHTML = '<form class="card signin" id="login" autocomplete="off"><div><p class="eyebrow">Agents and team leaders</p><h2>Sign in</h2></div>' +
      '<p class="hint">Enter the personal code your team leader gave you. Each agent has their own code and their own score.</p>' +
      '<div><label for="lc">Your code</label><input type="text" class="code" id="lc" maxlength="12" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABC123"></div>' +
      '<button class="btn" type="submit">Sign in</button><p class="formerr" id="lerr" role="alert">' + esc(S.loginErr || '') + '</p></form>';
    return;
  }
  if(S.openId){ renderPuzzle(); return; }
  if(!S.board){ el.dataset.mode = ''; el.innerHTML = '<p class="skeleton">Loading...</p>'; return; }
  el.dataset.mode = 'list';
  var team = teamOf(S.me.teamId), row = S.board.agents.find(function(a){ return a.id === S.me.id; }) || {points:0, done:0, per:{}};
  var puzzles = S.board.puzzles;
  var next = puzzles.find(function(p){ return p.open && row.per[p.id] === undefined; });
  var h = '<div class="mine"><div><p class="eyebrow">' + esc(team ? team.name : '') + '</p><h1><span class="sw" style="--c:' + teamColor(team) + '"></span>' + esc(S.me.name) + '</h1></div>' +
    '<div class="pts"><b>' + fmtN(row.points) + '</b><span>' + row.done + ' of ' + puzzles.length + ' puzzles done</span></div></div>';
  if(next){ h += '<p style="margin-bottom:16px"><button class="btn" type="button" data-act="open" data-id="' + esc(next.id) + '">Play puzzle ' + next.n + ': ' + esc(next.title) + '</button></p>'; }
  else if(puzzles.every(function(p){ return row.per[p.id] !== undefined; })){ h += '<p class="notice" style="margin-bottom:16px">You have answered every puzzle. Check the leaderboard for the standings.</p>'; }
  else { h += '<p class="notice" style="margin-bottom:16px">You are caught up. More puzzles open when your host releases them.</p>'; }
  h += '<div class="grid">' + puzzles.map(function(p){
    var done = row.per[p.id] !== undefined;
    var stt = done ? '<span class="chip done">Done: ' + row.per[p.id] + ' of ' + p.max + '</span>' : (p.open ? '<span class="chip open">Open</span>' : '<span class="chip">Not open yet</span>');
    return '<button type="button" class="pcard" data-act="open" data-id="' + esc(p.id) + '"' + (!done && !p.open ? ' disabled' : '') + '>' +
      '<span class="n">Puzzle ' + p.n + ' &middot; ' + esc(p.cat) + '</span><h3>' + esc(p.title) + '</h3>' +
      '<span class="chips"><span class="chip">' + FMT[p.format] + '</span>' + stt + '</span></button>';
  }).join('') + '</div>';
  el.innerHTML = h;
}

function fileHTML(p){
  if(!p.file || !p.file.length){ return ''; }
  return '<dl class="file">' + p.file.map(function(f){ return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>';
}
function draftFor(p){
  if(!S.drafts[p.id]){
    S.drafts[p.id] = p.format === 'choice' ? {sel:null} : p.format === 'multi' ? {sel:[]} : p.format === 'order' ? {order:p.steps.map(function(s){ return s.id; })} : p.format === 'angle' ? {g:p.groups.map(function(){ return []; })} : {text:''};
  }
  return S.drafts[p.id];
}
function canSubmit(p, d){
  if(p.format === 'choice'){ return d.sel !== null; }
  if(p.format === 'multi'){ return d.sel.length > 0; }
  if(p.format === 'angle'){ return p.groups.every(function(g, gi){ return d.g[gi].length === g.pick; }); }
  if(p.format === 'order'){ return true; }
  return words(d.text) >= (p.minWords || 12);
}
function answerOf(p, d){
  return p.format === 'choice' ? d.sel : p.format === 'multi' ? d.sel : p.format === 'angle' ? d.g : p.format === 'order' ? d.order : d.text;
}

function openPuzzle(id){
  S.openId = id; S.cur = null; S.notice = null; renderPlay(); mount.scrollIntoView({block:'start'});
  api('GET', '/api/puzzles/' + encodeURIComponent(id)).then(function(r){ if(S.openId === id){ S.cur = r; renderPuzzle(); } })
    .catch(function(e){
      if(e.status === 401){ S.me = null; S.openId = null; renderHeader(); renderPlay(); return; }
      S.openId = null; S.loadErr = e.message; renderBanner(); renderPlay();
    });
}
function renderPuzzle(){
  var el = $('#v-play'); el.dataset.mode = 'puzzle';
  if(!S.cur){ el.innerHTML = '<button type="button" class="link" data-act="back">&larr; All puzzles</button><p class="skeleton">Loading puzzle...</p>'; return; }
  var p = S.cur.puzzle, res = S.cur.result;
  var h = '<button type="button" class="link" data-act="back">&larr; All puzzles</button>' +
    '<div class="phead"><p class="eyebrow">Puzzle ' + p.n + ' &middot; ' + esc(p.cat) + ' &middot; ' + FMT[p.format] + ' &middot; up to ' + p.max + ' points</p><h1>' + esc(p.title) + '</h1></div>' +
    fileHTML(p) + '<div class="story"><p>' + esc(p.story) + '</p></div><p class="ask">' + esc(p.prompt) + '</p>';
  h += res ? resultHTML(p, res) : formHTML(p);
  el.innerHTML = h;
}

function formHTML(p){
  var d = draftFor(p), h = '';
  if(p.format === 'choice'){
    h += '<ul class="opts" role="radiogroup" aria-label="Answer choices">' + p.options.map(function(o, i){
      return '<li><button type="button" class="opt" role="radio" aria-checked="' + (d.sel === i) + '" data-act="pick" data-i="' + i + '"><span class="mark"></span><span>' + esc(o.t) + '</span></button></li>';
    }).join('') + '</ul>';
  } else if(p.format === 'multi'){
    h += '<ul class="opts" aria-label="Answer choices">' + p.options.map(function(o, i){
      return '<li><button type="button" class="opt" role="checkbox" aria-checked="' + (d.sel.indexOf(i) !== -1) + '" data-act="tog" data-i="' + i + '"><span class="mark"></span><span>' + esc(o.t) + '</span></button></li>';
    }).join('') + '</ul>';
  } else if(p.format === 'angle'){
    h += p.groups.map(function(g, gi){
      var sel = d.g[gi], multiPick = g.pick > 1, full = sel.length >= g.pick;
      return '<section class="grp"><div class="ghead"><h3>' + esc(g.label) + '</h3><span class="gcount' + (sel.length === g.pick ? ' ok' : '') + '">' + sel.length + ' of ' + g.pick + ' chosen</span></div>' +
        (g.hint ? '<p class="hint" style="margin-bottom:10px;max-width:70ch">' + esc(g.hint) + '</p>' : '') +
        '<ul class="opts" ' + (multiPick ? '' : 'role="radiogroup" ') + 'aria-label="' + esc(g.label) + '">' + g.options.map(function(o, i){
          var on = sel.indexOf(i) !== -1;
          return '<li><button type="button" class="opt" role="' + (multiPick ? 'checkbox' : 'radio') + '" aria-checked="' + on + '" data-act="gpick" data-g="' + gi + '" data-i="' + i + '"' + (multiPick && full && !on ? ' aria-disabled="true" style="opacity:.55"' : '') + '><span class="mark"></span><span>' + esc(o.t) + '</span></button></li>';
        }).join('') + '</ul></section>';
    }).join('');
  } else if(p.format === 'order'){
    h += '<ol class="opts" aria-label="Steps in your order">' + d.order.map(function(id, i){
      var s = p.steps.find(function(x){ return x.id === id; });
      return '<li class="ord"><span class="no">' + (i + 1) + '</span><span>' + esc(s.t) + '</span><span class="mv">' +
        '<button type="button" data-act="mv" data-i="' + i + '" data-d="-1" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button type="button" data-act="mv" data-i="' + i + '" data-d="1" aria-label="Move down"' + (i === d.order.length - 1 ? ' disabled' : '') + '>&darr;</button></span></li>';
    }).join('') + '</ol>';
  } else {
    var min = p.minWords || 12;
    h += '<label for="ans" style="max-width:70ch">Your answer (at least ' + min + ' words)</label><textarea id="ans" maxlength="1200" placeholder="Type what you would say to the client...">' + esc(d.text) + '</textarea><p class="count" id="cnt">' + words(d.text) + ' words</p>';
  }
  if(S.notice){ h += '<p class="notice err" role="alert" style="margin-top:16px;max-width:70ch">' + esc(S.notice) + '</p>'; }
  h += '<div class="submit"><button type="button" class="btn" id="sub" data-act="submit"' + (canSubmit(p, d) && !S.submitting ? '' : ' disabled') + '>' + (S.submitting ? 'Saving...' : 'Lock in answer') + '</button><span class="hint">Answers lock when you submit.</span></div>';
  return h;
}

function tag(pts, neutral){ return '<span class="tag ' + (neutral ? '' : pts > 0 ? 'p' : pts < 0 ? 'n' : '') + '">' + (pts > 0 && !neutral ? '+' : '') + pts + ' pts</span>'; }
function rubricHits(p, text){
  var low = String(text).toLowerCase();
  return p.rubric.map(function(r){ return r.keys.some(function(k){ return low.indexOf(String(k).toLowerCase()) !== -1; }); });
}
function nextOpen(afterId){
  if(!S.board){ return null; }
  var row = S.board.agents.find(function(a){ return a.id === S.me.id; }) || {per:{}};
  return S.board.puzzles.find(function(q){ return q.open && q.id !== afterId && row.per[q.id] === undefined; });
}
function resultHTML(p, res){
  var h = '<div class="score"><b>' + res.points + '</b><span>of ' + res.max + ' points</span></div>', a = res.answer;
  if(p.format === 'choice'){
    var bestPts = Math.max.apply(null, p.options.map(function(o){ return o.pts; }));
    h += '<ul class="rev">' + p.options.map(function(o, i){
      return '<li class="rv' + (a === i ? ' you' : '') + (o.pts === bestPts ? ' best' : '') + '"><div class="top2"><span>' + esc(o.t) + '</span>' + tag(o.pts, true) + '</div>' +
        '<span class="why">' + (a === i ? '<b>You picked this.</b> ' : '') + (o.pts === bestPts ? '<b>Best answer.</b> ' : '') + esc(o.why) + '</span></li>';
    }).join('') + '</ul>';
  } else if(p.format === 'multi'){
    var picked = Array.isArray(a) ? a : [];
    h += '<ul class="rev">' + p.options.map(function(o, i){
      var on = picked.indexOf(i) !== -1;
      return '<li class="rv' + (on ? ' you' : '') + (o.pts > 0 ? ' best' : '') + '"><div class="top2"><span>' + esc(o.t) + '</span>' + tag(o.pts) + '</div><span class="why">' + (on ? '<b>You selected this.</b> ' : '') + esc(o.why) + '</span></li>';
    }).join('') + '</ul>';
  } else if(p.format === 'angle'){
    h += p.groups.map(function(g, gi){
      var picks = Array.isArray(a) && Array.isArray(a[gi]) ? a[gi] : [];
      var top = g.options.map(function(o){ return o.pts; }).sort(function(x, y){ return y - x; }).slice(0, g.pick), cut = top[top.length - 1];
      return '<section class="grp"><div class="ghead"><h3>' + esc(g.label) + '</h3></div><ul class="rev">' + g.options.map(function(o, i){
        var on = picks.indexOf(i) !== -1, best = o.pts >= cut && o.pts > 0;
        return '<li class="rv' + (on ? ' you' : '') + (best ? ' best' : '') + '"><div class="top2"><span>' + esc(o.t) + '</span>' + tag(o.pts) + '</div><span class="why">' + (on ? '<b>You chose this.</b> ' : '') + (best ? '<b>Top pick.</b> ' : '') + esc(o.why) + '</span></li>';
      }).join('') + '</ul></section>';
    }).join('');
  } else if(p.format === 'order'){
    var mine = Array.isArray(a) ? a : [], correct = p.steps.slice().sort(function(x, y){ return x.pos - y.pos; });
    h += '<ol class="rev">' + correct.map(function(s){
      var at = mine.indexOf(s.id) + 1, ok = at === s.pos;
      return '<li class="rv' + (ok ? ' best' : '') + '"><div class="top2"><span><b>' + s.pos + '.</b> ' + esc(s.t) + '</span><span class="tag ' + (ok ? 'p' : 'n') + '">' + (ok ? 'Correct spot' : 'You put it #' + at) + '</span></div>' + (s.why ? '<span class="why">' + esc(s.why) + '</span>' : '') + '</li>';
    }).join('') + '</ol>';
  } else {
    var hits = rubricHits(p, a);
    h += '<p class="eyebrow" style="margin-bottom:6px">What you wrote</p><p class="yours">' + esc(a) + '</p><ul class="rev">' + p.rubric.map(function(r, i){
      return '<li class="rv' + (hits[i] ? ' best' : '') + '"><div class="top2"><span><b>' + esc(r.label) + '</b></span><span class="tag ' + (hits[i] ? 'p' : '') + '">' + (hits[i] ? '+' + r.pts : '0') + ' pts</span></div><span class="why">' + esc(r.tip) + '</span></li>';
    }).join('') + '</ul>';
    if(p.sample){ h += '<div class="sample"><p class="eyebrow">A strong answer</p><p>' + esc(p.sample) + '</p></div>'; }
    h += '<p class="legend-note" style="max-width:70ch">Written answers are scored by checking for each element of a strong close. Wording that gets the idea across in your own words earns the points.</p>';
  }
  var nxt = nextOpen(p.id);
  h += '<div class="after">' + (nxt ? '<button type="button" class="btn" data-act="open" data-id="' + esc(nxt.id) + '">Next: ' + esc(nxt.title) + '</button>' : '') +
    '<button type="button" class="btn ghost" data-act="back">All puzzles</button><button type="button" class="btn ghost" data-act="view" data-v="board">See the leaderboard</button></div>';
  return h;
}

function submit(){
  if(S.submitting || !S.cur || S.cur.result){ return; }
  var p = S.cur.puzzle, d = draftFor(p); if(!canSubmit(p, d)){ return; }
  S.submitting = true; S.notice = null; renderPuzzle();
  api('POST', '/api/puzzles/' + encodeURIComponent(p.id) + '/answer', {answer:answerOf(p, d)}).then(function(r){
    S.cur = r; S.submitting = false; renderPuzzle(); fetchBoard(true);
  }).catch(function(e){
    S.submitting = false;
    if(e.status === 401){ S.me = null; S.openId = null; renderHeader(); renderPlay(); return; }
    S.notice = e.message; renderPuzzle();
  });
}

/* ---------- host ---------- */
function hostLoad(){
  return api('GET', '/api/admin/agents').then(function(r){ S.host.agents = r.agents; })
    .catch(function(e){ if(e.status === 401){ S.admin = false; renderHeader(); } });
}
function renderHost(){
  var el = $('#v-host');
  if(!S.admin){
    if(el.dataset.mode === 'login'){ return; }
    el.dataset.mode = 'login';
    el.innerHTML = '<form class="card signin" id="hostlogin" autocomplete="off"><div><p class="eyebrow">Host</p><h2>Host sign-in</h2></div>' +
      '<div><label for="hp">Host password</label><input type="password" id="hp" autocomplete="current-password" style="width:100%;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:10px 12px"></div>' +
      '<button class="btn" type="submit">Sign in</button><p class="formerr" id="herr" role="alert"></p></form>';
    return;
  }
  el.dataset.mode = 'host';
  if(!S.board){ el.innerHTML = '<p class="skeleton">Loading...</p>'; return; }
  if(!S.host.agents){ el.innerHTML = '<p class="skeleton">Loading...</p>'; hostLoad().then(function(){ if(S.view === 'host'){ renderHost(); } }); return; }
  var b = S.board, cats = [];
  b.puzzles.forEach(function(p){ if(cats.indexOf(p.cat) === -1){ cats.push(p.cat); } });
  var h = '';
  if(S.host.msg){ h += '<p class="notice" role="status">' + esc(S.host.msg) + '</p>'; }

  /* agents first: it is the main job */
  h += '<div class="card"><h2>Add agents</h2><p class="hint">Type one agent per line. Add a comma and a team name to put a line on a different team, for example <b>Maria Lopez, Orange Team</b>. Each agent gets a personal code to sign in with.</p>' +
    '<div class="hostrow"><div><label for="nt">Default team</label><select id="nt">' + b.teams.map(function(t){ return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join('') + '</select></div></div>' +
    '<div><label for="nl">Agents</label><textarea id="nl" style="max-width:none" placeholder="Maria Lopez&#10;James Carter&#10;Priya Shah, Green Team"></textarea></div>' +
    '<div><button type="button" class="btn" data-act="addagents">Add agents</button></div>';
  if(S.host.added){
    var ad = S.host.added;
    if(ad.created.length){
      h += '<div class="added"><p class="eyebrow">New codes. Copy these now and share them with each agent.</p><table class="mini"><thead><tr><th>Agent</th><th>Team</th><th>Code</th></tr></thead><tbody>' +
        ad.created.map(function(a){ return '<tr><td>' + esc(a.name) + '</td><td>' + esc((teamOf(a.teamId) || {}).name || '') + '</td><td><b class="codecell">' + esc(a.code) + '</b></td></tr>'; }).join('') + '</tbody></table></div>';
    }
    if(ad.problems.length){ h += '<p class="notice err" style="margin-top:8px">Not added: ' + ad.problems.map(esc).join('; ') + '</p>'; }
  }
  h += '</div>';

  var q = S.host.q.trim().toLowerCase();
  var list = S.host.agents.slice().sort(function(x, y){ return (teamOf(x.teamId) || {order:9}).order - (teamOf(y.teamId) || {order:9}).order || x.name.localeCompare(y.name); })
    .filter(function(a){ return !q || a.name.toLowerCase().indexOf(q) !== -1 || a.code.toLowerCase().indexOf(q) !== -1; });
  h += '<div class="card"><h2>Agents (' + S.host.agents.length + ')</h2><div class="hostrow"><div style="flex:1;min-width:200px"><label for="hq">Search</label><input type="text" id="hq" value="' + esc(S.host.q) + '" placeholder="Name or code" autocomplete="off"></div>' +
    '<button type="button" class="btn ghost" data-act="copycodes">Copy all codes</button><button type="button" class="btn ghost" data-act="csv">Download scores (CSV)</button></div>' +
    '<div class="mwrap" style="margin-top:4px"><table class="mini hostt"><thead><tr><th>Agent</th><th>Team</th><th>Code</th><th></th></tr></thead><tbody>' +
    (list.length ? list.map(function(a){
      var sc = b.agents.find(function(x){ return x.id === a.id; }) || {points:0};
      var conf = S.host.confirm === 'del:' + a.id, confR = S.host.confirm === 'clr:' + a.id;
      return '<tr><td>' + esc(a.name) + '<br><span class="hint">' + fmtN(sc.points) + ' points</span></td>' +
        '<td><select data-act="setteam" data-id="' + esc(a.id) + '" aria-label="Team for ' + esc(a.name) + '">' + b.teams.map(function(t){ return '<option value="' + esc(t.id) + '"' + (t.id === a.teamId ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select></td>' +
        '<td><b class="codecell">' + esc(a.code) + '</b></td>' +
        '<td class="acts"><button type="button" class="btn ghost small" data-act="newcode" data-id="' + esc(a.id) + '">New code</button> ' +
        (confR ? '<button type="button" class="btn small" data-act="clr2" data-id="' + esc(a.id) + '">Clear their scores?</button>' : '<button type="button" class="btn ghost small" data-act="clr1" data-id="' + esc(a.id) + '">Clear scores</button>') + ' ' +
        (conf ? '<button type="button" class="btn small" data-act="del2" data-id="' + esc(a.id) + '">Remove for good?</button>' : '<button type="button" class="btn ghost small" data-act="del1" data-id="' + esc(a.id) + '">Remove</button>') + '</td></tr>';
    }).join('') : '<tr><td colspan="4">No agents yet. Add some above.</td></tr>') + '</tbody></table></div></div>';

  h += '<div class="card"><h2>Puzzle release</h2><p class="hint">Every agent gets the same puzzles. Open puzzles can be played now. Open or close a whole skill at once, or one puzzle at a time.</p><div class="catbar">' +
    '<button type="button" class="btn ghost small" data-act="cat" data-cat="*">All puzzles (' + b.puzzles.filter(function(p){ return p.open; }).length + '/' + b.puzzles.length + ' open)</button>' +
    cats.map(function(c){ var ps = b.puzzles.filter(function(p){ return p.cat === c; }); return '<button type="button" class="btn ghost small" data-act="cat" data-cat="' + esc(c) + '">' + esc(c) + ' (' + ps.filter(function(p){ return p.open; }).length + '/' + ps.length + ')</button>'; }).join('') + '</div><div>' +
    b.puzzles.map(function(p){
      return '<label class="switch"><input type="checkbox" data-act="toggle-open" data-id="' + esc(p.id) + '"' + (p.open ? ' checked' : '') + '><span><b>Puzzle ' + p.n + '</b> &middot; ' + esc(p.title) + ' <span class="hint">(' + esc(p.cat) + ', ' + FMT[p.format] + ')</span></span></label>';
    }).join('') + '</div></div>';

  h += '<div class="card"><h2>Teams</h2>' + b.teams.map(function(t){
    return '<div class="tedit"><span class="sw" style="--c:' + teamColor(t) + '"></span>' +
      '<div><label for="tn-' + t.id + '">Team name</label><input type="text" id="tn-' + t.id + '" value="' + esc(t.name) + '" maxlength="40"></div>' +
      '<div><label for="tl-' + t.id + '">Leader</label><input type="text" id="tl-' + t.id + '" value="' + esc(t.leader || '') + '" maxlength="40"></div>' +
      '<button type="button" class="btn ghost" data-act="saveteam" data-id="' + esc(t.id) + '">Save</button><p class="stat" id="hs-' + t.id + '" role="status"></p></div>';
  }).join('') + '</div>';

  var n = b.agents.reduce(function(a, x){ return a + x.done; }, 0);
  h += '<div class="card"><h2>Scores</h2><p class="hint">' + n + ' answers are recorded. Clearing scores lets every agent replay every puzzle.</p><div>' +
    (S.host.confirm === 'reset' ? '<button type="button" class="btn" data-act="reset2">Yes, delete ' + n + ' answers</button> <button type="button" class="btn ghost" data-act="cancel">Cancel</button>' : '<button type="button" class="btn ghost" data-act="reset1"' + (n ? '' : ' disabled') + '>Clear all scores</button>') + '</div></div>';
  el.innerHTML = h;
}
function hostDone(msg){
  S.host.msg = msg || ''; S.host.confirm = null;
  return Promise.all([hostLoad(), fetchBoard(true)]).then(function(){ if(S.view === 'host'){ renderHost(); } });
}
function hostCat(cat){
  var ps = S.board.puzzles.filter(function(p){ return cat === '*' || p.cat === cat; });
  var target = !ps.every(function(p){ return p.open; });
  api('POST', '/api/admin/puzzles/open', {cat:cat, open:target}).then(function(){ return hostDone(''); }).catch(function(e){ S.host.msg = e.message; renderHost(); });
}

/* ---------- events ---------- */
root.addEventListener('click', function(e){
  var b = e.target.closest('[data-act]'); if(!b || b.disabled || b.tagName === 'SELECT' || b.tagName === 'INPUT'){ return; }
  var act = b.dataset.act, p, d, fail = function(er){ S.host.msg = er.message; renderHost(); };
  if(act === 'view'){ S.view = b.dataset.v; syncViews(); if(S.view === 'host' && S.admin){ S.host.agents = null; renderHost(); } }
  else if(act === 'mode'){ S.mode = b.dataset.m; renderBoard(); }
  else if(act === 'team'){ S.openTeam = S.openTeam === b.dataset.id ? null : b.dataset.id; renderBoard(); }
  else if(act === 'showall'){ S.showAll = true; renderBoard(); }
  else if(act === 'open'){ S.view = 'play'; syncViews(); openPuzzle(b.dataset.id); }
  else if(act === 'back'){ S.openId = null; S.cur = null; S.notice = null; renderPlay(); }
  else if(act === 'pick'){ p = S.cur.puzzle; draftFor(p).sel = +b.dataset.i; renderPuzzle(); }
  else if(act === 'tog'){
    p = S.cur.puzzle; d = draftFor(p); var i = +b.dataset.i, at = d.sel.indexOf(i);
    if(at === -1){ d.sel.push(i); } else { d.sel.splice(at, 1); }
    renderPuzzle();
  }
  else if(act === 'gpick'){
    p = S.cur.puzzle; d = draftFor(p);
    var gi = +b.dataset.g, gx = +b.dataset.i, grp = p.groups[gi], cur = d.g[gi], pos = cur.indexOf(gx);
    if(grp.pick === 1){ d.g[gi] = [gx]; } else if(pos !== -1){ cur.splice(pos, 1); } else if(cur.length < grp.pick){ cur.push(gx); }
    renderPuzzle();
  }
  else if(act === 'mv'){
    p = S.cur.puzzle; d = draftFor(p); var from = +b.dataset.i, to = from + +b.dataset.d;
    if(to >= 0 && to < d.order.length){ var x = d.order[from]; d.order[from] = d.order[to]; d.order[to] = x; renderPuzzle(); }
  }
  else if(act === 'submit'){ submit(); }
  else if(act === 'signout'){ api('POST', '/api/logout').catch(function(){}).then(function(){ setToken(null); S.me = null; S.admin = false; S.openId = null; S.cur = null; S.host.agents = null; if(S.view === 'host'){ S.view = 'board'; } $('#v-play').dataset.mode = ''; $('#v-host').dataset.mode = ''; syncViews(); }); }
  else if(act === 'hostout'){ api('POST', '/api/logout').catch(function(){}).then(function(){ setToken(null); S.admin = false; S.me = null; S.host.agents = null; S.view = 'board'; $('#v-host').dataset.mode = ''; $('#v-play').dataset.mode = ''; syncViews(); }); }
  else if(act === 'addagents'){
    var lines = $('#nl').value, team = $('#nt').value;
    api('POST', '/api/admin/agents', {lines:lines, teamId:team}).then(function(r){ S.host.added = r; return hostDone(r.created.length + ' agent' + (r.created.length === 1 ? '' : 's') + ' added.'); }).catch(fail);
  }
  else if(act === 'newcode'){ api('PATCH', '/api/admin/agents/' + encodeURIComponent(b.dataset.id), {newCode:true}).then(function(){ return hostDone('New code created. The old code no longer works.'); }).catch(fail); }
  else if(act === 'del1'){ S.host.confirm = 'del:' + b.dataset.id; renderHost(); }
  else if(act === 'del2'){ api('DELETE', '/api/admin/agents/' + encodeURIComponent(b.dataset.id)).then(function(){ return hostDone('Agent removed.'); }).catch(fail); }
  else if(act === 'clr1'){ S.host.confirm = 'clr:' + b.dataset.id; renderHost(); }
  else if(act === 'clr2'){ api('POST', '/api/admin/reset', {agentId:b.dataset.id}).then(function(){ return hostDone('Scores cleared for that agent.'); }).catch(fail); }
  else if(act === 'reset1'){ S.host.confirm = 'reset'; renderHost(); }
  else if(act === 'reset2'){ api('POST', '/api/admin/reset', {}).then(function(r){ return hostDone(r.cleared + ' answers cleared.'); }).catch(fail); }
  else if(act === 'cancel'){ S.host.confirm = null; renderHost(); }
  else if(act === 'cat'){ hostCat(b.dataset.cat); }
  else if(act === 'saveteam'){
    var id = b.dataset.id, stat = $('#hs-' + id);
    api('PATCH', '/api/admin/teams/' + encodeURIComponent(id), {name:$('#tn-' + id).value, leader:$('#tl-' + id).value}).then(function(){ stat.style.color = 'var(--pos)'; stat.textContent = 'Saved.'; return fetchBoard(true); })
      .catch(function(er){ stat.style.color = 'var(--neg)'; stat.textContent = er.message; });
  }
  else if(act === 'csv'){
    fetch(API + '/api/admin/export.csv', {headers:authHeaders()}).then(function(r){ if(!r.ok){ throw new Error('Could not download.'); } return r.blob(); }).then(function(bl){
      var a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'closing-table-scores.csv'; root.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }).catch(fail);
  }
  else if(act === 'copycodes'){
    var lines2 = S.host.agents.map(function(a){ return a.name + '\t' + ((teamOf(a.teamId) || {}).name || '') + '\t' + a.code; }).join('\n');
    var done = function(ok){ S.host.msg = ok ? 'Codes copied. Paste them into a spreadsheet or message.' : 'Could not copy automatically. Use the CSV download instead.'; renderHost(); };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(lines2).then(function(){ done(true); }, function(){ done(false); }); } else { done(false); }
  }
});
root.addEventListener('change', function(e){
  var t = e.target; if(!t || !t.dataset){ return; }
  if(t.dataset.act === 'toggle-open'){ api('PATCH', '/api/admin/puzzles/' + encodeURIComponent(t.dataset.id), {open:t.checked}).then(function(){ return fetchBoard(true); }).catch(function(er){ S.host.msg = er.message; renderHost(); }); }
  if(t.dataset.act === 'setteam'){ api('PATCH', '/api/admin/agents/' + encodeURIComponent(t.dataset.id), {teamId:t.value}).then(function(){ return hostDone('Team changed.'); }).catch(function(er){ S.host.msg = er.message; renderHost(); }); }
});
root.addEventListener('input', function(e){
  var t = e.target;
  if(t.id === 'ans' && S.cur){
    var p = S.cur.puzzle, d = draftFor(p); d.text = t.value;
    $('#cnt').textContent = words(d.text) + ' words'; $('#sub').disabled = !canSubmit(p, d) || S.submitting;
  } else if(t.id === 'q'){ S.q = t.value; if(S.board){ $('#alist').innerHTML = agentRowsHTML(stats()); } }
  else if(t.id === 'hq'){
    S.host.q = t.value; var pos = t.selectionStart; renderHost(); var n = $('#hq'); if(n){ n.focus(); n.setSelectionRange(pos, pos); }
  }
});
root.addEventListener('submit', function(e){
  if(e.target.id === 'login'){
    e.preventDefault();
    var code = $('#lc').value, err = $('#lerr'); if(!code.trim()){ err.textContent = 'Enter your code.'; return; }
    api('POST', '/api/login', {code:code}).then(function(r){ setToken(r.token); S.me = r.agent; S.loginErr = ''; S.openId = null; $('#v-play').dataset.mode = ''; renderHeader(); renderPlay(); })
      .catch(function(er){ err.textContent = er.message; });
  }
  if(e.target.id === 'hostlogin'){
    e.preventDefault();
    var pw = $('#hp').value, er2 = $('#herr');
    api('POST', '/api/admin/login', {password:pw}).then(function(r){ setToken(r.token); S.admin = true; S.host.agents = null; $('#v-host').dataset.mode = ''; renderHeader(); renderHost(); })
      .catch(function(x){ er2.textContent = x.message; });
  }
});

/* ---------- data ---------- */
function fetchBoard(force){
  return fetch(API + '/api/state', {headers:(!force && S.etag) ? {'If-None-Match':S.etag} : {}}).then(function(r){
    if(r.status === 304){ return; }
    if(!r.ok){ throw new Error('Scores could not be loaded.'); }
    S.etag = r.headers.get('ETag');
    return r.json().then(function(j){
      S.board = j; S.loadErr = null; renderBanner(); renderHeader();
      if(S.view === 'board'){ if(root.activeElement && root.activeElement.id === 'q'){ var el = $('#alist'); if(el){ el.innerHTML = agentRowsHTML(stats()); } } else { renderBoard(); } }
      if(S.view === 'play' && !S.openId){ $('#v-play').dataset.mode === 'signin' || renderPlay(); }
      if(S.view === 'play' && S.openId && S.cur && S.cur.result){ /* results view is static */ }
    });
  }).catch(function(e){ S.loadErr = 'Connection problem. Scores will refresh when it comes back.'; renderBanner(); });
}
function start(){
  renderHeader(); renderBoard();
  api('GET', '/api/me').then(function(r){ S.me = r.agent; S.admin = !!r.admin; renderHeader(); if(S.view === 'play'){ renderPlay(); } }).catch(function(e){ if(e.status === 401){ setToken(null); } });
  fetchBoard(true);
  setInterval(function(){ if(!document.hidden){ fetchBoard(false); } }, 8000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden){ fetchBoard(false); } });
}
start();
})();
