# Contributing to SkyLens

Thanks for helping! 

## Setup
1. Fork + clone.
2. `npm i -g wrangler`, then `cp wrangler.toml.example wrangler.toml` and fill in your own D1 id + tracked actors.
3. `wrangler dev` to run locally.

## PR flow
- Keep changes focused; describe what and why.
- Never commit real secrets, D1 ids, or private handles — use the `.example` files.
- Run the app against your OWN Bluesky handle before opening a PR.

## Ground rules
- Public data only. No scraping of private/authenticated endpoints.
- Timestamps are UTC end-to-end.
