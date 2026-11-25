# Smoke run: product-deck-loop, end to end, as one unattended session

You play one Claude Code session that runs the whole loop from the first message to `STATE finish`. The working
folder is `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck`. The plugin is installed from `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops`. Begin every shell command with
`cd "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck" && export CLAUDE_PROJECT_DIR="/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck" && `.

The person's first message: `/product-loops:product-deck-loop a short HTML deck (6 to 8 slides) and PDF for a first meeting with the COO of Bright Smiles Dental, a 40-clinic UK chain, about our clinic scheduler. Use only the facts in facts.md, no web research. Quick track.`

Files already in the folder: `facts.md`.

Do what the skill says, start to finish. Read `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-deck-loop/SKILL.md` and `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/shared/loop-rules.md` first, and every
file they point to. `${CLAUDE_SKILL_DIR}` means `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-deck-loop` and `$ARGUMENTS` means the text after the command.

Two things differ from a real session, because no person and no hooks are here:
1. When node 1 ends its turn to wait for the person, write the message you would have shown to `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/evals/results/smoke/deck/intake-message.md`.
   Then play the person's reply "go": run
   `printf '%s' '{"hook_event_name":"UserPromptSubmit","prompt":"go","cwd":"/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck"}' | node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/shared/hooks/count-person-replies.mjs"`
   (this is what the plugin's hook does when a person types). Then carry on exactly as if the person had replied "go": the recommended track and every default.
2. No hook will send you back to work or block a question, so hold yourself to the rules: never ask anything, never stop before `STATE finish`, take defaults with `STATE decide`.

You may use helper agents where the skill says to (the Agent tool). You may use the web where the skill says to. Never publish, deploy, push, commit or send anything anywhere. Never read anything under an `evals/` folder except the output folder named here. Work for as long as it takes (up to about 75 minutes); if the budget pauses the run, run `STATE resume --continue` once and say so in the summary.

When the run is finished (or you had to give up), write `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/evals/results/smoke/deck/summary.md` with, in this order:
1. The exact output of `STATE status`, `STATE stop-fact status` and `STATE report`.
2. The full text of `handover.md`.
3. Every STATE refusal you hit (the exact line) and what you did about it.
4. Every place where the SKILL.md, loop-rules.md or a reference file was unclear, wrong, impossible to follow, or made you waste time. Quote the line and say what should change. This is the most valuable part: be specific and critical.
5. Minutes the whole run took, and how many helper agents you started.
Then copy the run folder (`loop-runs/...`) to `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/evals/results/smoke/deck/run/` (and for the deck loop also `decks/`, for the research loop also `research/`, for the build loop also the product folder, as `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/evals/results/smoke/deck/product/`).

Reply with one line: `done: <PASS or FAIL of the review node>, <n> refusals`.
