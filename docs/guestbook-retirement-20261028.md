# Guestbook and music retirement — 2026-10-28

The owner requested removal of the guestbook from the personal website.

- Removed the guestbook, moderation pages and their UI components.
- Removed both navigation references; /about now redirects to /#about.
- The loopback compatibility backend now serves health only, returns 410 for all guestbook API methods and never opens SQLite or creates guestbook cookies.
- Include deploy/nginx/retired-features.conf in the HTTPS server after removing the previous guestbook review location. Caddy deployments also return 410.
- Back up the database with SQLite backup before rollout. Retain it privately; do not delete historical messages or expose database backups through HTTP.
- Stop the old guestbook backup timer after the final archive and retain its configuration in the private deployment backup.
- The owner subsequently requested audio removal too: removed music UI, playback/list APIs, filesystem helpers, public configuration, Docker volume mount and outdated descriptions. Original music files remain private and archived.
