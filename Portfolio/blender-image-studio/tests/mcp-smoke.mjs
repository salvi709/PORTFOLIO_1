import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const child = spawn(process.execPath, [resolve(root, "server", "index.mjs")], { stdio: ["pipe", "pipe", "inherit"], windowsHide: true });
const output = createInterface({ input: child.stdout });
const responses = [];
output.on("line", (line) => {
  responses.push(JSON.parse(line));
  if (responses.length === 3) {
    const toolNames = responses[1].result.tools.map((tool) => tool.name);
    if (!toolNames.includes("image_to_3d_and_render")) throw new Error("Pipeline tool is missing");
    const status = JSON.parse(responses[2].result.content[0].text);
    if (!status.blender) throw new Error("Status response is malformed");
    console.log(`MCP smoke test passed (${toolNames.length} tools, Blender installed: ${status.blender.installed}).`);
    child.kill();
  }
});

child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } })}\n`);
child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })}\n`);
child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_status", arguments: {} } })}\n`);

setTimeout(() => {
  if (responses.length < 3) {
    child.kill();
    throw new Error("Timed out waiting for MCP responses");
  }
}, 5000);
