---
name: image-to-3d
description: Convert a local reference image into a 3D mesh and polished Blender render, or render an existing mesh, using Blender Image Studio.
---

# Image to 3D with Blender

Use the `blender-image-studio` MCP tools for this workflow.

1. Call `get_status` before the first generation in a conversation. Explain any missing setup item plainly.
2. For a reference image, call `image_to_3d_and_render`. Use `studio` unless the user asks for a product or dramatic look.
3. For OBJ, GLB, GLTF, FBX, STL, or PLY input, skip reconstruction and call `render_model`.
4. Return the mesh, Blender project, and PNG render paths. Show the render when the host supports local image display.

## Input guidance

The best input shows one isolated object, centered, fully visible, with a plain or transparent background. A single image cannot reveal hidden surfaces, so describe the result as an AI reconstruction rather than an exact scan. Do not imply dimensional accuracy.

## Quality and resource guidance

- Default to `mc_resolution: 192` and `chunk_size: 4096` on 6 GB VRAM.
- Raise marching-cubes resolution only when the user asks for more geometric detail and understands the memory cost.
- TripoSR produces vertex-colored geometry by default. Do not enable texture baking unless the local installation has been tested for it.
- Keep the editable `.blend` file so the user can refine geometry, materials, camera, and lighting.
