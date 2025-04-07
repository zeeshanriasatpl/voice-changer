let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let mediaStreamSource;
let gainNode;
let animationFrame;
let volumeCallback;
let pitchNode;
let mediaStream;
let isRecordingActive = false;

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const playButton = document.getElementById("playButton");
const status = document.getElementById("status");
const visualizer = document.getElementById("visualizer");
const volumeMeter = document.getElementById("volumeMeter");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const canvas = visualizer.getContext("2d");
const pitchSlider = document.getElementById("pitchSlider");
const pitchValue = document.getElementById("pitchValue");

// Set up canvas size
visualizer.width = visualizer.offsetWidth;
visualizer.height = visualizer.offsetHeight;

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
playButton.addEventListener("click", playRecording);

// Add volume control listener
volumeSlider.addEventListener("input", (e) => {
  const value = parseFloat(e.target.value);
  if (gainNode) {
    gainNode.gain.value = value;
  }
  volumeValue.textContent = `${Math.round(value * 100)}%`;
});

// Add pitch control listener
pitchSlider.addEventListener("input", (e) => {
  const value = parseInt(e.target.value);
  if (pitchNode) {
    pitchNode.parameters.get("detune").value = value * 100; // Convert semitones to cents
  }
  pitchValue.textContent = `${value} semitones`;
});

async function startRecording() {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Set up audio context and nodes
    if (!audioContext || audioContext.state === "closed") {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
    }

    // Set up audio context and analyser
    analyser = audioContext.createAnalyser();
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyser);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Set up media recorder
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
    };

    // Start recording
    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
    playButton.disabled = true;
    status.textContent = "Recording...";
    isRecordingActive = true;

    // Start visualizer
    function draw() {
      animationFrame = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvas.fillStyle = "#f8f9fa";
      canvas.fillRect(0, 0, visualizer.width, visualizer.height);

      canvas.lineWidth = 2;
      canvas.strokeStyle = "#007bff";
      canvas.beginPath();

      const sliceWidth = (visualizer.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * visualizer.height) / 2;

        if (i === 0) {
          canvas.moveTo(x, y);
        } else {
          canvas.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvas.lineTo(visualizer.width, visualizer.height / 2);
      canvas.stroke();

      // Update volume meter
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const volume = (average / 128.0) * 100;
      volumeMeter.style.width = `${volume}%`;
    }

    draw();
  } catch (err) {
    console.error("Error accessing microphone:", err);
    status.textContent =
      "Error accessing microphone. Please check permissions.";
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    cancelAnimationFrame(animationFrame);
    startButton.disabled = false;
    stopButton.disabled = true;
    playButton.disabled = false;
    status.textContent = 'Recording stopped. Click "Play Recording" to listen.';
    isRecordingActive = false;

    // Reset volume meter
    volumeMeter.style.width = "0%";
  }
}

function playRecording() {
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  // Create a new audio context for playback
  const playbackContext = new (window.AudioContext ||
    window.webkitAudioContext)();
  const source = playbackContext.createMediaElementSource(audio);
  const playbackGain = playbackContext.createGain();
  const pitchNode = playbackContext.createBiquadFilter();

  // Connect nodes for playback
  source.connect(pitchNode);
  pitchNode.connect(playbackGain);
  playbackGain.connect(playbackContext.destination);

  // Set gain value from slider
  playbackGain.gain.value = parseFloat(volumeSlider.value);

  // Set pitch value from slider
  const pitchValue = parseInt(pitchSlider.value);
  pitchNode.type = "lowpass";
  pitchNode.frequency.value = 2000;
  pitchNode.Q.value = 1;
  pitchNode.detune.value = pitchValue * 100; // Convert semitones to cents

  audio.onplay = () => {
    status.textContent = "Playing recording...";
    playButton.disabled = true;
  };

  audio.onended = () => {
    status.textContent = "Playback finished.";
    playButton.disabled = false;
    // Clean up audio context
    playbackContext.close();
  };

  audio.play();
}
