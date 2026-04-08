Send a task to Google Gemini for analysis. Defaults to **offload mode**: send files to Gemini without reading them yourself, preserving your context window for implementation work.

## Your task

The user wants Gemini's perspective on: $ARGUMENTS

## Instructions

1. Identify which files Gemini needs based on the user's request. Use Glob or Grep to find file paths if needed, but **do NOT read the file contents yourself** unless you specifically need them for your own analysis.

2. Send files to Gemini using `--file` flags. The wrapper script reads the files and pipes them to Gemini. You never load them into your context:

```bash
~/.claude/bin/gemini-clean "Your detailed prompt here" --file path/to/file1.ts --file path/to/file2.ts
```

For prompts without file context:
```bash
~/.claude/bin/gemini-clean "Your question here"
```

3. **IMPORTANT: Always echo Gemini's full response as regular text in your reply.** The bash tool output collapses in the UI and the user can't read it. After the bash call, reproduce Gemini's complete response as your own output text so it's fully visible. Do not summarize or truncate. Then add your own take below it if relevant.

## When to read files yourself (cross-review mode)

If the user explicitly asks for both perspectives, or if this is a code review / architecture decision where model diversity matters, read the files yourself too and synthesize both analyses. But the default is offload: let Gemini do the context-heavy work.

## Guidelines
- Prefer `--file` flags over piping. The wrapper handles multiple files.
- For large analysis (many files, full directories), lean hard on Gemini's 1M token window. Send more context than you normally would.
- If Gemini's response seems incomplete or off, then read the files yourself and provide a more grounded take.
