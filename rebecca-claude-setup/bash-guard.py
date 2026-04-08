#!/usr/bin/env python3
"""Claude Code PreToolUse hook: deny-list bash guard.

Deny-lists dangerous patterns and auto-approves everything else.
Dangerous commands get permissionDecision: "ask" so they can still
be approved at the prompt.

Logs all decisions to /tmp/claude-bash-guard.log for audit.
"""

import json
import re
import sys
import time

LOG_PATH = "/tmp/claude-bash-guard.log"

DENY_PATTERNS = [
    # -- Destructive file operations --
    (re.compile(r'\brm\s+.*-[^\s]*r', re.IGNORECASE), "recursive rm"),
    (re.compile(r'\brm\s+.*-[^\s]*f[^\s]*r|\brm\s+.*-[^\s]*r[^\s]*f', re.IGNORECASE), "rm -rf"),
    (re.compile(r'\bshred\b', re.IGNORECASE), "shred"),
    (re.compile(r'\bsrm\b', re.IGNORECASE), "secure rm"),

    # -- Git dangerous operations --
    (re.compile(r'\bgit\s+push\s+.*--force\b|\bgit\s+push\s+.*\s-f\b', re.IGNORECASE), "git push --force"),
    (re.compile(r'\bgit\s+reset\s+--hard\b', re.IGNORECASE), "git reset --hard"),
    (re.compile(r'\bgit\s+clean\s+.*-[^\s]*f', re.IGNORECASE), "git clean -f"),
    (re.compile(r'\bgit\s+checkout\s+\.\s*$', re.IGNORECASE), "git checkout . (discard all)"),
    (re.compile(r'\bgit\s+restore\s+\.\s*$', re.IGNORECASE), "git restore . (discard all)"),
    (re.compile(r'\bgit\s+branch\s+.*-D\b', re.IGNORECASE), "git branch -D (force delete)"),

    # -- System modification --
    (re.compile(r'\bsudo\b'), "sudo"),
    (re.compile(r'\bchmod\s+777\b'), "chmod 777"),
    (re.compile(r'\bmkfs\b', re.IGNORECASE), "mkfs"),
    (re.compile(r'\bfdisk\b', re.IGNORECASE), "fdisk"),
    (re.compile(r'\bdiskutil\s+(erase|partition|unmount)', re.IGNORECASE), "diskutil destructive"),
    (re.compile(r'\blaunchctl\s+(unload|remove)\b', re.IGNORECASE), "launchctl unload/remove"),
    (re.compile(r'\bkillall\b', re.IGNORECASE), "killall"),
    (re.compile(r'\bpkill\b', re.IGNORECASE), "pkill"),
    (re.compile(r'\bbrew\s+(uninstall|remove)\b', re.IGNORECASE), "brew uninstall"),
    (re.compile(r'\bpip3?\s+uninstall\b', re.IGNORECASE), "pip uninstall"),

    # -- Database destructive --
    (re.compile(r'\bDROP\s+(TABLE|DATABASE)\b', re.IGNORECASE), "DROP TABLE/DATABASE"),
    (re.compile(r'\bTRUNCATE\b', re.IGNORECASE), "TRUNCATE"),
    (re.compile(r'\bDELETE\s+FROM\b', re.IGNORECASE), "DELETE FROM"),

    # -- Network/exfiltration --
    (re.compile(r'\bcurl\s+.*-X\s*(POST|PUT|DELETE|PATCH)\b', re.IGNORECASE), "curl non-GET"),
    (re.compile(r'\bwget\s+.*--post-data\b', re.IGNORECASE), "wget POST"),

    # -- Shell injection safety net --
    (re.compile(r'(?:^|\s|;|&&|\|\|)\beval\s', re.IGNORECASE), "eval command"),
    (re.compile(r'>\s*/dev/sd[a-z]', re.IGNORECASE), "write to raw device"),
]


def log(message: str) -> None:
    try:
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        with open(LOG_PATH, "a") as f:
            f.write(f"[{ts}] {message}\n")
    except Exception:
        pass


def check_command(command: str) -> tuple[bool, str]:
    for pattern, description in DENY_PATTERNS:
        if pattern.search(command):
            return True, description
    return False, ""


def main() -> None:
    try:
        raw = sys.stdin.read()
        data = json.loads(raw)
    except (json.JSONDecodeError, Exception) as e:
        log(f"ERROR: failed to parse stdin: {e}")
        sys.exit(0)

    tool_name = data.get("tool_name", "")
    if tool_name != "Bash":
        sys.exit(0)

    command = data.get("tool_input", {}).get("command", "")
    if not command:
        log("WARN: empty command, allowing")
        sys.exit(0)

    is_dangerous, reason = check_command(command)
    cmd_short = command[:200] + ("..." if len(command) > 200 else "")

    if is_dangerous:
        log(f"ASK: [{reason}] {cmd_short}")
        result = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "ask",
                "permissionDecisionReason": f"bash-guard: {reason}"
            }
        }
    else:
        log(f"ALLOW: {cmd_short}")
        result = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "allow",
                "permissionDecisionReason": "bash-guard: no deny pattern matched"
            }
        }

    json.dump(result, sys.stdout)
    sys.exit(0)


if __name__ == "__main__":
    main()
