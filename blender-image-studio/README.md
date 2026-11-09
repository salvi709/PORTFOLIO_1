# Blender Image Studio

Blender Image Studio is a local Codex/ChatGPT plugin that turns one reference image into a TripoSR mesh, builds a polished Blender scene, and saves:

- `reconstruction/0/mesh.glb` — generated mesh
- `scene.blend` — editable Blender project
- `render.png` — final render

## Why TripoSR

The default configuration is tuned for a 6 GB NVIDIA GPU. It uses a conservative marching-cubes resolution of 192 and a chunk size of 4096. A single image cannot reveal hidden geometry, so the output is an AI reconstruction rather than a dimensionally exact scan.

## One-time local setup

1. Install 64-bit Python 3.11 from python.org.
2. Run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\setup-local.ps1
   ```

3. The first generation downloads the TripoSR model weights.

To use another Blender or Python location, copy `config.example.json` to `config.json` and edit the paths.

## Tools

- `get_status` checks Blender, Python, and TripoSR.
- `image_to_3d` generates a GLB mesh.
- `render_model` renders an existing mesh in Blender.
- `image_to_3d_and_render` runs the full workflow.

Supported reference images: PNG, JPG, JPEG, WebP. Supported meshes: OBJ, GLB, GLTF, FBX, STL, PLY.

## Development check

Run `node tests/mcp-smoke.mjs` to verify MCP startup and tool discovery without downloading the AI model.
