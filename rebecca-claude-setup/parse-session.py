#!/usr/bin/env python3
"""
Parse a Claude Code session JSONL file into a clean conversation transcript.

Usage:
    python3 parse-session.py [session_file.jsonl]
    python3 parse-session.py --list              # list recent sessions
    python3 parse-session.py --json              # output as JSON
    python3 parse-session.py --json session.jsonl # JSON output for a specific session
    python3 parse-session.py                     # auto-detect current session (most recent)

Output: Markdown conversation transcript to stdout (default) or JSON (with --json).
Filters out: tool calls, tool results, thinking blocks, system messages, empty messages.
Keeps: human text and assistant text responses.
"""

import json
import re
import sys
import os
import glob
from datetime import datetime, timezone
from pathlib import Path


def get_project_sessions_dir():
    """Find the Claude Code sessions directory for this project."""
    claude_dir = Path.home() / ".claude" / "projects"
    if not claude_dir.exists():
        return None

    cwd = os.getcwd()

    # Claude Code converts the path: / -> -, _ -> -, strip leading -
    project_hash = cwd.replace("/", "-").replace("_", "-").lstrip("-")
    project_dir = claude_dir / project_hash
    if project_dir.exists():
        return project_dir

    # Also try without underscore conversion
    project_hash_alt = cwd.replace("/", "-").lstrip("-")
    project_dir_alt = claude_dir / project_hash_alt
    if project_dir_alt.exists():
        return project_dir_alt

    # Fuzzy fallback: find dirs containing key path segments
    path_parts = cwd.rstrip("/").split("/")[-2:]
    for d in claude_dir.iterdir():
        if d.is_dir():
            name_lower = d.name.lower()
            if all(part.lower().replace("_", "-") in name_lower for part in path_parts):
                return d

    return None


def list_sessions(sessions_dir, count=10):
    """List recent sessions with timestamps and preview."""
    jsonl_files = sorted(
        sessions_dir.glob("*.jsonl"),
        key=lambda f: f.stat().st_mtime,
        reverse=True
    )[:count]

    for f in jsonl_files:
        size_kb = f.stat().st_size / 1024
        mtime = datetime.fromtimestamp(f.stat().st_mtime)

        preview = ""
        try:
            with open(f) as fh:
                for line in fh:
                    obj = json.loads(line)
                    if obj.get("type") == "user":
                        content = obj.get("message", {}).get("content", "")
                        if isinstance(content, str):
                            text = strip_system_tags(content.strip())
                            if text and not text.startswith("[Request interrupted") and not text.startswith("<"):
                                preview = text[:80]
                                break
                        elif isinstance(content, list):
                            for block in content:
                                if isinstance(block, dict) and block.get("type") == "text":
                                    text = strip_system_tags(block.get("text", "").strip())
                                    if text and not text.startswith("[Request interrupted") and not text.startswith("<"):
                                        preview = text[:80]
                                        break
                            if preview:
                                break
        except Exception:
            preview = "(could not read)"

        print(f"{f.name}  {mtime:%Y-%m-%d %H:%M}  {size_kb:.0f}KB  {preview}")


def strip_system_tags(text):
    """Remove <system-reminder>...</system-reminder> and similar tags from text."""
    text = re.sub(r'<system-reminder>.*?</system-reminder>', '', text, flags=re.DOTALL)
    text = re.sub(r'<system>.*?</system>', '', text, flags=re.DOTALL)
    text = re.sub(r'<local-command-caveat>.*?</local-command-caveat>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[a-z-]+>.*?</[a-z-]+>', '', text, flags=re.DOTALL)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_text_from_content(content):
    """Extract plain text from a message content field."""
    if isinstance(content, str):
        return strip_system_tags(content.strip())

    if isinstance(content, list):
        texts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    text = strip_system_tags(block.get("text", "").strip())
                    if text:
                        texts.append(text)
                elif block.get("type") == "image":
                    source = block.get("source", {})
                    if source.get("type") == "url":
                        texts.append(f"[Screenshot: {source.get('url', '')}]")
                    elif source.get("media_type", "").startswith("image/"):
                        texts.append("[Screenshot shared]")
                    else:
                        texts.append("[Image shared]")
            elif isinstance(block, str):
                text = strip_system_tags(block.strip())
                if text:
                    texts.append(text)
        return "\n\n".join(texts)

    return ""


def clean_voice_transcription(text):
    """Clean up speech-to-text artifacts from voice-transcribed text."""
    # Collapse exact word repetitions
    text = re.sub(
        r"(\b\w+(?:'\w+)?)\s*(?:,\s*|\s+)\1(?:\s*(?:,\s*|\s+)\1)+",
        r'\1',
        text,
        flags=re.IGNORECASE
    )

    # Collapse repeated short phrases (space-separated)
    for _ in range(3):
        prev = text
        text = re.sub(
            r'((?:\b\w+\b\s+){1,4}\b\w+\b)\s+(?:\1\s+){1,}',
            r'\1 ',
            text
        )
        if text == prev:
            break

    # Collapse repeated short phrases with commas
    for _ in range(3):
        prev = text
        text = re.sub(
            r'((?:\b\w+\b[\s,]+){1,5}\b\w+\b),\s+(?:\1[,\s]+){1,}',
            r'\1 ',
            text
        )
        if text == prev:
            break

    # Reduce filler word clusters
    text = re.sub(
        r'(?:,?\s*you know)+(?:,?\s*(?:like|right))*(?:,?\s*you know)*',
        ', you know,',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(r',?\s*you know\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'you know,?\s*you know', 'you know', text, flags=re.IGNORECASE)

    text = re.sub(r'(?:I mean[,.]?\s*){2,}', 'I mean, ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?:sort of[,.]?\s*){2,}', 'sort of ', text, flags=re.IGNORECASE)
    text = re.sub(r'(?:kind of[,.]?\s*){2,}', 'kind of ', text, flags=re.IGNORECASE)

    # Remove um/uh
    text = re.sub(r'\b[Uu]m\b[,.]?\s*', '', text)
    text = re.sub(r'\b[Uu]h\b[,.]?\s*', '', text)

    # Collapse "he's, you know, he's" patterns
    text = re.sub(
        r"(\b\w+'\w+),?\s*you know,?\s*\1(?:,?\s*you know,?\s*\1)*",
        r'\1',
        text,
        flags=re.IGNORECASE
    )

    # Clean up whitespace and orphaned commas
    text = re.sub(r',\s*,', ',', text)
    text = re.sub(r'\s{2,}', ' ', text)
    text = re.sub(r'\s+,', ',', text)
    text = re.sub(r',\s*\.', '.', text)

    # Split into paragraphs at natural topic shifts
    paragraph_signals = [
        r'(?<=\.)\s+(So\s)',
        r'(?<=\.)\s+(And see,?\s)',
        r'(?<=\.)\s+(Now\s)',
        r'(?<=\.)\s+(But\s(?!if\b|when\b|also\b))',
        r'(?<=\.)\s+(I think\s)',
        r'(?<=\.)\s+(And I\s)',
        r'(?<=\.)\s+(Yep,?\s)',
        r'(?<=\.)\s+(Yeah,?\s)',
        r'(?<=\.)\s+(Also,?\s)',
        r'(?<=\.)\s+(Can you\s)',
        r'(?<=\.)\s+(The \w+ (?:attempts?|is|builds?|has)\s)',
    ]
    for pattern in paragraph_signals:
        text = re.sub(pattern, r'\n\n\1', text)

    return text.strip()


def is_voice_transcribed(text):
    """Heuristic: detect if text looks like a voice transcription."""
    if len(text) < 200:
        return False

    signals = 0
    if '\n' not in text and len(text) > 400:
        signals += 2
    if len(re.findall(r'\byou know\b', text, re.IGNORECASE)) >= 3:
        signals += 2
    if re.search(r"\b(\w+(?:'\w+)?),\s*\1,\s*\1", text):
        signals += 2
    if re.search(r'((?:\w+\s+){2,4})(?:\1){2,}', text):
        signals += 2
    informal = len(re.findall(r'\b(?:um|uh|like|sort of|kind of|I mean|I guess|right\?)\b', text, re.IGNORECASE))
    if informal >= 5:
        signals += 1

    return signals >= 3


def parse_session(jsonl_path):
    """Parse a JSONL session file into conversation exchanges."""
    exchanges = []
    assistant_by_request = {}

    with open(jsonl_path) as f:
        for line in f:
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            msg_type = obj.get("type")
            timestamp = obj.get("timestamp", "")

            if msg_type == "user":
                content = obj.get("message", {}).get("content", "")
                text = extract_text_from_content(content)

                if not text:
                    continue
                if text.startswith("[Request interrupted"):
                    continue

                img_match = re.match(r'^\[Image source: (.+)\]$', text)
                if img_match:
                    text = f"[Screenshot: {Path(img_match.group(1)).name}]"

                if isinstance(content, list):
                    has_image = any(
                        isinstance(b, dict) and b.get("type") == "image"
                        for b in content
                    )
                    if has_image and not text:
                        continue

                exchanges.append({
                    "role": "human",
                    "text": text,
                    "timestamp": timestamp
                })

            elif msg_type == "assistant":
                request_id = obj.get("requestId", obj.get("uuid"))
                content = obj.get("message", {}).get("content", [])

                if isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            text = block.get("text", "").strip()
                            if text:
                                existing = assistant_by_request.get(request_id, {})
                                if len(text) > len(existing.get("text", "")):
                                    assistant_by_request[request_id] = {
                                        "text": text,
                                        "timestamp": timestamp,
                                        "parent": obj.get("parentUuid")
                                    }

    for rid, data in assistant_by_request.items():
        exchanges.append({
            "role": "assistant",
            "text": data["text"],
            "timestamp": data["timestamp"]
        })

    exchanges.sort(key=lambda e: e.get("timestamp", ""))
    return exchanges


def format_transcript(exchanges, session_file=None):
    """Format exchanges as a clean markdown transcript."""
    lines = []

    if session_file:
        lines.append(f"<!-- Source: {Path(session_file).name} -->")
        lines.append("")

    for ex in exchanges:
        ts = ""
        if ex.get("timestamp"):
            try:
                dt = datetime.fromisoformat(ex["timestamp"].replace("Z", "+00:00"))
                ts = f" ({dt.strftime('%H:%M')})"
            except (ValueError, AttributeError):
                pass

        text = ex["text"]

        if ex["role"] == "human" and is_voice_transcribed(text):
            text = clean_voice_transcription(text)

        if ex["role"] == "human":
            lines.append(f"**Human**{ts}:")
            lines.append("")
            lines.append(text)
            lines.append("")
        else:
            lines.append(f"**Claude**{ts}:")
            lines.append("")
            lines.append(text)
            lines.append("")

        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def format_json(exchanges, session_file=None):
    """Format exchanges as a JSON array."""
    result = []
    for ex in exchanges:
        msg = {
            "role": "user" if ex["role"] == "human" else "assistant",
            "content": ex["text"],
        }
        if ex.get("timestamp"):
            msg["timestamp"] = ex["timestamp"]
        result.append(msg)

    output = {
        "messages": result,
        "messageCount": len(result),
    }
    if session_file:
        output["sessionFile"] = Path(session_file).name

    json.dump(output, sys.stdout, indent=2)
    print()


def main():
    sessions_dir = get_project_sessions_dir()

    if not sessions_dir:
        print("Error: Could not find Claude Code sessions directory.", file=sys.stderr)
        print("Make sure you're running from within a Claude Code project.", file=sys.stderr)
        sys.exit(1)

    output_json = "--json" in sys.argv
    args = [a for a in sys.argv[1:] if a not in ("--list", "--json")]

    if "--list" in sys.argv:
        list_sessions(sessions_dir)
        return

    if args:
        jsonl_path = args[0]
        if not os.path.exists(jsonl_path):
            session_id = args[0].removesuffix(".jsonl")
            candidate = sessions_dir / f"{session_id}.jsonl"
            if candidate.exists():
                jsonl_path = str(candidate)
            else:
                print(f"Error: File not found: {jsonl_path}", file=sys.stderr)
                print(f"Also tried: {candidate}", file=sys.stderr)
                sys.exit(1)
    else:
        jsonl_files = sorted(
            sessions_dir.glob("*.jsonl"),
            key=lambda f: f.stat().st_mtime,
            reverse=True
        )
        if not jsonl_files:
            print("Error: No session files found.", file=sys.stderr)
            sys.exit(1)
        jsonl_path = str(jsonl_files[0])

    exchanges = parse_session(jsonl_path)

    if not exchanges:
        print("No conversation content found in session.", file=sys.stderr)
        sys.exit(1)

    if output_json:
        format_json(exchanges, jsonl_path)
    else:
        transcript = format_transcript(exchanges, jsonl_path)
        print(transcript)


if __name__ == "__main__":
    main()
