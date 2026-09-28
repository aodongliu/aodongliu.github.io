# Current human presentation asset

Updated 2026-09-21. The current simulation uses `redesign/athlete.glb` and `redesign/athlete-bind.json`.

- Source: [MakeHuman Community MPFB](https://github.com/makehumancommunity/mpfb2), commit `437dd513888a92399d1d3200d2e80859fae55abc`.
- The base human mesh and rig assets are **CC0 1.0**. The archived asset license is [MPFB-ASSETS-CC0.txt](redesign/MPFB-ASSETS-CC0.txt). The [upstream license explanation](redesign/MPFB-LICENSE.md) distinguishes CC0 assets/output from the GPL-licensed authoring software. The authoring software is not included in the browser payload.
- The project authors fitted this human to the analytical model's rest segments, reduced unused face controls, assigned opaque sportswear material regions, and exported a glTF skin. These are authored presentation choices, not a measured athlete reconstruction.
- Exact source and output hashes, source URLs, transformations, Blender version, and asset/license provenance are recorded in [manifest.json](redesign/manifest.json). The browser receives only the derived GLB, binding metadata, license notices, and manifest; the editable Blender file and raw biomechanics models remain in the reproducibility workspace.

The human is driven by the selected analytical replay. The current scenarios use a 75 mm wrist-to-bar station and were regenerated with corresponding motion, loads, and net joint moments. Runtime hand posing belongs to the presentation layer. It does not alter the recorded analysis, remove body geometry, or mask sections of the bar.

The separate [ATTRIBUTION.md](ATTRIBUTION.md), `reference-squat.glb`, and `QUATERNIUS-CC0.txt` preserve the previous Quaternius asset and its original documentation byte-for-byte. That historical documentation describes the earlier release. The original analytical replay remains available as a skeleton because its original 45 mm grip station does not match the current human presentation.

The analytical skeleton has its own [Catelli attribution and MIT notice](../analytical/ATTRIBUTION.md). No muscle-force, measured biomechanics, injury-risk, or coaching claim follows from either visual asset.
