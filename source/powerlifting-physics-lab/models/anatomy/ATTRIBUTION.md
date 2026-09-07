# Anatomy asset register

Captured 2026-08-30. The four `z-anatomy-*.glb` files in this directory are the
static layers mounted by the anatomy viewer. The previous procedural lift scene
is not mounted.

## Z-Anatomy derivatives shipped here

Source: [Z-Anatomy FBX layers](https://github.com/LluisV/Z-Anatomy/tree/PC-Version/Resources/Models/FBX),
branch `PC-Version`. Z-Anatomy is licensed [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
The project credits the underlying BodyParts3D data set as “BodyParts3D - The
Database Center for Life Science - CC-BY-SA 2.1 Japan”; see the upstream
[license and attribution register](https://github.com/Z-Anatomy/Models-of-human-anatomy#license).

| Shipped file | Upstream layer | FBX source size | GLB size | Source blob |
| --- | --- | ---: | ---: | --- |
| `z-anatomy-joints.glb` | `Joints100.fbx` | 9,804,796 B | 1,667,312 B | [`9db06d2`](https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/FBX/Joints100.fbx) |
| `z-anatomy-skeleton.glb` | `SkeletalSystem100.fbx` | 41,339,660 B | 6,966,956 B | [`7c62e45`](https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/FBX/SkeletalSystem100.fbx) |
| `z-anatomy-muscles.glb` | `MuscularSystem100.fbx` | 37,343,180 B | 5,194,944 B | [`2477e1b`](https://github.com/LluisV/Z-Anatomy/blob/PC-Version/Resources/Models/FBX/MuscularSystem100.fbx) |
| `z-anatomy-regions.ao.glb` | `Regions of human body100.fbx` | — | 334,800 B | [Open Twin XR conversion](https://github.com/Opening-Science/open-twin-xr) |

Conversion record:

- Blender 4.4.1 FBX importer and glTF 2.0 exporter.
- The joint and skeleton exports were rebuilt at full source mesh resolution
  (no decimation) and exported as GLB with Draco compression level 6. This
  avoids thin-ray artifacts from simplifying small anatomical structures.
  Empty FBX guide meshes were omitted by the exporter. The muscle export was
  subsequently rebuilt at full source mesh resolution as well.
- SHA-256: `z-anatomy-joints.glb`
  `be063c27e6cbd7a34ef20a80e867399222845202b3a7c949b764b5b2c77b4933`;
  `z-anatomy-skeleton.glb`
  `0cfea51f73be606863b969d5083b7604557eb5fc92d85150de826abed677980f`;
  `z-anatomy-muscles.glb`
  `98d94609e9d6e59ee37710f34dbcd9ccb8c85dff5efc8ae9464d689ca5fca6f2`;
  `z-anatomy-regions.ao.glb`
  `074cc6aea0d482e39175caadae3af2b4f87b63e5f5fef2ef15cfc3fd2b269c28`.

The Z-Anatomy layers are static atlas geometry, not a rig. They are normalized
to one standing height at runtime and are intentionally not connected to the
preserved lift pose solver. Decimation improves web payload size but is not a
scientific validation of the anatomical surfaces.

## Exterior-shell candidates

- **MakeHuman / MPFB:** MakeHuman's bundled graphical assets are CC0 1.0,
  and the project states that output exported by an official, unmodified
  MakeHuman build is CC0. The application source is AGPL; that source license
  does not turn exported character data into AGPL. Third-party community
  assets must be checked separately. Source: [MakeHuman license](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md).
- **Quaternius Universal Base Characters:** the official page describes a
  rigged, animation-friendly exterior shell, averaging 13k triangles, with
  FBX and glTF formats under CC0. The free Standard download is listed as
  122 MB (the Source package is 600 MB). Source: [official pack page](https://quaternius.com/packs/universalbasecharacters.html)
  and [download page](https://quaternius.itch.io/universal-base-characters/purchase).

No Quaternius or MakeHuman archive is shipped. The current exterior is the
Z-Anatomy surface-region layer, which is registered to the same standing atlas
as the muscles, skeleton, and joints.

## Do not ship blindly

The unused merged all-system `z-anatomy.ao.glb` was removed because it included
organ-system components under additional CC BY-NC / CC BY-NC-SA terms. The
surface-regions file is a separate Z-Anatomy CC BY-SA 4.0 work and does not
contain those organ components. Keep source-specific credits and licence scope
attached to every derivative.
