// Common audio functionality
export class AudioCommon {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
  }

  // Initialize audio context
  initAudioContext() {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        throw new Error("Web Audio API is not supported in this browser");
      }
      this.audioContext = new AudioContext();

      // Resume audio context if it's suspended (autoplay policy)
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
    }
    return this.audioContext;
  }

  // Create gain node
  createGainNode() {
    if (!this.audioContext) {
      this.initAudioContext();
    }
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1;
    return this.gainNode;
  }

  // Set volume
  setVolume(value) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  // Connect to destination
  connectToDestination(node) {
    if (this.audioContext) {
      node.connect(this.audioContext.destination);
    }
  }

  // Clean up
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.gainNode = null;
  }
}
