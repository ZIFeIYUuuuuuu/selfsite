# 4175 design on the production site

The frontend contains the approved Life/Work design from the local 4175 preview:
ZFY opening animation, photo reveal, project and note interactions, the Life note
dated 2026-05-03, unified navigation transitions, and pure white/black surfaces.
The backend, guestbook data, music directory, environment files and private contact
images remain deployment-owned.

## Reproducible release

The `Build frontend release` workflow builds on Linux with Node 22.22.2 and locked
Next.js 15.5.19, matching the production runtime. It records the build identity and
manifest checksums with `scripts/verify-build.cjs`. The artifact contains source,
the complete build and Linux dependencies. It contains no environment files or
private contact assets. Production uses `.next`; local development uses
`.next-development`. The `.selfsite-production` marker prevents builds in a live
runtime directory.

## Deployment

1. Merge the reviewed source into GitHub main and use the artifact for that commit.
2. Back up the existing frontend runtime, service configuration and Git changes.
3. Extract into a new release directory on the server. Restore deployment-owned
   contact assets and frontend environment configuration from the existing runtime.
4. Run the preflight with the production Node binary:
   `node scripts/verify-build.cjs RELEASE/frontend .next`.
5. Start a temporary systemd preview bound to loopback, verify pages, API forwarding
   and image optimization, then stop that preview.
6. Stop `selfsite-frontend.service`, retain the previous frontend directory, move
   the verified release into `/opt/selfsite/frontend`, and start the same service.
7. Verify port 3000 and `https://zifeiyu.cc/`, including opening animation, modes,
   note navigation and key images.

## Rollback

Stop `selfsite-frontend.service`, move the failed frontend aside, restore the retained
previous frontend directory to `/opt/selfsite/frontend`, verify its release stamp,
and start the service. Keep the backend and its data untouched throughout.
