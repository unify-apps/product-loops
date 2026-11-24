#!/usr/bin/env node
// serve.mjs serves a folder of plain HTML, CSS and JS on localhost, in the background, so the prototype has a link.
//   node serve.mjs start --dir <folder> --state <server.json> [--port 4100]    starts it, or reuses the one in server.json
//   node serve.mjs stop --state <server.json>                                  stops the server that start made
// It only reads files under --dir, and only answers on 127.0.0.1. It writes only the --state file and a log beside it.
// Pages are sent with no-store, so a reload always shows the latest edit.
import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const FIRST_PORT = 4100; // away from the 3000, 5173 and 8080 that dev tools take by default
const PORTS_TO_TRY = 50; // enough to find a free one on a busy laptop
const READY_WAIT_MS = 5000; // a static server answers in well under a second; 5 s covers a slow start
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".mp4": "video/mp4", ".txt": "text/plain; charset=utf-8" };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (message) => { console.error(`serve: ${message}`); process.exit(1); };

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 2) options[rest[i].replace(/^--/u, "")] = rest[i + 1];
  return { command, options };
}

const portFree = (port) => new Promise((resolve) => {
  const probe = net.createServer().once("error", () => resolve(false)).once("listening", () => probe.close(() => resolve(true)));
  probe.listen(port, "127.0.0.1");
});

async function answers(url) {
  try { return (await fetch(url, { signal: AbortSignal.timeout(1500) })).status; } catch { return 0; }
}

function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }

function serveFolder(dir, port) {
  const root = fs.realpathSync(dir);
  http.createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(root)) { res.writeHead(403).end("outside the folder"); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) && req.url === "/favicon.ico") { res.writeHead(204).end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404, { "content-type": "text/plain" }).end(`not found: ${req.url}`); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(file).pipe(res);
  }).listen(port, "127.0.0.1");
}

async function start({ dir, state, port }) {
  if (!dir || !state) fail("start needs --dir <folder> and --state <server.json>.");
  if (!fs.existsSync(dir)) fail(`no folder ${dir}`);
  const stateFile = path.resolve(state);
  try {
    const old = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    if (old.dir === fs.realpathSync(dir) && alive(old.pid) && (await answers(old.url)) === 200) { console.log(`ok reuse ${old.url} (pid ${old.pid})`); return; }
  } catch { /* no server yet */ }
  let chosen = null;
  for (let p = Number(port ?? FIRST_PORT); p < Number(port ?? FIRST_PORT) + PORTS_TO_TRY; p++) if (await portFree(p)) { chosen = p; break; }
  if (!chosen) fail(`no free port from ${port ?? FIRST_PORT}`);
  const log = stateFile.replace(/\.json$/u, "") + ".log";
  const out = fs.openSync(log, "a");
  // Detached, with its output in a file and not in this process, so the command that started it returns at once.
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "run", "--dir", dir, "--port", String(chosen)], { detached: true, stdio: ["ignore", out, out] });
  child.unref();
  const url = `http://localhost:${chosen}/`;
  const until = Date.now() + READY_WAIT_MS;
  let status = 0;
  while (Date.now() < until && status !== 200) { await sleep(150); status = await answers(url); }
  if (status !== 200) fail(`the server did not answer 200 at ${url} (got ${status}); see ${log}`);
  fs.writeFileSync(stateFile, `${JSON.stringify({ url, pid: child.pid, dir: fs.realpathSync(dir), log, startedAt: new Date().toISOString() }, null, 2)}\n`);
  console.log(`ok started ${url} (pid ${child.pid}); stop it with: node "${fileURLToPath(import.meta.url)}" stop --state "${stateFile}"`);
}

function stop({ state }) {
  if (!state) fail("stop needs --state <server.json>.");
  let old;
  try { old = JSON.parse(fs.readFileSync(state, "utf8")); } catch { fail(`no server state in ${state}`); }
  if (alive(old.pid)) process.kill(old.pid);
  console.log(`ok stopped ${old.url} (pid ${old.pid})`);
}

const { command, options } = parseArgs(process.argv.slice(2));
if (command === "run") serveFolder(options.dir, Number(options.port));
else if (command === "start") start(options);
else if (command === "stop") stop(options);
else fail("usage: serve.mjs start --dir <folder> --state <server.json> [--port 4100] | stop --state <server.json>");
