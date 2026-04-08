#!/bin/bash
# voice-transcribe.sh -- Transcribe a recording, save to Obsidian vault, copy to clipboard
# Called by Hammerspoon after recording stops. Arg: path to WAV file.

set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

VAULT_DIR="__VAULT_PATH__"
RECORDINGS_DIR="$VAULT_DIR/recordings"
TEMP_FILE="${1:-/tmp/voice-dictation.wav}"
API_FILE="${TEMP_FILE%.wav}-16k.wav"
VAULT_FILE="${TEMP_FILE%.wav}-vault.mp3"
ENV_FILE="__HOME__/.claude/.env"
SOX_BIN="/opt/homebrew/bin/sox"
LOG_FILE="/tmp/voice-transcribe.log"

log() { echo "$(date '+%H:%M:%S') $*" >> "$LOG_FILE"; }
log "--- transcription started ---"

# Read API key from env file
OPENAI_API_KEY="$(grep '^OPENAI_API_KEY=' "$ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'")"
export OPENAI_API_KEY

if [ -z "$OPENAI_API_KEY" ]; then
  echo "ERROR: No OPENAI_API_KEY found in $ENV_FILE"
  exit 1
fi

if [ ! -f "$TEMP_FILE" ]; then
  echo "ERROR: No audio file found"
  exit 1
fi

mkdir -p "$RECORDINGS_DIR"

# Check raw file exists and isn't trivially small
FILE_SIZE=$(stat -f%z "$TEMP_FILE")
if [ "$FILE_SIZE" -lt 1000 ]; then
  echo "ERROR: Recording too short"
  rm -f "$TEMP_FILE"
  exit 1
fi

# Fix WAV header: sox/rec writes placeholder sizes at recording start and may
# not update them when killed via SIGINT. Patch sizes to match actual file size.
python3 -c "
import struct, sys

with open('$TEMP_FILE', 'r+b') as f:
    header = f.read(200)
    if header[:4] != b'RIFF' or header[8:12] != b'WAVE':
        sys.exit(0)

    file_size = f.seek(0, 2)

    # Find 'data' chunk
    data_pos = header.find(b'data')
    if data_pos < 0:
        sys.exit(0)

    data_size_offset = data_pos + 4
    audio_start = data_pos + 8
    current_data = struct.unpack('<I', header[data_size_offset:data_size_offset+4])[0]
    expected_data = file_size - audio_start

    if current_data == expected_data:
        sys.exit(0)

    # Fix RIFF chunk size (bytes 4-7)
    f.seek(4)
    f.write(struct.pack('<I', file_size - 8))

    # Fix data chunk size
    f.seek(data_size_offset)
    f.write(struct.pack('<I', expected_data))

    # Fix 'fact' chunk sample count if present
    fact_pos = header.find(b'fact')
    if fact_pos >= 0:
        block_align = struct.unpack('<H', header[32:34])[0]
        expected_samples = expected_data // block_align
        f.seek(fact_pos + 8)
        f.write(struct.pack('<I', expected_samples))
"

# Downsample to 16kHz mono 16-bit for API
"$SOX_BIN" "$TEMP_FILE" -r 16000 -c 1 -b 16 "$API_FILE" 2>/dev/null

# Convert to mp3 for vault storage
"$SOX_BIN" "$TEMP_FILE" -r 16000 -c 1 "$VAULT_FILE" 2>/dev/null

# Transcribe via Whisper API
API_SIZE=$(stat -f%z "$API_FILE")
CHUNK_THRESHOLD=20000000
TRANSCRIPT=""

whisper_call() {
  local audio_file="$1"
  local label="$2"
  local result=""
  for attempt in 1 2; do
    local http_tmp=$(mktemp /tmp/whisper-resp.XXXXX)
    local exit_code=0
    result=$(curl -s --max-time 120 -w '\n%{http_code}' \
      https://api.openai.com/v1/audio/transcriptions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -F file=@"$audio_file" \
      -F model=whisper-1 \
      -F response_format=text \
      2>"$http_tmp") || exit_code=$?

    local http_code="${result##*$'\n'}"
    result="${result%$'\n'*}"
    rm -f "$http_tmp"

    if [ "$exit_code" -ne 0 ]; then
      log "$label: curl failed (attempt $attempt, exit $exit_code)"
      result=""
      [ "$attempt" -eq 1 ] && { sleep 2; continue; }
    elif [ "$http_code" != "200" ]; then
      log "$label: API error (attempt $attempt, HTTP $http_code): ${result:0:200}"
      result=""
      [ "$attempt" -eq 1 ] && { sleep 2; continue; }
    elif [ -z "$result" ]; then
      log "$label: empty response (attempt $attempt)"
      [ "$attempt" -eq 1 ] && { sleep 2; continue; }
    else
      log "$label: succeeded (attempt $attempt, ${#result} chars)"
      echo "$result"
      return 0
    fi
  done
  return 1
}

if [ "$API_SIZE" -gt "$CHUNK_THRESHOLD" ]; then
  # Chunked transcription for long recordings
  DURATION=$("$SOX_BIN" --i -D "$API_FILE" 2>/dev/null | cut -d. -f1)
  CHUNK_SECS=600
  CHUNK_DIR=$(mktemp -d /tmp/voice-chunks.XXXXX)
  CHUNK_NUM=0
  OFFSET=0

  log "chunking: ${DURATION}s total, ${API_SIZE} bytes"

  while [ "$OFFSET" -lt "$DURATION" ]; do
    CHUNK_FILE="${CHUNK_DIR}/chunk-$(printf '%03d' $CHUNK_NUM).wav"
    "$SOX_BIN" "$API_FILE" "$CHUNK_FILE" trim "$OFFSET" "$CHUNK_SECS" 2>/dev/null

    CHUNK_SIZE=$(stat -f%z "$CHUNK_FILE" 2>/dev/null || echo 0)
    if [ "$CHUNK_SIZE" -lt 1000 ]; then
      log "skipping trivial chunk $CHUNK_NUM (${CHUNK_SIZE} bytes)"
      rm -f "$CHUNK_FILE"
      break
    fi

    log "transcribing chunk $CHUNK_NUM (offset=${OFFSET}s, ${CHUNK_SIZE} bytes)"

    CHUNK_TEXT=$(whisper_call "$CHUNK_FILE" "chunk $CHUNK_NUM") || {
      log "FATAL: chunk $CHUNK_NUM failed after 2 attempts"
      rm -rf "$CHUNK_DIR"
      echo "ERROR: Transcription failed on chunk $((CHUNK_NUM + 1))"
      exit 1
    }

    [ -n "$TRANSCRIPT" ] && TRANSCRIPT="${TRANSCRIPT} "
    TRANSCRIPT="${TRANSCRIPT}${CHUNK_TEXT}"

    OFFSET=$(( OFFSET + CHUNK_SECS ))
    CHUNK_NUM=$(( CHUNK_NUM + 1 ))
  done

  rm -rf "$CHUNK_DIR"
  log "chunked transcription complete: $CHUNK_NUM chunks, ${#TRANSCRIPT} chars"

else
  log "calling Whisper API (file: ${API_SIZE} bytes)"
  TRANSCRIPT=$(whisper_call "$API_FILE" "Whisper") || true
fi

if [ -z "$TRANSCRIPT" ]; then
  log "FATAL: transcription failed"
  echo "ERROR: Transcription failed (see $LOG_FILE)"
  exit 1
fi

# Generate a short descriptive filename via GPT-4o-mini
SLUG=""
for slug_attempt in 1 2; do
  log "generating slug (attempt $slug_attempt)"
  SLUG=$(curl -s --max-time 15 \
    https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg transcript "${TRANSCRIPT:0:500}" '{
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: ("Generate a 3-5 word lowercase hyphenated filename slug summarizing this voice recording. Return ONLY the slug, no quotes, no explanation. Transcript: " + $transcript)
      }],
      max_tokens: 20
    }')" | jq -r '.choices[0].message.content // empty') || {
    log "slug generation failed (attempt $slug_attempt, exit $?)"
    SLUG=""
  }
  [ -n "$SLUG" ] && break
  [ "$slug_attempt" -eq 1 ] && sleep 1
done

if [ -z "$SLUG" ]; then
  SLUG="voice-recording"
  log "using fallback slug"
fi

# Clean the slug
SLUG=$(echo "$SLUG" | tr -d '"' | tr -d "'" | tr ' ' '-' | tr -cd 'a-z0-9-' | head -c 60)

DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%H-%M)
FILENAME="${DATE}-${TIMESTAMP}-${SLUG}"

# Save mp3 to vault
cp "$VAULT_FILE" "$RECORDINGS_DIR/${FILENAME}.mp3"

# Save transcript as markdown
cat > "$RECORDINGS_DIR/${FILENAME}.md" << MDEOF
---
type: recording
date: ${DATE}
audio: "[[${FILENAME}.mp3]]"
review: not-started
review-note:
---

${TRANSCRIPT}
MDEOF

# Copy transcript to clipboard
echo -n "$TRANSCRIPT" | pbcopy

# Clean up
rm -f "$TEMP_FILE" "$API_FILE" "$VAULT_FILE"

log "saved: $FILENAME"
echo "$FILENAME"
