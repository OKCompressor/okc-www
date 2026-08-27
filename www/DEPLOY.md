# DEPLOY / launch checklist

This bundle is intentionally host-agnostic static HTML.

## Before upload
1. Verify `blue@okcompressor.com` receives general mail and `green@okcompressor.com` receives the private-research route.
2. Verify Proton plus-routing for:
   - green+product@
   - green+licensing@
   - green+funding@
   - green+collab@
   - green+research@
3. Export **public** PGP key for the base address only and optionally place it at `assets/okc-green-public.asc`.
4. Add public-key fingerprint to `contact.html`.
5. Replace source-licence mail buttons with Payhip/Stripe links only after packages and licence text exist.
6. Never place private source, private keys, customer material or unreleased research in this static bundle.

## Artifact hosting
Keep large binaries/releases separate from the site. Mirror hashes and version numbers on the product page. The static site can link to a release host, source mirror or hosted checkout.

## Local preview
`python3 -m http.server 8000 --bind 127.0.0.1`


## Release-state update
Edit `assets/releases.json` directly or use the non-public helper in `../ops/release.py`.

Example after publishing zRank:
```bash
cd ../ops
./release.py zrank   --status released   --version 0.1.0   --primary 'https://github.com/OKCompressor/artifacts/releases/download/zrank-v0.1.0/zrank-v0.1.0-linux-x86_64.tar.zst'   --mirror 'SourceForge=https://sourceforge.net/...'
```

Deploy only the `www/` directory. Keep `ops/` local.


## OCK Rotor prerelease media

Before deploying the OCK Rotor page, populate:

```text
assets/media/ock-readme-roundtrip.webm
assets/media/ock-readme-roundtrip.gif
```

The generated media belongs in the WWW bundle; the raw sampled PNG frames do not.
The Rotor release manifest now points to the public `OKCompressor/ock-rotor` v0.4.0 release, with `core/drops` retained as the public artifact ledger/mirror.
