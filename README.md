# Closing Table

A puzzle league for a final expense sales team. Every agent signs in with their own personal code (no accounts, no email), plays the same set of puzzles, and is scored automatically. A live leaderboard shows the standings for the 6 teams and for every individual agent.

- Teams are ranked by average points per agent (counting every agent on the roster), so teams of different sizes compare fairly.
- Answers lock when submitted. Scoring happens on the server, so agents cannot see correct answers or scores before they answer, and cannot change a score.
- No dependencies. Needs Node 18 or newer.

## Put it on your own website

The game can live on a page of your own site. It still needs the Closing Table server running somewhere (see Hosting), because that is where the scores are kept and shared between agents. Your website page only shows the game.

**Option 1, two lines (recommended).** Paste this where you want the game to appear, using the address of your server:

    <div id="closing-table"></div>
    <script src="https://YOUR-SERVER-ADDRESS/embed.js"></script>

**Option 2, one pasteable block.** Open `paste-into-site.html`, change `YOUR-SERVER-ADDRESS-HERE` to your server's address, and paste the entire file into an HTML or custom-code block on your page. Use this if your site will not load scripts from other addresses.

Notes:
- The game draws inside its own sealed container, so your site's fonts and colors will not break it (and it will not change your site).
- Some website builders (for example the basic Wix, Squarespace and WordPress.com plans) block scripts in HTML blocks. If yours does, link to the server address directly or use an iframe: `<iframe src="https://YOUR-SERVER-ADDRESS/" style="width:100%;height:1400px;border:0"></iframe>`
- To allow only your site to talk to the server, set `ALLOWED_ORIGIN` to your site's address, for example `https://www.youragency.com`.
- If you edit anything in `src/`, run `node build.js` to rebuild.

## Run it

    node server.js

Open http://localhost:3000. Sign in with the host link at the bottom of the page.

## Settings (environment variables)

| Name | What it does |
| --- | --- |
| `PORT` | Port to listen on. Most hosts set this for you. Default 3000. |
| `DATA_DIR` | Folder where scores are saved (`db.json`). **Point this at a persistent disk**, or scores are lost when the host restarts. Default `./data`. |
| `ADMIN_PASSWORD` | Host password. If not set, one is generated on first start and printed in the server log. Set your own. |
| `SESSION_SECRET` | Optional. Secret used to sign login cookies. Generated and saved if not set. |
| `ALLOWED_ORIGIN` | Optional. Your website's address (for example `https://www.youragency.com`) to allow only that site to use the game. Default allows any site. |
| `COOKIE_SECURE` | Set to `1` if you serve over HTTPS without a proxy that sends `X-Forwarded-Proto`. |

## Hosting

The app needs a host that keeps one small folder of files between restarts. Options that work:

- **Render** (Web Service, plus a Disk mounted at `/data`, set `DATA_DIR=/data`). Build command: none. Start command: `node server.js`.
- **Railway** (add a Volume mounted at `/data`, set `DATA_DIR=/data`).
- **Fly.io** (use the Dockerfile and a volume mounted at `/data`).
- Any small VPS: `node server.js` behind a reverse proxy, run with pm2 or systemd.
- **Docker**: `docker build -t closing-table .` then `docker run -p 3000:3000 -v ct-data:/data -e ADMIN_PASSWORD=choose-one closing-table`.

Free tiers with no persistent disk will lose all scores on restart. Run one instance only.

## Setting up a game

1. Sign in as host (link at the bottom of the page).
2. Under Teams, rename the 6 teams and enter each leader's name.
3. Under Add agents, paste one agent per line. Add `, Team Name` to put a line on a different team. Each agent gets a personal code. Use Copy all codes to share them.
4. Under Puzzle release, open everything at once, or open one skill at a time (Objections, Replacement, and so on).

Host tools: change an agent's team, issue a new code (the old one stops working), clear one agent's scores, remove an agent, clear all scores, download all scores as CSV.

## Editing puzzles

Puzzles live in `puzzles.json`. Restart the server after editing. Formats: `choice`, `multi` (select all), `order`, `text` (keyword rubric) and `angle` (pick the best logical reasons, emotional reasons and objection response). In every puzzle the best answer is worth 100 points. Answer options are shown in the order they appear in the file, so keep the best answer out of a predictable position.

## Compliance note

The replacement puzzles teach general good practice (comparing policies side by side, having the new policy approved before surrendering the old one, checking cash value and tax basis, new contestability and waiting periods, and recommending the client keep the old policy when that is better). Replacement, disclosure and tax rules differ by state and carrier. Have your compliance contact review the puzzle content before you use it in training.
