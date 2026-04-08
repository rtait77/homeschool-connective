Cross-LLM code review: get Gemini's independent review alongside Claude's own analysis.

## What to review

$ARGUMENTS

## Instructions

### Step 1: Gather context
- If the user specified files, read them
- If no files specified, check `git diff` for recent unstaged changes, or `git diff --cached` for staged changes
- Identify the relevant files and their full content

### Step 2: Your own review (Claude)
Perform your own code review first. Note:
- Bugs or logic errors
- Security concerns
- Architectural issues
- Code quality / readability
- Anything that feels off

Keep your notes internal for now.

### Step 3: Send to Gemini for independent review
Construct a prompt for Gemini that includes the full file contents and asks for a thorough code review. Do NOT include your own findings (we want an independent perspective).

```bash
~/.claude/bin/gemini-clean "You are reviewing code changes. Review the following code for: bugs, security issues, architectural concerns, code quality, and edge cases. Be specific and cite line numbers.

[paste the code/diff here]"
```

For multiple files, use the --file flag:
```bash
~/.claude/bin/gemini-clean "Review these files for bugs, security issues, and architectural concerns. Be specific." --file path/to/file1.ts --file path/to/file2.ts
```

### Step 4: Show Gemini's full response
**IMPORTANT: Always echo Gemini's full response as regular text in your reply.** The bash tool output collapses in the UI and the user can't read it. Reproduce Gemini's complete response as your own output text so it's fully visible. Do not summarize or truncate.

### Step 5: Synthesize both perspectives
Present a unified review with three sections:

**Both agree:** Issues both Claude and Gemini independently identified (highest confidence)

**Claude only:** Issues Claude found that Gemini missed (explain why you think they matter)

**Gemini only:** Issues Gemini found that Claude missed (assess whether they're valid)

**Verdict:** Overall assessment and recommended actions, prioritized.
