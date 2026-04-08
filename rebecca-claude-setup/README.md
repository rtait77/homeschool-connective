# Claude Code Toolkit

Extra tools for Claude Code that Brian set up. This adds:

1. **Voice-to-text** - Press a keyboard shortcut to talk instead of type. Your words get transcribed and either copied to your clipboard or pasted directly into Claude Code.
2. **Save conversations** - Type `/save-conversation` to save any Claude Code chat as a document in your Obsidian vault.
3. **Safety guard** - Prevents Claude from running dangerous commands without asking you first.
4. **Gemini second opinion** - Type `/gemini` to get Google's AI perspective on something, or `/gemini-review` to get both Claude and Gemini reviewing the same thing.

## Before You Start

You'll need two things set up first. Brian can help with these if needed.

### 1. Get an OpenAI API key (for voice transcription)

This is what powers the speech-to-text. It costs fractions of a penny per use.

1. Go to https://platform.openai.com/signup and create an account (or sign in)
2. Go to https://platform.openai.com/api-keys
3. Click "Create new secret key", give it a name like "voice transcription"
4. Copy the key (starts with `sk-`). You'll paste it during setup.
5. Add a payment method at https://platform.openai.com/settings/organization/billing (you need at least $5 credit, but voice transcription costs about $0.006 per minute)

### 2. Install Hammerspoon (for voice recording)

Hammerspoon is what listens for your keyboard shortcut and starts/stops recording.

1. Download from https://www.hammerspoon.org/
2. Open it, grant it Accessibility permissions when macOS asks
3. You'll see a little hammer icon in your menu bar

### 3. Install sox (audio processing)

Open Terminal (Applications > Utilities > Terminal) and paste:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

If Homebrew is already installed, that's fine. Then run:

```
brew install sox jq
```

### 4. (Optional) Gemini CLI for the /gemini commands

If you want the Gemini second-opinion feature:

```
npm install -g @google/gemini-cli
```

Then run `gemini` once in Terminal to authenticate with your Google account.

## Running Setup

Open Terminal, navigate to wherever you put this folder, and run:

```
cd rebecca-claude-setup
bash setup.sh
```

It will ask you:
- **Your Mac username** - the short name (the folder under /Users/, like `rebecca`)
- **Your Obsidian vault path** - where your vault lives (like `/Users/rebecca/Documents/my-vault`)
- **Your OpenAI API key** - paste the key from step 1
- **Gemini API key** - skip this if you did the CLI auth above, or paste a key from https://aistudio.google.com/apikey

## After Setup

1. **Reload Hammerspoon**: Click the hammer icon in your menu bar, click "Reload Config". You should see a "Voice transcription ready" popup.

2. **Test voice transcription**:
   - Press **Option + `** (the backtick key, top-left of keyboard next to 1)
   - You'll see "Recording" and a timer in the menu bar
   - Say something, then press **Option + `** again to stop
   - Wait a few seconds for "Copied to clipboard" - your words are now on your clipboard
   - The audio and transcript also save to your Obsidian vault under `recordings/`

3. **Auto-submit mode**: Press **Option + Shift + R** instead. Same thing, but when transcription finishes it automatically pastes and hits Enter in whatever window is focused. Great for talking directly to Claude Code.

4. **Save a conversation**: In Claude Code, type `/save-conversation`. It saves the full chat to your vault under `reference/`.

5. **Gemini**: Type `/gemini tell me about X` to offload a question to Gemini. Type `/gemini-review` to get both AIs reviewing the same code.

## If Something Goes Wrong

- **"No OPENAI_API_KEY found"** - Your key wasn't saved. Edit `~/.claude/.env` and add: `OPENAI_API_KEY=sk-your-key-here`
- **Recording doesn't start** - Make sure Hammerspoon has Accessibility permissions (System Settings > Privacy & Security > Accessibility)
- **"sox not found"** - Run `brew install sox` in Terminal
- **Voice transcription fails** - Check the log: `cat /tmp/voice-transcribe.log`
