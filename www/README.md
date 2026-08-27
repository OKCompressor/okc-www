# OKC static launch bundle

One static site: artifact shelf + public research trail + funding/licensing/contact routing.

## New launch surfaces
- `index.html` — long-scroll artifact-first homepage.
- `products/zrank.html` — zRank `.zrk`.
- `products/doe.html` — doe `.doe`, working-note presentation.
- `products/pongo.html` — Pongo `.pong`, reversible visual experiment.
- `products/zxsynth.html` — ZXSynth `.zxs`, reversible sonic experiment.
- `research/working-note-001.html` — deliberately unfinished public research note.
- `lab/restricted.html` — defensive Unicode inspection + queued Rubik/rotor toys.
- `contact.html` — base identity + plus-routed intent.
- `support.html` — freeware/source/commercial/research boundary.
- `HANDOFF.md` — low-contact fixed-scope brief for an external visual finisher.
- `DEPLOY.md` — launch checklist.

Existing Rare1 and tools pages are retained.

## Philosophy
Runnable proof first. Freeware can be free without making source or commercial rights free. Private research and commercial integration stay separate from the public proof trail.

## Local preview
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```


## Release manifest
`assets/releases.json` drives public status, versions, primary downloads, mirrors, and source links.

Static HTML stays as a fallback if the manifest cannot load.

The private/operator helper lives outside the deployable `www/` directory in this bundle:
`../ops/release.py`.

## Licensing
Central boundary: `licensing.html`.
Current public text: `licenses/LNCL-1.1.md`.
Canonical upstream: `https://github.com/OKCompressor/core/blob/main/docs/LICENSE.md`.
The older `licenses/LNCL-0.1-DRAFT.txt` is retained only as historical draft material.

## Public-core boundary
The launch describes released/public OKC work first.
Future intelligence branches stay unnamed until a public artifact/spec justifies them.
Do not publish device or capability claims ahead of evidence.


Current drop addition: `products/ock-rotor.html` + `assets/releases.json#ockrotor`.
