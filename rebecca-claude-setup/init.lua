-- Voice Transcription for Claude Code
-- Toggle recording with Option + ` (backtick)
-- Option + Shift + R = record + auto-paste + submit when done

local LOG_FILE = "/tmp/hammerspoon-voice.log"
local TRANSCRIBE_SCRIPT = "__HOME__/.claude/bin/voice-transcribe.sh"
local REC_BIN = "/opt/homebrew/bin/rec"

local recording = false
local transcribing = false
local autoSubmit = false
local menubar = nil
local recordingTimer = nil
local startTime = nil
local recTask = nil
local currentTempFile = nil

-- Simple file logger
local function log(msg)
  local f = io.open(LOG_FILE, "a")
  if f then
    f:write(os.date("%H:%M:%S") .. " " .. msg .. "\n")
    f:close()
  end
end

log("=== Hammerspoon config loaded ===")

-- Create persistent menu bar item
menubar = hs.menubar.new()
menubar:setTitle("")

-- Update timer display in menu bar
local function updateTimer()
  if recording and startTime then
    local elapsed = math.floor(os.time() - startTime)
    local mins = math.floor(elapsed / 60)
    local secs = elapsed % 60
    menubar:setTitle(string.format("  ●  %d:%02d", mins, secs))
  end
end

-- Run transcription
local function startTranscription(tempFile)
  transcribing = true
  menubar:setTitle("  ⟳ Transcribing")
  log("Starting transcription: " .. TRANSCRIBE_SCRIPT .. " with file: " .. tempFile)

  local transcribeTask = hs.task.new("/bin/bash", function(exitCode, stdOut, stdErr)
    transcribing = false
    log("transcribe exited: code=" .. tostring(exitCode) .. " out=" .. tostring(stdOut) .. " err=" .. tostring(stdErr))
    if exitCode == 0 and stdOut and stdOut ~= "" then
      local result = stdOut:gsub("%s+$", "")
      if result:sub(1, 5) == "ERROR" then
        menubar:setTitle("  ✗ Failed")
        hs.alert.show(result, 3)
      elseif autoSubmit then
        menubar:setTitle("  ✓ Submitting")
        hs.alert.show("Auto-submitting transcription", 1.5)
        -- Paste clipboard contents, then press Enter after a short delay
        hs.timer.doAfter(0.3, function()
          hs.eventtap.keyStroke({"cmd"}, "v")
          hs.timer.doAfter(0.5, function()
            hs.eventtap.keyStroke({}, "return")
            autoSubmit = false
          end)
        end)
      else
        menubar:setTitle("  ✓ Done")
        hs.alert.show("Copied to clipboard\n" .. result, 3)
      end
    else
      local errMsg = stdErr or "unknown error"
      errMsg = errMsg:gsub("%s+$", "")
      menubar:setTitle("  ✗ Failed")
      hs.alert.show("Transcription failed\n" .. errMsg, 3)
    end
    -- Clear menu bar after 3s (matches alert duration)
    hs.timer.doAfter(3, function() menubar:setTitle("") end)
  end, {TRANSCRIBE_SCRIPT, tempFile})

  if transcribeTask then
    transcribeTask:start()
  else
    log("ERROR: transcribe task is nil")
    hs.alert.show("Failed to start transcription", 2)
    menubar:setTitle("")
  end
end

-- Toggle recording on/off
local function toggleRecording()
  log("toggleRecording called, recording=" .. tostring(recording))

  if not recording then
    -- Guard: don't start a new recording while transcription is still running
    if transcribing then
      hs.alert.show("Still transcribing, please wait", 2)
      log("Blocked: tried to record while transcribing")
      return
    end

    -- START: launch rec with unique temp file
    recording = true
    startTime = os.time()
    currentTempFile = "/tmp/voice-dictation-" .. tostring(os.time()) .. ".wav"
    menubar:setTitle("  ●  0:00")

    recordingTimer = hs.timer.doEvery(1, updateTimer)

    log("Starting rec: " .. REC_BIN .. " -> " .. currentTempFile)

    recTask = hs.task.new(REC_BIN, function(exitCode, stdOut, stdErr)
      log("rec exited: code=" .. tostring(exitCode))
      if recording then
        hs.alert.show("Recording stopped unexpectedly", 2)
        recording = false
        menubar:setTitle("")
        if recordingTimer then recordingTimer:stop() end
      end
    end, {"-q", "-c", "1", currentTempFile})

    if recTask then
      local started = recTask:start()
      log("rec task started: " .. tostring(started))
      if started then
        hs.alert.show("Recording", 1)
      else
        hs.alert.show("Failed to start recording", 2)
        recording = false
        menubar:setTitle("")
        if recordingTimer then recordingTimer:stop() end
      end
    else
      log("ERROR: hs.task.new returned nil")
      hs.alert.show("Failed to create recording task", 2)
      recording = false
      menubar:setTitle("")
      if recordingTimer then recordingTimer:stop() end
    end

  else
    -- STOP: interrupt rec, wait for exit callback, then transcribe
    log("Stopping recording")
    recording = false

    if recordingTimer then
      recordingTimer:stop()
      recordingTimer = nil
    end

    if recTask then
      recTask:interrupt()
      log("rec task interrupted (SIGINT)")
      recTask = nil
    end

    -- Wait 2s for sox to flush write buffers, then transcribe
    local fileToTranscribe = currentTempFile
    currentTempFile = nil
    hs.timer.doAfter(2, function() startTranscription(fileToTranscribe) end)
  end
end

-- Bind Option + ` (backtick/grave accent) -- record, transcribe, copy to clipboard
local hotkey = hs.hotkey.bind({"alt"}, "`", toggleRecording)
log("Hotkey bound: " .. tostring(hotkey))

-- Bind Option + Shift + R -- same but auto-paste + submit when transcription finishes
local hotkeyAutoSubmit = hs.hotkey.bind({"alt", "shift"}, "r", function()
  if not recording then
    autoSubmit = true
    log("Auto-submit mode ON")
  end
  toggleRecording()
end)
log("Auto-submit hotkey bound: " .. tostring(hotkeyAutoSubmit))

hs.alert.show("Voice transcription ready (Opt+` / Opt+Shift+R)", 2)
log("Setup complete")
