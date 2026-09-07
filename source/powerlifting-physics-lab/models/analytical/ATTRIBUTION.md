# Catelli v4 analytical skeleton attribution

`catelli-v4-skeleton.glb` is a display-only conversion of the bone geometry
distributed with the **Full-body Squat Model** on SimTK.

- Source: <https://simtk.org/projects/high-hip-flex>
- SimTK project/group: `high-hip-flex` / `1415`
- Source package/file: `Catelli_high_hip_flexion_V4.0.zip` / `5815`
- Source-package SHA-256: `8cc79a4ac9b7bcd5bc4ddf205f4325483313111e17ce2ddbc64a109f8289431e`
- Source model SHA-256: `2bdaaf92fdbae963405c4859ab4e8d4870899853e83b163a9c21d76098ad1bfb`
- Converted GLB SHA-256: `00a8d37b5a3d100dfedd697a0603b4852902397659c47b43afa6ae274b13ef89`
- License: MIT; the required copyright and permission notice is preserved in
  [`LICENSE.txt`](./LICENSE.txt).

The source page was rechecked on 2026-09-07. Its `package2039` license record
identifies the package as **MIT Use Agreement** and supplies the notice copied
verbatim into `LICENSE.txt`.

## Conversion

The project-authored converter reads the marker-enabled Catelli v4 OpenSim
model and its 81 VTP geometry files, applies the model-declared mesh scale
factors, writes an ordinary binary glTF (`.glb`), and groups the surfaces under
named OpenSim body nodes. It fails if a mesh is not attached directly to its
parent body frame because such an asset would require an unimplemented offset
transform. The conversion changes file format and render organization; it does
not turn the display mesh into a separate force model. Exact body/mesh counts
and transformation metadata are recorded in
[`catelli-v4-skeleton.manifest.json`](./catelli-v4-skeleton.manifest.json).

The analytical mesh is used only to visualize poses calculated from the
simulation bundles. It does not validate the authored lift kinematics, imply
measured athlete data, or support muscle-force, joint-contact, injury-risk, or
coaching claims.

## Citation

Catelli DS, Wesseling M, Jonkers I, Lamontagne M. *A musculoskeletal model
customized for squatting task.* Computer Methods in Biomechanics and Biomedical
Engineering. 2019;22(1):21–24. <https://doi.org/10.1080/10255842.2018.1523396>

The SimTK description and source-model credits identify this as a derivative of
the Rajagopal 2016 full-body model and Lai/Arnold 2017 high-flexion update; that
lineage is preserved here and does not imply endorsement by the authors or
institutions.
