#!/usr/bin/env node
// page-check.mjs opens the screens of a prototype in a headless browser and writes what it saw. Claude runs it.
//   node page-check.mjs browser | capture | compare | click | eval  (run `node page-check.mjs help` for the options)
// It reads pages and writes only under the --out folder it is given. It never changes the prototype.
// It needs Node 22 or newer and Chrome, Chromium, Edge or Brave on this computer. With no browser, `capture`
// falls back to the page source as text (no screenshot, no layout) and says so; `click` and `eval` then refuse.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HELP = `page-check.mjs: look at a prototype's screens the way a person would.

  browser                                       prints the browser it will use, or "none"
  capture --screens <screens.json> --out <dir> [--width 1440] [--only a,b]
                                                per screen: <name>.png, <name>.txt (page text), <name>.layout.json;
                                                and summary.json with errors per screen
  compare --before <dir> --after <dir> --out <file.md> [--explained a,b]
                                                per screen: text lines added and removed, boxes that moved, new errors.
                                                A screen that changed and is not in --explained is marked UNEXPECTED.
  click   --screens <screens.json> --screen <name> --target "<css selector>" | --text "<visible text>"
                                                clicks one thing and says what changed. "dead" means nothing changed.
  eval    --screens <screens.json> --screen <name> --js "<expression>"
                                                prints the value of a JavaScript expression on that screen, as JSON

screens.json: { "screens": [ { "name": "requests", "url": "http://localhost:4100/#requests", "open": null } ] }
"open" is optional JavaScript run after the page loads, for a screen with no URL of its own
(for example: "document.querySelector('[data-nav=settings]').click()").
Exit codes: 0 ok, 1 a check failed or a refusal, 3 no browser for a command that needs one.`;

const WAIT_AFTER_LOAD_MS = 500; // long enough for a small prototype's first draw and short entrance animations
const WAIT_AFTER_CLICK_MS = 600; // a click that opens a panel or changes the route has drawn by then
const MOVE_PX = 1; // a box that moved by 1px or less is rounding, not a change
const MAX_SHOT_HEIGHT = 6000; // a taller screenshot is too big to read and to compare
const LIST_LIMIT = 12; // how many changed lines or moved boxes a compare shows per screen
const SECOND_SHOT_MS = 800; // a screen whose screenshot differs after this long moves on its own (a clock, an animation)

class Refusal extends Error { constructor(message, code = 1) { super(message); this.code = code; } }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith("--")) throw new Refusal(`Unexpected "${rest[i]}". Options start with --.`);
    if (rest[i + 1] === undefined) throw new Refusal(`${rest[i]} needs a value.`);
    options[rest[i].slice(2)] = rest[++i];
  }
  return { command, options };
}

const need = (options, name) => {
  if (!options[name]) throw new Refusal(`--${name} is required. Run help to see the options.`);
  return options[name];
};

export function findBrowser(env = process.env) {
  const mac = ["Google Chrome", "Chromium", "Microsoft Edge", "Brave Browser", "Google Chrome Canary"]
    .map((app) => `/Applications/${app}.app/Contents/MacOS/${app}`);
  const linux = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "brave-browser"]
    .flatMap((name) => (env.PATH ?? "").split(path.delimiter).map((dir) => path.join(dir, name)));
  const windows = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
  return [env.CHROME_PATH, ...mac, ...linux, ...windows].filter(Boolean).find((file) => fs.existsSync(file)) ?? null;
}

export function readScreens(file) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, "utf8")); } catch (error) { throw new Refusal(`Cannot read ${file}: ${error.message}`); }
  const screens = Array.isArray(data) ? data : data.screens;
  if (!Array.isArray(screens) || !screens.length) throw new Refusal(`${file} has no "screens" list.`);
  for (const screen of screens) {
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(screen.name ?? "")) throw new Refusal(`Screen name "${screen.name}" must be small letters, numbers and dashes.`);
    if (!screen.url) throw new Refusal(`Screen "${screen.name}" has no "url".`);
  }
  return screens;
}

/** One headless browser, one tab, spoken to over the DevTools protocol with Node's own WebSocket. */
async function openBrowser(binary, width) {
  if (typeof WebSocket !== "function") throw new Refusal(`Node ${process.version} has no WebSocket. Use Node 22 or newer.`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "page-check-"));
  const child = spawn(binary, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((resolve, reject) => {
    let text = "";
    const timer = setTimeout(() => reject(new Refusal(`The browser did not start in 20 s: ${text.slice(0, 300)}`)), 20_000);
    child.stderr.on("data", (chunk) => {
      text += chunk;
      const match = text.match(/DevTools listening on (ws:\/\/\S+)/u);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    child.on("exit", (code) => { clearTimeout(timer); reject(new Refusal(`The browser quit at start (exit ${code}): ${text.slice(0, 300)}`)); });
  });
  const socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = () => reject(new Refusal("Could not connect to the browser.")); });
  let nextId = 1;
  const pending = new Map();
  const listeners = [];
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message}`)); else resolve(message.result);
    } else if (message.method) for (const listen of listeners) listen(message);
  };
  const raw = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await raw("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await raw("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => raw(method, params, sessionId);
  const page = {
    errors: [], dialogs: [],
    send,
    waitFor(method, ms = 15_000) {
      return new Promise((resolve) => {
        const timer = setTimeout(() => { listeners.splice(listeners.indexOf(listen), 1); resolve(null); }, ms);
        const listen = (message) => {
          if (message.sessionId !== sessionId || message.method !== method) return;
          clearTimeout(timer); listeners.splice(listeners.indexOf(listen), 1); resolve(message.params);
        };
        listeners.push(listen);
      });
    },
    async evaluate(expression) {
      const result = await send("Runtime.evaluate", { expression: `(async () => (${expression}))()`, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    },
    async close() {
      try { socket.close(); } catch { /* already closed */ }
      child.kill();
      await sleep(300);
      fs.rmSync(profile, { recursive: true, force: true }); // the temp profile this script made, nothing else
    },
  };
  listeners.push((message) => {
    if (message.sessionId !== sessionId) return;
    const p = message.params;
    if (message.method === "Runtime.exceptionThrown") page.errors.push(p.exceptionDetails.exception?.description?.split("\n")[0] ?? p.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && p.type === "error") page.errors.push(`console.error: ${p.args.map((a) => a.value ?? a.description ?? "").join(" ")}`);
    if (message.method === "Log.entryAdded" && p.entry.level === "error" && !/favicon\.ico$/u.test(p.entry.url ?? "")) page.errors.push(`${p.entry.text}${p.entry.url ? ` (${p.entry.url})` : ""}`);
    if (message.method === "Page.javascriptDialogOpening") {
      page.dialogs.push(`${p.type}: ${p.message}`);
      send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
    }
  });
  for (const domain of ["Page", "Runtime", "Log"]) await send(`${domain}.enable`);
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  return page;
}

async function openScreen(page, screen) {
  const blank = page.waitFor("Page.loadEventFired");
  await page.send("Page.navigate", { url: "about:blank" });
  await blank;
  page.errors = []; page.dialogs = [];
  const loaded = page.waitFor("Page.loadEventFired");
  const nav = await page.send("Page.navigate", { url: screen.url });
  if (nav.errorText) throw new Refusal(`${screen.name}: ${screen.url} did not open (${nav.errorText}). Is the server up?`);
  if (!(await loaded)) page.errors.push("the page did not finish loading in 15 s");
  if (screen.open) {
    try { await page.evaluate(screen.open); } catch (error) { page.errors.push(`the "open" step failed: ${error.message.split("\n")[0]}`); }
  }
  await sleep(screen.wait ?? WAIT_AFTER_LOAD_MS);
  await page.evaluate("document.getAnimations().forEach((a) => { try { a.finish(); } catch {} })").catch(() => {});
}

// Every visible element's box, keyed by its place in the page. Runs inside the page.
const LAYOUT_JS = `(() => {
  const out = [];
  const key = (el) => { const parts = []; for (let e = el; e && e !== document.body; e = e.parentElement) {
    const same = [...(e.parentElement?.children ?? [])].filter((c) => c.tagName === e.tagName);
    parts.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : same.length > 1 ? ':' + (same.indexOf(e) + 1) : '')); } return parts.join('>'); };
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ').slice(0, 40);
    out.push({ key: key(el), box: [r.x, r.y + scrollY, r.width, r.height].map(Math.round), text: own });
  }
  return out;
})()`;

const textOfHtml = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/giu, " ").replace(/<[^>]+>/gu, "\n")
  .replace(/&nbsp;/gu, " ").replace(/&amp;/gu, "&").replace(/&lt;/gu, "<").replace(/&gt;/gu, ">")
  .split("\n").map((line) => line.trim()).filter(Boolean).join("\n");

async function sourceOf(url) {
  if (url.startsWith("file:")) return fs.readFileSync(fileURLToPath(url.split("#")[0]), "utf8");
  const response = await fetch(url);
  if (!response.ok) throw new Refusal(`${url} answered ${response.status}.`);
  return response.text();
}

async function capture(options) {
  const screens = readScreens(need(options, "screens"));
  const only = options.only ? options.only.split(",") : null;
  const out = path.resolve(need(options, "out"));
  fs.mkdirSync(out, { recursive: true });
  // With an old Node the browser cannot be driven, so capture falls back to text, like a laptop with no browser.
  const binary = typeof WebSocket === "function" ? findBrowser() : null;
  const summary = { mode: binary ? "browser" : "text-only", browser: binary, width: Number(options.width ?? 1440), at: new Date().toISOString(), screens: {} };
  if (!binary) {
    for (const screen of screens.filter((s) => !only || only.includes(s.name))) {
      const text = textOfHtml(await sourceOf(screen.url));
      fs.writeFileSync(path.join(out, `${screen.name}.txt`), `${text}\n`);
      summary.screens[screen.name] = { url: screen.url, ok: text.length > 0, errors: [], textLines: text.split("\n").length, note: "page source only: no browser" };
    }
  } else {
    const page = await openBrowser(binary, summary.width);
    try {
      for (const screen of screens.filter((s) => !only || only.includes(s.name))) {
        await openScreen(page, screen);
        const text = String(await page.evaluate("document.body ? document.body.innerText : ''")).trim();
        const layout = await page.evaluate(LAYOUT_JS);
        const height = Math.min(MAX_SHOT_HEIGHT, Math.max(900, Math.ceil((await page.send("Page.getLayoutMetrics")).cssContentSize.height)));
        const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: summary.width, height, scale: 1 } });
        const png = Buffer.from(shot.data, "base64");
        await sleep(SECOND_SHOT_MS);
        const again = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: summary.width, height, scale: 1 } });
        const moving = again.data !== shot.data;
        fs.writeFileSync(path.join(out, `${screen.name}.png`), png);
        fs.writeFileSync(path.join(out, `${screen.name}.txt`), `${text}\n`);
        fs.writeFileSync(path.join(out, `${screen.name}.layout.json`), `${JSON.stringify(layout)}\n`);
        summary.screens[screen.name] = { url: screen.url, ok: text.length > 0 && !page.errors.length, errors: [...page.errors], dialogs: [...page.dialogs],
          textLines: text ? text.split("\n").length : 0, boxes: layout.length, png: crypto.createHash("sha1").update(png).digest("hex"), moving };
      }
    } finally { await page.close(); }
  }
  fs.writeFileSync(path.join(out, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  const bad = Object.entries(summary.screens).filter(([, s]) => !s.ok);
  for (const [name, s] of Object.entries(summary.screens)) console.log(`${s.ok ? "ok  " : "BAD "} ${name}: ${s.textLines} text lines${s.boxes ? `, ${s.boxes} boxes` : ""}${s.errors.length ? `; errors: ${s.errors.join(" | ")}` : ""}${s.ok || s.textLines ? "" : "; the screen is empty"}`);
  console.log(`${summary.mode}: ${Object.keys(summary.screens).length} screens in ${out}${bad.length ? `; ${bad.length} BAD` : ""}`);
  return bad.length ? 1 : 0;
}

const readText = (dir, name) => { try { return fs.readFileSync(path.join(dir, `${name}.txt`), "utf8").split("\n").map((l) => l.trim()).filter(Boolean); } catch { return null; } };
const readLayout = (dir, name) => { try { return JSON.parse(fs.readFileSync(path.join(dir, `${name}.layout.json`), "utf8")); } catch { return null; } };

/** Pure: lines in b and not in a, counted, so a repeated line that appears one more time still shows. */
export function linesAdded(a, b) {
  const count = new Map();
  for (const line of a) count.set(line, (count.get(line) ?? 0) + 1);
  const added = [];
  for (const line of b) { const n = count.get(line) ?? 0; if (n > 0) count.set(line, n - 1); else added.push(line); }
  return added;
}

/** Pure: boxes that moved, appeared or went away between two layouts. */
export function layoutChanges(before, after) {
  const map = new Map(before.map((item) => [item.key, item]));
  const moved = []; const added = [];
  for (const item of after) {
    const old = map.get(item.key);
    if (!old) { added.push(item); continue; }
    map.delete(item.key);
    if (old.box.some((value, i) => Math.abs(value - item.box[i]) > MOVE_PX)) moved.push({ ...item, was: old.box });
  }
  return { moved, added, removed: [...map.values()] };
}

function compare(options) {
  const before = path.resolve(need(options, "before"));
  const after = path.resolve(need(options, "after"));
  const outFile = path.resolve(need(options, "out"));
  const explained = new Set((options.explained ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  const read = (dir) => { try { return JSON.parse(fs.readFileSync(path.join(dir, "summary.json"), "utf8")); } catch { throw new Refusal(`No summary.json in ${dir}. Run capture first.`); } };
  const a = read(before); const b = read(after);
  const names = [...new Set([...Object.keys(a.screens), ...Object.keys(b.screens)])];
  const lines = [`# Screen compare`, "", `Before: ${before}`, `After: ${after}`, `Explained screens: ${[...explained].join(", ") || "none"}`, ""];
  const result = { unexpected: [], broken: [], changed: [], same: [] };
  for (const name of names) {
    const sa = a.screens[name]; const sb = b.screens[name];
    if (!sb) { result.broken.push(name); lines.push(`## ${name}: BROKEN`, "", "- It was there before and is missing now.", ""); continue; }
    if (!sa) { result.changed.push(name); lines.push(`## ${name}: new screen`, ""); continue; }
    const ta = readText(before, name) ?? []; const tb = readText(after, name) ?? [];
    const plus = linesAdded(ta, tb); const minus = linesAdded(tb, ta);
    const la = readLayout(before, name); const lb = readLayout(after, name);
    const boxes = la && lb ? layoutChanges(la, lb) : null;
    const newErrors = (sb.errors ?? []).filter((e) => !(sa.errors ?? []).includes(e));
    const broken = !sb.ok || newErrors.length > 0;
    // A screen that moves on its own gives a new screenshot every time, so its pixels prove nothing.
    const pixels = sa.png && sb.png && !sa.moving && !sb.moving ? sa.png !== sb.png : null;
    const changed = plus.length || minus.length || (boxes && (boxes.moved.length || boxes.added.length || boxes.removed.length)) || pixels;
    const verdict = broken ? "BROKEN" : !changed ? "same" : explained.has(name) ? "changed (explained)" : "UNEXPECTED change";
    (broken ? result.broken : !changed ? result.same : explained.has(name) ? result.changed : result.unexpected).push(name);
    lines.push(`## ${name}: ${verdict}`, "");
    if (newErrors.length) lines.push(`- New errors: ${newErrors.join(" | ")}`);
    if (!sb.ok && !newErrors.length) lines.push("- The screen is empty or has errors now.");
    if (plus.length) lines.push(`- Text added (${plus.length}): ${plus.slice(0, LIST_LIMIT).map((l) => `"${l}"`).join(", ")}`);
    if (minus.length) lines.push(`- Text gone (${minus.length}): ${minus.slice(0, LIST_LIMIT).map((l) => `"${l}"`).join(", ")}`);
    if (boxes) {
      // Resized boxes first: a removed line shifts every box below it, and those moves would hide a real resize.
      boxes.moved.sort((x, y) => Number(y.box[2] !== y.was[2] || y.box[3] !== y.was[3]) - Number(x.box[2] !== x.was[2] || x.box[3] !== x.was[3]));
      if (boxes.moved.length) lines.push(`- Boxes moved or resized (${boxes.moved.length}, resized first): ${boxes.moved.slice(0, LIST_LIMIT).map((m) => `${m.key}${m.text ? ` "${m.text}"` : ""} [${m.was.join(",")}] -> [${m.box.join(",")}]`).join("; ")}`);
      if (boxes.added.length) lines.push(`- Boxes added: ${boxes.added.length}`);
      if (boxes.removed.length) lines.push(`- Boxes gone: ${boxes.removed.length}`);
    }
    if (sa.moving || sb.moving) lines.push("- Screenshot: not compared, the screen moves on its own");
    if (pixels !== null) lines.push(`- Screenshot: ${pixels ? "different" : "the same"} (before/${name}.png, after/${name}.png)`);
    if (!changed && !broken) lines.push("- No change.");
    lines.push("");
  }
  lines.push("## Result", "", `- Same: ${result.same.join(", ") || "none"}`, `- Changed, explained: ${result.changed.join(", ") || "none"}`,
    `- UNEXPECTED change: ${result.unexpected.join(", ") || "none"}`, `- BROKEN: ${result.broken.join(", ") || "none"}`, "");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${lines.join("\n")}\n`);
  console.log(`same ${result.same.length}, explained ${result.changed.length}, UNEXPECTED ${result.unexpected.length}, BROKEN ${result.broken.length}: ${outFile}`);
  return result.unexpected.length || result.broken.length ? 1 : 0;
}

async function withScreen(options, work) {
  const screens = readScreens(need(options, "screens"));
  const screen = screens.find((s) => s.name === need(options, "screen"));
  if (!screen) throw new Refusal(`No screen "${options.screen}". The screens are: ${screens.map((s) => s.name).join(", ")}.`);
  const binary = findBrowser();
  if (!binary) throw new Refusal("No browser found (Chrome, Chromium, Edge or Brave). Set CHROME_PATH, or check this by reading the code.", 3);
  const page = await openBrowser(binary, Number(options.width ?? 1440));
  try { await openScreen(page, screen); return await work(page, screen); } finally { await page.close(); }
}

const SNAPSHOT_JS = "({ url: location.href, text: document.body.innerText, html: document.body.innerHTML.length + ':' + [...document.body.innerHTML].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0), opened: window.__opened || [] })";

async function click(options) {
  if (!options.target && !options.text) throw new Refusal("Give --target \"<css selector>\" or --text \"<visible text>\".");
  return withScreen(options, async (page, screen) => {
    const find = options.target ? `document.querySelector(${JSON.stringify(options.target)})`
      : `[...document.querySelectorAll('button, a, [role=button], [onclick], summary, label, li, [data-nav], div, span')].filter((e) => e.getClientRects().length && e.innerText && e.innerText.trim() === ${JSON.stringify(options.text)}).pop()`;
    const found = await page.evaluate(`(() => { const el = ${find}; if (!el) return null; window.__opened = []; window.open = (u) => { window.__opened.push(String(u)); return null; }; window.__target = el; return el.outerHTML.slice(0, 160); })()`);
    if (!found) { console.log(`not found: ${options.target ?? options.text} on ${screen.name}`); return 1; }
    const before = await page.evaluate(SNAPSHOT_JS);
    const dialogs = page.dialogs.length;
    await page.evaluate("window.__target.click()");
    await sleep(WAIT_AFTER_CLICK_MS);
    const after = await page.evaluate(SNAPSHOT_JS);
    const what = [];
    if (after.url !== before.url) what.push(`the address changed to ${after.url}`);
    const added = linesAdded(before.text.split("\n").map((l) => l.trim()).filter(Boolean), after.text.split("\n").map((l) => l.trim()).filter(Boolean));
    if (added.length) what.push(`new text: ${added.slice(0, 8).map((l) => `"${l}"`).join(", ")}`);
    if (!added.length && after.html !== before.html) what.push("the page changed (no new text)");
    if (after.opened.length) what.push(`it opened a window: ${after.opened.join(", ")}`);
    if (page.dialogs.length > dialogs) what.push(`a browser dialog: ${page.dialogs.slice(dialogs).join(" | ")}`);
    if (page.errors.length) what.push(`errors: ${page.errors.join(" | ")}`);
    console.log(`clicked ${found}`);
    console.log(what.length ? `works: ${what.join("; ")}` : "dead: nothing changed after the click");
    return what.length && !page.errors.length ? 0 : 1;
  });
}

async function evalOn(options) {
  const js = need(options, "js");
  return withScreen(options, async (page) => {
    console.log(JSON.stringify(await page.evaluate(js), null, 2));
    if (page.errors.length) console.log(`errors: ${page.errors.join(" | ")}`);
    return 0;
  });
}

export async function main(argv) {
  const { command, options } = parseArgs(argv);
  if (!command || command === "help" || command === "--help") { console.log(HELP); return 0; }
  if (command === "browser") {
    const b = findBrowser();
    if (b && typeof WebSocket !== "function") { console.log(`none: ${b} is there, but Node ${process.version} has no WebSocket (needs 22 or newer)`); return 3; }
    console.log(b ?? "none"); return b ? 0 : 3;
  }
  if (command === "capture") return capture(options);
  if (command === "compare") return compare(options);
  if (command === "click") return click(options);
  if (command === "eval") return evalOn(options);
  throw new Refusal(`Unknown command "${command}". Run help.`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; },
    (error) => { console.error(`page-check: ${error.message}`); process.exitCode = error.code ?? 1; });
}
