(function(){
'use strict';
/* ---------- mount: works as a full page or pasted into any site ---------- */
var script = document.currentScript;
var API = (window.CLOSING_TABLE_API || (script && script.src ? new URL(script.src).origin : '')).replace(/\/+$/, '');
var mount = document.getElementById('closing-table');
if(!mount){ mount = document.createElement('div'); mount.id = 'closing-table'; if(script && script.parentNode){ script.parentNode.insertBefore(mount, script); } else { document.body.appendChild(mount); } }
if(!document.getElementById('ct-fonts')){
  var lk = document.createElement('link'); lk.id = 'ct-fonts'; lk.rel = 'stylesheet';
  lk.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Public+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(lk);
}
var root = mount.attachShadow ? mount.attachShadow({mode:'open'}) : mount;
root.innerHTML = '<style>' + ":host{\n  --bg:#f6f2e7; --surface:#ffffff; --sunk:#efe6d0; --ink:#181305; --ink2:#4a4433; --muted:#867d63;\n  --line:#e2d6b8; --btn:#0e1b33; --btn-ink:#e7c467; --focus:#b3841f; --seq:#b3841f;\n  --gold:#b3841f; --gold-deep:#7a5a14; --gold-bright:#e7c467; --navy:#0e1b33; --navy-ink:#e7c467; --accent:#7a5a14; --navy-hover:#15284a; --seq-k:.8;\n  --pos:#2f6b3f; --neg:#a3312a; --pos-bg:#e3ecdf; --neg-bg:#f5e3e1; --best-bg:#f7ecd2;\n  --t1:#2d4f8f; --t2:#c2601f; --t3:#17806f; --t4:#b3841f; --t5:#a3486a; --t6:#2f6b3f; --t7:#5b3a8e; --t8:#a3312a; --tmore:var(--muted);\n  --display:\"Playfair Display\",Georgia,\"Times New Roman\",serif;\n  --body:\"Public Sans\",system-ui,-apple-system,\"Segoe UI\",sans-serif;\n  --r:3px; --rl:5px;\n}\n@media (prefers-color-scheme: dark){\n  :host(:not([data-theme=\"light\"])){\n    color-scheme:dark;\n    --bg:#0b0d12; --surface:#15171d; --sunk:#0f1116; --ink:#f2ecd8; --ink2:#cdc4a4; --muted:#928a6c;\n    --line:#2f2a1f; --btn:#e7c467; --btn-ink:#12100a; --focus:#e7c467; --seq:#d4a83c;\n    --gold:#d4a83c; --gold-deep:#a67c1e; --gold-bright:#f0d27a; --navy:#101a2e; --navy-ink:#e7c467; --accent:#d4a83c; --navy-hover:#1a2a4a; --seq-k:.55;\n    --pos:#5cbf6a; --neg:#e2766c; --pos-bg:#173420; --neg-bg:#3a201d; --best-bg:#2c230f;\n    --t1:#5c85d6; --t2:#d9772e; --t3:#22a68f; --t4:#d4a83c; --t5:#c95c86; --t6:#4aab5c; --t7:#8a68d9; --t8:#d1483f; --tmore:var(--muted);\n  }\n}\n:host([data-theme=\"dark\"]){\n  color-scheme:dark;\n  --bg:#0b0d12; --surface:#15171d; --sunk:#0f1116; --ink:#f2ecd8; --ink2:#cdc4a4; --muted:#928a6c;\n  --line:#2f2a1f; --btn:#e7c467; --btn-ink:#12100a; --focus:#e7c467; --seq:#d4a83c;\n  --gold:#d4a83c; --gold-deep:#a67c1e; --gold-bright:#f0d27a; --navy:#101a2e; --navy-ink:#e7c467; --accent:#d4a83c; --navy-hover:#1a2a4a; --seq-k:.55;\n  --pos:#5cbf6a; --neg:#e2766c; --pos-bg:#173420; --neg-bg:#3a201d; --best-bg:#2c230f;\n  --t1:#5c85d6; --t2:#d9772e; --t3:#22a68f; --t4:#d4a83c; --t5:#c95c86; --t6:#4aab5c; --t7:#8a68d9; --t8:#d1483f; --tmore:var(--muted);\n}\n*{box-sizing:border-box}\n:host{display:block;background:var(--bg);color:var(--ink);font-family:var(--body);font-size:15px;line-height:1.55;padding:0 16px 56px;text-align:left}\n.wrap{max-width:1040px;margin-inline:auto}\nbutton,input,select,textarea{font:inherit;color:inherit}\n:focus-visible{outline:2px solid var(--focus);outline-offset:2px}\nh1,h2,h3{margin:0;text-wrap:balance;font-weight:700}\np{margin:0}\n\n/* header */\n.top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 24px;margin-top:16px;padding:16px 22px;background:var(--navy);color:var(--navy-ink);border-radius:var(--rl);border-bottom:3px solid var(--gold)}\n.brand{display:flex;align-items:center;gap:14px}\n.brand .mark{flex:none;width:46px;height:46px;border-radius:50%;background:#f6f2e7;display:grid;place-items:center;box-shadow:0 0 0 2px var(--gold)}\n.brand .mark img{height:34px;width:auto;display:block}\n.brand b{font-family:var(--display);font-weight:700;font-size:23px;letter-spacing:.01em;line-height:1;color:var(--navy-ink)}\n.brand div span{display:block;color:var(--gold-bright);font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-top:3px;opacity:.85}\n.right{display:flex;flex-wrap:wrap;align-items:center;gap:16px}\n.tabs{display:flex;gap:18px;background:transparent;padding:0;border-radius:0}\n.tabs button{border:0;background:transparent;padding:4px 0;border-radius:0;cursor:pointer;font-weight:600;color:var(--gold-bright);opacity:.6;border-bottom:2px solid transparent;font-size:14px;letter-spacing:.02em}\n.tabs button[aria-selected=\"true\"]{opacity:1;color:var(--navy-ink);border-bottom-color:var(--gold)}\n.who-pill{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--gold-bright);opacity:.9}\n.top .link{color:var(--gold-bright);text-decoration-color:rgba(231,196,103,.5)}\n.top .sw{box-shadow:0 0 0 1.5px rgba(255,255,255,.55)}\n.link{background:none;border:0;padding:0;color:var(--ink);text-decoration:underline;text-decoration-color:var(--gold);text-underline-offset:3px;cursor:pointer;font-size:13px}\nmain{padding-block:30px 0}\n\n/* shared bits */\n.eyebrow{font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}\n.card{background:var(--surface);border:1px solid var(--line);border-top:3px solid var(--gold);border-radius:var(--r);padding:20px}\n.btn{background:var(--btn);color:var(--btn-ink);border:1px solid var(--btn);border-radius:var(--r);padding:10px 20px;font-weight:700;cursor:pointer;letter-spacing:.02em;transition:background .15s ease,color .15s ease}\n.btn:hover:not(:disabled){background:transparent;color:var(--ink);border-color:var(--line)}\n.btn:disabled{opacity:.4;cursor:not-allowed}\n.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}\n.btn.ghost:hover{border-color:var(--gold);color:var(--ink)}\n.sw{display:inline-block;width:11px;height:11px;border-radius:50%;background:var(--c,var(--muted));flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.08)}\n.hint{color:var(--ink2);font-size:14px}\n.notice{border:1px solid var(--line);border-left:3px solid var(--gold);background:var(--sunk);border-radius:var(--r);padding:12px 14px;color:var(--ink2);font-size:14px}\n.notice.err{border-left-color:var(--neg);color:var(--ink)}\n.skeleton{color:var(--muted);padding:48px 0;text-align:center}\ntable{border-collapse:collapse;width:100%}\n\n/* leaderboard */\n.hero{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px 32px;margin-bottom:26px}\n.hero h1{font-family:var(--display);font-weight:700;font-size:clamp(30px,5.2vw,46px);line-height:1.08;letter-spacing:0;margin-top:6px}\n.pulse{display:flex;gap:28px;margin:0}\n.pulse div{display:flex;flex-direction:column-reverse}\n.pulse dt{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}\n.pulse dd{margin:0;font-family:var(--display);font-weight:700;font-size:28px;line-height:1.1;color:var(--accent)}\n.standings{list-style:none;margin:0;padding:0;background:var(--surface);border:1px solid var(--line);border-radius:var(--r)}\n.srow{display:grid;grid-template-columns:44px minmax(150px,1.1fr) minmax(180px,2fr) 110px;align-items:center;gap:12px 20px;padding:14px 20px}\n.srow+.srow{border-top:1px solid var(--line)}\n.rk{font-family:var(--display);font-weight:700;font-size:30px;line-height:1;color:var(--muted)}\n.srow.first .rk{color:var(--accent)}\n.srow.first{background:linear-gradient(90deg,var(--best-bg),transparent 60%)}\n.who{display:flex;align-items:center;gap:10px;min-width:0}\n.who b{display:block;font-weight:700;overflow-wrap:anywhere}\n.who span.sub{display:block;color:var(--ink2);font-size:13px}\n.track{height:12px;background:var(--sunk);border-radius:1px;overflow:hidden;border:1px solid var(--line)}\n.track i{display:block;height:100%;background:var(--c);min-width:0;transition:width .5s ease}\n.pips{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:3px;margin-top:8px}\n.pips i{height:6px;border-radius:1px;border:1px solid var(--line);background:transparent}\n.pips i.on{background:var(--c);border-color:var(--c)}\n.pips i.shut{border-style:dashed;opacity:.5}\n.pts{text-align:right}\n.pts b{font-family:var(--display);font-weight:700;font-size:34px;line-height:1;display:block;font-variant-numeric:tabular-nums}\n.pts span{font-size:12px;color:var(--muted)}\n.legend-note{color:var(--muted);font-size:12.5px;margin-top:10px}\n.board2col{display:grid;gap:28px;align-items:start;margin-bottom:8px}\n.colhead{font-family:var(--display);font-weight:700;font-size:20px;letter-spacing:0;margin:0 0 10px;padding-bottom:8px;border-bottom:2px solid var(--gold)}\n.standings.compact .crow{grid-template-columns:34px 1fr auto;padding:11px 16px}\n.standings.compact .crow .pts b{font-size:22px}\n.standings.compact .crow .who b{font-size:14.5px}\n@media (min-width:880px){.board2col{grid-template-columns:1.3fr 1fr}}\nh2.sec{font-family:var(--display);font-weight:700;font-size:25px;letter-spacing:0;margin:44px 0 6px;padding-bottom:8px;border-bottom:2px solid var(--gold)}\n.mwrap{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);margin-top:12px}\n.matrix{min-width:640px;font-variant-numeric:tabular-nums}\n.matrix th,.matrix td{padding:9px 10px;text-align:center;font-size:14px}\n.matrix thead th{font-size:12.5px;font-weight:600;vertical-align:bottom;border-bottom:2px solid var(--gold);color:var(--ink2)}\n.matrix thead th .sw{display:block;margin:0 auto 5px;width:100%;height:4px;border-radius:0}\n.matrix th.pl,.matrix td.pl{text-align:left;padding-left:16px}\n.matrix tbody th{font-weight:500;color:var(--ink)}\n.matrix tbody th small{color:var(--muted);margin-right:6px;font-weight:700}\n.matrix tr.shut th{color:var(--muted)}\n.matrix td{border-left:1px solid var(--surface);border-top:1px solid var(--surface)}\n.matrix td.cell{background:color-mix(in srgb,var(--seq) calc(var(--p) * var(--seq-k) * 1%),var(--surface));font-weight:600}\n.matrix td.cell.hi{color:inherit}\n.matrix td.none{color:var(--muted)}\n.matrix tfoot td,.matrix tfoot th{border-top:2px solid var(--gold);font-weight:700}\n.scale{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:12.5px;margin-top:10px}\n.scale i{width:120px;height:8px;border-radius:0;background:linear-gradient(90deg,var(--surface),var(--seq));border:1px solid var(--line)}\n\n/* play */\n.signin{max-width:440px;margin-inline:auto;display:grid;gap:14px}\n.signin form{display:grid;gap:14px}\n.signin form .btn{width:100%;padding:12px 20px;font-size:15px}\n.signin form .formerr:empty{display:none}\n.signin h2,.host h2{font-family:var(--display);font-weight:700;font-size:26px;letter-spacing:0}\nlabel{display:block;font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:4px}\ninput[type=text],input[type=password],select,textarea{width:100%;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 12px}\ninput[type=text]:focus,input[type=password]:focus,select:focus,textarea:focus{border-color:var(--gold)}\ninput.code{font-family:var(--display);font-weight:700;font-size:22px;letter-spacing:.2em;text-transform:uppercase}\n.formerr{color:var(--neg);font-size:14px;min-height:20px}\n.mine{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:20px}\n.mine h1{font-family:var(--display);font-weight:700;font-size:clamp(28px,5vw,42px);line-height:1.1;letter-spacing:0;display:flex;align-items:center;gap:12px}\n.mine h1 .sw{width:15px;height:15px}\n.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}\n.pcard{text-align:left;background:var(--surface);border:1px solid var(--line);border-top:3px solid var(--gold);border-radius:var(--r);padding:16px;cursor:pointer;display:grid;gap:6px;align-content:start}\n.pcard:hover:not(:disabled){border-color:var(--ink2);border-top-color:var(--gold)}\n.pcard:disabled{cursor:not-allowed;opacity:.55}\n.pcard .n{font-family:var(--display);font-weight:700;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}\n.pcard h3{font-size:17px;line-height:1.25;font-weight:700}\n.gnfeatured{display:block;width:100%;text-align:left;background:var(--navy);color:var(--navy-ink);border:0;border-bottom:3px solid var(--gold);border-radius:var(--rl);padding:22px 24px;cursor:pointer;margin-bottom:22px}\n.gnfeatured:hover{background:var(--navy-hover)}\n.gnfeatured .eyebrow{color:var(--gold-bright);opacity:.9}\n.gnfeatured h2{font-family:var(--display);font-weight:700;font-size:clamp(22px,3vw,29px);letter-spacing:0;margin:6px 0 10px;color:var(--navy-ink)}\n.gnfeatured p{margin:0 0 12px;max-width:60ch;opacity:.85}\n.gnfeatured .chips{margin-bottom:12px}\n.gnfeatured .chip{border-color:currentColor;color:inherit;opacity:.8}\n.gnfeatured .chip.done{background:rgba(231,196,103,.18);color:inherit;opacity:1}\n.gnfeatured .cta{font-weight:700;color:var(--gold-bright)}\n.gnfeatured .chips .chip.open{color:var(--gold-bright);border-color:rgba(231,196,103,.6)}\n.pcard.bonuscard{background:var(--sunk);border:1px dashed var(--gold-deep);border-top:3px solid var(--gold)}\n.pcard.bonuscard.ready{background:var(--best-bg);border-style:solid;border-color:var(--gold)}\n.pcard.bonuscard h3{color:var(--ink)}\n.pcard.bonuscard .bnote{color:var(--ink2);font-size:13.5px;line-height:1.45}\n.wrapup{margin-top:24px;max-width:70ch;background:var(--navy);color:var(--navy-ink);border-bottom:3px solid var(--gold);border-radius:var(--rl);padding:18px 20px;display:grid;gap:6px}\n.wrapup .eyebrow{color:var(--gold-bright)}\n.wrapup h3{font-family:var(--display);font-weight:700;font-size:22px;color:var(--navy-ink)}\n.wrapup p:last-child{opacity:.88}\n.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}\n.chip{font-size:12px;font-weight:600;padding:2px 9px;border-radius:99px;border:1px solid var(--line);color:var(--ink2)}\n.chip.done{background:var(--pos-bg);border-color:transparent;color:var(--pos)}\n.chip.open{border-color:var(--gold-deep);color:var(--ink)}\n\n.phead{display:grid;gap:6px;margin-block:18px 20px}\n.phead h1{font-family:var(--display);font-weight:700;font-size:clamp(28px,5vw,42px);line-height:1.1;letter-spacing:0}\n.file{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));background:var(--sunk);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;margin:0 0 16px}\n.file div{padding:9px 12px;box-shadow:inset -1px -1px 0 var(--line)}\n.file dt{font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700}\n.file dd{margin:2px 0 0;font-weight:500}\n.story{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:var(--r);padding:16px 18px;max-width:70ch}\n.ask{font-weight:700;font-size:17px;margin-block:22px 12px;max-width:62ch;font-family:var(--display)}\n.opts{display:grid;gap:8px;max-width:70ch;list-style:none;margin:0;padding:0}\n.opt{width:100%;display:grid;grid-template-columns:22px 1fr;gap:12px;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:12px 14px;cursor:pointer}\n.opt:hover{border-color:var(--gold-deep)}\n.opt[aria-checked=\"true\"]{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}\n.mark{width:20px;height:20px;border:2px solid var(--muted);border-radius:50%;margin-top:1px;position:relative}\n.opt[role=checkbox] .mark{border-radius:3px}\n.opt[aria-checked=\"true\"] .mark{border-color:var(--gold);background:var(--gold)}\n.opt[aria-checked=\"true\"] .mark::after{content:\"\";position:absolute;left:5px;top:1px;width:5px;height:10px;border:solid var(--surface);border-width:0 2px 2px 0;transform:rotate(45deg)}\n.ord{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:12px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:10px 10px 10px 14px}\n.ord .no{font-family:var(--display);font-weight:700;font-size:22px;color:var(--accent);line-height:1}\n.mv{display:flex;gap:4px}\n.mv button{width:34px;height:34px;border:1px solid var(--line);background:var(--surface);border-radius:var(--r);cursor:pointer;font-size:16px;line-height:1}\n.mv button:disabled{opacity:.3;cursor:not-allowed}\n.grp{margin-top:28px;max-width:72ch}\n.grp+.grp{margin-top:32px}\n.ghead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 16px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--line)}\n.ghead h3{font-family:var(--display);font-weight:700;font-size:21px;letter-spacing:0}\n.gcount{font-size:13px;font-weight:600;color:var(--muted)}\n.gcount.ok{color:var(--pos)}\ntextarea{min-height:130px;resize:vertical;max-width:70ch;display:block}\n.count{color:var(--muted);font-size:13px;margin-top:6px}\n.submit{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;margin-top:20px}\n\n.score{display:flex;align-items:baseline;gap:10px;margin:0 0 18px}\n.score b{font-family:var(--display);font-weight:700;font-size:64px;line-height:.9;color:var(--accent)}\n.score span{color:var(--ink2)}\n.rev{display:grid;gap:8px;max-width:72ch;list-style:none;margin:0;padding:0}\n.rv{border:1px solid var(--line);background:var(--surface);border-radius:var(--r);padding:12px 14px;display:grid;gap:4px}\n.rv.you{border-color:var(--gold)}\n.rv.best{background:var(--best-bg)}\n.rv .top2{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}\n.tag{font-size:12px;font-weight:700;white-space:nowrap;padding:1px 8px;border-radius:99px;background:var(--sunk);color:var(--ink2)}\n.tag.p{background:var(--pos-bg);color:var(--pos)}\n.tag.n{background:var(--neg-bg);color:var(--neg)}\n.rv .why{color:var(--ink2);font-size:14px}\n.yours{border-left:3px solid var(--gold);padding:4px 0 4px 14px;color:var(--ink2);max-width:70ch;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 14px}\n.sample{margin-top:16px;max-width:72ch}\n.sample p{background:var(--sunk);border-radius:var(--r);padding:12px 14px;margin-top:6px}\n.after{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}\n\n/* host */\n.host{display:grid;gap:16px}\n.host .card{display:grid;gap:12px}\n.switch{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line);cursor:pointer}\n.switch:first-of-type{border-top:0}\n.switch input{width:18px;height:18px}\n.tedit{display:grid;grid-template-columns:20px repeat(3,minmax(120px,1fr)) auto;gap:10px;align-items:end;border-top:1px solid var(--line);padding-top:12px}\n.tedit .sw{margin-bottom:14px}\n.tedit .stat{font-size:13px;color:var(--pos);min-height:18px;grid-column:2/-1}\n@media (max-width:760px){\n  .srow{grid-template-columns:34px 1fr auto;padding:14px 16px}\n  .srow .meter{grid-column:1/-1;grid-row:2}\n  .rk{font-size:26px}\n  .pts b{font-size:29px}\n  .tedit{grid-template-columns:1fr}\n  .tedit .sw{display:none}\n  .tedit .stat{grid-column:1}\n  .top{padding:14px 16px}\n  .brand .mark{width:40px;height:40px}\n  .brand .mark img{height:29px}\n}\n@media (prefers-reduced-motion:reduce){.track i{transition:none}}\n/* standalone-app additions */\n.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n.foot{margin-top:48px;padding-top:16px;border-top:1px solid var(--line);text-align:center}\n.seg{display:inline-flex;gap:20px;background:transparent;padding:0 0 8px;border-radius:0;margin-bottom:16px;border-bottom:1px solid var(--line)}\n.seg button{border:0;background:transparent;padding:4px 0;border-radius:0;cursor:pointer;font-weight:600;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-9px}\n.seg button[aria-selected=\"true\"]{background:transparent;color:var(--ink);box-shadow:none;border-bottom-color:var(--gold)}\n.rowbtn{background:none;border:0;padding:0;text-align:left;cursor:pointer;color:inherit}\n.rowbtn b{text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}\n.rowbtn:hover b{text-decoration-color:var(--gold)}\n.mline{color:var(--ink2);font-size:13px;margin-top:6px}\n.drill{list-style:none;padding:4px 20px 16px 84px;background:var(--sunk);border-top:1px solid var(--line)}\n.mini{width:100%;font-variant-numeric:tabular-nums}\n.mini th,.mini td{padding:7px 10px;text-align:left;font-size:14px;border-bottom:1px solid var(--line)}\n.mini th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}\n.mini tr:last-child td{border-bottom:0}\n.arow{grid-template-columns:44px minmax(150px,1.1fr) minmax(180px,2fr) 110px}\n.searchrow{margin-bottom:12px;max-width:420px}\n.hostrow{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px}\n.hostrow>div{min-width:180px}\n.hostt td{vertical-align:middle}\n.hostt select{width:auto;min-width:130px}\n.codecell{font-family:var(--display);font-size:20px;letter-spacing:.14em}\n.added{background:var(--sunk);border:1px solid var(--line);border-radius:var(--r);padding:12px 14px;display:grid;gap:8px}\n.catbar{display:flex;flex-wrap:wrap;gap:8px}\n.btn.small{padding:6px 12px;font-size:13px}\n.acts{white-space:nowrap}\n.acts .btn{margin-right:4px}\n.matrix td small{display:block;font-weight:400;font-size:11px;opacity:.8}\n.tedit{grid-template-columns:20px repeat(2,minmax(120px,1fr)) minmax(100px,auto) auto}\n.tedit .acts{white-space:nowrap;display:flex;gap:6px;flex-wrap:wrap;align-items:center}\ninput[type=password]{width:100%}\n@media (max-width:760px){\n  .arow{grid-template-columns:34px 1fr auto}\n  .drill{padding-left:16px}\n  .acts{white-space:normal}\n}\n[hidden]{display:none !important}\n" + '</style>' + "<div class=\"wrap\">\n  <header class=\"top\">\n    <div class=\"brand\"><span class=\"mark\"><img src=\"data:image/webp;base64,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\" alt=\"\" width=\"27\" height=\"34\"></span><div><b>Closing Table</b><span>Structured Integrity Group</span></div></div>\n    <div class=\"right\">\n      <nav class=\"tabs\" id=\"nav\" role=\"tablist\" aria-label=\"Sections\"></nav>\n      <div class=\"who-pill\" id=\"pill\"></div>\n    </div>\n  </header>\n  <main>\n    <div id=\"banner\"></div>\n    <section id=\"v-board\"><p class=\"skeleton\">Loading scores...</p></section>\n    <section id=\"v-play\" hidden></section>\n    <section id=\"v-host\" class=\"host\" hidden></section>\n  </main>\n  <footer class=\"foot\"><button type=\"button\" class=\"link\" data-act=\"view\" data-v=\"host\">Host sign-in</button></footer>\n</div>\n";
var TOKEN_KEY = 'closing-table-token-v1', token = null;
try { token = localStorage.getItem(TOKEN_KEY); } catch(e){}
function setToken(t){ token = t || null; try { if(t){ localStorage.setItem(TOKEN_KEY, t); } else { localStorage.removeItem(TOKEN_KEY); } } catch(e){} }
function authHeaders(h){ h = h || {}; if(token){ h['Authorization'] = 'Bearer ' + token; } return h; }

var $ = function(s){ return root.querySelector(s); };
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
var FMT = {choice:'Multiple choice', multi:'Select all that apply', order:'Put in order', text:'Written answer', angle:'Build the angle'};

var S = {
  board:null, etag:null, me:null, admin:false, view:'board', mode:'teams', openTeam:null, q:'', showAll:false,
  openId:null, cur:null, drafts:{}, notice:null, submitting:false, loadErr:null, loginMode:'team',
  boardScope:'all', pool:null,
  host:{agents:null, teams:null, added:null, addedTeam:null, msg:'', confirm:null, q:''}
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
function teamColor(t){ var o=(t&&t.order)||1; return o<=8 ? 'var(--t'+o+')' : 'var(--tmore)'; }
function fmtN(n){ return Math.round(n).toLocaleString(); }

/* ---------- pools: game night, bonus, and category pools ---------- */
var CAT_LABEL = {
  'Objections':'Objection Control', 'Process':'Proper Process', 'Building the case':'Building The Case',
  'Discovery':'Discovery Questions', 'Product knowledge':'Product Knowledge', 'Replacement':'Replacement Scenarios',
  'Compliance':'Compliance & Ethics', 'Closing':'Closing Techniques', 'Door Knocking':'Door Knocking'
};
function catLabel(c){ return CAT_LABEL[c] || c; }
function poolsList(){
  var ps = S.board.puzzles;
  var gn = ps.filter(function(p){ return p.gameNight; });
  var bonus = ps.filter(function(p){ return !p.gameNight; });
  var cats = [];
  bonus.forEach(function(p){ if(cats.indexOf(p.cat) === -1){ cats.push(p.cat); } });
  var pools = [];
  if(gn.length){ pools.push({id:'gamenight', label:'Paragon Game Night', items:gn}); }
  if(bonus.length){ pools.push({id:'bonus', label:'Bonus Puzzles', items:bonus}); }
  cats.forEach(function(c){ pools.push({id:'cat:' + c, label:catLabel(c), items:bonus.filter(function(p){ return p.cat === c; })}); });
  var angle = bonus.filter(function(p){ return p.format === 'angle'; });
  if(angle.length > 1){ pools.push({id:'angle', label:'Find the Angle', items:angle}); }
  return pools;
}
function poolById(id){ return poolsList().find(function(x){ return x.id === id; }); }
function gnProgress(gn, row, justDoneId){
  var done = gn.items.filter(function(q){ return q.id === justDoneId || row.per[q.id] !== undefined; }).length;
  return {done:done, total:gn.items.length, complete:done >= gn.items.length};
}
function bonusTileHTML(gn, row){
  var bonus = poolById('bonus');
  if(!bonus){ return ''; }
  var pr = gnProgress(gn, row), bDone = bonus.items.filter(function(q){ return row.per[q.id] !== undefined; }).length;
  return '<button type="button" class="pcard bonuscard' + (pr.complete ? ' ready' : '') + '" data-act="poolopen" data-id="bonus">' +
    '<span class="n">' + (pr.complete ? 'Game Night complete' : 'After the ' + pr.total) + '</span>' +
    '<h3>Bonus Puzzles &rarr;</h3>' +
    '<span class="bnote">' + bonus.items.length + ' more if you want to keep going. Bonus points count toward your all-time score, not the Game Night standings.</span>' +
    (bDone ? '<span class="chips"><span class="chip done">' + bDone + ' done</span></span>' : '') + '</button>';
}

/* ---------- scoreboard maths ---------- */
function scopedRow(a, idSet){
  if(!idSet){ return {id:a.id, name:a.name, teamId:a.teamId, points:a.points, done:a.done, per:a.per, last:a.last}; }
  var points = 0, done = 0, per = {};
  Object.keys(a.per || {}).forEach(function(id){ if(!idSet[id]){ return; } points += a.per[id]; done++; per[id] = a.per[id]; });
  return {id:a.id, name:a.name, teamId:a.teamId, points:points, done:done, per:per, last:a.last};
}
function stats(scope){
  var b = S.board;
  var scopedPuzzles = scope === 'gamenight' ? b.puzzles.filter(function(p){ return p.gameNight; }) : b.puzzles;
  var idSet = null;
  if(scope === 'gamenight'){ idSet = {}; scopedPuzzles.forEach(function(p){ idSet[p.id] = true; }); }
  var open = scopedPuzzles.filter(function(p){ return p.open; });
  var maxPer = Math.max(1, open.reduce(function(a, p){ return a + p.max; }, 0));
  var teams = b.teams.map(function(t){
    var mem = b.agents.filter(function(a){ return a.teamId === t.id; }).map(function(a){ return scopedRow(a, idSet); });
    var total = 0, answers = 0, playing = 0, pp = {};
    mem.forEach(function(a){
      total += a.points; answers += a.done; if(a.done){ playing++; }
      Object.keys(a.per).forEach(function(id){ var c = pp[id] || (pp[id] = {sum:0, n:0}); c.sum += a.per[id]; c.n++; });
    });
    var n = mem.length;
    return {t:t, mem:mem, n:n, total:total, answers:answers, playing:playing, avg:n ? total / n : 0, pp:pp};
  });
  var sorted = teams.slice().sort(function(a, b2){ return b2.avg - a.avg || b2.total - a.total || a.t.order - b2.t.order; });
  sorted.forEach(function(r, i){ r.rank = (i > 0 && Math.abs(sorted[i-1].avg - r.avg) < 1e-9) ? sorted[i-1].rank : i + 1; });
  var ag = b.agents.map(function(a){ return scopedRow(a, idSet); }).sort(function(a, b2){ return b2.points - a.points || (a.last || 1e15) - (b2.last || 1e15) || a.name.localeCompare(b2.name); });
  ag.forEach(function(r, i){ r.rank = (i > 0 && ag[i-1].points === r.points) ? ag[i-1].rank : i + 1; });
  return {open:open, maxPer:maxPer, teams:teams, sorted:sorted, agents:ag, scopedPuzzles:scopedPuzzles};
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
  var hasGameNight = b.puzzles.some(function(p){ return p.gameNight; });
  if(!hasGameNight){ S.boardScope = 'all'; }
  var st = stats(S.boardScope);
  var answersIn = st.agents.reduce(function(a, x){ return a + x.done; }, 0);
  var playing = st.agents.filter(function(a){ return a.done > 0; }).length;
  var top = st.sorted.filter(function(r){ return r.rank === 1; }), headline;
  if(!top.length || top[0].avg === 0){ headline = 'No scores yet'; }
  else if(top.length === 1){ headline = esc(top[0].t.name) + ' leads with ' + fmtN(top[0].avg) + ' per agent'; }
  else { headline = top.map(function(r){ return esc(r.t.name); }).join(' and ') + ' tied at ' + fmtN(top[0].avg); }
  var star = st.agents[0], starLine = star && star.points > 0
    ? '<p class="hint" style="margin-top:8px">Top agent: <b>' + esc(star.name) + '</b> (' + esc((teamOf(star.teamId) || {}).name || '') + ') with ' + fmtN(star.points) + ' points</p>' : '';

  var h = '';
  if(hasGameNight){
    h += '<div class="seg" role="tablist" aria-label="Leaderboard scope"><button type="button" role="tab" aria-selected="' + (S.boardScope !== 'gamenight') + '" data-act="boardscope" data-s="all">All-time</button>' +
      '<button type="button" role="tab" aria-selected="' + (S.boardScope === 'gamenight') + '" data-act="boardscope" data-s="gamenight">Paragon Game Night</button></div>';
  }
  h += '<div class="hero"><div><p class="eyebrow">' + (S.boardScope === 'gamenight' ? 'Game Night standings' : 'All-time standings') + '</p><h1>' + headline + '</h1>' + starLine + '</div>' +
    '<dl class="pulse"><div><dd>' + playing + ' of ' + b.agents.length + '</dd><dt>Agents playing</dt></div>' +
    '<div><dd>' + st.open.length + ' of ' + st.scopedPuzzles.length + '</dd><dt>Puzzles open</dt></div>' +
    '<div><dd>' + answersIn.toLocaleString() + '</dd><dt>Answers in</dt></div></dl></div>';

  h += '<div class="board2col">' +
    '<div><h2 class="colhead">Team standings</h2>' + teamsHTML(st) + '</div>' +
    '<div><h2 class="colhead">Top agents</h2>' + topAgentsHTML(st, 8) +
      (st.agents.length > 8 ? '<p style="margin-top:10px"><button type="button" class="link" data-act="jumpagents">See every agent &amp; search &rarr;</button></p>' : '') +
    '</div></div>';

  h += '<h2 class="sec">Puzzle by puzzle</h2><p class="hint">Each cell is the average score of the agents on that team who have answered, with how many have answered.</p>';
  h += '<div class="mwrap"><table class="matrix"><thead><tr><th class="pl" scope="col">Puzzle</th>' + b.teams.map(function(t){
    return '<th scope="col"><span class="sw" style="background:' + teamColor(t) + '"></span>' + esc(t.name) + '</th>';
  }).join('') + '</tr></thead><tbody>';
  st.scopedPuzzles.forEach(function(p){
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

  h += '<h2 class="sec" id="ct-allagents">Every agent' + (S.boardScope === 'gamenight' ? ' &middot; Game Night' : '') + '</h2>' + agentsHTML(st);
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
        (mem.length ? mem.map(function(a){ return '<tr><td>' + esc(a.name) + '</td><td>' + a.done + ' of ' + st.scopedPuzzles.length + '</td><td>' + fmtN(a.points) + '</td></tr>'; }).join('') : '<tr><td colspan="3">No agents on this team yet.</td></tr>') +
        '</tbody></table></li>';
    }
    return row;
  }).join('') + '</ol>';
  h += '<p class="legend-note">Teams are ranked by average points per agent, counting every agent on the roster, so teams of different sizes compare fairly and every agent who plays helps. Select a team to see its agents. The bar shows the average against the ' + fmtN(st.maxPer) + ' points available per agent in open puzzles.</p>';
  return h;
}

function topAgentsHTML(st, limit){
  var list = st.agents.slice(0, limit || 8);
  if(!list.length){ return '<p class="hint" style="padding:16px 20px">No agents yet.</p>'; }
  return '<ol class="standings compact">' + list.map(function(a){
    var t = teamOf(a.teamId);
    return '<li class="srow crow' + (a.rank === 1 && a.points > 0 ? ' first' : '') + '" style="--c:' + teamColor(t) + '">' +
      '<span class="rk">' + a.rank + '</span>' +
      '<div class="who"><span class="sw"></span><div><b>' + esc(a.name) + '</b><span class="sub">' + esc(t ? t.name : '') + '</span></div></div>' +
      '<div class="pts"><b>' + fmtN(a.points) + '</b><span>' + a.done + ' of ' + st.scopedPuzzles.length + '</span></div></li>';
  }).join('') + '</ol>';
}
function agentRowsHTML(st){
  var q = S.q.trim().toLowerCase();
  var list = st.agents.filter(function(a){ return !q || a.name.toLowerCase().indexOf(q) !== -1 || ((teamOf(a.teamId) || {}).name || '').toLowerCase().indexOf(q) !== -1; });
  var total = list.length, shown = (S.showAll || q) ? list : list.slice(0, 40);
  if(!total){ return '<p class="hint" style="padding:16px 20px">No agents match.</p>'; }
  return '<ol class="standings agents">' + shown.map(function(a){
    var t = teamOf(a.teamId);
    var pips = st.scopedPuzzles.map(function(p){
      var got = a.per[p.id] !== undefined;
      return '<i class="' + (got ? 'on' : (p.open ? '' : 'shut')) + '" title="Puzzle ' + p.n + (got ? ': ' + a.per[p.id] + ' pts' : '') + '"></i>';
    }).join('');
    return '<li class="srow arow' + (a.rank === 1 && a.points > 0 ? ' first' : '') + '" style="--c:' + teamColor(t) + '"><span class="rk">' + a.rank + '</span>' +
      '<div class="who"><span class="sw"></span><div><b>' + esc(a.name) + '</b><span class="sub">' + esc(t ? t.name : '') + '</span></div></div>' +
      '<div class="meter"><div class="pips">' + pips + '</div></div>' +
      '<div class="pts"><b>' + fmtN(a.points) + '</b><span>' + a.done + ' of ' + st.scopedPuzzles.length + ' puzzles</span></div></li>';
  }).join('') + '</ol>' + (total > shown.length ? '<p style="margin-top:12px"><button type="button" class="btn ghost" data-act="showall">Show all ' + total + ' agents</button></p>' : '');
}
function agentsHTML(st){
  return '<div class="searchrow"><label for="q" class="sr">Search agents</label><input type="text" id="q" placeholder="Search by agent or team" value="' + esc(S.q) + '" autocomplete="off"></div><div id="alist">' + agentRowsHTML(st) + '</div>';
}

/* ---------- play ---------- */
function renderPlay(){
  var el = $('#v-play');
  if(!S.me){
    if(el.dataset.mode === 'signin' && el.dataset.signinmode === S.loginMode){ return; }
    el.dataset.mode = 'signin'; el.dataset.signinmode = S.loginMode;
    var tabs = '<div class="seg" role="tablist" aria-label="Sign-in method">' +
      '<button type="button" role="tab" aria-selected="' + (S.loginMode !== 'code') + '" data-act="signinmode" data-m="team">Join with team code</button>' +
      '<button type="button" role="tab" aria-selected="' + (S.loginMode === 'code') + '" data-act="signinmode" data-m="code">I have a personal code</button></div>';
    var form = S.loginMode === 'code'
      ? '<form id="login" autocomplete="off"><p class="hint">Enter the personal code your host gave you.</p>' +
        '<div><label for="lc">Your code</label><input type="text" class="code" id="lc" maxlength="12" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABC123"></div>' +
        '<button class="btn" type="submit">Sign in</button><p class="formerr" id="lerr" role="alert">' + esc(S.loginErr || '') + '</p></form>'
      : '<form id="join" autocomplete="off"><p class="hint">Enter your team\'s code and your name. Your host has the code for the room you are in. This library stays open after game night, so a 4-digit PIN keeps your score yours when you come back to add more.</p>' +
        '<div><label for="tc">Team code</label><input type="text" class="code" id="tc" maxlength="12" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABC123"></div>' +
        '<div><label for="jn">Your name</label><input type="text" id="jn" maxlength="60" autocomplete="off" placeholder="First and last name"></div>' +
        '<div><label for="jp">4-digit PIN</label><input type="text" inputmode="numeric" class="code" id="jp" maxlength="6" autocomplete="off" placeholder="1234"></div>' +
        '<button class="btn" type="submit">Join</button><p class="hint">New here: pick any 4-digit PIN. Coming back: enter the same PIN you used before.</p><p class="formerr" id="jerr" role="alert">' + esc(S.loginErr || '') + '</p></form>';
    el.innerHTML = '<div class="card signin"><div><p class="eyebrow">Agents and team leaders</p><h2>Sign in</h2></div>' + tabs + form + '</div>';
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
  if(S.pool){ /* inside a pool the grid shows what's left; no global continue button */ }
  else if(next && row.done){ h += '<p style="margin-bottom:18px"><button class="btn ghost" type="button" data-act="open" data-id="' + esc(next.id) + '">Continue &middot; Puzzle ' + next.n + ': ' + esc(next.title) + ' &rarr;</button></p>'; }
  else if(next){ /* first visit: the Game Night card below is the starting point */ }
  else if(puzzles.every(function(p){ return row.per[p.id] !== undefined; })){ h += '<p class="notice" style="margin-bottom:16px">You have answered every puzzle. Check the leaderboard for the standings.</p>'; }
  else { h += '<p class="notice" style="margin-bottom:16px">You are caught up. More puzzles open when your host releases them.</p>'; }
  function puzzleGrid(list, extra){
    return '<div class="grid">' + list.map(function(p){
      var done = row.per[p.id] !== undefined;
      var stt = done ? '<span class="chip done">Done: ' + row.per[p.id] + ' of ' + p.max + '</span>' : (p.open ? '<span class="chip open">Open</span>' : '<span class="chip">Not open yet</span>');
      return '<button type="button" class="pcard" data-act="open" data-id="' + esc(p.id) + '"' + (!done && !p.open ? ' disabled' : '') + '>' +
        '<span class="n">Puzzle ' + p.n + ' &middot; ' + esc(p.cat) + '</span><h3>' + esc(p.title) + '</h3>' +
        '<span class="chips"><span class="chip">' + FMT[p.format] + '</span>' + stt + '</span></button>';
    }).join('') + (extra || '') + '</div>';
  }
  var pools = poolsList(), pool = S.pool ? poolById(S.pool) : null;
  if(!pool){
    var gnPool = pools.find(function(pl){ return pl.id === 'gamenight'; });
    var otherPools = pools.filter(function(pl){ return pl.id !== 'gamenight'; });
    if(gnPool){
      var gnDoneN = gnPool.items.filter(function(p){ return row.per[p.id] !== undefined; }).length;
      var gnOpenN = gnPool.items.filter(function(p){ return p.open; }).length;
      h += '<button type="button" class="gnfeatured" data-act="poolopen" data-id="gamenight">' +
        '<span class="eyebrow">' + (gnDoneN === 0 ? 'New here? Start with' : gnDoneN < gnPool.items.length ? 'In progress &middot; ' + gnDoneN + ' of ' + gnPool.items.length + ' done' : 'Completed &middot; all ' + gnPool.items.length + ' done') + '</span>' +
        '<h2>Paragon Game Night</h2>' +
        '<p>' + gnPool.items.length + ' puzzles picked to put a good range of skills to the test &mdash; a fun sneak peek to get familiar with the tool before you dig into the full library.</p>' +
        '<span class="chips"><span class="chip open">' + gnOpenN + ' open</span>' + (gnDoneN ? '<span class="chip done">' + gnDoneN + ' done</span>' : '') + '</span>' +
        '<span class="cta">' + (gnDoneN === 0 ? 'Play Game Night' : gnDoneN < gnPool.items.length ? 'Continue Game Night' : 'Review your answers') + ' &rarr;</span></button>';
    }
    h += '<h2 class="colhead" style="margin-top:4px">Full training library</h2>' +
      '<p class="hint" style="margin:-8px 0 12px">Every other puzzle, organized by pool. Come back anytime you like to keep practicing and add to your all-time score.</p>' +
      '<div class="grid">' + otherPools.map(function(pl){
        var doneN = pl.items.filter(function(p){ return row.per[p.id] !== undefined; }).length;
        var openN = pl.items.filter(function(p){ return p.open; }).length;
        return '<button type="button" class="pcard poolcard" data-act="poolopen" data-id="' + esc(pl.id) + '">' +
          '<span class="n">' + pl.items.length + ' puzzle' + (pl.items.length === 1 ? '' : 's') + '</span><h3>' + esc(pl.label) + '</h3>' +
          '<span class="chips"><span class="chip open">' + openN + ' open</span>' + (doneN ? '<span class="chip done">' + doneN + ' done</span>' : '') + '</span></button>';
      }).join('') + '</div>';
  } else {
    h += '<p style="margin:4px 0 16px"><button type="button" class="link" data-act="poolback">&larr; All pools</button></p>' +
      '<h2 class="colhead" style="margin-top:0">' + esc(pool.label) + '</h2>' +
      puzzleGrid(pool.items, pool.id === 'gamenight' ? bonusTileHTML(pool, row) : '');
  }
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
  if(!S.cur){ el.innerHTML = '<button type="button" class="link" data-act="back">&larr; ' + backLabel() + '</button><p class="skeleton">Loading puzzle...</p>'; return; }
  var p = S.cur.puzzle, res = S.cur.result;
  var h = '<button type="button" class="link" data-act="back">&larr; ' + backLabel() + '</button>' +
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
  var pool = S.pool ? poolById(S.pool) : null;
  return (pool ? pool.items : S.board.puzzles).find(function(q){ return q.open && q.id !== afterId && row.per[q.id] === undefined; });
}
function backLabel(){ var pool = S.pool && S.board ? poolById(S.pool) : null; return pool ? esc(pool.label) : 'All puzzles'; }
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
  var nxt = nextOpen(p.id), curPool = S.pool ? poolById(S.pool) : null, gnDone = false, bonusPool = poolById('bonus');
  if(!nxt && curPool && curPool.id === 'gamenight'){
    var myRow = S.board.agents.find(function(x){ return x.id === S.me.id; }) || {per:{}};
    gnDone = gnProgress(curPool, myRow, p.id).complete;
    if(gnDone){
      h += '<div class="wrapup"><p class="eyebrow">Game Night complete</p><h3>That&rsquo;s all ' + curPool.items.length + ' Paragon Game Night puzzles.</h3>' +
        '<p>Your Game Night score is locked in. Want more? ' + (bonusPool ? bonusPool.items.length + ' Bonus Puzzles are ready, and they count' : 'The rest of the library is open, and it counts') + ' toward your all-time score.</p></div>';
    }
  }
  h += '<div class="after">' + (nxt ? '<button type="button" class="btn" data-act="open" data-id="' + esc(nxt.id) + '">Next: ' + esc(nxt.title) + '</button>' : '') +
    (gnDone && bonusPool ? '<button type="button" class="btn" data-act="poolopen" data-id="bonus">Play Bonus Puzzles &rarr;</button>' :
      (!nxt && curPool ? '<button type="button" class="btn" data-act="poolback">Explore the full library</button>' : '')) +
    '<button type="button" class="btn ghost" data-act="back">' + (curPool ? 'Back to ' : '') + backLabel() + '</button><button type="button" class="btn ghost" data-act="view" data-v="board">See the leaderboard</button></div>';
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
  return Promise.all([
    api('GET', '/api/admin/agents').then(function(r){ S.host.agents = r.agents; }),
    api('GET', '/api/admin/teams').then(function(r){ S.host.teams = r.teams; })
  ]).catch(function(e){ if(e.status === 401){ S.admin = false; renderHeader(); } });
}
function renderHost(){
  var el = $('#v-host');
  if(!S.admin){
    if(el.dataset.mode === 'login'){ return; }
    el.dataset.mode = 'login';
    el.innerHTML = '<form class="card signin" id="hostlogin" autocomplete="off"><div><p class="eyebrow">Host</p><h2>Host sign-in</h2></div>' +
      '<div><label for="hp">Host password</label><input type="password" id="hp" autocomplete="current-password"></div>' +
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

  h += '<div class="card"><h2>Big-screen display</h2><p class="hint">A large, auto-updating standings screen for a projector or TV in the room. Nobody needs to sign in to view it.</p>' +
    '<div><a class="btn ghost" href="' + esc((API || '') + '/tv.html') + '" target="_blank" rel="noopener">Open big-screen display</a></div></div>';

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

  var hteams = (S.host.teams || b.teams).slice().sort(function(x, y){ return x.order - y.order; });
  h += '<div class="card"><h2>Teams (' + hteams.length + (hteams.length > 8 ? ' &middot; only the first 8 get their own color' : '') + ')</h2>' +
    '<p class="hint">Each team has its own join code. Agents can enter it with their name to join, without needing a personal code from you first (see Sign in on the Play tab).</p>' +
    hteams.map(function(t){
      var n = S.host.agents ? S.host.agents.filter(function(a){ return a.teamId === t.id; }).length : 0;
      var conf = S.host.confirm === 'delteam:' + t.id;
      return '<div class="tedit"><span class="sw" style="--c:' + teamColor(t) + '"></span>' +
        '<div><label for="tn-' + t.id + '">Team name</label><input type="text" id="tn-' + t.id + '" value="' + esc(t.name) + '" maxlength="40"></div>' +
        '<div><label for="tl-' + t.id + '">Leader</label><input type="text" id="tl-' + t.id + '" value="' + esc(t.leader || '') + '" maxlength="40"></div>' +
        '<div><label>Team code</label><b class="codecell">' + esc(t.joinCode || '&hellip;') + '</b></div>' +
        '<div class="acts"><button type="button" class="btn ghost" data-act="saveteam" data-id="' + esc(t.id) + '">Save</button> ' +
        '<button type="button" class="btn ghost small" data-act="newteamcode" data-id="' + esc(t.id) + '">New code</button> ' +
        (n ? '<span class="hint">' + n + ' agent' + (n === 1 ? '' : 's') + '</span>'
            : (hteams.length <= 1 ? '' : (conf ? '<button type="button" class="btn small" data-act="delteam2" data-id="' + esc(t.id) + '">Remove for good?</button>' : '<button type="button" class="btn ghost small" data-act="delteam1" data-id="' + esc(t.id) + '">Remove team</button>'))) +
        '</div><p class="stat" id="hs-' + t.id + '" role="status"></p></div>';
    }).join('') +
    '<div class="tedit"><span class="sw" style="--c:var(--muted);opacity:.4"></span>' +
      '<div><label for="antn">New team name</label><input type="text" id="antn" maxlength="40" placeholder="e.g. Purple Team"></div>' +
      '<div><label for="antl">Leader</label><input type="text" id="antl" maxlength="40" placeholder="Optional"></div>' +
      '<div></div><button type="button" class="btn" data-act="addteam">Add team</button></div>' +
    (S.host.addedTeam ? '<p class="notice" style="margin-top:8px">Added ' + esc(S.host.addedTeam.name) + '. Team code: <b class="codecell">' + esc(S.host.addedTeam.joinCode) + '</b></p>' : '') +
  '</div>';

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
  else if(act === 'boardscope'){ S.boardScope = b.dataset.s; S.openTeam = null; renderBoard(); }
  else if(act === 'poolopen'){ S.pool = b.dataset.id; S.openId = null; S.cur = null; S.notice = null; renderPlay(); mount.scrollIntoView({block:'start'}); }
  else if(act === 'poolback'){ S.pool = null; S.openId = null; S.cur = null; S.notice = null; renderPlay(); mount.scrollIntoView({block:'start'}); }
  else if(act === 'signinmode'){ S.loginMode = b.dataset.m; S.loginErr = ''; renderPlay(); }
  else if(act === 'team'){ S.openTeam = S.openTeam === b.dataset.id ? null : b.dataset.id; renderBoard(); }
  else if(act === 'showall'){ S.showAll = true; renderBoard(); }
  else if(act === 'jumpagents'){ var jt = $('#ct-allagents'); if(jt){ jt.scrollIntoView({behavior:'smooth', block:'start'}); } }
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
  else if(act === 'signout'){ api('POST', '/api/logout').catch(function(){}).then(function(){ setToken(null); S.me = null; S.admin = false; S.openId = null; S.cur = null; S.pool = null; S.host.agents = null; S.host.teams = null; if(S.view === 'host'){ S.view = 'board'; } $('#v-play').dataset.mode = ''; $('#v-host').dataset.mode = ''; syncViews(); }); }
  else if(act === 'hostout'){ api('POST', '/api/logout').catch(function(){}).then(function(){ setToken(null); S.admin = false; S.me = null; S.pool = null; S.host.agents = null; S.host.teams = null; S.view = 'board'; $('#v-host').dataset.mode = ''; $('#v-play').dataset.mode = ''; syncViews(); }); }
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
  else if(act === 'newteamcode'){
    api('PATCH', '/api/admin/teams/' + encodeURIComponent(b.dataset.id), {newJoinCode:true}).then(function(){ return hostDone('New team code created. The old one no longer works.'); }).catch(fail);
  }
  else if(act === 'addteam'){
    var antn = $('#antn'), antl = $('#antl');
    api('POST', '/api/admin/teams', {name:antn.value, leader:antl.value}).then(function(r){
      S.host.addedTeam = r.team; S.host.teams = null;
      return hostDone(r.team.name + ' added.');
    }).catch(fail);
  }
  else if(act === 'delteam1'){ S.host.confirm = 'delteam:' + b.dataset.id; renderHost(); }
  else if(act === 'delteam2'){
    api('DELETE', '/api/admin/teams/' + encodeURIComponent(b.dataset.id)).then(function(){ S.host.teams = null; return hostDone('Team removed.'); }).catch(fail);
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
  if(e.target.id === 'join'){
    e.preventDefault();
    var tc = $('#tc').value, jn = $('#jn').value, jp = $('#jp').value, jerr = $('#jerr');
    if(!tc.trim()){ jerr.textContent = 'Enter your team code.'; return; }
    if(!jn.trim()){ jerr.textContent = 'Enter your name.'; return; }
    api('POST', '/api/join', {teamCode:tc, name:jn, pin:jp}).then(function(r){ setToken(r.token); S.me = r.agent; S.loginErr = ''; S.openId = null; S.pool = null; $('#v-play').dataset.mode = ''; renderHeader(); renderPlay(); })
      .catch(function(er){ jerr.textContent = er.message; });
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
