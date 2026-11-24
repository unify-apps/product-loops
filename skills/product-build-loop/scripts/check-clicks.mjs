#!/usr/bin/env node
// check-clicks.mjs opens every link of a prototype in a real browser and clicks everything that looks clickable.
//   node check-clicks.mjs <links.md or URL>... --out <report.json> [--shots <folder>] [--tools <folder>] [--allow <word,word>] [--max 120]
//   node check-clicks.mjs --probe [--tools <folder>]      only says which browser a check would use
// It never follows a link to another site. Before it clicks a form's submit button it fills that form's empty fields
// with test values, so a form that saves is tested too.
// A click is dead when nothing changes: no new content, no new address, no dialog, no new tab.
// The browser: the system Chrome through playwright-core (installed once into --tools with npm), else Playwright's own
// browser, else a load-only check (each link must load; clicks are then NOT checked, and the report says so).
// Exit 0: every link opened, no dead click, no page error, no placeholder text. Exit 1: something failed. Exit 2: usage.
// In load-only mode exit 0 means only that every link loaded: the report then says "clicksChecked": false.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

// An old enough, fixed version, so every run gets the same browser driver.
const PLAYWRIGHT = "playwright-core@1.62.1";
const PLACEHOLDER = /\b(lorem ipsum|placeholder|coming soon|todo|tbd|not (?:yet )?implemented|under construction|dummy text|sample text)\b/giu;
// How long a click gets to change the page. Prototype clicks answer at once; 350 ms leaves room for a short animation.
const SETTLE_MS = 350;

function parseArgs(argv) {
  // --max: a prototype page rarely has more than 120 things to click; past that the check only gets slower.
  const options = { inputs: [], out: null, shots: null, tools: null, allow: [], max: 120, probe: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--out") options.out = path.resolve(argv[++i]);
    else if (arg === "--shots") options.shots = path.resolve(argv[++i]);
    else if (arg === "--tools") options.tools = path.resolve(argv[++i]);
    else if (arg === "--allow") options.allow = argv[++i].split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
    else if (arg === "--max") options.max = Number(argv[++i]);
    else if (arg === "--probe") options.probe = true;
    else options.inputs.push(arg);
  }
  return options;
}

/** Pure: every local link in the inputs. A file is read for links; anything else is taken as a link. */
export function linksFrom(inputs) {
  const found = [];
  for (const input of inputs) {
    const text = fs.existsSync(input) ? fs.readFileSync(input, "utf8") : input;
    for (const match of text.matchAll(/https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?[^\s)>\]"'`]*/gu)) found.push(match[0].replace(/[.,;]+$/u, ""));
  }
  return [...new Set(found)];
}

/** Pure: placeholder words in a text, minus the words this product really uses. */
export function placeholders(text, allow = []) {
  return [...new Set([...String(text).matchAll(PLACEHOLDER)].map((m) => m[0].toLowerCase()))].filter((w) => !allow.includes(w));
}

function loadPlaywright(tools) {
  const tries = [path.join(process.cwd(), "x.js"), ...(tools ? [path.join(tools, "x.js")] : [])];
  for (const from of tries) {
    for (const name of ["playwright", "playwright-core"]) {
      try { return createRequire(from)(name); } catch { /* try the next one */ }
    }
  }
  if (!tools) return null;
  fs.mkdirSync(tools, { recursive: true });
  const done = spawnSync("npm", ["install", "--prefix", tools, PLAYWRIGHT, "--no-audit", "--no-fund", "--silent"], { encoding: "utf8" });
  if (done.status !== 0) { console.error(`check-clicks: npm could not install ${PLAYWRIGHT}: ${String(done.stderr).slice(0, 200)}`); return null; }
  try { return createRequire(path.join(tools, "x.js"))("playwright-core"); } catch { return null; }
}

/** Browsers Playwright downloaded earlier on this laptop, newest first. Any of them works with playwright-core. */
function cachedBrowsers() {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? "";
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(home, "Library", "Caches", "ms-playwright"), path.join(home, ".cache", "ms-playwright"),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "ms-playwright")].filter(Boolean);
  const names = new Set(["chrome-headless-shell", "chrome-headless-shell.exe", "Chromium", "chrome", "chrome.exe"]);
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 5 || !fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && names.has(entry.name) && /MacOS|headless|chrome-(linux|win)/u.test(full)) found.push(full);
      else if (entry.isDirectory() && !entry.name.endsWith(".framework")) walk(full, depth + 1);
    }
  };
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const folder of fs.readdirSync(root).filter((n) => /^chromium/u.test(n)).sort().reverse()) walk(path.join(root, folder), 0);
  }
  return found;
}

async function launch(playwright) {
  const tries = [{ channel: "chrome" }, {}, ...cachedBrowsers().map((executablePath) => ({ executablePath }))];
  for (const options of tries) {
    try {
      const browser = await playwright.chromium.launch({ headless: true, timeout: 20000, ...options });
      return { browser, name: options.channel ?? (options.executablePath ? path.basename(options.executablePath) : "playwright chromium") };
    } catch { /* try the next browser */ }
  }
  return null;
}

// Runs in the page: tags every visible thing that looks clickable with data-cc, in page order, and lists them.
function tagClickables(max) {
  const NATIVE = "a[href],button,summary,[role=button],[role=tab],[role=menuitem],[role=link],[role=option],[role=switch],[role=checkbox],[onclick]";
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const list = [];
  for (const el of document.querySelectorAll("body *")) {
    el.removeAttribute("data-cc");
    if (el.matches("input,select,textarea,option,label,html,body") || el.closest("[disabled],[aria-disabled=true]")) continue;
    const native = el.matches(NATIVE);
    const pointer = getComputedStyle(el).cursor === "pointer";
    const parentPointer = el.parentElement && getComputedStyle(el.parentElement).cursor === "pointer";
    if (!(native || (pointer && !parentPointer)) || !visible(el)) continue;
    const href = el.getAttribute("href");
    const other = href && /^(https?:)?\/\//u.test(href) && !href.includes(location.host);
    // A link to the page already open is the "you are here" mark of a menu, not a dead click.
    const here = el.matches("a[href]") && el.href === location.href;
    const kind = other ? "other-site" : href && /^(mailto|tel):/u.test(href) ? "mail" : el.getAttribute("target") === "_blank" ? "new-tab" : here ? "here" : "click";
    el.setAttribute("data-cc", String(list.length));
    list.push({ i: list.length, kind, text: (el.innerText || el.getAttribute("aria-label") || el.getAttribute("title") || el.tagName).trim().replace(/\s+/gu, " ").slice(0, 50) });
    if (list.length >= max) break;
  }
  return list;
}

async function checkWithBrowser(browser, links, options) {
  const routes = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // serve.mjs pages ask /__changed to reload themselves when a file changes. A helper writing a file mid-check
  // must not reload the page under the check, so the check always gets the same answer.
  await context.route("**/__changed", (r) => r.fulfill({ status: 200, body: "0" }));
  for (const url of links) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message.slice(0, 200)));
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text().slice(0, 200)); });
    page.on("dialog", (dialog) => dialog.accept().catch(() => {}));
    const route = { url, opened: false, errors, placeholders: [], clicks: { tried: 0, dead: [], skipped: 0, otherSite: 0 } };
    const open = async () => {
      // A fresh state for each click: an earlier click must not hide or show what the next one finds.
      // Saved data goes too, so a prototype that saves to storage starts from its own sample data every time.
      await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* no storage */ } }).catch(() => {});
      await page.goto("about:blank");
      await page.goto(url, { waitUntil: "load", timeout: 15000 });
      await page.evaluate(() => document.getAnimations?.().forEach((a) => a.finish()));
      await page.waitForTimeout(150);
      return page.evaluate(tagClickables, options.max);
    };
    let targets = [];
    try {
      const res = await page.goto(url, { waitUntil: "load", timeout: 15000 });
      targets = await open();
      const text = await page.evaluate(() => document.body?.innerText ?? "");
      route.opened = Boolean(res?.ok()) && text.trim().length >= 20;
      route.placeholders = placeholders(text, options.allow);
      if (options.shots) {
        fs.mkdirSync(options.shots, { recursive: true });
        const name = (url.split("#")[1] || "home").replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "") || "home";
        route.shot = path.join(options.shots, `${name}.png`);
        await page.screenshot({ path: route.shot, fullPage: true });
      }
    } catch (error) { errors.push(`did not open: ${error.message.slice(0, 160)}`); }
    let dirty = false;
    for (const target of route.opened ? targets : []) {
      if (target.kind !== "click") { route.clicks.otherSite += target.kind === "other-site" ? 1 : 0; continue; }
      try {
        if (dirty) { await open(); dirty = false; }
        const el = await page.$(`[data-cc="${target.i}"]`);
        if (!el) { route.clicks.skipped++; continue; }
        await el.hover({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(120);
        const before = await page.evaluate(() => {
          window.__ccChanges = 0;
          window.__ccObserver?.disconnect();
          window.__ccObserver = new MutationObserver((records) => { window.__ccChanges += records.length; });
          window.__ccObserver.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
          return location.href;
        });
        // A submit button: fill the form's empty fields first, or the browser's own check stops the click.
        await el.evaluate((node) => {
          const form = node.closest("form");
          const submits = node.matches("button:not([type]),button[type=submit],input[type=submit]");
          if (!form || !submits) return;
          const values = { email: "test@example.com", number: "1", date: "2026-01-15", url: "https://example.com", tel: "5550100", time: "10:00" };
          for (const field of form.querySelectorAll("input,textarea,select")) {
            if (field.matches("[type=hidden],[type=checkbox],[type=radio],[type=file],[type=submit],[type=button]") || field.value) continue;
            if (field.tagName === "SELECT") { if (field.options.length) field.selectedIndex = field.options.length > 1 ? 1 : 0; }
            else field.value = values[field.type] ?? "Test entry";
            field.dispatchEvent(new Event("input", { bubbles: true }));
            field.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        let reacted = false;
        const onReact = () => { reacted = true; };
        page.once("dialog", onReact);
        context.once("page", onReact);
        await el.click({ timeout: 2000 });
        route.clicks.tried++;
        await page.waitForTimeout(SETTLE_MS);
        const after = await page.evaluate(() => ({ href: location.href, changes: window.__ccChanges, text: document.body?.innerText ?? "" }));
        page.off("dialog", onReact);
        context.off("page", onReact);
        // A bare "#" link moves the address but opens nothing, so it does not count as a change.
        const moved = after.href !== before && !after.href.endsWith("#");
        if (moved || after.changes > 0 || reacted) {
          dirty = true;
          const found = placeholders(after.text, options.allow).filter((w) => !route.placeholders.includes(w));
          if (found.length) route.placeholders.push(...found.map((w) => `${w} (after clicking "${target.text}")`));
        } else route.clicks.dead.push(target.text);
      } catch { route.clicks.skipped++; dirty = true; }
    }
    routes.push(route);
    await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* no storage */ } }).catch(() => {});
    await page.close();
  }
  await context.close();
  return routes;
}

async function checkLoadOnly(links, options) {
  const routes = [];
  for (const url of links) {
    const route = { url, opened: false, errors: [], placeholders: [], clicks: "not checked: no browser" };
    try {
      const res = await fetch(url, { cache: "no-store" });
      const html = await res.text();
      const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/giu, " ");
      route.opened = res.ok && text.trim().length >= 20;
      route.placeholders = placeholders(text, options.allow);
    } catch (error) { route.errors.push(`did not open: ${error.message}`); }
    routes.push(route);
  }
  return routes;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.probe) {
    const found = loadPlaywright(options.tools);
    const browser = found ? await launch(found) : null;
    if (browser) await browser.browser.close();
    console.log(browser ? `browser: ${browser.name}` : "browser: none (links will be checked by loading only; clicks will not be checked)");
    return 0;
  }
  const links = linksFrom(options.inputs);
  if (!options.out || !links.length) {
    console.error("Usage: node check-clicks.mjs <links.md or URL>... --out <report.json> [--shots <folder>] [--tools <folder>] [--allow <words>]");
    console.error(links.length ? "" : "No local link (http://127.0.0.1:... or http://localhost:...) was found in the inputs.");
    return 2;
  }
  const playwright = loadPlaywright(options.tools);
  const launched = playwright ? await launch(playwright) : null;
  const routes = launched ? await checkWithBrowser(launched.browser, links, options) : await checkLoadOnly(links, options);
  if (launched) await launched.browser.close();
  const bad = routes.filter((r) => !r.opened || r.errors.length || r.placeholders.length || (typeof r.clicks === "object" && r.clicks.dead.length));
  const report = { checkedAt: new Date().toISOString(), browser: launched?.name ?? "none (load-only: clicks not checked)", pass: bad.length === 0, clicksChecked: Boolean(launched), links: links.length, failing: bad.map((r) => r.url), routes };
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  fs.writeFileSync(options.out, `${JSON.stringify(report, null, 2)}\n`);
  for (const r of routes) {
    const clicks = typeof r.clicks === "object" ? `${r.clicks.tried} clicks, ${r.clicks.skipped} could not be clicked, ${r.clicks.dead.length} dead${r.clicks.dead.length ? ` (${r.clicks.dead.slice(0, 5).map((t) => `"${t}"`).join(", ")})` : ""}` : r.clicks;
    console.log(`${r.opened && !r.errors.length && !r.placeholders.length && !(r.clicks.dead?.length) ? "ok  " : "FAIL"} ${r.url}: ${r.opened ? "opened" : "did not open"}; ${clicks}; ${r.errors.length} errors; placeholders: ${r.placeholders.join(", ") || "none"}`);
  }
  const verdict = !report.pass ? "FAIL" : launched ? "PASS" : "LOAD-ONLY PASS (clicks NOT checked)";
  console.log(`${verdict}: ${links.length} links, browser ${report.browser}. Report: ${options.out}`);
  return report.pass ? 0 : 1;
}

main().then((code) => { process.exitCode = code; }, (error) => { console.error(`check-clicks: ${error.message}`); process.exitCode = 1; });
