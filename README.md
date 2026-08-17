# SkyLens 🛰️

**An open-source engagement-analytics observatory for Bluesky / the AT Protocol.**
Timing heatmaps, a golden-hour finder, thread-shape analysis, and fan-loyalty signals — served from a single Cloudflare Worker.

![license](https://img.shields.io/badge/license-MIT-blue) ![runtime](https://img.shields.io/badge/runtime-Cloudflare%20Workers-orange) ![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## What it does
SkyLens ingests the public post history of the Bluesky actors you track and turns it into decisions:

- **Golden Hour** — the day-of-week + hour when your posts historically earn the most engagement.
- **Timing heatmap** — a 7×24 grid of average engagement, filterable by topic.
- **Thread shapes** — which posting patterns (single vs thread, spacing) actually performed.
- **Fan loyalty** — who engages repeatedly, and how your reach concentrates.
- **Schedule advice API** — an endpoint your automations can call to pick the best slot.

It reads only **public** AT Protocol data via the public AppView. No login, no private data.

## Architecture (one worker)
- **Cron ingest** — tiered HOT/WARM/COLD backfill of tracked actors into D1.
- **Read API** — `/api/overview`, `/api/goldenhour`, `/api/timing`, `/api/threads`, `/api/topics`, plus `/api/optimal-schedule` and `/api/advise-schedule` for automations.
- **Static SPA** — a self-contained React dashboard (charts via ECharts) served from the worker.

## Quickstart
```bash
npm i -g wrangler
git clone https://github.com/<you>/skylens && cd skylens
cp wrangler.toml.example wrangler.toml      # fill in your D1 id + tracked actors
wrangler d1 create skylens-db               # paste the id into wrangler.toml
wrangler secret put INGEST_KEY              # protects the manual backfill trigger
# optional: wrangler secret put TELEGRAM_BOT_TOKEN ; wrangler secret put TELEGRAM_CHAT_ID
wrangler deploy
```
Then open your worker URL. The cron will begin backfilling the actors in `TRACKED_ACTORS`; the dashboard fills in as data lands.

## Configuration
| Var / Secret | What it is |
|---|---|
| `TRACKED_ACTORS` | comma-separated Bluesky handles to ingest |
| `FEATURED_ACTOR` | default handle shown on the dashboard |
| `INGEST_KEY` | secret token guarding the manual backfill trigger |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | *(optional)* daily digest + alerts |

## The schedule-advice API
`GET /api/advise-schedule?actor=<handle>&topic=<optional>` returns the measured best day/hour and drip spacing for that actor (and topic), with a sample size so you can gate on confidence. Great for wiring an autonomous poster to fire in the golden window.

## Honest caveats
- Engagement is **measured**, not predicted — thin samples (low `sample_n`) are advisory only.
- All timestamps in the API are **UTC**; convert to your local zone when scheduling.
- It only sees public data; private or blocked accounts won't ingest.

## License
MIT — see [LICENSE](LICENSE). Contributions welcome; see [CONTRIBUTING](CONTRIBUTING.md) and please report security issues privately per [SECURITY.md](SECURITY.md).
