import { AudioCommon } from "./audio-common.js";

export class VoiceChanger {
  constructor() {
    this.audioCommon = new AudioCommon();
    this.sourceNode = null;
    this.pitchNode = null;
    this.delayNode = null;
    this.isPlaying = false;
    this.audioData = null;
    this.audioContext = null;
  }

  // Create audio nodes
  createAudioNodes() {
    this.audioContext = this.audioCommon.initAudioContext();

    // Create source node
    this.sourceNode = this.audioContext.createBufferSource();

    // Create pitch shifter using detune
    this.pitchNode = this.audioContext.createBiquadFilter();
    this.pitchNode.type = "lowpass";
    this.pitchNode.frequency.value = 2000;
    this.pitchNode.Q.value = 1;

    // Create delay node
    this.delayNode = this.audioContext.createDelay();
    this.delayNode.delayTime.value = 1;

    // Create gain node
    const gainNode = this.audioCommon.createGainNode();

    // Connect nodes
    this.sourceNode.connect(this.pitchNode);
    this.pitchNode.connect(this.delayNode);
    this.delayNode.connect(gainNode);
    this.audioCommon.connectToDestination(gainNode);
  }

  // Set pitch using detune
  setPitch(value) {
    if (this.pitchNode) {
      // Convert pitch to frequency
      const frequency = 440 * Math.pow(2, (value - 1) / 12);
      this.pitchNode.frequency.value = frequency;
    }
  }

  // Set delay
  setDelay(value) {
    if (this.delayNode) {
      this.delayNode.delayTime.value = value;
    }
  }

  // Set audio data
  setAudioData(data) {
    this.audioData = data;
  }

  // Play/Stop audio
  togglePlay() {
    if (!this.isPlaying) {
      if (!this.audioData) {
        console.error("No audio data available");
        return false;
      }

      this.createAudioNodes();

      // Create buffer from audio data
      const buffer = this.audioContext.createBuffer(
        1,
        this.audioData.length,
        44100
      );
      buffer.copyToChannel(this.audioData, 0);

      // Set up source node
      this.sourceNode.buffer = buffer;
      this.sourceNode.loop = true;

      // Start playback
      this.sourceNode.start(0);
      this.isPlaying = true;
      return true;
    } else {
      this.stop();
      return false;
    }
  }

  // Stop audio
  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.pitchNode) {
      this.pitchNode.disconnect();
      this.pitchNode = null;
    }
    if (this.delayNode) {
      this.delayNode.disconnect();
      this.delayNode = null;
    }
    this.isPlaying = false;
  }
}
