import { VoiceChanger } from "./public/js/voice-changer.js";
import { AudioRecorder } from "./public/js/recorder.js";

// Initialize voice changer and recorder
const voiceChanger = new VoiceChanger();
const audioRecorder = new AudioRecorder();

// DOM Elements
const pitchSlider = document.getElementById("pitch");
const pitchValue = document.getElementById("pitchValue");
const delaySlider = document.getElementById("delay");
const delayValue = document.getElementById("delayValue");
const playButton = document.getElementById("playButton");
const recordButton = document.getElementById("recordButton");

// Handle pitch change
pitchSlider.addEventListener("input", (e) => {
  const pitch = parseFloat(e.target.value);
  pitchValue.textContent = pitch.toFixed(1);
  voiceChanger.setPitch(pitch);
});

// Handle delay change
delaySlider.addEventListener("input", (e) => {
  const delay = parseFloat(e.target.value);
  delayValue.textContent = delay.toFixed(1);
  voiceChanger.setDelay(delay);
});

// Handle play/stop
playButton.addEventListener("click", () => {
  const isPlaying = voiceChanger.togglePlay();
  playButton.textContent = isPlaying ? "Stop" : "Play";
});

// Handle record
recordButton.addEventListener("click", async () => {
  if (!audioRecorder.isRecording) {
    const success = await audioRecorder.startRecording();
    if (success) {
      recordButton.textContent = "Stop Recording";
    }
  } else {
    const audioBlob = audioRecorder.stopRecording();
    if (audioBlob) {
      const audioData = await audioRecorder.getAudioDataFromBlob(audioBlob);
      voiceChanger.setAudioData(audioData);
      recordButton.textContent = "Record";
    }
  }
});
