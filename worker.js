/**
 * SkyLens — Bluesky Engagement Analytics Worker (v1)
 * One worker: cron ingest (tiered HOT/WARM/COLD) + read API + static SPA.
 * Domain: skylens.example.com | DB: skylens-db
 *
 * Bindings (wrangler.toml):
 *   [[d1_databases]] binding = "DB"  database_name = "skylens-db"  database_id = "<your-d1-database-id>"
 * Vars: TRACKED_ACTORS = "you.bsky.social,friend.bsky.social"
 *       FEATURED_ACTOR = "you.bsky.social"
 * Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SKYLENS_LNURLP_TARGET (Lightning proxy, optional)
 */

const APPVIEW = "https://public.api.bsky.app/xrpc";
const SPA_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuIiBjbGFzcz0iZGFyayI+CjxoZWFkPgo8bWV0YSBjaGFyc2V0PSJVVEYtOCIvPgo8bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEsIG1heGltdW0tc2NhbGU9MSIvPgo8dGl0bGU+U2t5TGVucyDigJQgQmx1ZXNreSBFbmdhZ2VtZW50IE9ic2VydmF0b3J5PC90aXRsZT4KPG1ldGEgbmFtZT0iZGVzY3JpcHRpb24iIGNvbnRlbnQ9IlNreUxlbnM6IGFuIG9wZW4tc291cmNlIGVuZ2FnZW1lbnQgYW5hbHl0aWNzIG9ic2VydmF0b3J5IGZvciBCbHVlc2t5IC8gQVQgUHJvdG9jb2wuIFRpbWluZyBoZWF0bWFwcywgZ29sZGVuLWhvdXIgZmluZGVyLCB0aHJlYWQgc2hhcGVzLCBmYW4gbG95YWx0eS4iLz4KPGxpbmsgcmVsPSJpY29uIiBocmVmPSJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgdmlld0JveD0nMCAwIDMyIDMyJyUzRSUzQ3RleHQgeT0nMjYnIGZvbnQtc2l6ZT0nMjYnJTNF8J+bsO+4jyUzQy90ZXh0JTNFJTNDL3N2ZyUzRSIvPgo8c2NyaXB0IHNyYz0iaHR0cHM6Ly91bnBrZy5jb20vcmVhY3RAMTgvdW1kL3JlYWN0LnByb2R1Y3Rpb24ubWluLmpzIj48L3NjcmlwdD4KPHNjcmlwdCBzcmM9Imh0dHBzOi8vdW5wa2cuY29tL3JlYWN0LWRvbUAxOC91bWQvcmVhY3QtZG9tLnByb2R1Y3Rpb24ubWluLmpzIj48L3NjcmlwdD4KPHNjcmlwdCBzcmM9Imh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vZWNoYXJ0c0A1LjUuMC9kaXN0L2VjaGFydHMubWluLmpzIj48L3NjcmlwdD4KPHNjcmlwdCBzcmM9Imh0dHBzOi8vY2RuLnRhaWx3aW5kY3NzLmNvbSI+PC9zY3JpcHQ+CjxzY3JpcHQ+CnRhaWx3aW5kLmNvbmZpZyA9IHsgZGFya01vZGU6J2NsYXNzJywgdGhlbWU6eyBleHRlbmQ6eyBjb2xvcnM6ewogIGluazonIzA3MGIxNCcsIHBhbmVsOicjMGUxNjI2JywgcGFuZWwyOicjMTUyMDNhJywgbGluZTonIzFlMmM0NycsCiAgY3lhbjonIzIyZDNlZScsIGFtYmVyOicjZmJiZjI0JywgbXV0ZTonIzhhYTBjNicsIHNvZnQ6JyNjOGQ2ZjAnIH0gfSB9IH07Cjwvc2NyaXB0Pgo8c3R5bGU+CiAgaHRtbCxib2R5e2JhY2tncm91bmQ6IzA3MGIxNDtjb2xvcjojYzhkNmYwOy13ZWJraXQtZm9udC1zbW9vdGhpbmc6YW50aWFsaWFzZWR9CiAgKntmb250LWZhbWlseTp1aS1zYW5zLXNlcmlmLHN5c3RlbS11aSwtYXBwbGUtc3lzdGVtLCJTZWdvZSBVSSIsUm9ib3RvLEludGVyLHNhbnMtc2VyaWZ9CiAgOjotd2Via2l0LXNjcm9sbGJhcnt3aWR0aDo3cHg7aGVpZ2h0OjdweH06Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1ie2JhY2tncm91bmQ6IzFlMmM0Nztib3JkZXItcmFkaXVzOjlweH0KICAuZmFkZXthbmltYXRpb246ZiAuMzVzIGVhc2V9QGtleWZyYW1lcyBme2Zyb217b3BhY2l0eTowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKDZweCl9dG97b3BhY2l0eToxO3RyYW5zZm9ybTpub25lfX0KICAudGFiYnRue3RyYW5zaXRpb246YWxsIC4xOHN9CiAgLmNhcmR7YmFja2dyb3VuZDpsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCMwZTE2MjYsIzBjMTMyMCk7Ym9yZGVyOjFweCBzb2xpZCAjMWUyYzQ3O2JvcmRlci1yYWRpdXM6MTZweH0KICAuZ2xvd3tib3gtc2hhZG93OjAgMCAwIDFweCAjMjJkM2VlMzMsMCA4cHggMzBweCAtMTJweCAjMjJkM2VlNTV9Cjwvc3R5bGU+CjwvaGVhZD4KPGJvZHk+CjxkaXYgaWQ9InJvb3QiPjwvZGl2Pgo8c2NyaXB0IHR5cGU9InRleHQvYmFiZWwtc3RhbmRhbG9uZSIgZGF0YS1wcmVzZXRzPSIiPi8qIHBsYWNlaG9sZGVyICovPC9zY3JpcHQ+CjxzY3JpcHQ+CmNvbnN0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VNZW1vLCBjcmVhdGVFbGVtZW50OiBoIH0gPSBSZWFjdDsKY29uc3QgQVBJID0gIi9hcGkiOwpjb25zdCBET1cgPSBbIlN1biIsIk1vbiIsIlR1ZSIsIldlZCIsIlRodSIsIkZyaSIsIlNhdCJdOwpjb25zdCBmbXQgPSAobik9PiBuPT1udWxsPyLigJQiIDogbj49MWU2PyhuLzFlNikudG9GaXhlZCgxKSsiTSIgOiBuPj0xZTM/KG4vMWUzKS50b0ZpeGVkKDEpKyJLIiA6ICgiIituKTsKY29uc3QgaiA9ICh1KT0+IGZldGNoKEFQSSt1KS50aGVuKHI9PnIuanNvbigpKS5jYXRjaCgoKT0+bnVsbCk7CgpmdW5jdGlvbiB1c2VRdWVyeSh1LCBkZXApeyBjb25zdCBbZCxzZXREXT11c2VTdGF0ZShudWxsKSxbbCxzZXRMXT11c2VTdGF0ZSh0cnVlKTsKICB1c2VFZmZlY3QoKCk9PnsgbGV0IG9uPXRydWU7IHNldEwodHJ1ZSk7IGlmKCF1KXtzZXREKG51bGwpO3NldEwoZmFsc2UpO3JldHVybjt9CiAgICBqKHUpLnRoZW4oeD0+eyBpZihvbil7c2V0RCh4KTtzZXRMKGZhbHNlKTt9IH0pOyByZXR1cm4gKCk9Pm9uPWZhbHNlOyB9LCBkZXB8fFt1XSk7CiAgcmV0dXJuIFtkLGxdOyB9CgovLyAtLS0tIHNoYXJlZCBiaXRzIC0tLS0KZnVuY3Rpb24gU3RhdCh7bGFiZWwsdmFsLGFjY2VudH0peyByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJjYXJkIHAtMyBmbGV4LTEgbWluLXctWzg4cHhdIn0sCiAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LVsxMXB4XSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSB0ZXh0LW11dGUifSxsYWJlbCksCiAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LXhsIGZvbnQtYm9sZCBtdC0wLjUiLHN0eWxlOntjb2xvcjphY2NlbnR8fCIjYzhkNmYwIn19LCB2YWwpKTsgfQoKZnVuY3Rpb24gU3Bpbm5lcigpeyByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJmbGV4IGp1c3RpZnktY2VudGVyIHB5LTEwIn0sCiAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ3LTYgaC02IHJvdW5kZWQtZnVsbCBib3JkZXItMiBib3JkZXItbGluZSBib3JkZXItdC1jeWFuIGFuaW1hdGUtc3BpbiJ9KSk7IH0KCmZ1bmN0aW9uIENoYXJ0KHtvcHRpb24saGVpZ2h0fSl7IGNvbnN0IHJlZj11c2VSZWYoKTsKICB1c2VFZmZlY3QoKCk9PnsgaWYoIXJlZi5jdXJyZW50fHwhb3B0aW9uKXJldHVybjsgY29uc3QgYz1lY2hhcnRzLmluaXQocmVmLmN1cnJlbnQsbnVsbCx7cmVuZGVyZXI6ImNhbnZhcyJ9KTsKICAgIGMuc2V0T3B0aW9uKG9wdGlvbik7IGNvbnN0IHJzPSgpPT5jLnJlc2l6ZSgpOyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicmVzaXplIixycyk7CiAgICByZXR1cm4gKCk9Pnsgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoInJlc2l6ZSIscnMpOyBjLmRpc3Bvc2UoKTsgfTsgfSxbSlNPTi5zdHJpbmdpZnkob3B0aW9uKV0pOwogIHJldHVybiBoKCJkaXYiLHtyZWYsc3R5bGU6e3dpZHRoOiIxMDAlIixoZWlnaHQ6KGhlaWdodHx8MjgwKSsicHgifX0pOyB9CgovLyAtLS0tIERhc2hib2FyZCAtLS0tCmZ1bmN0aW9uIERhc2hib2FyZCh7YWN0b3J9KXsKICBjb25zdCBbb3YsbF09dXNlUXVlcnkoYWN0b3I/YC9vdmVydmlldz9hY3Rvcj0ke2FjdG9yfWA6bnVsbCxbYWN0b3JdKTsKICBjb25zdCBbZ2hdPXVzZVF1ZXJ5KGFjdG9yP2AvZ29sZGVuaG91cj9hY3Rvcj0ke2FjdG9yfWA6bnVsbCxbYWN0b3JdKTsKICBjb25zdCBbdGhdPXVzZVF1ZXJ5KGFjdG9yP2AvdGhyZWFkcz9hY3Rvcj0ke2FjdG9yfWA6bnVsbCxbYWN0b3JdKTsKICBpZihsfHwhb3YpIHJldHVybiBoKFNwaW5uZXIpOwogIGlmKG92LmVycm9yKSByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LW11dGUgcC02In0sIk5vIGRhdGEgZm9yIHRoaXMgYWN0b3IuIik7CiAgY29uc3QgYT1vdi5hY3Rvcnx8e307CiAgY29uc3QgZ2hUeHQgPSBnaCYmIWdoLm5vdGUgPyBgJHtET1dbZ2guZG93XX0gJHtTdHJpbmcoZ2guaG91cikucGFkU3RhcnQoMiwiMCIpfTowMCBVVENgIDogIuKAlCI7CiAgcmV0dXJuIGgoImRpdiIse2NsYXNzTmFtZToiZmFkZSBzcGFjZS15LTQifSwKICAgIGgoImRpdiIse2NsYXNzTmFtZToiY2FyZCBnbG93IHAtNCJ9LAogICAgICBoKCJkaXYiLHtjbGFzc05hbWU6InRleHQtWzExcHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlIHRleHQtY3lhbiJ9LCLirZAgR29sZGVuIEhvdXIiKSwKICAgICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LTJ4bCBmb250LWV4dHJhYm9sZCBtdC0xIn0sIGdoVHh0KSwKICAgICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LXNtIHRleHQtbXV0ZSBtdC0xIn0sIGdoJiYhZ2gubm90ZT9gYXZnICR7Zm10KE1hdGgucm91bmQoZ2guYXZnX2VuZykpfSBlbmdhZ2VtZW50IMK3ICR7Z2gubn0gcG9zdHMgaW4gdGhpcyBzbG90YDoiR2F0aGVyaW5nIGRhdGEiKSksCiAgICBoKCJkaXYiLHtjbGFzc05hbWU6ImZsZXggZmxleC13cmFwIGdhcC0yIn0sCiAgICAgIGgoU3RhdCx7bGFiZWw6IlBvc3RzIix2YWw6Zm10KG92LnBvc3RzKSxhY2NlbnQ6IiMyMmQzZWUifSksCiAgICAgIGgoU3RhdCx7bGFiZWw6Ikxpa2VzIix2YWw6Zm10KG92Lmxpa2VzKSxhY2NlbnQ6IiNmYmJmMjQifSksCiAgICAgIGgoU3RhdCx7bGFiZWw6IlJlcG9zdHMiLHZhbDpmbXQob3YucmVwb3N0cyl9KSwKICAgICAgaChTdGF0LHtsYWJlbDoiUmVwbGllcyIsdmFsOmZtdChvdi5yZXBsaWVzKX0pLAogICAgICBoKFN0YXQse2xhYmVsOiJUaHJlYWRzIix2YWw6Zm10KG92LnRocmVhZHMpfSksCiAgICAgIGgoU3RhdCx7bGFiZWw6IkZvbGxvd2VycyIsdmFsOmZtdChhLmZvbGxvd2VyX2NvdW50KX0pKSwKICAgIGgoImRpdiIse2NsYXNzTmFtZToiY2FyZCBwLTQifSwKICAgICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgbWItMiB0ZXh0LXNvZnQifSwi8J+UpSBUb3AgdGhyZWFkcyIpLAogICAgICAodGh8fFtdKS5zbGljZSgwLDUpLm1hcCgodCxpKT0+aCgiZGl2Iix7a2V5OmksY2xhc3NOYW1lOiJmbGV4IGp1c3RpZnktYmV0d2VlbiBnYXAtMyBweS0xLjUgYm9yZGVyLWIgYm9yZGVyLWxpbmUvNTAgdGV4dC1zbSJ9LAogICAgICAgIGgoInNwYW4iLHtjbGFzc05hbWU6InRydW5jYXRlIHRleHQtbXV0ZSJ9LCAodC5zcGFjaW5nX3BhdHRlcm58fCJzaW5nbGUiKSsiIMK3ICIrKHQucG9zdF9jb3VudHx8MSkrIiBwb3N0cyIpLAogICAgICAgIGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtYW1iZXIgZm9udC1zZW1pYm9sZCB3aGl0ZXNwYWNlLW5vd3JhcCJ9LCBmbXQoKHQudG90YWxfbGlrZXN8fDApKyh0LnRvdGFsX3JlcG9zdHN8fDApKSsiIGVuZyIpKSkpKTsKfQoKLy8gLS0tLSBIZWF0bWFwIC0tLS0KZnVuY3Rpb24gSGVhdG1hcCh7YWN0b3J9KXsKICBjb25zdCBbdG9waWNzXT11c2VRdWVyeShhY3Rvcj9gL3RvcGljcz9hY3Rvcj0ke2FjdG9yfWA6bnVsbCxbYWN0b3JdKTsKICBjb25zdCBbdG9waWMsc2V0VG9waWNdPXVzZVN0YXRlKCIiKTsKICBjb25zdCBbZGF0YSxsXT11c2VRdWVyeShhY3Rvcj9gL3RpbWluZz9hY3Rvcj0ke2FjdG9yfSR7dG9waWM/YCZ0b3BpYz0ke3RvcGljfWA6IiJ9YDpudWxsLFthY3Rvcix0b3BpY10pOwogIGNvbnN0IG9wdD11c2VNZW1vKCgpPT57IGlmKCFkYXRhfHwhZGF0YS5sZW5ndGgpcmV0dXJuIG51bGw7CiAgICBjb25zdCBwdHM9ZGF0YS5tYXAoZD0+W2QuaG91cixkLmRvdyxNYXRoLnJvdW5kKGQuYXZnX2VuZyldKTsKICAgIGNvbnN0IG1heD1NYXRoLm1heCguLi5wdHMubWFwKHA9PnBbMl0pLDEpOwogICAgcmV0dXJuIHsgdG9vbHRpcDp7cG9zaXRpb246InRvcCIsZm9ybWF0dGVyOnA9PmAke0RPV1twLnZhbHVlWzFdXX0gJHtwLnZhbHVlWzBdfTowMCBVVEM8YnIvPjxiPiR7Zm10KHAudmFsdWVbMl0pfTwvYj4gYXZnIGVuZ2B9LAogICAgICBncmlkOntsZWZ0OjM4LHJpZ2h0OjEwLHRvcDoxMCxib3R0b206NDZ9LAogICAgICB4QXhpczp7dHlwZToiY2F0ZWdvcnkiLGRhdGE6Wy4uLkFycmF5KDI0KS5rZXlzKCldLHNwbGl0QXJlYTp7c2hvdzp0cnVlfSxheGlzTGFiZWw6e2NvbG9yOiIjOGFhMGM2Iixmb250U2l6ZTo5LGludGVydmFsOjJ9LGF4aXNMaW5lOntsaW5lU3R5bGU6e2NvbG9yOiIjMWUyYzQ3In19fSwKICAgICAgeUF4aXM6e3R5cGU6ImNhdGVnb3J5IixkYXRhOkRPVyxzcGxpdEFyZWE6e3Nob3c6dHJ1ZX0sYXhpc0xhYmVsOntjb2xvcjoiIzhhYTBjNiIsZm9udFNpemU6MTB9LGF4aXNMaW5lOntsaW5lU3R5bGU6e2NvbG9yOiIjMWUyYzQ3In19fSwKICAgICAgdmlzdWFsTWFwOnttaW46MCxtYXgsY2FsY3VsYWJsZTpmYWxzZSxvcmllbnQ6Imhvcml6b250YWwiLGxlZnQ6ImNlbnRlciIsYm90dG9tOjYsaW5SYW5nZTp7Y29sb3I6WyIjMGUxNjI2IiwiIzE1NWU3NSIsIiMyMmQzZWUiLCIjZmJiZjI0Il19LHRleHRTdHlsZTp7Y29sb3I6IiM4YWEwYzYiLGZvbnRTaXplOjl9fSwKICAgICAgc2VyaWVzOlt7dHlwZToiaGVhdG1hcCIsZGF0YTpwdHMsZW1waGFzaXM6e2l0ZW1TdHlsZTp7Ym9yZGVyQ29sb3I6IiNmZmYiLGJvcmRlcldpZHRoOjF9fX1dIH07CiAgfSxbZGF0YV0pOwogIHJldHVybiBoKCJkaXYiLHtjbGFzc05hbWU6ImZhZGUgc3BhY2UteS0zIn0sCiAgICBoKCJkaXYiLHtjbGFzc05hbWU6ImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGZsZXgtd3JhcCJ9LAogICAgICBoKCJzcGFuIix7Y2xhc3NOYW1lOiJ0ZXh0LXNtIHRleHQtbXV0ZSJ9LCJUb3BpYzoiKSwKICAgICAgaCgic2VsZWN0Iix7dmFsdWU6dG9waWMsb25DaGFuZ2U6ZT0+c2V0VG9waWMoZS50YXJnZXQudmFsdWUpLGNsYXNzTmFtZToiYmctcGFuZWwyIGJvcmRlciBib3JkZXItbGluZSByb3VuZGVkLWxnIHB4LTIgcHktMSB0ZXh0LXNtIHRleHQtc29mdCJ9LAogICAgICAgIGgoIm9wdGlvbiIse3ZhbHVlOiIifSwiQWxsIiksCiAgICAgICAgKHRvcGljc3x8W10pLm1hcCh0PT5oKCJvcHRpb24iLHtrZXk6dC50b3BpYyx2YWx1ZTp0LnRvcGljfSxgJHt0LnRvcGljfSAoJHt0LnBvc3RzfSlgKSkpKSwKICAgIGgoImRpdiIse2NsYXNzTmFtZToiY2FyZCBwLTIifSwgbD9oKFNwaW5uZXIpOiBvcHQ/aChDaGFydCx7b3B0aW9uOm9wdCxoZWlnaHQ6MzAwfSk6aCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LW11dGUgdGV4dC1jZW50ZXIgcHktMTAgdGV4dC1zbSJ9LCJObyB0aW1pbmcgZGF0YSIpKSwKICAgIGgoImRpdiIse2NsYXNzTmFtZToidGV4dC1bMTFweF0gdGV4dC1tdXRlIHRleHQtY2VudGVyIn0sIkF2ZyBlbmdhZ2VtZW50IGJ5IGRheSDDlyBob3VyIChVVEMpLiBCcmlnaHRlciA9IGhvdHRlci4iKSk7Cn0KCi8vIC0tLS0gVG9waWNzIC0tLS0KZnVuY3Rpb24gVG9waWNzKHthY3Rvcn0pewogIGNvbnN0IFt0LGxdPXVzZVF1ZXJ5KGFjdG9yP2AvdG9waWNzP2FjdG9yPSR7YWN0b3J9YDpudWxsLFthY3Rvcl0pOwogIGNvbnN0IG9wdD11c2VNZW1vKCgpPT57IGlmKCF0fHwhdC5sZW5ndGgpcmV0dXJuIG51bGw7IGNvbnN0IHRvcD10LnNsaWNlKDAsMTApLnJldmVyc2UoKTsKICAgIHJldHVybiB7IGdyaWQ6e2xlZnQ6NzQscmlnaHQ6MTgsdG9wOjgsYm90dG9tOjI0fSwKICAgICAgeEF4aXM6e3R5cGU6InZhbHVlIixheGlzTGFiZWw6e2NvbG9yOiIjOGFhMGM2Iixmb250U2l6ZTo5fSxzcGxpdExpbmU6e2xpbmVTdHlsZTp7Y29sb3I6IiMxNTIwM2EifX19LAogICAgICB5QXhpczp7dHlwZToiY2F0ZWdvcnkiLGRhdGE6dG9wLm1hcCh4PT54LnRvcGljKSxheGlzTGFiZWw6e2NvbG9yOiIjYzhkNmYwIixmb250U2l6ZToxMX0sYXhpc0xpbmU6e2xpbmVTdHlsZTp7Y29sb3I6IiMxZTJjNDcifX19LAogICAgICB0b29sdGlwOntmb3JtYXR0ZXI6cD0+YCR7cC5uYW1lfTxici8+PGI+JHtmbXQocC52YWx1ZSl9PC9iPiBlbmcgwrcgJHt0b3BbcC5kYXRhSW5kZXhdLnBvc3RzfSBwb3N0c2B9LAogICAgICBzZXJpZXM6W3t0eXBlOiJiYXIiLGRhdGE6dG9wLm1hcCh4PT54LmVuZyksaXRlbVN0eWxlOntjb2xvcjoiIzIyZDNlZSIsYm9yZGVyUmFkaXVzOlswLDUsNSwwXX0sYmFyV2lkdGg6IjYyJSJ9XSB9OwogIH0sW3RdKTsKICByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJmYWRlIHNwYWNlLXktMiJ9LAogICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJjYXJkIHAtMiJ9LCBsP2goU3Bpbm5lcik6IG9wdD9oKENoYXJ0LHtvcHRpb246b3B0LGhlaWdodDozMjB9KTpoKCJkaXYiLHtjbGFzc05hbWU6InRleHQtbXV0ZSB0ZXh0LWNlbnRlciBweS0xMCB0ZXh0LXNtIn0sIk5vIHRvcGljcyB0YWdnZWQgeWV0IikpLAogICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LVsxMXB4XSB0ZXh0LW11dGUgdGV4dC1jZW50ZXIifSwiVG90YWwgZW5nYWdlbWVudCBieSBpbmZlcnJlZCB0b3BpYy4iKSk7Cn0KCi8vIC0tLS0gQ29tcGFyZSAtLS0tCmZ1bmN0aW9uIENvbXBhcmUoe2FjdG9yc30pewogIGNvbnN0IGE9YWN0b3JzWzBdPy5oYW5kbGUsIGI9YWN0b3JzWzFdPy5oYW5kbGU7CiAgY29uc3QgW2QsbF09dXNlUXVlcnkoYSYmYj9gL2NvbXBhcmU/YT0ke2F9JmI9JHtifWA6bnVsbCxbYSxiXSk7CiAgaWYobCkgcmV0dXJuIGgoU3Bpbm5lcik7IGlmKCFkfHxkLmVycm9yKSByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJ0ZXh0LW11dGUgcC02IHRleHQtc20ifSwiTmVlZCB0d28gYWN0b3JzIHRvIGNvbXBhcmUuIik7CiAgY29uc3Qgcm93PShsYWJlbCxrYSxrYixmbik9PmgoImRpdiIse2NsYXNzTmFtZToiZ3JpZCBncmlkLWNvbHMtMyBnYXAtMiBweS0yIGJvcmRlci1iIGJvcmRlci1saW5lLzUwIHRleHQtc20ifSwKICAgIGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtcmlnaHQgZm9udC1zZW1pYm9sZCAiKyhrYT49a2I/InRleHQtY3lhbiI6InRleHQtc29mdCIpfSwgKGZufHxmbXQpKGthKSksCiAgICBoKCJzcGFuIix7Y2xhc3NOYW1lOiJ0ZXh0LWNlbnRlciB0ZXh0LVsxMXB4XSB0ZXh0LW11dGUgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgc2VsZi1jZW50ZXIifSxsYWJlbCksCiAgICBoKCJzcGFuIix7Y2xhc3NOYW1lOiJmb250LXNlbWlib2xkICIrKGtiPmthPyJ0ZXh0LWFtYmVyIjoidGV4dC1zb2Z0Iil9LCAoZm58fGZtdCkoa2IpKSk7CiAgY29uc3QgQT1kLmEsQj1kLmI7CiAgcmV0dXJuIGgoImRpdiIse2NsYXNzTmFtZToiZmFkZSBjYXJkIHAtNCJ9LAogICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJncmlkIGdyaWQtY29scy0zIGdhcC0yIHBiLTIgbWItMSBib3JkZXItYiBib3JkZXItbGluZSB0ZXh0LXNtIGZvbnQtYm9sZCJ9LAogICAgICBoKCJzcGFuIix7Y2xhc3NOYW1lOiJ0ZXh0LXJpZ2h0IHRleHQtY3lhbiB0cnVuY2F0ZSJ9LEEuZGlzcGxheV9uYW1lfHxBLmhhbmRsZSksCiAgICAgIGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtY2VudGVyIHRleHQtbXV0ZSB0ZXh0LXhzIHNlbGYtY2VudGVyIn0sInZzIiksCiAgICAgIGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtYW1iZXIgdHJ1bmNhdGUifSxCLmRpc3BsYXlfbmFtZXx8Qi5oYW5kbGUpKSwKICAgIHJvdygiZm9sbG93ZXJzIixBLmZvbGxvd2VycyxCLmZvbGxvd2VycyksCiAgICByb3coInBvc3RzIixBLnBvc3RzLEIucG9zdHMpLAogICAgcm93KCJsaWtlcyIsQS5saWtlcyxCLmxpa2VzKSwKICAgIHJvdygicmVwb3N0cyIsQS5yZXBvc3RzLEIucmVwb3N0cyksCiAgICByb3coImVuZyAvIGZvbGxvd2VyIixBLmVuZ19wZXJfZm9sbG93ZXIsQi5lbmdfcGVyX2ZvbGxvd2VyLCh4KT0+eCksCiAgICByb3coImVuZyAvIHBvc3QiLEEuZW5nX3Blcl9wb3N0LEIuZW5nX3Blcl9wb3N0LCh4KT0+eCksCiAgICBoKCJkaXYiLHtjbGFzc05hbWU6InRleHQtWzExcHhdIHRleHQtbXV0ZSB0ZXh0LWNlbnRlciBwdC0zIn0sIkVuZy9mb2xsb3dlciBub3JtYWxpemVzIGZvciBhdWRpZW5jZSBzaXplIOKAlCB0aGUgZmFpciBjcm9zcy1hY2NvdW50IG1ldHJpYy4iKSk7Cn0KCi8vIC0tLS0gTG95YWx0eSAtLS0tCmZ1bmN0aW9uIExveWFsdHkoKXsKICBjb25zdCBbZCxsXT11c2VRdWVyeShgL2xveWFsdHlgLFtdKTsKICBpZihsKSByZXR1cm4gaChTcGlubmVyKTsKICByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJmYWRlIGNhcmQgcC0zIn0sCiAgICBoKCJkaXYiLHtjbGFzc05hbWU6InRleHQtc20gZm9udC1zZW1pYm9sZCBtYi0yIHRleHQtc29mdCJ9LCLwn5KOIFRvcCBmYW5zIChtb3N0IGVuZ2FnZW1lbnRzKSIpLAogICAgKGR8fFtdKS5zbGljZSgwLDMwKS5tYXAoKGYsaSk9PmgoImEiLHtrZXk6aSxocmVmOmBodHRwczovL2Jza3kuYXBwL3Byb2ZpbGUvJHtmLmhhbmRsZX1gLHRhcmdldDoiX2JsYW5rIiwKICAgICAgY2xhc3NOYW1lOiJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMS41IGJvcmRlci1iIGJvcmRlci1saW5lLzQwIHRleHQtc20gaG92ZXI6YmctcGFuZWwyIHB4LTEgcm91bmRlZCJ9LAogICAgICBoKCJzcGFuIix7Y2xhc3NOYW1lOiJ0cnVuY2F0ZSJ9LGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtbXV0ZSBtci0xLjUifSxgIyR7aSsxfWApLAogICAgICAgIGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtc29mdCJ9LGYuZGlzcGxheV9uYW1lfHxmLmhhbmRsZSksCiAgICAgICAgZi5zZWxmX2RlY2xhcmVkX2xvY2F0aW9uP2goInNwYW4iLHtjbGFzc05hbWU6InRleHQtWzEwcHhdIHRleHQtbXV0ZSBtbC0xIn0sIsK3ICIrZi5zZWxmX2RlY2xhcmVkX2xvY2F0aW9uKTpudWxsKSwKICAgICAgaCgic3BhbiIse2NsYXNzTmFtZToidGV4dC1hbWJlciBmb250LXNlbWlib2xkIn0sZm10KGYuZW5nYWdlbWVudF9jb3VudCkpKSkpOwp9CgovLyAtLS0tIEFib3V0IC0tLS0KZnVuY3Rpb24gQWJvdXQoKXsKICByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJmYWRlIHNwYWNlLXktNCB0ZXh0LXNtIGxlYWRpbmctcmVsYXhlZCJ9LAogICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJjYXJkIHAtNCJ9LAogICAgICBoKCJkaXYiLHtjbGFzc05hbWU6InRleHQtYmFzZSBmb250LWJvbGQgdGV4dC1zb2Z0IG1iLTEifSwi8J+bsO+4jyBXaGF0IFNreUxlbnMgaXMiKSwKICAgICAgaCgicCIse2NsYXNzTmFtZToidGV4dC1tdXRlIn0sIkFuIG9wZW4tc291cmNlIGVuZ2FnZW1lbnQgb2JzZXJ2YXRvcnkgZm9yIEJsdWVza3kgLyB0aGUgQVQgUHJvdG9jb2wuIEl0IGluZ2VzdHMgYW4gYWNjb3VudCdzIGZ1bGwgcG9zdCBoaXN0b3J5LCByZWNvbnN0cnVjdHMgdGhyZWFkcywgYW5kIHN1cmZhY2VzIHdoZW4sIHdoYXQsIGFuZCB3aXRoIHdob20geW91ciBjb250ZW50IGxhbmRzIOKAlCBidWlsdCBmb3IgcmVzZWFyY2hlcnMgYW5kIGNyZWF0b3JzIHdobyB0aGluayBpbiBwYXR0ZXJucy4iKSksCiAgICBoKCJkaXYiLHtjbGFzc05hbWU6ImNhcmQgcC00In0sCiAgICAgIGgoImRpdiIse2NsYXNzTmFtZToidGV4dC1iYXNlIGZvbnQtYm9sZCB0ZXh0LXNvZnQgbWItMSJ9LCLwn5SsIE1ldGhvZG9sb2d5IOKAlCByZWFsIHZzIGluZmVycmVkIiksCiAgICAgIGgoInVsIix7Y2xhc3NOYW1lOiJ0ZXh0LW11dGUgbGlzdC1kaXNjIHBsLTUgc3BhY2UteS0xIn0sCiAgICAgICAgaCgibGkiLG51bGwsaCgiYiIse2NsYXNzTmFtZToidGV4dC1jeWFuIn0sIlJlYWw6IiksJyBsaWtlcywgcmVwb3N0cywgcmVwbGllcywgcXVvdGVzLCB0aW1lc3RhbXBzLCB0aHJlYWQgc3RydWN0dXJlIOKAlCBhbGwgZnJvbSB0aGUgcHVibGljIEFwcFZpZXcgQVBJLicpLAogICAgICAgIGgoImxpIixudWxsLGgoImIiLHtjbGFzc05hbWU6InRleHQtYW1iZXIifSwiSW5mZXJyZWQgKGV4cGVyaW1lbnRhbCk6IiksJyBlbmdhZ2VyIHRpbWV6b25lIGZyb20gbGlrZS9yZXBvc3QgdGltZXN0YW1wIGRpc3RyaWJ1dGlvbjsgc2VsZi1kZWNsYXJlZCBsb2NhdGlvbiBwYXJzZWQgZnJvbSBwcm9maWxlIGJpb3MgKHBhcnRpYWwgY292ZXJhZ2UsIGxhYmVsZWQgYXMgc3VjaCkuJyksCiAgICAgICAgaCgibGkiLG51bGwsaCgiYiIsbnVsbCwiTm90IGF2YWlsYWJsZToiKSwnIHRydWUgZ2VvbG9jYXRpb24gZG9lcyBub3QgZXhpc3QgaW4gYXRwcm90byDigJQgd2UgbmV2ZXIgZmFrZSBpdC4nKSkpLAogICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJjYXJkIGdsb3cgcC00IHRleHQtY2VudGVyIn0sCiAgICAgIGgoImRpdiIse2NsYXNzTmFtZToidGV4dC1iYXNlIGZvbnQtYm9sZCB0ZXh0LXNvZnQgbWItMiJ9LCLimqEgU3VwcG9ydCB0aGUgcHJvamVjdCIpLAogICAgICBoKCJwIix7Y2xhc3NOYW1lOiJ0ZXh0LW11dGUgbWItMyJ9LCJTa3lMZW5zIGlzIGZyZWUgJiBvcGVuLiBMaWdodG5pbmcgdGlwcyBrZWVwIHRoZSBlZGdlIHJ1bm5pbmcuIiksCiAgICAgIGgoImltZyIse3NyYzoiaHR0cHM6Ly90aXBzLm9zaW50bmV0LnVrL3FyLnN2ZyIsCiAgICAgICAgY2xhc3NOYW1lOiJteC1hdXRvIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1saW5lIix3aWR0aDoxNjAsaGVpZ2h0OjE2MCxhbHQ6IkxpZ2h0bmluZyB0aXAgUVIifSksCiAgICAgIGgoImRpdiIse2NsYXNzTmFtZToidGV4dC1jeWFuIGZvbnQtbW9ubyB0ZXh0LXhzIG10LTIgc2VsZWN0LWFsbCJ9LCJ0aXBzQHNreWdpdmUuYXBwIikpLAogICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJjYXJkIHAtNCJ9LAogICAgICBoKCJkaXYiLHtjbGFzc05hbWU6ImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIGZsZXgtd3JhcCJ9LAogICAgICAgIGgoImltZyIse3NyYzoiaHR0cHM6Ly9iYWRnZS5vc2ludG5ldC51ay9iYWRnZS5zdmciLGFsdDoiSUlNIGJhZGdlIixoZWlnaHQ6Mjgsc3R5bGU6e2hlaWdodDoiMjhweCJ9fSksCiAgICAgICAgaCgiYSIse2hyZWY6Imh0dHBzOi8vZ2l0aHViLmNvbS9pbmRpY2FpbmRlcGVuZGVudC9za3lsZW5zIix0YXJnZXQ6Il9ibGFuayIsY2xhc3NOYW1lOiJ0ZXh0LWN5YW4gdW5kZXJsaW5lIn0sIkdpdEh1YiByZXBvIiksCiAgICAgICAgaCgiYSIse2hyZWY6Imh0dHBzOi8vYnNreS5hcHAvcHJvZmlsZS9pbmRpY2Eub3NpbnRuZXQudWsiLHRhcmdldDoiX2JsYW5rIixjbGFzc05hbWU6InRleHQtY3lhbiB1bmRlcmxpbmUifSwiQGluZGljYS5vc2ludG5ldC51ayIpKSksCiAgICBoKCJkaXYiLHtjbGFzc05hbWU6InRleHQtWzExcHhdIHRleHQtbXV0ZSB0ZXh0LWNlbnRlciBwYi00In0sIkJ1aWx0IG9uIENsb3VkZmxhcmUgV29ya2VycyArIEQxLiBCdW1ib2NsYWF0LWFzc2lzdGVkIPCfpJYiKSk7Cn0KCi8vIC0tLS0gU2hlbGwgLS0tLQpjb25zdCBUQUJTPVtbImRhc2giLCJEYXNoYm9hcmQiXSxbImhlYXQiLCJIZWF0bWFwIl0sWyJ0b3BpY3MiLCJUb3BpY3MiXSxbImNvbXBhcmUiLCJDb21wYXJlIl0sWyJsb3lhbHR5IiwiTG95YWx0eSJdLFsiYWJvdXQiLCJBYm91dCJdXTsKZnVuY3Rpb24gQXBwKCl7CiAgY29uc3QgW2FjdG9ycyxzZXRBY3RvcnNdPXVzZVN0YXRlKG51bGwpOwogIGNvbnN0IFtzZWwsc2V0U2VsXT11c2VTdGF0ZSgwKTsKICBjb25zdCBwYXJhbXM9bmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpOwogIGNvbnN0IFt0YWIsc2V0VGFiXT11c2VTdGF0ZShwYXJhbXMuZ2V0KCJ0YWIiKXx8ImRhc2giKTsKICB1c2VFZmZlY3QoKCk9PnsgaigiL2FjdG9ycyIpLnRoZW4oYT0+eyBzZXRBY3RvcnMoYXx8W10pOyB9KTsgfSxbXSk7CiAgdXNlRWZmZWN0KCgpPT57IGNvbnN0IHA9bmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpOyBwLnNldCgidGFiIix0YWIpOyBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCIiLCI/IitwLnRvU3RyaW5nKCkpOyB9LFt0YWJdKTsKICBpZighYWN0b3JzKSByZXR1cm4gaCgiZGl2Iix7Y2xhc3NOYW1lOiJtaW4taC1zY3JlZW4gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIifSxoKFNwaW5uZXIpKTsKICBjb25zdCBhY3Rvcj1hY3RvcnNbc2VsXT8uaGFuZGxlOwogIHJldHVybiBoKCJkaXYiLHtjbGFzc05hbWU6Im1heC13LW1kIG14LWF1dG8gbWluLWgtc2NyZWVuIHBiLTYifSwKICAgIGgoImhlYWRlciIse2NsYXNzTmFtZToic3RpY2t5IHRvcC0wIHotMTAgYmctaW5rLzkwIGJhY2tkcm9wLWJsdXIgYm9yZGVyLWIgYm9yZGVyLWxpbmUgcHgtNCBweS0zIn0sCiAgICAgIGgoImRpdiIse2NsYXNzTmFtZToiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIn0sCiAgICAgICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJmb250LWV4dHJhYm9sZCB0ZXh0LWxnIHRyYWNraW5nLXRpZ2h0In0saCgic3BhbiIse2NsYXNzTmFtZToidGV4dC1jeWFuIn0sIlNreSIpLGgoInNwYW4iLHtjbGFzc05hbWU6InRleHQtYW1iZXIifSwiTGVucyIpLAogICAgICAgICAgaCgic3BhbiIse2NsYXNzTmFtZToidGV4dC1bMTBweF0gdGV4dC1tdXRlIG1sLTEgYWxpZ24tdG9wIn0sIvCfm7DvuI8iKSksCiAgICAgICAgaCgiZGl2Iix7Y2xhc3NOYW1lOiJmbGV4IGdhcC0xIn0sCiAgICAgICAgICBhY3RvcnMubWFwKChhLGkpPT5oKCJidXR0b24iLHtrZXk6aSxvbkNsaWNrOigpPT5zZXRTZWwoaSksCiAgICAgICAgICAgIGNsYXNzTmFtZToidGFiYnRuIHRleHQteHMgcHgtMi41IHB5LTEgcm91bmRlZC1mdWxsIGJvcmRlciAiKyhpPT09c2VsPyJiZy1jeWFuIHRleHQtaW5rIGJvcmRlci1jeWFuIGZvbnQtYm9sZCI6ImJvcmRlci1saW5lIHRleHQtbXV0ZSIpfSwKICAgICAgICAgICAgKGEuZGlzcGxheV9uYW1lfHxhLmhhbmRsZSkuc3BsaXQoL1sgfF0vKVswXSkpKSkpLAogICAgaCgibmF2Iix7Y2xhc3NOYW1lOiJmbGV4IGdhcC0xIG92ZXJmbG93LXgtYXV0byBweC0zIHB5LTIgYm9yZGVyLWIgYm9yZGVyLWxpbmUvNjAgdGV4dC1zbSJ9LAogICAgICBUQUJTLm1hcCgoW2ssbGFiXSk9PmgoImJ1dHRvbiIse2tleTprLG9uQ2xpY2s6KCk9PnNldFRhYihrKSwKICAgICAgICBjbGFzc05hbWU6InRhYmJ0biB3aGl0ZXNwYWNlLW5vd3JhcCBweC0zIHB5LTEuNSByb3VuZGVkLWxnICIrKHRhYj09PWs/ImJnLXBhbmVsMiB0ZXh0LWN5YW4gZm9udC1zZW1pYm9sZCI6InRleHQtbXV0ZSIpfSxsYWIpKSksCiAgICBoKCJtYWluIix7Y2xhc3NOYW1lOiJweC0zIHB0LTQifSwKICAgICAgdGFiPT09ImRhc2giJiZoKERhc2hib2FyZCx7YWN0b3J9KSwKICAgICAgdGFiPT09ImhlYXQiJiZoKEhlYXRtYXAse2FjdG9yfSksCiAgICAgIHRhYj09PSJ0b3BpY3MiJiZoKFRvcGljcyx7YWN0b3J9KSwKICAgICAgdGFiPT09ImNvbXBhcmUiJiZoKENvbXBhcmUse2FjdG9yc30pLAogICAgICB0YWI9PT0ibG95YWx0eSImJmgoTG95YWx0eSksCiAgICAgIHRhYj09PSJhYm91dCImJmgoQWJvdXQpKSk7Cn0KUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgicm9vdCIpKS5yZW5kZXIoaChBcHApKTsKPC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPgo=";
const PAGE = 100;            // getAuthorFeed max
const HYDRATE_BATCH = 25;    // getPosts max uris
const ENGAGER_CAP = 200;     // max engagers pulled per HOT post
const CALL_CAP = 250;
const FEED_CAP  = 180;   // paging stops here so Phase B always has >=70 calls of headroom
const HYDRATE_POSTS_PER_RUN = 70;  // HOT posts to engager-hydrate per invocation (phase B). Bumped 40->70 Jul25: clears the 153-post first_hour_likes backlog + keeps it near-zero (fits the FEED_CAP 70-call headroom).
const THROTTLE_MS = 50;
const HOT_DAYS = 14, WARM_DAYS = 90;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- tiny xrpc client with call accounting ----
function makeClient() {
  let calls = 0;
  return {
    get calls() { return calls; },
    async get(method, params) {
      if (calls >= CALL_CAP) throw new Error("CALL_CAP reached");
      const qs = new URLSearchParams(params).toString();
      const r = await fetch(`${APPVIEW}/${method}?${qs}`, { headers: { "accept": "application/json" } });
      calls++;
      await sleep(THROTTLE_MS);
      if (r.status === 429) { await sleep(2000); throw new Error("429 rate limited"); }
      if (!r.ok) throw new Error(`${method} ${r.status}`);
      return r.json();
    },
  };
}

const TOPIC_MAP = {
  iran: ["iran","iranian","tehran","irgc","khamenei","hormuz","strait","gulf","kuwait"],
  ukraine: ["ukrain","kyiv","kremlin","putin","russia","moscow","zelensky"],
  israel: ["israel","idf","lebanon","hezbollah","gaza","palestin","hamas","beirut"],
  military: ["strike","strikes","missile","missiles","drone","drones","ceasefire","warship","airstrike"],
  osint: ["osint","geoint","sigint","open source","open-source","opensource","warheatmap","tracker"],
  crypto: ["bitcoin","btc","lightning","crypto","satoshi","sats"],
  finance: ["pre-market","premarket","vwap","futures","earnings","warchest","nasdaq","s&p","semis","semiconductor","alpaca sip","opening range","market open","pre-open","tape read"],
  trump: ["trump","maga","white house","deal"],
  surveillance: ["surveillance","facial","spyware","nso","tracking"],
};
function tagText(t) {
  const tags = [];
  const lc = (t || "").toLowerCase();
  for (const [k, kws] of Object.entries(TOPIC_MAP)) {
    if (kws.some((w) => lc.includes(w))) tags.push(k);
  }
  return tags;
}
function hashtagsOf(t) { return [...(t || "").matchAll(/#(\w{2,30})/g)].map((m) => m[1]); }
function dowHour(iso) { const d = new Date(iso); return { dow: d.getUTCDay(), hour: d.getUTCHours() }; }
function tierOf(iso) {
  const age = (Date.now() - new Date(iso).getTime()) / 86400000;
  return age <= HOT_DAYS ? "HOT" : age <= WARM_DAYS ? "WARM" : "COLD";
}

async function resolveActor(c, handle) {
  const p = await c.get("app.bsky.actor.getProfile", { actor: handle });
  return { did: p.did, handle: p.handle, display_name: p.displayName || "",
           follower_count: p.followersCount, follows_count: p.followsCount, posts_count: p.postsCount };
}

// ---- INGEST one actor (resumable via cursor) ----
async function ingestActor(env, c, actor, runId, resumeCursor, recencySync) {
  const isFeatured = actor.handle === (env.FEATURED_ACTOR || "");
  await env.DB.prepare(
    `INSERT INTO actors (did,handle,display_name,is_featured,follower_count,follows_count,posts_count,last_ingested)
     VALUES (?,?,?,?,?,?,?,datetime('now'))
     ON CONFLICT(did) DO UPDATE SET handle=excluded.handle,display_name=excluded.display_name,
       follower_count=excluded.follower_count,follows_count=excluded.follows_count,
       posts_count=excluded.posts_count,last_ingested=datetime('now')`
  ).bind(actor.did, actor.handle, actor.display_name, isFeatured ? 1 : 0,
         actor.follower_count, actor.follows_count, actor.posts_count).run();

  let cursor = resumeCursor || undefined;
  let postsSeen = 0, eventsSeen = 0;
  let seenStreak = 0; const SEEN_STREAK = 8; // recencySync: stop after N consecutive unchanged known posts

  while (true) {
    if (c.calls >= FEED_CAP) { await saveCursor(env, runId, cursor, "paused"); return { postsSeen, eventsSeen, paused: true }; }
    const feed = await c.get("app.bsky.feed.getAuthorFeed",
      { actor: actor.did, limit: PAGE, filter: "posts_with_replies", ...(cursor ? { cursor } : {}) });
    const items = feed.feed || [];
    if (!items.length) break;

    for (const it of items) {
      const post = it.post; if (!post?.uri) continue;
      const rec = post.record || {};
      const createdAt = rec.createdAt || post.indexedAt;
      const { dow, hour } = dowHour(createdAt);
      const replyRoot = rec.reply?.root?.uri || null;
      // self-thread guard: a post belongs to a multi-post THREAD only when its root is authored by THIS actor.
      // replies to OTHER people's posts are engagement, not Pete's own threads — keep them as singletons.
      const rootIsSelf = replyRoot && (replyRoot.indexOf("at://" + actor.did + "/") === 0);
      const rootUri = rootIsSelf ? replyRoot : post.uri;       // thread = self-root, else standalone
      const parentUri = rec.reply?.parent?.uri || null;
      const fullText = rec.text || "";
      // Derive analytics signals from the full text, but only STORE a compact preview.
      // Rationale (Pete's directive): keep minimal JSON — don't hoard full graphemes of every post/reply.
      const text = fullText.length > 200 ? fullText.slice(0, 200) : fullText;
      const tier = tierOf(createdAt);
      const hasImg = !!(post.embed && /images|video/.test(post.embed.$type || ""));

      if (recencySync) {
        const prev = await env.DB.prepare(
          `SELECT like_count,repost_count,reply_count,quote_count FROM posts WHERE uri=?`
        ).bind(post.uri).first();
        const unchanged = prev &&
          prev.like_count === (post.likeCount || 0) &&
          prev.repost_count === (post.repostCount || 0) &&
          prev.reply_count === (post.replyCount || 0) &&
          prev.quote_count === (post.quoteCount || 0);
        seenStreak = unchanged ? seenStreak + 1 : 0;
      }

      await env.DB.prepare(
        `INSERT INTO posts (uri,cid,actor_did,thread_id,text,created_at,hour_of_day,day_of_week,
            has_image,hashtags,topic_tags,reply_root_uri,reply_parent_uri,tier,
            like_count,repost_count,reply_count,quote_count)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(uri) DO UPDATE SET like_count=excluded.like_count,repost_count=excluded.repost_count,
            reply_count=excluded.reply_count,quote_count=excluded.quote_count,tier=excluded.tier,
            updated_at=datetime('now')`
      ).bind(post.uri, post.cid, actor.did, rootUri, text, createdAt, hour, dow,
             hasImg ? 1 : 0, JSON.stringify(hashtagsOf(fullText)), JSON.stringify(tagText(fullText)),
             rootUri, parentUri, tier,
             post.likeCount || 0, post.repostCount || 0, post.replyCount || 0, post.quoteCount || 0).run();

      // snapshot for growth tracking — only if counts changed since last snapshot
      const lastSnap = await env.DB.prepare(
        `SELECT like_count,repost_count,reply_count,quote_count FROM post_snapshots
         WHERE post_uri=? ORDER BY snapshot_at DESC LIMIT 1`
      ).bind(post.uri).first();
      const changed = !lastSnap ||
        lastSnap.like_count !== (post.likeCount || 0) ||
        lastSnap.repost_count !== (post.repostCount || 0) ||
        lastSnap.reply_count !== (post.replyCount || 0) ||
        lastSnap.quote_count !== (post.quoteCount || 0);
      if (changed) {
        await env.DB.prepare(
          `INSERT INTO post_snapshots (post_uri,snapshot_at,like_count,repost_count,reply_count,quote_count,actor_follower_count)
           VALUES (?,datetime('now'),?,?,?,?,?)`
        ).bind(post.uri, post.likeCount || 0, post.repostCount || 0, post.replyCount || 0,
               post.quoteCount || 0, actor.follower_count).run();
      }

      // posts default engagers_pulled=NULL (needs hydration); phase B picks them up. No marker needed here.
      postsSeen++;
    }
    cursor = feed.cursor;
    await env.DB.prepare(`UPDATE ingest_runs SET cursor=?, status='running', posts_seen=?, api_calls=? WHERE id=?`)
      .bind(cursor || null, postsSeen, c.calls, runId).run();
    console.log(`[ingest] ${actor.handle} page done: postsSeen=${postsSeen} calls=${c.calls} cursor=${cursor?'y':'END'} streak=${seenStreak}`);
    if (recencySync && seenStreak >= SEEN_STREAK) { console.log(`[ingest] ${actor.handle} recency caught up — stop`); break; }
    if (!cursor) break;
  }
  await reconcileThreads(env, actor.did);
  return { postsSeen, eventsSeen, paused: false };
}

async function hydratePhaseB(env, c, limitOverride) {
  // pick HOT posts not yet engager-hydrated, bounded per run
  const lim = limitOverride || HYDRATE_POSTS_PER_RUN;
  const rows = await env.DB.prepare(
    `SELECT uri,created_at FROM posts WHERE tier IN ('HOT','WARM') AND like_count>0 AND engagers_pulled IS NULL
     ORDER BY like_count DESC LIMIT ?`
  ).bind(lim).all();
  let done = 0, events = 0;
  for (const p of (rows.results || [])) {
    if (c.calls >= CALL_CAP) break;
    try {
      events += await hydrateEngagers(env, c, p.uri, p.created_at);
      await env.DB.prepare(`UPDATE posts SET engagers_pulled=1 WHERE uri=?`).bind(p.uri).run();
      done++;
    } catch (e) {
      console.log("phaseB err", p.uri, String(e));
      break;
    }
  }
  const remain = await env.DB.prepare(
    `SELECT COUNT(*) c FROM posts WHERE tier IN ('HOT','WARM') AND like_count>0 AND engagers_pulled IS NULL`
  ).first();
  return { posts: done, events, remaining: remain?.c || 0 };
}

async function hydrateEngagers(env, c, uri, postCreatedAt) {
  let pulled = 0, firstHour = 0, cursor;
  const postT = new Date(postCreatedAt).getTime();
  while (pulled < ENGAGER_CAP && c.calls < CALL_CAP) {
    let res;
    try { res = await c.get("app.bsky.feed.getLikes", { uri, limit: 100, ...(cursor ? { cursor } : {}) }); }
    catch { break; }
    const likes = res.likes || [];
    for (const l of likes) {
      const a = l.actor || {}; const at = l.createdAt;
      const { dow, hour } = dowHour(at);
      if (new Date(at).getTime() - postT <= 3600000) firstHour++;
      await env.DB.prepare(
        `INSERT OR IGNORE INTO engagers (did,handle,display_name,self_declared_location,first_seen,engagement_count)
         VALUES (?,?,?,?,datetime('now'),0)`
      ).bind(a.did, a.handle || "", a.displayName || "", parseLoc(a.description)).run();
      await env.DB.prepare(
        `INSERT OR IGNORE INTO engagement_events (post_uri,engager_did,type,event_at,event_hour,event_dow)
         VALUES (?,?,?,?,?,?)`
      ).bind(uri, a.did, "like", at, hour, dow).run();
      pulled++;
    }
    cursor = res.cursor; if (!cursor || !likes.length) break;
  }
  await env.DB.prepare(`UPDATE posts SET first_hour_likes=? WHERE uri=?`).bind(firstHour, uri).run();
  return pulled;
}

function parseLoc(bio) {
  if (!bio) return null;
  const m = bio.match(/\b(NYC|London|UK|USA|Berlin|Tokyo|Paris|Toronto|Sydney|Dublin|LA|SF|Texas|California|Canada|Germany|France|Australia)\b/i);
  return m ? m[1] : null;
}

async function reconcileThreads(env, did) {
  // rebuild thread aggregates from posts table for this actor
  const rows = (await env.DB.prepare(
    `SELECT thread_id, COUNT(*) n, MIN(created_at) f, MAX(created_at) l,
            SUM(like_count) lk, SUM(repost_count) rp, SUM(reply_count) rep, SUM(quote_count) q
     FROM posts WHERE actor_did=? GROUP BY thread_id`
  ).bind(did).all()).results || [];
  for (const t of rows) {
    // spacing pattern from this thread's post times
    const ps = (await env.DB.prepare(
      `SELECT created_at, text FROM posts WHERE thread_id=? ORDER BY created_at`
    ).bind(t.thread_id).all()).results || [];
    let spacingPattern = `${t.n}x`, avgMin = 0;
    if (ps.length > 1) {
      const deltas = [];
      for (let i = 1; i < ps.length; i++)
        deltas.push((new Date(ps[i].created_at) - new Date(ps[i - 1].created_at)) / 60000);
      avgMin = Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
      spacingPattern = `${t.n}x${avgMin}m`;
    }
    const allText = ps.map((p) => p.text).join(" ");
    await env.DB.prepare(
      `INSERT INTO threads (thread_id,actor_did,root_post_uri,post_count,first_post_at,last_post_at,
          spacing_pattern,spacing_avg_min,topic_tags,total_likes,total_reposts,total_replies,total_quotes,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
       ON CONFLICT(thread_id) DO UPDATE SET post_count=excluded.post_count,first_post_at=excluded.first_post_at,
          last_post_at=excluded.last_post_at,spacing_pattern=excluded.spacing_pattern,
          spacing_avg_min=excluded.spacing_avg_min,topic_tags=excluded.topic_tags,
          total_likes=excluded.total_likes,total_reposts=excluded.total_reposts,
          total_replies=excluded.total_replies,total_quotes=excluded.total_quotes,updated_at=datetime('now')`
    ).bind(t.thread_id, did, t.thread_id, t.n, t.f, t.l, spacingPattern, avgMin,
           JSON.stringify(tagText(allText)), t.lk, t.rp, t.rep, t.q).run();
  }
}

async function saveCursor(env, runId, cursor, status) {
  await env.DB.prepare(`UPDATE ingest_runs SET cursor=?, status=? WHERE id=?`).bind(cursor || null, status, runId).run();
}

async function tg(env, msg) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: msg, parse_mode: "HTML" }),
    });
  } catch {}
}

async function runIngest(env, opts) {
  const forceFull = !!(opts && opts.full);
  const c = makeClient();
  const handles = (env.TRACKED_ACTORS || "you.bsky.social,friend.bsky.social").split(",").map((s) => s.trim());
  let report = "🔭 <b>SkyLens ingest</b>\n";
  for (const h of handles) {
    if (c.calls >= CALL_CAP) { report += `• ${h}: deferred (call cap)\n`; continue; }
    let actor;
    try { actor = await resolveActor(c, h); }
    catch (e) { report += `• ${h}: ❌ resolve ${e.message}\n`; continue; }

    // skip feed paging if this actor's feed is already fully completed (frees budget for Phase B)
    const feedDone = await env.DB.prepare(
      `SELECT 1 FROM ingest_runs WHERE actor_did=? AND status='completed' LIMIT 1`
    ).bind(actor.did).first();
    const stillOpen = await env.DB.prepare(
      `SELECT 1 FROM ingest_runs WHERE actor_did=? AND status IN ('running','paused') LIMIT 1`
    ).bind(actor.did).first();
    // zombie guard: supersede any OPEN run with no progress that's been sitting > 20 min (a chain that died mid-flight)
    await env.DB.prepare(
      `UPDATE ingest_runs SET status='superseded', finished_at=datetime('now')
       WHERE actor_did=? AND status IN ('running','paused')
         AND (cursor IS NULL OR cursor='') AND posts_seen=0
         AND started_at < datetime('now','-20 minutes')`
    ).bind(actor.did).run();

    // recencySync mode kicks in once a full backfill has completed: page from the top and
    // stop early when we hit a streak of already-known, unchanged posts. forceFull (?full=1)
    // disables the early-stop so we deep re-page (used to recapture historical reply posts).
    let recencySync = false;
    if (feedDone && !stillOpen && !forceFull) {
      recencySync = true;
    }

    // forceFull: resume an in-progress 'full' run if one exists (chain continuation),
    // else supersede stale runs and start a fresh full backfill from the top.
    let runId, resumeCursor;
    if (forceFull) {
      const openFull = await env.DB.prepare(
        `SELECT id,cursor FROM ingest_runs WHERE actor_did=? AND phase='full' AND status IN ('running','paused') ORDER BY id DESC LIMIT 1`
      ).bind(actor.did).first();
      if (openFull) {
        runId = openFull.id; resumeCursor = openFull.cursor || undefined;
        await env.DB.prepare(`UPDATE ingest_runs SET status='running' WHERE id=?`).bind(runId).run();
      } else {
        await env.DB.prepare(`UPDATE ingest_runs SET status='superseded', finished_at=datetime('now') WHERE actor_did=? AND status IN ('running','paused')`).bind(actor.did).run();
        const r = await env.DB.prepare(
          `INSERT INTO ingest_runs (started_at,actor_did,phase,status) VALUES (datetime('now'),?,'full','running')`
        ).bind(actor.did).run();
        runId = r.meta.last_row_id; resumeCursor = undefined;
      }
    } else {
      // find an OPEN run for this actor (resume it); else start a new one
      const open = await env.DB.prepare(
        `SELECT id,cursor FROM ingest_runs WHERE actor_did=? AND status IN ('running','paused') ORDER BY id DESC LIMIT 1`
      ).bind(actor.did).first();
      if (open) {
        runId = open.id; resumeCursor = open.cursor || undefined;
        await env.DB.prepare(`UPDATE ingest_runs SET status='running' WHERE id=?`).bind(runId).run();
      } else {
        const r = await env.DB.prepare(
          `INSERT INTO ingest_runs (started_at,actor_did,phase,status) VALUES (datetime('now'),?,?,'running')`
        ).bind(actor.did, recencySync ? 'recency' : 'feed').run();
        runId = r.meta.last_row_id; resumeCursor = undefined;
      }
    }
    try {
      const out = await ingestActor(env, c, actor, runId, resumeCursor, recencySync);
      await env.DB.prepare(
        `UPDATE ingest_runs SET finished_at=datetime('now'),posts_seen=?,events_seen=?,api_calls=?,status=? WHERE id=?`
      ).bind(out.postsSeen, out.eventsSeen, c.calls, out.paused ? "paused" : "completed", runId).run();
      report += `• ${h}: ${out.postsSeen} posts${recencySync ? " (recency)" : ""}, ${out.eventsSeen} events${out.paused ? " (paused — resumes next run)" : " ✅"}\n`;
    } catch (e) {
      await env.DB.prepare(`UPDATE ingest_runs SET finished_at=datetime('now'),status='error',error=?,api_calls=? WHERE id=?`)
        .bind(String(e.message || e), c.calls, runId).run();
      report += `• ${h}: ❌ ${e.message}\n`;
    }
  }
  // Phase B: engager hydration for HOT posts, with leftover call budget.
  // Persist its own run row so events_seen reflects reality (was previously only in the report string).
  if (c.calls < CALL_CAP) {
    const pbRun = await env.DB.prepare(
      `INSERT INTO ingest_runs (started_at,actor_did,phase,status) VALUES (datetime('now'),'_phaseB','hydrate','running')`
    ).run();
    const pbId = pbRun.meta.last_row_id;
    let b;
    try {
      b = await hydratePhaseB(env, c);
      await env.DB.prepare(
        `UPDATE ingest_runs SET finished_at=datetime('now'),posts_seen=?,events_seen=?,api_calls=?,status='completed' WHERE id=?`
      ).bind(b.posts, b.events, c.calls, pbId).run();
      report += `• engagers: +${b.posts} posts, +${b.events} events (${b.remaining} HOT posts left)\n`;
    } catch (e) {
      await env.DB.prepare(
        `UPDATE ingest_runs SET finished_at=datetime('now'),status='error',error=?,api_calls=? WHERE id=?`
      ).bind(String(e.message||e), c.calls, pbId).run();
      report += `• engagers: ❌ ${String(e.message||e)}\n`;
    }
  } else {
    report += `• engagers: skipped (call budget exhausted ${c.calls}/${CALL_CAP})\n`;
  }
  report += `\nAPI calls: ${c.calls}/${CALL_CAP}`;
  await tg(env, report);
  return report;
}

// ---- READ API (edge-cached) ----
async function api(env, url) {
  const p = url.pathname.replace(/^\/api\//, "");
  const q = url.searchParams;
  const J = (o) => new Response(JSON.stringify(o), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300",
               "access-control-allow-origin": "*" } });

  // Alias resolver: let callers pass a short alias ("you", "friend") instead of the
  // full handle/did. Rewrites the 'actor' param in place to the exact handle before any
  // did=?/handle=? lookup runs. No-op if already an exact match or a DID.
  const rawActor = q.get("actor");
  if (rawActor && !rawActor.startsWith("did:")) {
    const exact = await env.DB.prepare(`SELECT handle FROM actors WHERE did=? OR handle=?`).bind(rawActor, rawActor).first();
    if (!exact) {
      const like = await env.DB.prepare(`SELECT handle FROM actors WHERE handle LIKE ? ORDER BY posts_count DESC LIMIT 1`).bind(rawActor + "%").first();
      if (like && like.handle) q.set("actor", like.handle);
    }
  }

  if (p === "actors") {
    const r = await env.DB.prepare(`SELECT did,handle,display_name,is_featured,follower_count,posts_count,last_ingested FROM actors ORDER BY is_featured DESC`).all();
    return J(r.results || []);
  }
  if (p === "overview") {
    const did = q.get("actor");
    const a = await env.DB.prepare(`SELECT * FROM actors WHERE did=? OR handle=?`).bind(did, did).first();
    if (!a) return J({ error: "actor not found" });
    const agg = await env.DB.prepare(
      `SELECT COUNT(*) posts, SUM(like_count) likes, SUM(repost_count) reposts, SUM(reply_count) replies, SUM(quote_count) quotes
       FROM posts WHERE actor_did=?`).bind(a.did).first();
    const threads = await env.DB.prepare(`SELECT COUNT(*) n FROM threads WHERE actor_did=?`).bind(a.did).first();
    return J({ actor: a, ...agg, threads: threads.n });
  }
  if (p === "threads") {
    const did = q.get("actor");
    const r = await env.DB.prepare(
      `SELECT t.* FROM threads t JOIN actors a ON a.did=t.actor_did WHERE a.did=? OR a.handle=?
       ORDER BY (t.total_likes+t.total_reposts) DESC LIMIT 100`).bind(did, did).all();
    return J(r.results || []);
  }
  if (p === "timing") {
    const did = q.get("actor"); const topic = q.get("topic");
    let sql = `SELECT day_of_week dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
               FROM posts p JOIN actors a ON a.did=p.actor_did WHERE (a.did=? OR a.handle=?)`;
    const binds = [did, did];
    if (topic) { sql += ` AND p.topic_tags LIKE ?`; binds.push(`%"${topic}"%`); }
    sql += ` GROUP BY dow, hour`;
    const r = await env.DB.prepare(sql).bind(...binds).all();
    return J(r.results || []);
  }
  if (p === "goldenhour") {
    const did = q.get("actor"); const topic = q.get("topic");
    let sql = `SELECT day_of_week dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
               FROM posts p JOIN actors a ON a.did=p.actor_did WHERE (a.did=? OR a.handle=?)`;
    const binds = [did, did];
    if (topic) { sql += ` AND p.topic_tags LIKE ?`; binds.push(`%"${topic}"%`); }
    sql += ` GROUP BY dow, hour HAVING n>=2 ORDER BY avg_eng DESC LIMIT 1`;
    const r = await env.DB.prepare(sql).bind(...binds).first();
    return J(r || { note: "not enough data" });
  }
  if (p === "shapes") {
    const did = q.get("actor");
    const r = await env.DB.prepare(
      `SELECT spacing_pattern, COUNT(*) threads, AVG((total_likes+total_reposts)*1.0/post_count) avg_eng_per_post
       FROM threads t JOIN actors a ON a.did=t.actor_did WHERE (a.did=? OR a.handle=?) AND post_count>1
       GROUP BY spacing_pattern ORDER BY avg_eng_per_post DESC LIMIT 20`).bind(did, did).all();
    return J(r.results || []);
  }
  if (p === "loyalty") {
    const r = await env.DB.prepare(
      `SELECT handle, display_name, self_declared_location, engagement_count
       FROM engagers ORDER BY engagement_count DESC LIMIT 50`).all();
    return J(r.results || []);
  }
  if (p === "topics") {
    const did = q.get("actor");
    const rows = (await env.DB.prepare(
      `SELECT topic_tags, like_count, repost_count FROM posts p JOIN actors a ON a.did=p.actor_did
       WHERE a.did=? OR a.handle=?`).bind(did, did).all()).results || [];
    const acc = {};
    for (const r of rows) for (const t of JSON.parse(r.topic_tags || "[]")) {
      acc[t] = acc[t] || { topic: t, posts: 0, eng: 0 };
      acc[t].posts++; acc[t].eng += (r.like_count + r.repost_count);
    }
    return J(Object.values(acc).sort((a, b) => b.eng - a.eng));
  }
  if (p === "velocity") {
    const did = q.get("actor");
    const r = await env.DB.prepare(
      `SELECT pp.uri uri, substr(pp.text,1,120) text, pp.first_hour_likes first_hour_likes, pp.like_count like_count, pp.repost_count repost_count, pp.created_at created_at
       FROM posts pp JOIN actors a ON a.did=pp.actor_did
       WHERE (a.did=? OR a.handle=?) AND first_hour_likes IS NOT NULL AND first_hour_likes>0
       ORDER BY first_hour_likes DESC LIMIT 25`).bind(did, did).all();
    return J(r.results || []);
  }
  if (p === "compare") {
    const A = q.get("a"), B = q.get("b");
    async function snap(h) {
      const a = await env.DB.prepare(`SELECT * FROM actors WHERE did=? OR handle=?`).bind(h, h).first();
      if (!a) return null;
      const agg = await env.DB.prepare(
        `SELECT COUNT(*) posts, SUM(like_count) likes, SUM(repost_count) reposts,
                SUM(reply_count) replies, SUM(quote_count) quotes FROM posts WHERE actor_did=?`).bind(a.did).first();
      const th = await env.DB.prepare(`SELECT COUNT(*) n FROM threads WHERE actor_did=?`).bind(a.did).first();
      const gh = await env.DB.prepare(
        `SELECT day_of_week dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
         FROM posts WHERE actor_did=? GROUP BY dow,hour HAVING n>=2 ORDER BY avg_eng DESC LIMIT 1`).bind(a.did).first();
      const f = a.follower_count || 1;
      const totalEng = (agg.likes || 0) + (agg.reposts || 0);
      return {
        handle: a.handle, display_name: a.display_name, followers: a.follower_count,
        posts: agg.posts, likes: agg.likes, reposts: agg.reposts, replies: agg.replies,
        quotes: agg.quotes, threads: th.n,
        eng_per_follower: +(totalEng / f).toFixed(2),
        eng_per_post: agg.posts ? +(totalEng / agg.posts).toFixed(1) : 0,
        golden_hour: gh || null,
      };
    }
    const [sa, sb] = await Promise.all([snap(A), snap(B)]);
    if (!sa || !sb) return J({ error: "actor not found", a: !!sa, b: !!sb });
    return J({ a: sa, b: sb });
  }
  if (p === "optimal-schedule") {
    const did = q.get("actor"); const topic = q.get("topic");
    let nposts = parseInt(q.get("nposts") || "5", 10);
    if (isNaN(nposts) || nposts < 1) nposts = 5;
    // DOCTRINE: hard 6-post cap (engagement craters after post 5).
    const capped = nposts > 6;
    if (capped) nposts = 6;
    const replies = Math.max(0, nposts - 1);

    // 1) best (dow,hour) root slot from goldenhour logic
    let ghSql = `SELECT day_of_week dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
                 FROM posts p JOIN actors a ON a.did=p.actor_did WHERE (a.did=? OR a.handle=?)`;
    const ghB = [did, did];
    if (topic) { ghSql += ` AND p.topic_tags LIKE ?`; ghB.push(`%"${topic}"%`); }
    ghSql += ` GROUP BY dow, hour HAVING n>=2 ORDER BY avg_eng DESC LIMIT 1`;
    const gh = await env.DB.prepare(ghSql).bind(...ghB).first();

    // 2) best spacing pattern from the thread-shape leaderboard (post_count matched-ish)
    const shp = await env.DB.prepare(
      `SELECT spacing_pattern, COUNT(*) threads, AVG((total_likes+total_reposts)*1.0/post_count) avg_eng_per_post
       FROM threads t JOIN actors a ON a.did=t.actor_did
       WHERE (a.did=? OR a.handle=?) AND post_count>1
       GROUP BY spacing_pattern ORDER BY avg_eng_per_post DESC LIMIT 1`).bind(did, did).first();

    // 3) DOCTRINE default: 55-min total drip, replies spaced 10-14 min.
    const TOTAL_MIN = 55;
    let spacing = replies > 0 ? Math.round(TOTAL_MIN / replies) : 0;
    // clamp spacing to the 10-14 min sweet spot the doctrine prescribes
    if (replies > 0) spacing = Math.max(10, Math.min(18, spacing));
    const total_drip = spacing * replies;

    const dowNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const rootSlot = gh ? { dow: gh.dow, dow_name: dowNames[gh.dow] || String(gh.dow), hour_utc: gh.hour,
                            measured_avg_eng: +(gh.avg_eng||0).toFixed(1), sample_n: gh.n }
                        : null;

    return J({
      actor: did, topic: topic || null,
      posts: nposts, replies,
      capped_to_6: capped,
      root_slot: rootSlot,
      root_slot_note: rootSlot ? "hour_utc is UTC — convert to ET when scheduling" : "insufficient data: fall back to 8-10am or 6-8pm target-tz weekday",
      spacing_minutes: spacing,
      total_drip_minutes: total_drip,
      drip_doctrine: "55-min total drip; replies 10-14min apart; one thread at a time (next root >= prev root + 60min)",
      best_measured_shape: shp ? { spacing_pattern: shp.spacing_pattern, threads: shp.threads,
                                   avg_eng_per_post: +(shp.avg_eng_per_post||0).toFixed(2) } : null,
      ready_to_fire: {
        spacing_minutes: spacing,
        max_posts: nposts,
        simultaneity_rule: "do not fire a new root while another thread is inside its 60-min golden hour"
      }
    });
  }
  if (p === "advise-schedule") {
    // SOFT/LISTENING MODE: compute the optimal plan, LOG it to schedule_advice,
    // Telegram Pete the advisory, and return it. Does NOT change any live fire —
    // WarDesk keeps its fixed schedule; this only listens + takes notes.
    // FIX (Aug2 2026): actor defaults to FEATURED_ACTOR (your handle) when caller omits it —
    // was querying WHERE did=null -> zero rows -> false "insufficient data" despite 6k+ posts.
    let did = q.get("actor") || env.FEATURED_ACTOR || "you.bsky.social";
    // FIX (Aug2 2026): callers sometimes pass a SHORT handle ("you") that matches no did/handle.
    // Resolve it to a real actor: exact did/handle -> handle-prefix LIKE -> FEATURED_ACTOR.
    {
      const exact = await env.DB.prepare(`SELECT did,handle FROM actors WHERE did=? OR handle=? LIMIT 1`).bind(did,did).first();
      if (!exact) {
        const pref = await env.DB.prepare(`SELECT did,handle FROM actors WHERE handle LIKE ? ORDER BY posts_count DESC LIMIT 1`).bind(did+"%").first();
        did = pref ? pref.handle : (env.FEATURED_ACTOR || did);
      }
    }
    const topic = q.get("topic");
    let nposts = parseInt(q.get("nposts") || "5", 10);
    if (isNaN(nposts) || nposts < 1) nposts = 5;
    const capped = nposts > 6; if (capped) nposts = 6;
    const replies = Math.max(0, nposts - 1);
    // caller may report what it WILL actually use (soft-mode comparison)
    const actualSlot = q.get("actual_slot") || null;      // e.g. "07:00 ET"
    const actualSpacing = q.get("actual_spacing") ? parseInt(q.get("actual_spacing"),10) : null;
    const routine = q.get("routine") || "wardesk";

    // ===== WARDESK LOCKED MORNING SLOTS (Pete Aug2 2026) =====
    // Fans depend on a CONSISTENT daily WarDesk schedule. If this advisory is for a WarDesk
    // MORNING theatre thread (routine="wardesk-<theatre>"), SkyLens MUST recommend the exact
    // locked slot — never a golden-hour override. SkyLens' smart slotting stays active only for
    // Part-II overflow / ad-hoc threads (routine "wardesk-<theatre>-partii" or non-wardesk).
    const WARDESK_LOCKED = {
      "wardesk-ukraine": { hour_et: 7,  min: 0,  square: "🟦", label: "🇺🇦 Ukraine" },
      "wardesk-iran":    { hour_et: 8,  min: 0,  square: "🟥", label: "🛢️ US–Iran / Hormuz" },
      "wardesk-war30":   { hour_et: 9,  min: 35, square: "🟥", label: "🌍 WAR 3.0 Global Front" },
    };
    const _lockKey = (routine || "").toLowerCase();
    const _isPartII = _lockKey.includes("partii") || _lockKey.includes("part-ii") || _lockKey.includes("overflow");
    const _lock = (!_isPartII) ? WARDESK_LOCKED[_lockKey] : null;
    if (_lock) {
      const hour_utc = (_lock.hour_et + 4) % 24; // EDT->UTC (UTC-4). Doctrine slot is ET-fixed.
      const repliesL = Math.max(0, nposts - 1);
      let spacingL = repliesL > 0 ? Math.max(10, Math.min(18, Math.round(55/repliesL))) : 0;
      const totalL = spacingL * repliesL;
      const lockMsg =
        `🛰️ <b>SkyLens — WarDesk LOCKED slot</b> <i>(consistent daily schedule)</i>\n\n`+
        `<b>Theatre:</b> ${_lock.label}\n`+
        `<b>📌 Fixed slot:</b> ${String(_lock.hour_et).padStart(2,"0")}:${String(_lock.min).padStart(2,"0")} ET (locked — fans depend on it)\n`+
        `<b>Posts:</b> ${nposts} · <b>spacing:</b> ${spacingL} min · <b>drip:</b> ${totalL} min\n`+
        `\n<i>SkyLens will NOT move a WarDesk morning thread. Golden-hour analysis applies only to Part-II / ad-hoc threads.</i>`;
      try { await tg(env, lockMsg); } catch(e){}
      try {
        await env.DB.prepare(
          `INSERT INTO schedule_advice
           (actor,topic,nposts,mode,advised_dow,advised_dow_name,advised_hour_utc,advised_avg_eng,advised_sample_n,
            advised_spacing_min,advised_total_drip_min,best_shape,actual_slot_used,actual_spacing_used,followed,source_routine,notes)
           VALUES (?,?,?,'locked',NULL,'AnyDay',?,NULL,NULL,?,?,NULL,?,?,1,?,?)`
        ).bind(did, topic||null, nposts, hour_utc, spacingL, totalL,
               `${String(_lock.hour_et).padStart(2,"0")}:${String(_lock.min).padStart(2,"0")} ET`,
               (q.get("actual_spacing")?parseInt(q.get("actual_spacing"),10):spacingL),
               routine, "WARDESK LOCKED morning slot — no override").run();
      } catch(e){}
      return J({
        actor: did, topic: topic||null, posts: nposts, replies: repliesL, capped_to_6: (nposts>6),
        mode: "locked", wardesk_locked: true,
        advised: { dow: null, dow_name: "AnyDay", hour_utc: hour_utc, slot_et: `${String(_lock.hour_et).padStart(2,"0")}:${String(_lock.min).padStart(2,"0")}`,
                   avg_eng: null, sample_n: null, spacing_minutes: spacingL, total_drip_minutes: totalL, best_shape: null },
        note: "WarDesk morning thread -> LOCKED slot (consistent daily schedule); SkyLens does not override."
      });
    }
    // ===== end WarDesk locked slots (falls through to smart golden-hour for Part-II / ad-hoc) =====


    // 1) golden-hour slot (topic-scoped if given, else broad)
    let ghSql = `SELECT day_of_week dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
                 FROM posts p JOIN actors a ON a.did=p.actor_did WHERE (a.did=? OR a.handle=?)`;
    const ghB=[did,did];
    if (topic){ ghSql+=` AND p.topic_tags LIKE ?`; ghB.push(`%"${topic}"%`); }
    ghSql+=` GROUP BY dow,hour HAVING n>=2 ORDER BY avg_eng DESC LIMIT 1`;
    let gh = await env.DB.prepare(ghSql).bind(...ghB).first();
    // FIX (Aug2 2026): if the exact (dow,hour) bucket is thin, relax to HOUR-ONLY across all days.
    // Still real measured data (not doctrine) — just pooled over weekdays. dow becomes null => any day.
    if (!gh) {
      let hrSql = `SELECT NULL dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
                   FROM posts p JOIN actors a ON a.did=p.actor_did WHERE (a.did=? OR a.handle=?)`;
      const hrB=[did,did];
      if (topic){ hrSql+=` AND p.topic_tags LIKE ?`; hrB.push(`%"${topic}"%`); }
      hrSql+=` GROUP BY hour HAVING n>=3 ORDER BY avg_eng DESC LIMIT 1`;
      gh = await env.DB.prepare(hrSql).bind(...hrB).first();
      // last relax: if topic-scoped still empty, drop the topic filter entirely (broad account golden hour)
      if (!gh && topic) {
        gh = await env.DB.prepare(
          `SELECT NULL dow, hour_of_day hour, AVG(like_count+repost_count) avg_eng, COUNT(*) n
           FROM posts p JOIN actors a ON a.did=p.actor_did WHERE (a.did=? OR a.handle=?)
           GROUP BY hour HAVING n>=3 ORDER BY avg_eng DESC LIMIT 1`).bind(did,did).first();
      }
    }

    // 2) best shape
    const shp = await env.DB.prepare(
      `SELECT spacing_pattern, AVG((total_likes+total_reposts)*1.0/post_count) e
       FROM threads t JOIN actors a ON a.did=t.actor_did
       WHERE (a.did=? OR a.handle=?) AND post_count>1
       GROUP BY spacing_pattern ORDER BY e DESC LIMIT 1`).bind(did,did).first();

    // 3) doctrine drip: 55-min total, spacing clamped 10-18
    const TOTAL=55;
    let spacing = replies>0 ? Math.max(10, Math.min(18, Math.round(TOTAL/replies))) : 0;
    const total_drip = spacing*replies;
    const dowNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const dowName = gh ? (gh.dow==null ? "AnyDay" : (dowNames[gh.dow]||String(gh.dow))) : null;
    const bestShape = shp ? shp.spacing_pattern : null;

    // 4) LOG to schedule_advice (soft-mode note-taking)
    try {
      await env.DB.prepare(
        `INSERT INTO schedule_advice
         (actor,topic,nposts,mode,advised_dow,advised_dow_name,advised_hour_utc,advised_avg_eng,advised_sample_n,
          advised_spacing_min,advised_total_drip_min,best_shape,actual_slot_used,actual_spacing_used,followed,source_routine,notes)
         VALUES (?,?,?,'soft',?,?,?,?,?,?,?,?,?,?,0,?,?)`
      ).bind(did, topic||null, nposts,
             gh?gh.dow:null, dowName, gh?gh.hour:null, gh?+(gh.avg_eng||0).toFixed(1):null, gh?gh.n:null,
             spacing, total_drip, bestShape, actualSlot, actualSpacing, routine,
             capped ? "nposts capped 6" : null).run();
    } catch(e) { /* table may not exist yet; don't fail the advisory */ }

    // 5) Telegram Pete the advisory (soft-mode: FYI only)
    const etHour = gh!=null ? ((gh.hour-4+24)%24) : null; // rough EDT (UTC-4); Pete converts precisely
    const slotLine = gh
      ? `${dowName} ${String(gh.hour).padStart(2,"0")}:00 UTC (~${String(etHour).padStart(2,"0")}:00 ET) · avg ${(+gh.avg_eng).toFixed(0)} eng, n=${gh.n}`
      : `insufficient data → doctrine fallback (8-10am / 6-8pm target-tz weekday)`;
    const msg =
      `🛰️ <b>SkyLens advisory</b> <i>(soft mode — listening only)</i>\n\n`+
      `<b>Actor:</b> ${did}${topic?` · <b>topic:</b> ${topic}`:""}\n`+
      `<b>Posts:</b> ${nposts}${capped?" (capped from &gt;6)":""} · replies ${replies}\n\n`+
      `<b>📈 Recommended slot:</b> ${slotLine}\n`+
      `<b>⏱ Spacing:</b> ${spacing} min · <b>total drip:</b> ${total_drip} min\n`+
      (bestShape?`<b>🧵 Best measured shape:</b> ${bestShape}\n`:"")+
      (actualSlot?`\n<b>WarDesk will actually fire:</b> ${actualSlot}${actualSpacing?` · ${actualSpacing}min`:""}\n`:"")+
      `\n<i>No change made — WarDesk keeps its fixed schedule. Toggle full-auto when ready.</i>`;
    await tg(env, msg);

    return J({
      actor: did, topic: topic||null, posts: nposts, replies, capped_to_6: capped, mode: "soft",
      advised: { dow: gh?gh.dow:null, dow_name: dowName, hour_utc: gh?gh.hour:null,
                 avg_eng: gh?+(gh.avg_eng||0).toFixed(1):null, sample_n: gh?gh.n:null,
                 spacing_minutes: spacing, total_drip_minutes: total_drip, best_shape: bestShape },
      actual: { slot: actualSlot, spacing_minutes: actualSpacing },
      logged: true, telegrammed: true,
      note: "soft mode: advisory logged to schedule_advice + telegrammed; live fire unchanged"
    });
  }
  return J({ error: "unknown endpoint" });
}

// ---- Lightning proxy (tips@skylens.example.com -> sovereign LND node) ----
// LIVE: proxies to https://ln.warheatmap.app/.well-known/lnurlp/tips (paylink Ko2Cev).
// The upstream response's callback already points at ln.warheatmap.app, so payer
// wallets resolve + pay against the real node regardless of discovery domain.
async function lnurlp(env, url) {
  if (!env.SKYLENS_LNURLP_TARGET) return new Response("Lightning not configured", { status: 503 });
  const target = env.SKYLENS_LNURLP_TARGET + (url.search || "");
  const r = await fetch(target, { headers: { accept: "application/json" } });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(runIngest(env)); },
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === "/api/status") {
      const rows = await env.DB.prepare(`SELECT actor_did,status,posts_seen,events_seen,api_calls,started_at,finished_at FROM ingest_runs ORDER BY id DESC LIMIT 4`).all();
      const counts = await env.DB.prepare(`SELECT (SELECT COUNT(*) FROM posts) posts,(SELECT COUNT(*) FROM threads) threads,(SELECT COUNT(*) FROM engagers) engagers,(SELECT COUNT(*) FROM engagement_events) events`).first();
      return new Response(JSON.stringify({ counts, runs: rows.results }, null, 2), { headers: { "content-type": "application/json" } });
    }
    if (url.pathname.startsWith("/api/")) return api(env, url);
    if (url.pathname === "/.well-known/lnurlp/tips") return lnurlp(env, url);
    if (url.pathname === "/__hydrate" && req.method === "POST") {
      if (url.searchParams.get("key") !== env.INGEST_KEY) return new Response("forbidden", { status: 403 });
      const c = makeClient();
      const pbRun = await env.DB.prepare(
        `INSERT INTO ingest_runs (started_at,actor_did,phase,status) VALUES (datetime('now'),'_phaseB','hydrate-manual','running')`
      ).run();
      const pbId = pbRun.meta.last_row_id;
      try {
        const nReq = Math.min(20, Math.max(1, parseInt(url.searchParams.get("n")||"12",10)));
        const b = await hydratePhaseB(env, c, nReq);
        await env.DB.prepare(
          `UPDATE ingest_runs SET finished_at=datetime('now'),posts_seen=?,events_seen=?,api_calls=?,status='completed' WHERE id=?`
        ).bind(b.posts, b.events, c.calls, pbId).run();
        return new Response(JSON.stringify({ ok:true, ...b, api_calls:c.calls }, null, 2), { headers:{ "content-type":"application/json" } });
      } catch (e) {
        await env.DB.prepare(`UPDATE ingest_runs SET finished_at=datetime('now'),status='error',error=?,api_calls=? WHERE id=?`).bind(String(e.message||e),c.calls,pbId).run();
        return new Response(JSON.stringify({ ok:false, error:String(e.message||e) }),{status:500,headers:{"content-type":"application/json"}});
      }
    }
    if (url.pathname === "/__reconcile" && req.method === "POST") {
      if (url.searchParams.get("key") !== env.INGEST_KEY) return new Response("forbidden", { status: 403 });
      const did = url.searchParams.get("did");
      if (!did) return new Response(JSON.stringify({error:"need did"}),{status:400,headers:{"content-type":"application/json"}});
      const off = parseInt(url.searchParams.get("off")||"0",10);
      const BATCH = 60;
      // grouped thread aggregates, paginated
      const rows = (await env.DB.prepare(
        `SELECT thread_id, COUNT(*) n, MIN(created_at) f, MAX(created_at) l,
                SUM(like_count) lk, SUM(repost_count) rp, SUM(reply_count) rep, SUM(quote_count) q
         FROM posts WHERE actor_did=? GROUP BY thread_id ORDER BY thread_id LIMIT ? OFFSET ?`
      ).bind(did, BATCH, off).all()).results || [];
      for (const t of rows) {
        const ps = (await env.DB.prepare(
          `SELECT created_at, text FROM posts WHERE thread_id=? ORDER BY created_at`
        ).bind(t.thread_id).all()).results || [];
        let spacingPattern = `${t.n}x`, avgMin = 0;
        if (ps.length > 1) {
          const deltas = [];
          for (let i=1;i<ps.length;i++) deltas.push((new Date(ps[i].created_at)-new Date(ps[i-1].created_at))/60000);
          avgMin = Math.round(deltas.reduce((a,b)=>a+b,0)/deltas.length);
          spacingPattern = `${t.n}x${avgMin}m`;
        }
        const allText = ps.map(p=>p.text).join(" ");
        await env.DB.prepare(
          `INSERT INTO threads (thread_id,actor_did,root_post_uri,post_count,first_post_at,last_post_at,
              spacing_pattern,spacing_avg_min,topic_tags,total_likes,total_reposts,total_replies,total_quotes,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
           ON CONFLICT(thread_id) DO UPDATE SET post_count=excluded.post_count,first_post_at=excluded.first_post_at,
              last_post_at=excluded.last_post_at,spacing_pattern=excluded.spacing_pattern,
              spacing_avg_min=excluded.spacing_avg_min,topic_tags=excluded.topic_tags,
              total_likes=excluded.total_likes,total_reposts=excluded.total_reposts,
              total_replies=excluded.total_replies,total_quotes=excluded.total_quotes,updated_at=datetime('now')`
        ).bind(t.thread_id, did, t.thread_id, t.n, t.f, t.l, spacingPattern, avgMin,
               JSON.stringify(tagText(allText)), t.lk, t.rp, t.rep, t.q).run();
      }
      const done = rows.length < BATCH;
      const mt = done ? ((await env.DB.prepare(`SELECT COUNT(*) c FROM threads WHERE actor_did=? AND post_count>1`).bind(did).first())?.c || 0) : null;
      return new Response(JSON.stringify({ ok:true, did, processed: rows.length, next_off: done?null:off+BATCH, done, multi_post_threads: mt }), { headers: { "content-type": "application/json" } });
    }
    if (url.pathname === "/__debug" && req.method === "GET") {
      if (url.searchParams.get("key") !== env.INGEST_KEY) return new Response("forbidden", { status: 403 });
      const root = url.searchParams.get("root") || "";
      const did = url.searchParams.get("did") || "";
      const out = {};
      out.posts_for_root = (await env.DB.prepare(`SELECT uri,thread_id,reply_root_uri,substr(text,1,40) t,created_at FROM posts WHERE thread_id=? ORDER BY created_at`).bind(root).all()).results || [];
      out.thread_row = await env.DB.prepare(`SELECT thread_id,post_count,spacing_pattern FROM threads WHERE thread_id=?`).bind(root).first();
      out.total_posts = (await env.DB.prepare(`SELECT COUNT(*) c FROM posts WHERE actor_did=?`).bind(did).first())?.c;
      out.multi_threads = (await env.DB.prepare(`SELECT COUNT(*) c FROM (SELECT thread_id FROM posts WHERE actor_did=? GROUP BY thread_id HAVING COUNT(*)>1)`).bind(did).first())?.c;
      out.text_len_sample = (await env.DB.prepare(`SELECT MAX(LENGTH(text)) mx, AVG(LENGTH(text)) av FROM posts WHERE actor_did=?`).bind(did).first());
      return new Response(JSON.stringify(out,null,2), { headers: { "content-type": "application/json" } });
    }
    if (url.pathname === "/__ingest_sync" && req.method === "POST") {
      if (url.searchParams.get("key") !== env.INGEST_KEY) return new Response("forbidden", { status: 403 });
      try {
        const report = await runIngest(env);
        return new Response(JSON.stringify({ ok: true, report }), { status: 200, headers: { "content-type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e), stack: String(e && e.stack || "") }), { status: 500, headers: { "content-type": "application/json" } });
      }
    }
    if (url.pathname === "/__ingest" && req.method === "POST") {
      // manual backfill trigger (protected by a secret query token)
      if (url.searchParams.get("key") !== env.INGEST_KEY) return new Response("forbidden", { status: 403 });
      const chain = url.searchParams.get("chain") === "1";
      const full = url.searchParams.get("full") === "1";
      ctx.waitUntil((async () => {
        try {
          await runIngest(env, { full });
          if (chain) {
            // if any actor still has unfinished feed paging, re-trigger self
            const more = await env.DB.prepare(
              `SELECT COUNT(*) c FROM ingest_runs WHERE status IN ('running','paused') AND cursor IS NOT NULL`
            ).first();
            const hotLeft = await env.DB.prepare(
              `SELECT COUNT(*) c FROM posts WHERE tier IN ('HOT','WARM') AND like_count>0 AND engagers_pulled IS NULL`
            ).first();
            if ((more?.c || 0) > 0 || (hotLeft?.c || 0) > 0) {
              const self = `${url.origin}/__ingest?key=${env.INGEST_KEY}&chain=1${full ? "&full=1" : ""}`;
              await fetch(self, { method: "POST" }).catch(() => {});
            }
          }
        } catch (e) { console.log("ingest err", String(e)); }
      })());
      return new Response(JSON.stringify({ started: true, chain }), { status: 202, headers: { "content-type": "application/json" } });
    }
    if (url.pathname === "/__retag" && req.method === "POST") {
      if (url.searchParams.get("key") !== env.INGEST_KEY) return new Response("forbidden", { status: 403 });
      const off = parseInt(url.searchParams.get("off") || "0", 10);
      const BATCH = 400;
      const rows = (await env.DB.prepare(
        `SELECT uri, text FROM posts ORDER BY rowid LIMIT ? OFFSET ?`).bind(BATCH, off).all()).results || [];
      let wrote = 0;
      if (rows.length) {
        const stmts = rows.map((r) =>
          env.DB.prepare(`UPDATE posts SET topic_tags=? WHERE uri=?`)
            .bind(JSON.stringify(tagText(r.text)), r.uri));
        const res = await env.DB.batch(stmts);
        wrote = res.reduce((a, x) => a + ((x.meta && x.meta.changes) || 0), 0);
      }
      const done = rows.length < BATCH;
      if (done) {
        // roll thread tags once posts are fully tagged
        let toff = 0;
        while (true) {
          const ths = (await env.DB.prepare(`SELECT thread_id FROM threads ORDER BY rowid LIMIT 200 OFFSET ?`).bind(toff).all()).results || [];
          if (!ths.length) break;
          const tstmts = [];
          for (const t of ths) {
            const ps = (await env.DB.prepare(`SELECT text FROM posts WHERE thread_id=?`).bind(t.thread_id).all()).results || [];
            tstmts.push(env.DB.prepare(`UPDATE threads SET topic_tags=? WHERE thread_id=?`)
              .bind(JSON.stringify(tagText(ps.map((x) => x.text).join(" "))), t.thread_id));
          }
          if (tstmts.length) await env.DB.batch(tstmts);
          toff += ths.length;
        }
        await tg(env, `\u{1F3F7}\uFE0F SkyLens re-tag complete: ${off + rows.length} posts tagged.`);
      } else {
        // chain next batch
        ctx.waitUntil(fetch(`${url.origin}/__retag?key=${env.INGEST_KEY}&off=${off + BATCH}`, { method: "POST" }).catch(() => {}));
      }
      return new Response(JSON.stringify({ retag: done ? "done" : "batch", off, read: rows.length, wrote }), { status: 202, headers: { "content-type": "application/json" } });
    }
    // SPA (inline, base64) — served for all non-API routes
    return new Response(decodeURIComponent(escape(atob(SPA_B64))), {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } });
  },
};