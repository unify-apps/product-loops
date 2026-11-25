#!/usr/bin/env node
// notify.mjs tells the person that a run finished, stopped or paused, so they do not have to keep checking.
//   node notify.mjs "<title>" "<body>"
// On a Mac: a notification and a spoken title (no voice when PRODUCT_LOOPS_QUIET=1). On Linux: notify-send, when it
// is there. On Windows: a PowerShell toast. When PRODUCT_LOOPS_NOTIFY_URL is set, it also posts { text } as JSON to
// that address (the shape a Slack webhook takes), giving up after 5 seconds.
// It never throws and always exits 0: a notice that fails must never break a run.
// Other scripts call sendNotice(), which starts this file on its own and does not wait for it.
import { execFile, spawn } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const scriptPath = fs.realpathSync(fileURLToPath(import.meta.url));
const WAIT_MS = 5000; // the longest any one way of telling the person may take

/**
 * Starts the notice and returns at once. It never waits and never throws.
 * Two settings exist for tests and for people who want their own way of being told:
 *   PRODUCT_LOOPS_NOTIFY_LOG=<file>  appends "<title>\t<body>" to that file instead of notifying (tests prove the call)
 *   PRODUCT_LOOPS_NOTIFY_CMD=<program>  runs that program with the title and the body instead of this file
 * Returns how the notice was sent: "log", "command", "notify" or "failed".
 */
export function sendNotice(title, body, env = process.env) {
  try {
    if (env.PRODUCT_LOOPS_NOTIFY_LOG) {
      fs.appendFileSync(env.PRODUCT_LOOPS_NOTIFY_LOG, `${oneLine(title)}\t${oneLine(body)}\n`);
      return "log";
    }
    const [program, args, how] = env.PRODUCT_LOOPS_NOTIFY_CMD
      ? [env.PRODUCT_LOOPS_NOTIFY_CMD, [String(title), String(body)], "command"]
      : [process.execPath, [scriptPath, String(title), String(body)], "notify"];
    const child = spawn(program, args, { detached: true, stdio: "ignore", env });
    child.on("error", () => {}); // a missing program reports here, later; without a listener it would crash the caller
    child.unref();
    return how;
  } catch {
    return "failed";
  }
}

const oneLine = (text) => String(text ?? "").replace(/\s+/gu, " ").trim();
// AppleScript strings end at a double quote, so quotes and backslashes in the words must be escaped.
const appleText = (text) => oneLine(text).replace(/\\/gu, "\\\\").replace(/"/gu, '\\"');
const powershellText = (text) => oneLine(text).replace(/'/gu, "''");

/** Runs one program and waits for it at most WAIT_MS. Resolves either way; a missing program is not an error here. */
function run(program, args) {
  return new Promise((resolve) => {
    try {
      execFile(program, args, { timeout: WAIT_MS, windowsHide: true }, () => resolve());
    } catch {
      resolve();
    }
  });
}

async function post(url, title, body) {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `${oneLine(title)}: ${oneLine(body)}` }),
      signal: AbortSignal.timeout(WAIT_MS),
    });
  } catch {
    // The address is wrong, slow or down. The person still gets the notice on this computer.
  }
}

/** Tells the person every way this computer offers. Waits for each way at most WAIT_MS. */
export async function notifyNow(title, body, env = process.env, platform = process.platform) {
  const jobs = [];
  if (platform === "darwin") {
    jobs.push(run("osascript", ["-e", `display notification "${appleText(body)}" with title "${appleText(title)}"`]));
    if (env.PRODUCT_LOOPS_QUIET !== "1") jobs.push(run("say", ["-v", "Daniel", oneLine(title)]));
  } else if (platform === "linux") {
    jobs.push(run("notify-send", [oneLine(title), oneLine(body)]));
  } else if (platform === "win32") {
    const script = [
      "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null",
      "$t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)",
      `$t.GetElementsByTagName('text').Item(0).AppendChild($t.CreateTextNode('${powershellText(title)}')) | Out-Null`,
      `$t.GetElementsByTagName('text').Item(1).AppendChild($t.CreateTextNode('${powershellText(body)}')) | Out-Null`,
      "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Product Loops').Show([Windows.UI.Notifications.ToastNotification]::new($t))",
    ].join("; ");
    jobs.push(run("powershell", ["-NoProfile", "-NonInteractive", "-Command", script]));
  }
  if (env.PRODUCT_LOOPS_NOTIFY_URL) jobs.push(post(env.PRODUCT_LOOPS_NOTIFY_URL, title, body));
  await Promise.all(jobs);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === scriptPath) {
  const [title = "Product loops", body = ""] = process.argv.slice(2);
  notifyNow(title, body).catch(() => {}).finally(() => { process.exitCode = 0; });
}
