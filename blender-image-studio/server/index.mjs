import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(serverDir, "..");
const configPath = join(pluginRoot, "config.json");

function readConfig() {
  let fileConfig = {};
  if (existsSync(configPath)) {
    fileConfig = JSON.parse(readFileSync(configPath, "utf8"));
  }
  const pathFromRoot = (value, fallback) => {
    const selected = value || fallback;
    return isAbsolute(selected) ? selected : resolve(pluginRoot, selected);
  };
  const blenderCandidates = [
    process.env.BLENDER_IMAGE_STUDIO_BLENDER,
    fileConfig.blenderPath,
    "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
  ].filter(Boolean);
  return {
    blenderPath: blenderCandidates.find((candidate) => existsSync(candidate)) || blenderCandidates[0] || "blender",
    pythonPath: pathFromRoot(process.env.BLENDER_IMAGE_STUDIO_PYTHON || fileConfig.pythonPath, ".venv\\Scripts\\python.exe"),
    triposrRoot: pathFromRoot(process.env.BLENDER_IMAGE_STUDIO_TRIPOSR || fileConfig.triposrRoot, "vendor\\TripoSR"),
  };
}

const tools = [
  {
    name: "get_status",
    description: "Check whether Blender and the local TripoSR image-to-3D backend are installed and ready.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "image_to_3d",
    description: "Convert one local reference image into a GLB mesh with the local TripoSR model.",
    inputSchema: {
      type: "object",
      required: ["image_path", "output_dir"],
      additionalProperties: false,
      properties: {
        image_path: { type: "string", description: "Absolute path to a PNG, JPG, JPEG, or WebP reference image." },
        output_dir: { type: "string", description: "Absolute directory where generated files will be written." },
        mc_resolution: { type: "integer", minimum: 128, maximum: 320, default: 192 },
        chunk_size: { type: "integer", minimum: 512, maximum: 16384, default: 4096 },
      },
    },
  },
  {
    name: "render_model",
    description: "Import an existing mesh into Blender, create lighting and camera, and save a PNG render plus editable .blend file.",
    inputSchema: {
      type: "object",
      required: ["mesh_path", "output_dir"],
      additionalProperties: false,
      properties: {
        mesh_path: { type: "string", description: "Absolute path to an OBJ, GLB, GLTF, FBX, STL, or PLY mesh." },
        output_dir: { type: "string", description: "Absolute directory for the PNG and .blend output." },
        style: { type: "string", enum: ["studio", "product", "dramatic"], default: "studio" },
        resolution: { type: "integer", minimum: 256, maximum: 2048, default: 768 },
        transparent_background: { type: "boolean", default: false },
      },
    },
  },
  {
    name: "image_to_3d_and_render",
    description: "Run the full local workflow: reconstruct a mesh from an image, import it into Blender, and save a polished render and editable project.",
    inputSchema: {
      type: "object",
      required: ["image_path", "output_dir"],
      additionalProperties: false,
      properties: {
        image_path: { type: "string", description: "Absolute path to a PNG, JPG, JPEG, or WebP reference image." },
        output_dir: { type: "string", description: "Absolute directory where all generated files will be written." },
        style: { type: "string", enum: ["studio", "product", "dramatic"], default: "studio" },
        resolution: { type: "integer", minimum: 256, maximum: 2048, default: 768 },
        transparent_background: { type: "boolean", default: false },
        mc_resolution: { type: "integer", minimum: 128, maximum: 320, default: 192 },
        chunk_size: { type: "integer", minimum: 512, maximum: 16384, default: 4096 },
      },
    },
  },
];

function requireExistingFile(path, allowedExtensions, label) {
  if (!path || !isAbsolute(path)) throw new Error(`${label} must be an absolute path.`);
  if (!existsSync(path)) throw new Error(`${label} does not exist: ${path}`);
  const extension = extname(path).toLowerCase();
  if (!allowedExtensions.includes(extension)) throw new Error(`${label} must use one of: ${allowedExtensions.join(", ")}`);
  return resolve(path);
}

function requireOutputDirectory(path) {
  if (!path || !isAbsolute(path)) throw new Error("output_dir must be an absolute path.");
  const result = resolve(path);
  mkdirSync(result, { recursive: true });
  return result;
}

function runProcess(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || pluginRoot,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout = (stdout + chunk).slice(-12000); });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-12000); });
    child.on("error", (error) => reject(new Error(`Could not start ${command}: ${error.message}`)));
    child.on("close", (code) => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else reject(new Error(`${command} exited with code ${code}.\n${stderr || stdout}`));
    });
  });
}

function getStatus() {
  const config = readConfig();
  const triposrRun = join(config.triposrRoot, "run.py");
  const status = {
    ready: existsSync(config.blenderPath) && existsSync(config.pythonPath) && existsSync(triposrRun),
    blender: { path: config.blenderPath, installed: existsSync(config.blenderPath) },
    python: { path: config.pythonPath, installed: existsSync(config.pythonPath) },
    triposr: { path: config.triposrRoot, installed: existsSync(triposrRun) },
    setupCommand: `powershell -ExecutionPolicy Bypass -File "${join(pluginRoot, "scripts", "setup-local.ps1")}"`,
  };
  return status;
}

async function generateMesh(args) {
  const config = readConfig();
  const imagePath = requireExistingFile(args.image_path, [".png", ".jpg", ".jpeg", ".webp"], "image_path");
  const outputDir = requireOutputDirectory(args.output_dir);
  const runScript = join(config.triposrRoot, "run.py");
  if (!existsSync(config.pythonPath) || !existsSync(runScript)) {
    throw new Error(`TripoSR is not installed. Run: powershell -ExecutionPolicy Bypass -File "${join(pluginRoot, "scripts", "setup-local.ps1")}"`);
  }
  const stageDir = join(outputDir, "reconstruction");
  mkdirSync(stageDir, { recursive: true });
  await runProcess(config.pythonPath, [
    runScript,
    imagePath,
    "--device", "cuda:0",
    "--chunk-size", String(args.chunk_size || 4096),
    "--mc-resolution", String(args.mc_resolution || 192),
    "--output-dir", stageDir,
    "--model-save-format", "glb",
  ], { cwd: config.triposrRoot });
  const meshPath = join(stageDir, "0", "mesh.glb");
  if (!existsSync(meshPath)) throw new Error(`TripoSR finished but did not create ${meshPath}`);
  return { meshPath, imagePath, outputDir };
}

async function renderMesh(args) {
  const config = readConfig();
  const meshPath = requireExistingFile(args.mesh_path, [".obj", ".glb", ".gltf", ".fbx", ".stl", ".ply"], "mesh_path");
  const outputDir = requireOutputDirectory(args.output_dir);
  if (!existsSync(config.blenderPath)) throw new Error(`Blender was not found at ${config.blenderPath}. Update config.json.`);
  const renderPath = join(outputDir, "render.png");
  const blendPath = join(outputDir, "scene.blend");
  const blenderScript = join(pluginRoot, "scripts", "blender_render.py");
  const blenderArgs = [
    "--background",
    "--python", blenderScript,
    "--",
    "--mesh", meshPath,
    "--render", renderPath,
    "--blend", blendPath,
    "--style", args.style || "studio",
    "--resolution", String(args.resolution || 768),
  ];
  if (args.transparent_background) blenderArgs.push("--transparent");
  await runProcess(config.blenderPath, blenderArgs);
  if (!existsSync(renderPath) || !existsSync(blendPath)) throw new Error("Blender finished without creating the expected outputs.");
  return { meshPath, renderPath, blendPath, outputDir };
}

async function callTool(name, args = {}) {
  if (name === "get_status") return getStatus();
  if (name === "image_to_3d") return generateMesh(args);
  if (name === "render_model") return renderMesh(args);
  if (name === "image_to_3d_and_render") {
    const generated = await generateMesh(args);
    return renderMesh({ ...args, mesh_path: generated.meshPath });
  }
  throw new Error(`Unknown tool: ${name}`);
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", async (line) => {
  if (!line.trim()) return;
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }
  if (request.id === undefined) return;
  try {
    let result;
    if (request.method === "initialize") {
      result = {
        protocolVersion: request.params?.protocolVersion || "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "blender-image-studio", version: "0.1.0" },
        instructions: "Use get_status first, then image_to_3d_and_render for a reference image or render_model for an existing mesh.",
      };
    } else if (request.method === "ping") {
      result = {};
    } else if (request.method === "tools/list") {
      result = { tools };
    } else if (request.method === "tools/call") {
      try {
        const data = await callTool(request.params?.name, request.params?.arguments || {});
        result = { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        result = { isError: true, content: [{ type: "text", text: error.message }] };
      }
    } else {
      throw Object.assign(new Error(`Method not found: ${request.method}`), { code: -32601 });
    }
    send({ jsonrpc: "2.0", id: request.id, result });
  } catch (error) {
    send({ jsonrpc: "2.0", id: request.id, error: { code: error.code || -32603, message: error.message } });
  }
});
