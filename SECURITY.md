# Security Policy

## Reporting a vulnerability
Please **do not** open a public issue for security problems.
Instead, open a private security advisory via GitHub's "Report a vulnerability" (Security tab), or contact the maintainer privately.

We aim to acknowledge reports within a few days.

## Scope
SkyLens reads only public AT Protocol data. It stores no credentials in the repo; all secrets are set via `wrangler secret put`. If you find a committed secret, report it privately and we will rotate it immediately.
