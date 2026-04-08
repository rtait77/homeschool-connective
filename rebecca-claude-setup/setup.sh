#!/bin/bash
# Claude Code Toolkit Setup
# Run: bash setup.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  Claude Code Toolkit Setup"
echo "  ========================="
echo ""
echo "  This will set up voice transcription, conversation saving,"
echo "  a safety guard, and Gemini commands for Claude Code."
echo ""

# --- Gather info ---

# Auto-detect username
DETECTED_USER="$(whoami)"
echo "  Your Mac username appears to be: $DETECTED_USER"
read -p "  Press Enter to confirm, or type a different one: " USERNAME
USERNAME="${USERNAME:-$DETECTED_USER}"
HOME_DIR="/Users/$USERNAME"

if [ ! -d "$HOME_DIR" ]; then
  echo ""
  echo "  ERROR: $HOME_DIR does not exist. Check the username and try again."
  exit 1
fi

echo ""
echo "  Where is your Obsidian vault?"
echo "  (This is the folder Obsidian opens. Look in Obsidian > Settings > Files and Links"
echo "   or check what folder Obsidian shows in its sidebar.)"
echo ""
read -p "  Vault path (e.g., $HOME_DIR/Documents/my-vault): " VAULT_PATH

if [ -z "$VAULT_PATH" ]; then
  echo "  ERROR: You need to provide your Obsidian vault path."
  exit 1
fi

if [ ! -d "$VAULT_PATH" ]; then
  echo "  That folder doesn't exist yet. Creating it."
  mkdir -p "$VAULT_PATH"
fi

VAULT_NAME="$(basename "$VAULT_PATH")"

echo ""
echo "  --- API Keys ---"
echo ""
echo "  OpenAI key is needed for voice transcription (speech-to-text)."
echo "  Get one at: https://platform.openai.com/api-keys"
echo "  (Leave blank to skip - you can add it later)"
echo ""
read -p "  OpenAI API key: " OPENAI_KEY

echo ""
echo "  Gemini key is needed for the /gemini commands (optional)."
echo "  Get one at: https://aistudio.google.com/apikey"
echo "  (Leave blank to skip)"
echo ""
read -p "  Gemini API key: " GEMINI_KEY

# --- Check prerequisites ---

echo ""
echo "  Checking what's installed..."
echo ""

MISSING=()

if command -v sox &>/dev/null; then
  echo "  [OK] sox (audio processing)"
else
  MISSING+=("sox")
  echo "  [MISSING] sox (needed for voice recording)"
fi

if command -v jq &>/dev/null; then
  echo "  [OK] jq (JSON processing)"
else
  MISSING+=("jq")
  echo "  [MISSING] jq (needed for voice transcription)"
fi

if command -v python3 &>/dev/null; then
  echo "  [OK] python3"
else
  echo "  [MISSING] python3 - this should come with macOS, something is wrong"
  exit 1
fi

if [ -d "/Applications/Hammerspoon.app" ]; then
  echo "  [OK] Hammerspoon"
else
  echo "  [MISSING] Hammerspoon (needed for voice recording keyboard shortcut)"
  echo "           Download from: https://www.hammerspoon.org/"
fi

# Offer to install missing brew packages
if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  if command -v brew &>/dev/null; then
    echo "  I can install the missing tools for you."
    read -p "  Run 'brew install ${MISSING[*]}'? (y/n): " INSTALL_DEPS
    if [[ "$INSTALL_DEPS" == "y" || "$INSTALL_DEPS" == "Y" ]]; then
      brew install "${MISSING[@]}"
      echo "  Done!"
    fi
  else
    echo "  You need Homebrew to install the missing tools."
    echo "  Install it by pasting this into Terminal:"
    echo '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo "  Then run: brew install ${MISSING[*]}"
    echo ""
    read -p "  Continue setup anyway? (y/n): " CONTINUE
    if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
      echo "  OK, install the prerequisites and run setup.sh again."
      exit 0
    fi
  fi
fi

# --- Install everything ---

echo ""
echo "  Installing..."

# 1. Directories
echo "  Creating directories..."
mkdir -p "$HOME_DIR/.claude/bin"
mkdir -p "$HOME_DIR/.claude/hooks"
mkdir -p "$HOME_DIR/.claude/commands"
mkdir -p "$HOME_DIR/.claude/skills/save-conversation"
mkdir -p "$HOME_DIR/.hammerspoon"
mkdir -p "$VAULT_PATH/recordings"
mkdir -p "$VAULT_PATH/reference"

# 2. Hammerspoon config
echo "  Setting up voice recording..."
sed "s|__HOME__|$HOME_DIR|g" \
  "$SCRIPT_DIR/files/init.lua" > "$HOME_DIR/.hammerspoon/init.lua"

# 3. Voice transcription script
echo "  Setting up voice transcription..."
sed "s|__HOME__|$HOME_DIR|g; s|__VAULT_PATH__|$VAULT_PATH|g; s|__VAULT_NAME__|$VAULT_NAME|g" \
  "$SCRIPT_DIR/files/voice-transcribe.sh" > "$HOME_DIR/.claude/bin/voice-transcribe.sh"
chmod +x "$HOME_DIR/.claude/bin/voice-transcribe.sh"

# 4. Bash guard
echo "  Setting up safety guard..."
cp "$SCRIPT_DIR/files/bash-guard.py" "$HOME_DIR/.claude/hooks/bash-guard.py"

# 5. Gemini commands
echo "  Setting up Gemini commands..."
cp "$SCRIPT_DIR/files/gemini-clean" "$HOME_DIR/.claude/bin/gemini-clean"
chmod +x "$HOME_DIR/.claude/bin/gemini-clean"
cp "$SCRIPT_DIR/files/gemini.md" "$HOME_DIR/.claude/commands/gemini.md"
cp "$SCRIPT_DIR/files/gemini-review.md" "$HOME_DIR/.claude/commands/gemini-review.md"

# 6. Save conversation skill
echo "  Setting up /save-conversation..."
sed "s|__VAULT_PATH__|$VAULT_PATH|g; s|__VAULT_NAME__|$VAULT_NAME|g" \
  "$SCRIPT_DIR/files/save-conversation-SKILL.md" > "$HOME_DIR/.claude/skills/save-conversation/SKILL.md"
cp "$SCRIPT_DIR/files/parse-session.py" "$HOME_DIR/.claude/skills/save-conversation/parse-session.py"

# 7. API Keys
ENV_FILE="$HOME_DIR/.claude/.env"
if [ -n "$OPENAI_KEY" ] || [ -n "$GEMINI_KEY" ]; then
  echo "  Saving API keys..."
  touch "$ENV_FILE"
  [ -n "$OPENAI_KEY" ] && echo "OPENAI_API_KEY=$OPENAI_KEY" >> "$ENV_FILE"
  [ -n "$GEMINI_KEY" ] && echo "GEMINI_API_KEY=$GEMINI_KEY" >> "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

# 8. Settings
SETTINGS_FILE="$HOME_DIR/.claude/settings.json"
if [ ! -f "$SETTINGS_FILE" ]; then
  cp "$SCRIPT_DIR/files/settings.json" "$SETTINGS_FILE"
  sed -i '' "s|__HOME__|$HOME_DIR|g" "$SETTINGS_FILE"
  echo "  Created Claude Code settings with safety guard enabled."
else
  echo ""
  echo "  NOTE: You already have a settings file at $SETTINGS_FILE."
  echo "  The safety guard hook needs to be added manually."
  echo "  Ask Brian or Claude Code to help add it."
fi

# --- Done ---

echo ""
echo "  ========================="
echo "  Setup Complete!"
echo "  ========================="
echo ""
echo "  What you now have:"
echo ""
echo "  VOICE TRANSCRIPTION"
echo "    Option + \`  (backtick)     = Record, transcribe, copy to clipboard"
echo "    Option + Shift + R         = Record, transcribe, paste + submit"
echo "    Recordings save to: $VAULT_PATH/recordings/"
echo ""
echo "  SAVE CONVERSATIONS"
echo "    Type /save-conversation in Claude Code"
echo "    Transcripts save to: $VAULT_PATH/reference/"
echo ""
echo "  SAFETY GUARD"
echo "    Automatically active. Catches dangerous commands before they run."
echo ""
echo "  GEMINI"
echo "    Type /gemini [question] or /gemini-review in Claude Code"
echo ""
echo "  --- What to do now ---"
echo ""
echo "  1. Open Hammerspoon and click 'Reload Config' in the menu bar"
echo "  2. Test voice: press Option+\` to start, speak, press Option+\` to stop"
echo "  3. Wait a few seconds - your words will be copied to clipboard"
echo ""
if [ -z "$OPENAI_KEY" ]; then
  echo "  IMPORTANT: Voice transcription won't work until you add your OpenAI key."
  echo "  Edit $ENV_FILE and add: OPENAI_API_KEY=sk-your-key-here"
  echo ""
fi
