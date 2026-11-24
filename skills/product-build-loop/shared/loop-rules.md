# Loop rules

You are running a loop. A loop is a fixed list of nodes, done in order. Read these rules once, before node 1.
They win over anything else in the loop's SKILL.md that says otherwise.

`STATE` below means: `node "<this skill's folder>/shared/scripts/loop-state.mjs"`.
The loop's SKILL.md gives the full path. Run every `STATE` command from the working folder, the folder the
session started in. Only you, the main session, run `STATE`. A helper agent never does.

## The files of a run

All of them live in the run folder that `STATE init` makes: `loop-runs/<loop>-<date>/` in the working folder.

- `state.json`: owned by `STATE`. Never edit it by hand.
- `brief.md`: what the person wants, in full. Written by node 1.
- `decisions.md`: every answer you chose on your own. Written by `STATE decide`.
- `handover.md`: what you give the person at the end. Written by the hand-over node.
- Proof files: whatever each node's check writes. A `--proof` path is relative to the working folder.

## Node 1: intake (the only node that talks to the person)

1. Run `STATE init --loop <loop name> --nodes <the node names from SKILL.md, in order, comma separated>`.
   It starts the intake node. If it says a run is still going, tell the person and ask whether to replace it.
2. Read everything the person gave: the message, files, links.
3. Collect what every later node needs. Each node in SKILL.md lists its needs, and each need has a default.
   Fill what you can find yourself. Do not ask for what you can find.
4. Rewrite the person's ask as a full brief: the goal, the facts, every need with its value or its default,
   and the stop fact (the one thing that must be true at the end).
5. Run the loop's start check, if SKILL.md has one (for example: a tool works, a file exists, a sign-in is fresh).
   If it fails, say what failed in the same message as your questions.
6. Ask the rest in ONE message. Show your brief, then a numbered list of questions. Each question names the
   default you picked. End with: `Reply with your answers, or just "go" to use the defaults.`
   If the AskUserQuestion tool is there, you may use it once for this round. If it is not there (a headless
   session), write the numbered list and end your turn.
   If the first message already says "go" and nothing is missing, skip the questions and go to step 7.
7. When the person answers: put their answers in the brief. If they said "go" (or clearly said to start),
   write `brief.md`, then run `STATE close-intake`. If they did not say go, ask once more, then wait.
8. After close-intake, tell the person in one line: "The run has started. You can leave. Everything is in
   <run folder>." Then go straight on to node 2 in the same turn. Do not wait for a reply.

## After the intake: never ask the person anything

From `close-intake` to `finish`:

- Never call AskUserQuestion. Never end a turn with a question. A hook blocks both.
- A missing answer takes its default. Write it down: `STATE decide --question "<q>" --answer "<the default>"`.
- Do not stop before `finish`. A hook sends you back with the next node's name if you try.
- Only three things may wait for the person: a delete, money, or an expired sign-in. Even then, do not wait:
  run `STATE hold --step "<what waits>" --kind delete|money|sign-in --why "<why>"`, skip that step, and go on.

## Each work node

1. `STATE start <node>`
2. Do the node's work as SKILL.md says.
3. Run the node's check. Write what proves it to a file (the proof), for example the output of a test.
4. If the check passed: `STATE done <node> --check "<what proved it>" --proof <proof file>`.
   `done` refuses when the proof file does not exist or an earlier node is not done or left.
5. If the check failed: `STATE retry <node> --why "<what failed>"`, fix it, and check again.
   After 3 retries, `retry` refuses. Then run `STATE left <node> --why "<what still fails>"` and go on.
6. A node you cannot start at all (a missing tool, a held step it needs): `STATE left <node> --why "<why>"`.

## Waiting for helper agents

Start the helpers a node needs in one message, and wait for all of them before the node's check. Do not
start them in the background and then end your turn: the run would stop until something wakes it. When a
shell command must wait for a file a helper writes, wait in the foreground with one loop that ends when the
file exists, and run it again if the shell moves it to the background.

## The review node (the node before handover)

The review checks the stop fact with fresh eyes. Start one helper agent (the Agent tool) that did not build
anything in this run. Give it the brief, the stop fact, and the paths to check. Tell it to read the real
files, not your notes, and to answer PASS or FAIL with the reason. Write its answer to the proof file.
If it says FAIL, treat it as a failed check (retry, then left). Never mark the review done without the agent.

## The hand-over node (always last)

1. `STATE start handover`
2. Write `handover.md` in the run folder with these parts:
   - What was made, with links or paths.
   - The stop fact, and whether the review said PASS.
   - Decisions: the count, and a link to `decisions.md`.
   - Left for you: every node marked left and every held step, each with why and the one step the person takes.
   - Rules learned: what made this run slow or wrong, as short rules for next time. Write "none" if none.
3. `STATE done handover --check "handover.md written" --proof <run folder>/handover.md`
4. `STATE finish --stop-fact "<the stop fact, as now true>"`. It refuses unless every node is done or left.
5. Your last message: a short summary and the path to `handover.md`. It holds no question mark at all, not
   even a quoted question, and no offer ("Want me to..."). Questions for the person go in `handover.md`.

## STATE commands

| When | Command |
|---|---|
| Node 1 starts | `init --loop <name> --nodes intake,<work nodes>,review,handover` |
| The person said go | `close-intake` (needs `brief.md`) |
| A node starts | `start <node>` |
| A node's check passed | `done <node> --check "<what proved it>" --proof <file>` |
| A node's check failed | `retry <node> --why "<what failed>"` (3 times at most) |
| A node is given up | `left <node> --why "<why>"` |
| A step must wait (delete, money, sign-in) | `hold --step "<step>" --kind <kind> --why "<why>"` |
| You chose an answer | `decide --question "<q>" --answer "<a>"` |
| Hand-over done | `finish --stop-fact "<fact>"` |
| Where am I? | `status` |
| The run must end early | `stop --why "<why>"` |

Every command prints a line that starts with `ok <command>` when it worked. Anything else means it refused:
read the reason, fix it, and run it again. Add `--json` to get JSON instead.
