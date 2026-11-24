#!/usr/bin/env node
// serve.mjs serves one prototype folder on this laptop only (127.0.0.1), and keeps running after the session ends.
//   node serve.mjs <folder> --info <server.json> [--port 4400]   start, or reuse the server already running for it
//   node serve.mjs --stop --info <server.json>                     stop it
// Every answer is sent with no-store, so a page is never stale. An HTML page gets a small script that reloads it
// when a file in the folder changes. It prints "ok serving <folder> at <url> (pid <n>)" when the link opens.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".woff": "font/woff", ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8" };
const SKIP = new Set(["node_modules", ".git", "loop-runs", ".claude"]);
const RELOAD = `<script>(()=>{let v=null;setInterval(async()=>{try{const r=await fetch("/__changed",{cache:"no-store"});const t=await r.text();if(v!==null&&t!==v)location.reload();v=t;}catch{}},1500);})();</script>`;

function args(argv) {
  const out = { folder: null, info: null, port: 4400, stop: false, child: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--info") out.info = path.resolve(argv[++i]);
    else if (argv[i] === "--port") out.port = Number(argv[++i]);
    else if (argv[i] === "--stop") out.stop = true;
    else if (argv[i] === "--child") out.child = true;
    else out.folder = path.resolve(argv[i]);
  }
  return out;
}

/** The newest change time of any file in the folder, so a page can tell it must reload. */
function newest(dir, depth = 0) {
  let best = 0;
  if (depth > 4) return best;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) best = Math.max(best, newest(full, depth + 1));
    else best = Math.max(best, fs.statSync(full).mtimeMs);
  }
  return best;
}

function serveFolder(folder, firstPort, info) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    res.setHeader("Cache-Control", "no-store");
    if (url.pathname === "/__changed") { res.end(String(newest(folder))); return; }
    let file = path.join(folder, decodeURIComponent(url.pathname));
    if (!file.startsWith(folder)) { res.statusCode = 403; res.end("no"); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) { res.statusCode = 404; res.end("not found"); return; }
    const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    res.setHeader("Content-Type", type);
    let body = fs.readFileSync(file);
    if (type.startsWith("text/html")) {
      const text = body.toString("utf8");
      body = Buffer.from(text.includes("</body>") ? text.replace("</body>", `${RELOAD}</body>`) : text + RELOAD);
    }
    res.end(body);
  });
  let port = firstPort;
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < firstPort + 50) { port++; server.listen(port, "127.0.0.1"); return; }
    console.error(`serve: ${error.message}`);
    process.exit(1);
  });
  server.on("listening", () => {
    fs.writeFileSync(info, `${JSON.stringify({ url: `http://127.0.0.1:${port}/`, pid: process.pid, folder, startedAt: new Date().toISOString() }, null, 2)}\n`);
  });
  server.listen(port, "127.0.0.1");
}

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
const readInfo = (file) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; } };
async function opens(url) {
  try { const res = await fetch(url, { cache: "no-store" }); return res.ok; } catch { return false; }
}

async function main() {
  const options = args(process.argv.slice(2));
  if (!options.info) { console.error("Usage: node serve.mjs <folder> --info <server.json> [--port 4400] | --stop --info <server.json>"); return 2; }
  if (options.child) { serveFolder(options.folder, options.port, options.info); return null; }
  const old = readInfo(options.info);
  if (options.stop) {
    if (old && alive(old.pid)) process.kill(old.pid);
    console.log(`ok stopped ${old?.url ?? "(no server was running)"}`);
    return 0;
  }
  if (!options.folder || !fs.existsSync(path.join(options.folder, "index.html"))) {
    console.error(`serve: ${options.folder ?? "(no folder)"} has no index.html. Write one first.`);
    return 1;
  }
  if (old && old.folder === options.folder && alive(old.pid) && await opens(old.url)) {
    console.log(`ok serving ${old.folder} at ${old.url} (pid ${old.pid}, reused)`);
    return 0;
  }
  fs.rmSync(options.info, { force: true });
  const log = fs.openSync(`${options.info.replace(/\.json$/u, "")}.log`, "a");
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), options.folder, "--info", options.info, "--port", String(options.port), "--child"],
    { detached: true, stdio: ["ignore", log, log] });
  child.unref();
  for (let i = 0; i < 50; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const info = readInfo(options.info);
    if (info && await opens(info.url)) { console.log(`ok serving ${info.folder} at ${info.url} (pid ${info.pid})`); return 0; }
  }
  console.error("serve: the server did not answer within 5 seconds. See the .log file next to the info file.");
  return 1;
}

main().then((code) => { if (code !== null) process.exit(code); });
