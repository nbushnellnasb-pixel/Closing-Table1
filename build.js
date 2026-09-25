'use strict';
/* Assembles the app from src/ into:
 *   public/embed.js           the whole game as one script (what the server hosts)
 *   public/index.html         the game as a full page
 *   paste-into-site.html      one block to paste into any website's HTML
 * Run:  node build.js   (only needed if you edit files in src/) */
const fs = require('fs');
const css = fs.readFileSync('src/widget.css', 'utf8');
const markup = fs.readFileSync('src/markup.html', 'utf8');
let js = fs.readFileSync('src/widget.js', 'utf8');
js = js.replace('__CSS__', () => JSON.stringify(css)).replace('__MARKUP__', () => JSON.stringify(markup));
js = js.replace(/<\/script/gi, '<\\/script');
fs.writeFileSync('public/embed.js', js);
fs.writeFileSync('public/index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Closing Table</title>
<style>html,body{margin:0;background:#f1f4f7}@media (prefers-color-scheme:dark){html,body{background:#0d141c}}</style>
</head>
<body>
<div id="closing-table"></div>
<script src="/embed.js"></script>
</body>
</html>
`);
fs.writeFileSync('paste-into-site.html', `<!-- Closing Table: paste this whole block into the HTML of any page on your site. -->
<!-- Step 1: change the address below to where you host the Closing Table server. -->
<div id="closing-table"></div>
<script>window.CLOSING_TABLE_API = "https://YOUR-SERVER-ADDRESS-HERE";</script>
<script>
${js}
</script>
`);
console.log('built', fs.statSync('public/embed.js').size, 'bytes');
