---
name: save-conversation
description: >
  Save the current conversation as a reference doc in the Obsidian vault.
  Extracts human + assistant text, strips tool calls, formats with proper
  frontmatter, and saves to the vault's reference/ directory.
  Use when: (1) user says "/save-conversation", "/transcribe", "save this conversation",
  "save this session", (2) context is running low and conversation should be preserved,
  (3) user wants to capture a session's reasoning as source material.
  NOT for: saving individual files, creating concept pages, or summarizing without the transcript.
---

# /save-conversation

Save the current Claude Code session as a reference doc in the Obsidian vault (`__VAULT_PATH__/reference/`). Fast and cheap. Do NOT read the transcript into context or do cleanup passes.

## How to Execute This Skill

### Step 1: Parse, add frontmatter, and save (single step)

Generate a filename from the session topic. Pattern: `{topic}-session-{YYYY-MM-DD}.md`

Run this as a single bash command:

```bash
# 1. Parse transcript to temp file
python3 ~/.claude/skills/save-conversation/parse-session.py > /tmp/session-transcript.md

# 2. Prepend frontmatter + save
cat <<'FRONT' > /tmp/session-final.md
---
title: "SESSION_TITLE -- DATE"
date: YYYY-MM-DD
status: unprocessed
review: not-started
review-note: "BRIEF_DESCRIPTION"
tags:
  - voice-capture
  - process
  - raw
type: source-material
related:
  - "[[related-doc-1]]"
  - "[[related-doc-2]]"
---

ONE_SENTENCE_INTRO

FRONT
cat /tmp/session-transcript.md >> /tmp/session-final.md
mkdir -p "__VAULT_PATH__/reference"
cp /tmp/session-final.md "__VAULT_PATH__/reference/FILENAME.md"
```

Fill in the frontmatter from what you already know about the session (topic, related docs referenced during conversation). Do NOT read the transcript to figure these out.

### Step 2: Report

Report the Obsidian link: `obsidian://open?vault=__VAULT_NAME__&file=reference/{filename-without-extension}`

That's it. Done.

**If you need a different session** (not the current one), list available sessions:
```bash
python3 ~/.claude/skills/save-conversation/parse-session.py --list
```
Then pass the session ID:
```bash
python3 ~/.claude/skills/save-conversation/parse-session.py <session-id>.jsonl
```

## Important

- **Do NOT read the transcript into your context.** The parser output goes straight to a file. This is what keeps the skill fast and cheap.
- **Do NOT do voice cleanup passes.** The parser handles mechanical cleanup (filler words, stuttering, paragraph breaks). That's good enough.
- **Do NOT ask to confirm the filename.** Just pick a good one and save.
- This produces a **transcript**, not a summary. The raw back-and-forth IS the source material.
