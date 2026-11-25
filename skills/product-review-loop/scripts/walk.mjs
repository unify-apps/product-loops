#!/usr/bin/env node
// walk.mjs opens a prototype in a headless browser, takes a screenshot of every screen, and runs the checks a script can do.
//   node walk.mjs --check                                         is Node new enough, and is a browser here
//   node walk.mjs --url <file, folder or URL> --find-screens [--write <screens.json>]   prints (or writes) the screens the nav reaches, named as the nav names them
//   node walk.mjs --url <...> --screens <screens.json> --out <folder> [--width 1440] [--no-phone] [--no-clicks]
// It writes only into --out: one PNG per screen, checks.json and checks.md. It never changes the prototype.
// It clicks and types only on a local page (a file, localhost or 127.0.0.1). On any other host it only looks.
// It downloads nothing: it uses a Chrome, Chromium, Edge or Brave already on this computer (or BROWSER_PATH).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const NODE_MAJOR = 22; // the first Node with a built-in WebSocket, which this script talks to the browser with
const SETTLE_MS = 500; // a screen is ready when nothing on it changed for this long
const SETTLE_MAX_MS = 5000; // and we wait at most this long for that; a timer longer than this is not waited for
const CLICK_WAIT_MS = 350; // how long a click has to change something before we call it dead
const MAX_CLICKS = 60; // clickable things tried per screen, so a long table does not take minutes
const PHONE_WIDTH = 390; // a common phone width

// ---------- arguments ----------
function parseArgs(argv) {
  const o = { width: 1440, phone: true, clicks: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--check") o.check = true;
    else if (a === "--find-screens") o.findScreens = true;
    else if (a === "--no-phone") o.phone = false;
    else if (a === "--no-clicks") o.clicks = false;
    else if (["--url", "--screens", "--out", "--width", "--write"].includes(a)) o[a.slice(2)] = argv[++i];
    else throw new Error(`Unknown argument ${a}. Run with --check, --find-screens or --screens (see the top of this file).`);
  }
  o.width = Number(o.width) || 1440;
  return o;
}

// ---------- finding a browser ----------
export function findBrowser() {
  const home = os.homedir();
  const tries = [process.env.BROWSER_PATH, process.env.CHROME_PATH];
  if (process.platform === "darwin") {
    tries.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
      path.join(home, "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"));
  } else if (process.platform === "win32") {
    for (const base of [process.env["PROGRAMFILES"], process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean)) {
      tries.push(path.join(base, "Google/Chrome/Application/chrome.exe"), path.join(base, "Microsoft/Edge/Application/msedge.exe"));
    }
  } else {
    for (const dir of (process.env.PATH ?? "").split(":")) {
      for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "brave-browser"]) tries.push(path.join(dir, name));
    }
  }
  // A Chromium that Playwright already put on this computer, if any.
  const cache = process.platform === "darwin" ? path.join(home, "Library/Caches/ms-playwright") : path.join(home, ".cache/ms-playwright");
  try {
    for (const dir of fs.readdirSync(cache).filter((d) => /^chromium-\d+$/u.test(d)).sort().reverse()) {
      for (const sub of fs.readdirSync(path.join(cache, dir))) {
        tries.push(path.join(cache, dir, sub, "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
          path.join(cache, dir, sub, "Chromium.app/Contents/MacOS/Chromium"), path.join(cache, dir, sub, "chrome"), path.join(cache, dir, sub, "chrome.exe"));
      }
    }
  } catch { /* no Playwright cache: fine */ }
  return tries.find((file) => file && fs.existsSync(file)) ?? null;
}

// ---------- serving a local file ----------
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".woff2": "font/woff2" };

/** A file or folder is served from 127.0.0.1, so a prototype that fetches its own files works as it would on a server. */
async function serve(target) {
  const full = path.resolve(target);
  const stat = fs.statSync(full);
  const root = stat.isDirectory() ? full : path.dirname(full);
  const start = stat.isDirectory() ? "index.html" : path.basename(full);
  const server = http.createServer((req, res) => {
    const wanted = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = path.join(root, wanted);
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const real = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file, "index.html") : file;
    if (!fs.existsSync(real)) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(real).toLowerCase()] ?? "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(real).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}/${start.split(path.sep).map(encodeURIComponent).join("/")}` };
}

export function isLocal(url) {
  try {
    const u = new URL(url);
    return u.protocol === "file:" || ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname) || u.hostname.endsWith(".localhost");
  } catch { return false; }
}

// ---------- the browser ----------
async function launch(browserPath) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "walk-profile-"));
  const child = spawn(browserPath, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((resolve, reject) => {
    let text = "";
    const timer = setTimeout(() => reject(new Error(`The browser did not start in 20 s: ${text.slice(0, 300)}`)), 20_000);
    child.stderr.on("data", (chunk) => {
      text += chunk;
      const m = text.match(/DevTools listening on (ws:\/\/\S+)/u);
      if (m) { clearTimeout(timer); resolve(m[1]); }
    });
    child.on("exit", (code) => { clearTimeout(timer); reject(new Error(`The browser stopped at start (exit ${code}): ${text.slice(0, 300)}`)); });
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error("Could not talk to the browser.")); });
  let next = 1;
  const waiting = new Map();
  const listeners = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && waiting.has(msg.id)) {
      const { resolve, reject } = waiting.get(msg.id);
      waiting.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    } else if (msg.method) for (const fn of listeners) fn(msg);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = next++;
    waiting.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  const close = () => {
    try { ws.close(); } catch { /* gone */ }
    child.kill("SIGKILL");
    // The browser's helpers can still write to the profile for a moment after the kill. Retry, and never throw:
    // a throw here skipped closing the file server, so the script printed its answer and then never ended.
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); } catch { /* a temp folder left behind is harmless */ }
  };
  return { page, on: (fn) => listeners.push(fn), close };
}

const sleep = (ms, loose = false) => new Promise((resolve) => { const t = setTimeout(resolve, ms); if (loose) t.unref(); });

async function evaluate(b, expression) {
  const r = await b.page("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
}

async function setWidth(b, width) {
  const mobile = width <= 500;
  await b.page("Emulation.setDeviceMetricsOverride", { width, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
}

/** Opens one screen fresh: a blank page first, so no state is left from the last screen. */
async function openScreen(b, baseUrl, screen, loads) {
  const open = screen.open ?? "";
  const target = /^click:/u.test(open) || !open ? baseUrl : new URL(open, baseUrl).href;
  const blank = loads.next();
  await b.page("Page.navigate", { url: "about:blank" });
  await Promise.race([blank, sleep(5_000, true)]);
  const loaded = loads.next();
  await b.page("Page.navigate", { url: target });
  await Promise.race([loaded, sleep(10_000, true)]);
  await evaluate(b, EARLY_SNAPSHOT);
  if (/^click:/u.test(open)) {
    const how = open.slice("click:".length);
    await evaluate(b, `(${clickBy.toString()})(${JSON.stringify(how)})`);
  }
  await settle(b);
}

// Put into every page before its own scripts: counts the short timers and requests still to finish,
// because a prototype often fakes loading with a timer, and the screen is not ready until it fires.
const TRACK_PENDING = `(() => {
  const pending = new Set(); let requests = 0;
  window.__walkPending = () => pending.size + requests;
  const set = window.setTimeout.bind(window), clear = window.clearTimeout.bind(window);
  window.__walkSetTimeout = set;
  window.setTimeout = (fn, ms, ...rest) => {
    if (!(Number(ms) <= ${SETTLE_MAX_MS})) return set(fn, ms, ...rest);
    const id = set((...a) => { pending.delete(id); typeof fn === "function" ? fn(...a) : 0; }, ms, ...rest);
    pending.add(id); return id;
  };
  window.clearTimeout = (id) => { pending.delete(id); clear(id); };
  const realFetch = window.fetch?.bind(window);
  if (realFetch) window.fetch = (...a) => { requests++; return realFetch(...a).finally(() => { requests--; }); };
})();`;

async function settle(b) {
  await evaluate(b, `new Promise((done) => {
    let last = Date.now(); const started = Date.now();
    const obs = new MutationObserver(() => { last = Date.now(); });
    obs.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    const busy = () => (window.__walkPending ? window.__walkPending() : 0) > 0;
    const tick = () => { if ((Date.now() - last >= ${SETTLE_MS} && !busy()) || Date.now() - started >= ${SETTLE_MAX_MS}) { obs.disconnect(); try { document.getAnimations().forEach((a) => a.finish()); } catch {} done(true); } else later(tick, 50); };
    const later = window.__walkSetTimeout || setTimeout;
    later(tick, 50);
  })`);
}

// Runs in the page: click the first visible thing whose text is the given text ("text=Settings") or that matches a CSS selector.
function clickBy(how) {
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  let el = null;
  if (how.startsWith("text=")) {
    const want = how.slice(5).trim().toLowerCase();
    el = [...document.querySelectorAll("a, button, [role=button], [role=tab], [role=menuitem], li, div, span")].find((e) => visible(e) && e.textContent.trim().toLowerCase() === want);
  } else el = [...document.querySelectorAll(how)].find(visible);
  if (!el) throw new Error(`Nothing to click for "${how}"`);
  el.setAttribute("data-walk-opened", "1"); // the button that opened this screen: clicking it again is expected to do nothing
  el.click();
  return true;
}

// Runs in the page right after load: what the screen showed before its data came in.
const EARLY_SNAPSHOT = `(() => {
  const t = (document.body?.innerText ?? "").trim();
  const busy = /\\b(loading|fetching|please wait)\\b/iu.test(t) || !!document.querySelector('[aria-busy="true"], progress, [class*="spinner" i], [class*="skeleton" i], [class*="loader" i], [class*="loading" i]');
  window.__walkEarly = { length: t.length, busy };
  return true;
})()`;

// ---------- the in-page checks (run with Runtime.evaluate) ----------
function pageChecks(windowWidth) {
  const out = [];
  const add = (kind, el, detail) => out.push({ kind, text: el ? (el.innerText || el.getAttribute?.("alt") || el.getAttribute?.("src") || "").trim().replace(/\s+/gu, " ").slice(0, 80) : "", where: el ? where(el) : "", detail });
  function where(el) {
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 4; e = e.parentElement) {
      if (e.id) { parts.unshift(`#${e.id}`); break; }
      const cls = [...e.classList].slice(0, 2).map((c) => `.${c}`).join("");
      const same = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [];
      parts.unshift(`${e.tagName.toLowerCase()}${cls}${same.length > 1 ? `:nth-of-type(${same.indexOf(e) + 1})` : ""}`);
    }
    return parts.join(" > ");
  }
  const visible = (el) => {
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05;
  };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  const all = [...document.body.querySelectorAll("*")].filter((el) => !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName) && visible(el));

  // Cut-off text: text wider or taller than its box, in a box that hides the rest.
  for (const el of all) {
    if (!ownText(el)) continue;
    const s = getComputedStyle(el);
    const hidesX = ["hidden", "clip"].includes(s.overflowX) || s.textOverflow === "ellipsis";
    const hidesY = ["hidden", "clip"].includes(s.overflowY);
    if ((hidesX && el.scrollWidth > el.clientWidth + 1) || (hidesY && el.scrollHeight > el.clientHeight + 2)) {
      add("cut-off-text", el, `shows ${el.clientWidth}x${el.clientHeight}px of ${el.scrollWidth}x${el.scrollHeight}px`);
    }
  }

  // Placeholder or broken text that is on screen.
  const PLACEHOLDER = /\blorem ipsum\b|\b(TODO|TBD|FIXME|XXX)\b|\bcoming soon\b|\bplaceholder\b|\{\{[^}]*\}\}|\$\{[^}]*\}|\b(undefined|NaN)\b|\[object Object\]|\b(asdf|qwerty|sample text|your text here|text goes here|dummy text)\b|\binsert [a-z ]{1,20} here\b/u;
  const PLACEHOLDER_I = /\blorem ipsum\b|\bcoming soon\b|\bsample text\b|\byour text here\b|\btext goes here\b|\bdummy text\b/iu;
  for (const el of all) {
    const text = ownText(el);
    if (text && (PLACEHOLDER.test(text) || PLACEHOLDER_I.test(text))) add("placeholder", el, `text: "${text.slice(0, 80)}"`);
  }

  // Images that did not load, or that are stand-ins.
  for (const img of document.images) {
    const r = img.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (img.complete && img.naturalWidth === 0) add("broken-image", img, `src ${img.getAttribute("src")}`);
    else if (/placehold|placeholder|dummyimage|via\.placeholder/iu.test(img.src)) add("placeholder", img, `stand-in image ${img.getAttribute("src")}`);
  }

  // Near-miss alignment: left edges of text blocks that sit 1 to 6 px off the edge most of their neighbours share.
  const blocks = all.filter((el) => ownText(el) || ["LABEL", "H1", "H2", "H3", "H4", "P", "LI"].includes(el.tagName))
    .filter((el) => { const s = getComputedStyle(el); return ["block", "flex", "grid", "list-item", "table-cell"].includes(s.display) && ["left", "start"].includes(s.textAlign); });
  const edges = blocks.map((el) => {
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const area = el.parentElement?.closest("section, form, article, aside, header, nav, footer, main, dialog, [role=dialog], ul, ol, table, fieldset") ?? document.body;
    return { el, area, x: Math.round(el.getBoundingClientRect().left + pad), top: el.getBoundingClientRect().top };
  });
  const seen = new Set();
  for (const a of edges) {
    if (seen.has(a.el)) continue;
    const group = edges.filter((b) => b.area === a.area && Math.abs(b.x - a.x) <= 6 && Math.abs(b.top - a.top) < 700);
    if (group.length < 3) continue;
    const count = new Map();
    for (const g of group) count.set(g.x, (count.get(g.x) ?? 0) + 1);
    const [mode, modeCount] = [...count.entries()].sort((p, q) => q[1] - p[1])[0];
    if (modeCount < 2) continue;
    for (const g of group) {
      const nested = [...seen].some((other) => other.contains(g.el) || g.el.contains(other));
      if (g.x !== mode && Math.abs(g.x - mode) >= 1 && count.get(g.x) <= modeCount / 2 && !seen.has(g.el) && !nested) {
        seen.add(g.el);
        add("near-miss-alignment", g.el, `text starts at x=${g.x}, ${count.get(mode)} neighbours start at x=${mode}`);
      }
    }
  }

  // Uneven spacing: alike siblings (same tag and class) stacked or in a row, where one gap differs from the rest.
  for (const parent of all) {
    const kids = [...parent.children].filter(visible).filter((k) => getComputedStyle(k).position !== "absolute" && getComputedStyle(k).position !== "fixed");
    if (kids.length < 3) continue;
    const base = (k) => `${k.tagName}.${k.classList[0] ?? ""}`;
    const runs = new Map();
    for (const k of kids) { const key = base(k); if (!runs.has(key)) runs.set(key, []); runs.get(key).push(k); }
    for (const run of runs.values()) {
      if (run.length < 3) continue;
      const rects = run.map((k) => k.getBoundingClientRect());
      const vertical = rects.every((r, i) => i === 0 || r.top >= rects[i - 1].bottom - 1);
      const horizontal = !vertical && rects.every((r, i) => i === 0 || (r.left >= rects[i - 1].right - 1 && Math.abs(r.top - rects[i - 1].top) < 4));
      if (!vertical && !horizontal) continue;
      const gaps = rects.slice(1).map((r, i) => Math.round(vertical ? r.top - rects[i].bottom : r.left - rects[i].right));
      const count = new Map();
      for (const g of gaps) count.set(g, (count.get(g) ?? 0) + 1);
      const [mode, modeCount] = [...count.entries()].sort((p, q) => q[1] - p[1])[0];
      if (modeCount < 2) continue;
      gaps.forEach((g, i) => {
        if (Math.abs(g - mode) >= 2 && Math.abs(g - mode) <= 40) add("uneven-spacing", run[i], `gap after it is ${g}px, the other gaps are ${mode}px`);
      });
    }
  }

  // The page scrolls sideways.
  const sw = document.documentElement.scrollWidth;
  const width = windowWidth || innerWidth;
  if (sw > width + 1) {
    // The thing that pushes out furthest; of those, the smallest, which is most likely the cause.
    const wide = all.filter((el) => el.getBoundingClientRect().right > width + 1)
      .sort((p, q) => q.getBoundingClientRect().right - p.getBoundingClientRect().right || p.getBoundingClientRect().width - q.getBoundingClientRect().width)[0];
    add("page-scrolls-sideways", wide ?? null, `page is ${sw}px wide in a ${width}px window`);
  }

  // Data came in after the first paint, and nothing showed it was loading.
  const early = window.__walkEarly;
  const nowLen = (document.body.innerText ?? "").trim().length;
  if (early && !early.busy && nowLen > early.length + 80 && nowLen > early.length * 1.3) {
    add("no-loading-state", null, `the screen first showed ${early.length} characters, then ${nowLen}, with no loading sign in between`);
  }

  // The words on the screen, for the cross-screen word check.
  const words = [...new Set(all.filter((el) => ["A", "BUTTON", "H1", "H2", "H3", "LABEL", "TH", "LEGEND", "SUMMARY", "OPTION"].includes(el.tagName) || ["button", "tab", "menuitem", "link"].includes(el.getAttribute("role") ?? ""))
    .map((el) => (el.innerText || "").trim().split("\n")[0]).filter((t) => t && t.length <= 40))];
  const title = (document.querySelector("h1")?.innerText ?? document.title ?? "").trim();
  return { findings: out, words, title };
}

// Runs in the page: every visible thing that looks clickable, with a way to find it again.
function listClickables(max) {
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05; };
  const looks = (el) => el.matches("a, button, [role=button], [role=tab], [role=menuitem], [onclick], summary, input[type=button], input[type=submit]")
    || (getComputedStyle(el).cursor === "pointer" && el.parentElement && getComputedStyle(el.parentElement).cursor !== "pointer");
  // The control for the screen you are on (the open tab, the current nav item) may do nothing when clicked again.
  const current = (el) => el.hasAttribute("data-walk-opened") || el.hasAttribute("aria-current") || el.getAttribute("aria-selected") === "true"
    || (el.closest("nav, [role=navigation], [role=tablist], .sidebar, .nav, .tabs") && /(^|\s)(on|active|current|selected|is-active)(\s|$)/u.test(el.className));
  const list = [...document.body.querySelectorAll("*")].filter((el) => looks(el) && visible(el) && !el.disabled && el.getAttribute("aria-disabled") !== "true" && !current(el));
  const here = location.href;
  return list.slice(0, max).map((el, index) => {
    el.setAttribute("data-walk-click", String(index));
    const href = el.tagName === "A" ? el.getAttribute("href") : null;
    let link = null;
    if (href && href !== "#" && !href.startsWith("javascript:")) {
      const to = new URL(href, here);
      link = { to: to.href, sameDoc: to.href.split("#")[0] === here.split("#")[0], here: to.href === here, external: to.origin !== location.origin };
    }
    return { index, text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || el.value || "").trim().replace(/\s+/gu, " ").slice(0, 60), tag: el.tagName.toLowerCase(), link };
  });
}

// Runs in the page: click one thing and report whether anything changed.
function clickAndWatch(index, waitMs) {
  return new Promise((done) => {
    const el = document.querySelector(`[data-walk-click="${index}"]`);
    if (!el) { done({ gone: true }); return; }
    const before = location.href;
    let changes = 0;
    let opened = false;
    const noisy = new Set();
    const pre = new MutationObserver((list) => { for (const m of list) noisy.add(m.target); });
    pre.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    setTimeout(() => {
      pre.disconnect();
      const obs = new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === "attributes" && m.attributeName === "data-walk-click") continue;
          if (!noisy.has(m.target)) changes++;
        }
      });
      obs.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
      const realOpen = window.open;
      window.open = () => { opened = true; return null; };
      for (const name of ["alert", "confirm", "prompt"]) window[name] = () => { opened = true; return name === "confirm" ? false : null; };
      const focusBefore = document.activeElement;
      try {
        for (const type of ["pointerdown", "mousedown", "pointerup", "mouseup"]) el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        el.click();
      } catch { /* a click that throws still counts as tried; the console error is caught by the walk */ }
      setTimeout(() => {
        obs.disconnect();
        window.open = realOpen;
        const focusMoved = document.activeElement !== focusBefore && document.activeElement !== el && document.activeElement?.matches?.("input, textarea, select, [contenteditable]");
        done({ live: changes > 0 || location.href !== before || opened || Boolean(focusMoved), moved: location.href !== before });
      }, waitMs);
    }, 120);
  });
}

// Runs in the page: type a word nothing matches into each search box, and see whether the screen says so.
function searchBoxes() {
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  return [...document.querySelectorAll("input")].filter((el) => visible(el) && (el.type === "search" || /search|filter|find/iu.test(`${el.placeholder} ${el.getAttribute("aria-label") ?? ""} ${el.name} ${el.id}`)))
    .map((el, index) => { el.setAttribute("data-walk-search", String(index)); return { index, label: el.placeholder || el.getAttribute("aria-label") || el.name || el.id }; });
}
function typeNoMatch(index, waitMs) {
  return new Promise((done) => {
    const el = document.querySelector(`[data-walk-search="${index}"]`);
    const lines = () => (document.body.innerText ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    const before = lines();
    el.focus();
    el.value = "zqxjvw";
    for (const type of ["input", "keyup", "change"]) el.dispatchEvent(new Event(type, { bubbles: true }));
    setTimeout(() => {
      const after = lines();
      // Any new line of text counts as the screen saying something ("No results", "0 items", the typed word).
      const said = after.filter((l) => !before.includes(l));
      done({ says: said.length > 0, changed: after.length !== before.length || said.length > 0 });
    }, waitMs);
  });
}

// ---------- the cross-screen word check ----------
const SAME_THING = [["sign in", "log in", "login"], ["sign out", "log out", "logout"], ["sign up", "register", "create account"], ["delete", "remove"],
  ["settings", "preferences", "options"], ["customer", "client"], ["e-mail", "email"], ["cancel", "dismiss"]];
// Pure: a phrase with case, spaces, dashes and common word endings taken away, so "Sign-in" and "sign in" match.
export const wordShape = (text) => text.toLowerCase().split(/[\s-]+/u).filter(Boolean).map((w) => w.replace(/(ing|ed|s)$/u, "")).join("");
export function wordClashes(screens) {
  const uses = new Map(); // a lower-case phrase -> where it is used, with its exact spelling
  for (const s of screens) for (const w of s.words ?? []) {
    const key = w.toLowerCase();
    if (!uses.has(key)) uses.set(key, []);
    uses.get(key).push({ screen: s.name, text: w });
  }
  const out = [];
  for (const list of uses.values()) {
    const spellings = [...new Set(list.map((u) => u.text))];
    if (spellings.length > 1) out.push({ kind: "mixed-words", text: spellings.join(" / "), where: [...new Set(list.map((u) => u.screen))].join(", "), detail: "the same words with different capitals" });
  }
  const shapes = new Map(); // a word shape -> the lower-case phrases with that shape
  for (const key of uses.keys()) { const shape = wordShape(key); if (shape.length >= 4) { if (!shapes.has(shape)) shapes.set(shape, []); shapes.get(shape).push(key); } }
  for (const keys of shapes.values()) {
    if (keys.length < 2) continue;
    // "Client" and "Clients" are one word in two numbers, not one name written two ways.
    if (keys.length === 2 && (keys[0] === `${keys[1]}s` || keys[1] === `${keys[0]}s`)) continue;
    const where = keys.flatMap((k) => uses.get(k).map((u) => `"${u.text}" on ${u.screen}`));
    out.push({ kind: "mixed-words", text: keys.map((k) => uses.get(k)[0].text).join(" / "), where: [...new Set(where)].join("; "), detail: "one name written two ways" });
  }
  const keys = [...uses.keys()];
  for (const group of SAME_THING) {
    const found = group.map((word) => ({ word, at: keys.filter((k) => new RegExp(`(^|\\W)${word.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}(\\W|$)`, "u").test(k)) })).filter((g) => g.at.length);
    if (found.length > 1) {
      const where = found.flatMap((g) => g.at.flatMap((k) => uses.get(k).map((u) => `"${u.text}" on ${u.screen}`)));
      out.push({ kind: "mixed-words", text: found.map((g) => g.word).join(" / "), where: [...new Set(where)].join("; "), detail: "two names for the same thing" });
    }
  }
  return out;
}

// ---------- the walk ----------
async function startUrl(given) {
  if (!given) throw new Error("Give --url: the prototype's file, its folder, or a URL.");
  if (/^https?:\/\//u.test(given) || given.startsWith("file:")) return { url: given, server: null };
  if (!fs.existsSync(given)) throw new Error(`No file or folder at ${given}.`);
  return serve(given);
}

function loadWaiter(b) {
  let pending = [];
  b.on((msg) => { if (msg.method === "Page.loadEventFired") { const p = pending; pending = []; p.forEach((fn) => fn()); } });
  return { next: () => new Promise((resolve) => pending.push(resolve)) };
}

// The screens the nav reaches, each named with the nav's own label. Run in the page.
const NAV_SCREENS = `(() => {
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const navs = [...document.querySelectorAll('nav, header, aside, [role=navigation], [role=tablist], .sidebar, .nav, .tabs')];
      const out = []; const seen = new Set();
      const names = new Set();
      for (const nav of navs) for (const el of nav.querySelectorAll('a[href], [role=tab], button, li')) {
        if (!visible(el)) continue;
        if (el.matches('li') && el.querySelector('a[href], button, [role=tab]')) continue; // its link or button is the item
        if (/brand|logo/i.test(String(el.className) + ' ' + el.id)) continue; // the product's name, not a screen
        const text = (el.innerText || '').trim().split('\\n')[0];
        if (!text || text.length > 40) continue;
        const href = el.getAttribute('href');
        let open = null;
        if (href && href !== '#' && !href.startsWith('javascript:')) {
          const to = new URL(href, location.href);
          if (to.origin !== location.origin) continue;
          open = to.pathname === location.pathname ? (to.hash || '') : to.pathname.split('/').pop() + to.search + to.hash;
        } else if (el.matches('[role=tab], [data-screen], [data-view], [data-page], [data-tab]') || nav.matches('nav, [role=navigation], [role=tablist], .sidebar, .nav, .tabs')) open = 'click:text=' + text;
        if (open === null || seen.has(open) || names.has(text)) continue;
        seen.add(open); names.add(text); out.push({ name: text, open });
      }
      return out;
    })()`;

async function findScreens(options) {
  const { url, server } = await startUrl(options.url);
  const b = await launch(requireBrowser());
  try {
    await b.page("Page.enable");
    await setWidth(b, options.width);
    const loads = loadWaiter(b);
    await openScreen(b, url, { name: "start", open: "" }, loads);
    const found = await evaluate(b, NAV_SCREENS);
    const screens = found.length ? found : [{ name: "Start", open: "" }];
    if (options.write) {
      fs.mkdirSync(path.dirname(options.write), { recursive: true });
      fs.writeFileSync(options.write, `${JSON.stringify(screens, null, 2)}\n`);
      console.log(`wrote ${screens.length} screens to ${options.write}: ${screens.map((x) => x.name).join(", ")}`);
    } else console.log(JSON.stringify(screens, null, 2));
  } finally { server?.close(); b.close(); }
}

function requireBrowser() {
  const found = findBrowser();
  if (!found) throw new Error("No Chrome, Chromium, Edge or Brave found on this computer. Install one, or set BROWSER_PATH to its program file.");
  return found;
}

const slug = (name, i) => `${String(i + 1).padStart(2, "0")}-${String(name).toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "") || "screen"}`;

async function walk(options) {
  if (!options.screens) throw new Error("Give --screens <screens.json>: a list of { \"name\", \"open\" }. Run --find-screens to start one.");
  if (!options.out) throw new Error("Give --out <folder> for the screenshots and checks.");
  const screens = JSON.parse(fs.readFileSync(options.screens, "utf8"));
  if (!Array.isArray(screens) || !screens.length || !screens.every((s) => s && typeof s.name === "string")) throw new Error(`${options.screens} must be a JSON list of { "name", "open" }.`);
  fs.mkdirSync(options.out, { recursive: true });
  const { url, server } = await startUrl(options.url);
  const local = isLocal(url);
  const clicks = options.clicks && local;
  const browser = requireBrowser();
  const b = await launch(browser);
  const result = { url, browser, width: options.width, clicks, phone: options.phone, when: new Date().toISOString(), screens: [], crossScreen: [], blocked: [], warnings: [] };
  let current = null;
  let requestCount = 0; // requests the page made; a click that makes one is not dead
  b.on((msg) => {
    if (!current) return;
    if (msg.method === "Runtime.exceptionThrown") current.consoleErrors.push(msg.params.exceptionDetails.exception?.description?.split("\n")[0] ?? msg.params.exceptionDetails.text);
    if (msg.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(msg.params.type)) current.consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 200));
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") current.consoleErrors.push(`${msg.params.entry.text}${msg.params.entry.url ? ` (${msg.params.entry.url})` : ""}`.slice(0, 200));
  });
  try {
    await b.page("Page.enable");
    await b.page("Runtime.enable");
    await b.page("Log.enable");
    await b.page("Page.addScriptToEvaluateOnNewDocument", { source: TRACK_PENDING });
    if (clicks) {
      // A click may fire a request. Anything but a plain read to another host is stopped, so the walk never sends data out.
      b.on((msg) => {
        if (msg.method !== "Fetch.requestPaused") return;
        requestCount++;
        const { requestId, request } = msg.params;
        const send = request.method !== "GET" && request.method !== "HEAD" && !isLocal(request.url);
        b.page(send ? "Fetch.failRequest" : "Fetch.continueRequest", send ? { requestId, errorReason: "BlockedByClient" } : { requestId }).catch(() => {});
        if (send) result.blocked.push(`${request.method} ${request.url}`.slice(0, 200));
      });
      await b.page("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
    }
    const loads = loadWaiter(b);
    // A screen the nav reaches keeps the nav's own name, so findings, the hand-over and the person all use one word.
    await setWidth(b, options.width);
    await openScreen(b, url, { name: "start", open: "" }, loads);
    const nav = await evaluate(b, NAV_SCREENS).catch(() => []);
    for (const screen of screens) {
      const item = nav.find((n) => n.open === (screen.open ?? ""));
      if (item && item.name !== screen.name) result.warnings.push(`screen "${screen.name}" is the nav item "${item.name}": rename it to "${item.name}" in ${options.screens}`);
    }
    for (const [i, screen] of screens.entries()) {
      const record = { name: screen.name, open: screen.open ?? "", screenshot: null, phoneScreenshot: null, consoleErrors: [], findings: [], words: [], clicksTried: 0, error: null };
      current = record;
      result.screens.push(record);
      try {
        await setWidth(b, options.width);
        await openScreen(b, url, screen, loads);
        const checks = await evaluate(b, `(${pageChecks.toString()})(${options.width})`);
        record.findings.push(...checks.findings);
        record.words = checks.words;
        record.title = checks.title;
        // The whole visible text, as a short key: two screens with the same key show the same thing.
        const text = await evaluate(b, `(document.body?.innerText ?? "").replace(/\\s+/g, " ").trim()`);
        record.textKey = text ? `${text.length}:${crypto.createHash("sha1").update(text).digest("hex").slice(0, 12)}` : "";
        record.screenshot = path.join(options.out, `${slug(screen.name, i)}.png`);
        await shot(b, record.screenshot, options.width);

        if (clicks) {
          const items = await evaluate(b, `(${listClickables.toString()})(${MAX_CLICKS})`);
          record.clicksTried = items.length;
          for (const item of items) {
            if (item.link?.here) continue; // a link to the screen you are on
            if (item.link && !item.link.sameDoc) {
              if (item.link.external) continue; // a link to another site: not ours to test
              const ok = await evaluate(b, `fetch(${JSON.stringify(item.link.to)}, { method: "GET" }).then((r) => r.ok, () => false)`);
              if (!ok) record.findings.push({ kind: "broken-link", text: item.text, where: item.tag, detail: `goes to ${item.link.to}, which does not load` });
              continue;
            }
            let watched;
            const errorsBefore = record.consoleErrors.length;
            const requestsBefore = requestCount;
            try { watched = await evaluate(b, `(${clickAndWatch.toString()})(${item.index}, ${CLICK_WAIT_MS})`); } catch { watched = { live: true, moved: true }; } // the page went away: it navigated
            if (watched.gone) continue;
            if (requestCount > requestsBefore) watched.live = true;
            // A click that went to another screen: its errors belong to that screen, which is walked on its own.
            if (watched.moved) record.consoleErrors.length = errorsBefore;
            else for (let e = errorsBefore; e < record.consoleErrors.length; e++) record.consoleErrors[e] += ` (after clicking "${item.text}")`;
            if (!watched.live) record.findings.push({ kind: "dead-click", text: item.text, where: item.tag, detail: "clicking it changes nothing on the screen" });
            else {
              await openScreen(b, url, screen, loads);
              await evaluate(b, `(${listClickables.toString()})(${MAX_CLICKS})`);
            }
          }
          await openScreen(b, url, screen, loads);
          const boxes = await evaluate(b, `(${searchBoxes.toString()})()`);
          for (const box of boxes) {
            const r = await evaluate(b, `(${typeNoMatch.toString()})(${box.index}, 500)`);
            if (r.changed && !r.says) record.findings.push({ kind: "no-empty-state", text: box.label, where: "input", detail: "a search with no match empties the screen and says nothing" });
            await openScreen(b, url, screen, loads);
            await evaluate(b, `(${searchBoxes.toString()})()`);
          }
        }

        if (options.phone) {
          await setWidth(b, PHONE_WIDTH);
          await openScreen(b, url, screen, loads);
          const phone = await evaluate(b, `(${pageChecks.toString()})(${PHONE_WIDTH})`);
          for (const f of phone.findings.filter((x) => ["page-scrolls-sideways", "cut-off-text"].includes(x.kind))) record.findings.push({ ...f, detail: `at ${PHONE_WIDTH}px: ${f.detail}` });
          record.phoneScreenshot = path.join(options.out, `${slug(screen.name, i)}.phone.png`);
          await shot(b, record.phoneScreenshot, PHONE_WIDTH);
        }
      } catch (error) {
        record.error = String(error.message ?? error).slice(0, 300);
      }
      record.consoleErrors = [...new Set(record.consoleErrors)];
      const brokenImages = record.findings.filter((f) => f.kind === "broken-image").map((f) => f.detail.replace(/^src /u, ""));
      record.consoleErrors = record.consoleErrors.filter((m) => !(/Failed to load resource/u.test(m) && brokenImages.some((src) => m.includes(src))) && !/ERR_BLOCKED_BY_CLIENT/u.test(m));
      for (const message of record.consoleErrors) record.findings.push({ kind: "console-error", text: message, where: "console", detail: "an error in the browser console on this screen" });
      record.findings = dedupe(record.findings);
    }
    current = null;
    result.crossScreen = wordClashes(result.screens);
    // A screen with no words is blank, and one with the same words as an earlier screen most likely did not open.
    for (const [i, s] of result.screens.entries()) {
      if (s.error) continue;
      if (!s.textKey) result.warnings.push(`screen "${s.name}" shows no words: it is blank or did not load. Check its "open" in ${options.screens}`);
      const twin = s.textKey && result.screens.slice(0, i).find((t) => !t.error && t.textKey === s.textKey);
      if (twin) result.warnings.push(`screen "${s.name}" shows the same words as "${twin.name}": its "open" most likely did not open it. Check ${options.screens}`);
    }
  } finally { server?.close(); b.close(); }
  fs.writeFileSync(path.join(options.out, "checks.json"), `${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(path.join(options.out, "checks.md"), summary(result));
  const total = result.screens.reduce((n, s) => n + s.findings.length, 0) + result.crossScreen.length;
  const missing = result.screens.filter((s) => !s.screenshot || !fs.existsSync(s.screenshot));
  console.log(`walked ${result.screens.length} screens: ${result.screens.length - missing.length} screenshots, ${total} script findings. Wrote ${path.join(options.out, "checks.md")}`);
  for (const s of result.screens.filter((x) => x.error)) console.log(`screen "${s.name}" had a problem: ${s.error}`);
  for (const w of result.warnings) console.log(`check screens.json: ${w}`);
  return missing.length || result.screens.some((s) => s.error) || result.warnings.length ? 1 : 0;
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((f) => { const key = `${f.kind}|${f.text}|${f.where}|${f.detail}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

async function shot(b, file, width) {
  const metrics = await b.page("Page.getLayoutMetrics");
  const height = Math.min(Math.ceil(metrics.cssContentSize?.height ?? metrics.contentSize.height), 6000); // a cap, so a very long page stays a readable file
  const { data } = await b.page("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.max(height, 300), scale: 1 } });
  fs.writeFileSync(file, Buffer.from(data, "base64"));
}

function summary(r) {
  const lines = [`# Script checks`, "", `Page: ${r.url}`, `Width: ${r.width}px${r.phone ? `, and ${PHONE_WIDTH}px for the phone checks` : ""}. Clicks and typing: ${r.clicks ? "on" : "off (not a local page, or --no-clicks)"}.`, ""];
  for (const s of r.screens) {
    lines.push(`## ${s.name}`, "", `Screenshot: ${s.screenshot ?? "none"}${s.phoneScreenshot ? ` · phone: ${s.phoneScreenshot}` : ""}. Clickable things tried: ${s.clicksTried}.`);
    if (s.error) lines.push(`The walk had a problem on this screen: ${s.error}`);
    if (!s.findings.length) lines.push("", "No script findings.");
    else { lines.push(""); for (const f of s.findings) lines.push(`- ${f.kind}: ${f.text ? `"${f.text}" ` : ""}(${f.where || "screen"}) ${f.detail}`); }
    lines.push("", `Words: ${s.words.join(" · ")}`, "");
  }
  if (r.warnings?.length) { lines.push("## Screens file", ""); for (const w of r.warnings) lines.push(`- ${w}`); lines.push(""); }
  lines.push("## Across screens", "");
  if (!r.crossScreen.length) lines.push("No mixed words found by the script.");
  for (const f of r.crossScreen) lines.push(`- ${f.kind}: ${f.text}: ${f.where} (${f.detail})`);
  if (r.blocked?.length) lines.push("", `Requests the walk stopped, so nothing was sent to another host: ${[...new Set(r.blocked)].join("; ")}`);
  lines.push("", "These are facts a script measured, not verdicts. The reviewer decides which are real problems.", "");
  return lines.join("\n");
}

async function main(argv) {
  const options = parseArgs(argv);
  if (options.check) {
    const major = Number(process.versions.node.split(".")[0]);
    const browser = findBrowser();
    console.log(`node ${process.versions.node}: ${major >= NODE_MAJOR ? "ok" : `too old, needs ${NODE_MAJOR} or newer`}`);
    console.log(`browser: ${browser ?? "none found (install Chrome, or set BROWSER_PATH)"}`);
    return major >= NODE_MAJOR && browser ? 0 : 1;
  }
  if (Number(process.versions.node.split(".")[0]) < NODE_MAJOR) throw new Error(`walk.mjs needs Node ${NODE_MAJOR} or newer; this is ${process.versions.node}.`);
  if (options.findScreens) { await findScreens(options); return 0; }
  return walk(options);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const timer = setTimeout(() => { console.error("walk.mjs: stopped after 10 minutes."); process.exit(1); }, 10 * 60_000); // a hard stop, so a stuck page never holds the loop
  // End on purpose once the output is written, so nothing left open (a socket, a server) keeps the script running.
  const end = (code) => { clearTimeout(timer); process.stdout.write("", () => process.exit(code)); };
  main(process.argv.slice(2)).then(end, (error) => { console.error(`walk.mjs: ${error.message}`); end(1); });
}
