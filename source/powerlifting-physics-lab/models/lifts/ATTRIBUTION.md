# Lift-model asset register

Captured 2026-08-30.

## Reference squat exterior

- Shipped file: `reference-squat.glb`
- Character: Quaternius **Universal Base Characters**, Standard edition,
  `Superhero_Male_FullBody`
- Official source: <https://quaternius.com/packs/universalbasecharacters.html>
- Licence: CC0 1.0; the upstream licence text is preserved in
  `QUATERNIUS-CC0.txt`
- Source character SHA-256:
  `a466828c67a4acc9b2413212ce6d9cde235e3aed9b675680c14fd9673858f118`
- Shipped animated GLB SHA-256:
  `ba342670cf16aec9b6b6ca3189504800d8e5fe97a0eb1e8769e8984902a25a4c`

The character was given an original, unweighted four-second squat animation in
Blender 4.4.1. The lower body was solved with planted-foot IK and forward knee
targets; the armature action was baked before glTF export. Diagnostic renders
were checked from true side and three-quarter cameras at standing, bottom, and
return positions. The exported GLB was re-imported and checked again at the
bottom frame for planted feet and intact skinning.

This is the Force Lab's motion-ready exterior shell, not an anatomical atlas or
measured athlete capture. It is display-only: retargeting the OpenSim body poses
onto this skin never changes the reported mechanics. The authored squat action
is retained as build provenance for the shared character asset, not as a
separate application mode or universal form prescription.
