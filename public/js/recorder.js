import { AudioCommon } from "./audio-common.js";

export class AudioRecorder {
  constructor() {
    this.audioCommon = new AudioCommon();
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
  }

  // Start recording
  async startRecording() {
    try {
      if (this.isRecording) {
        console.warn("Already recording");
        return false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        this.audioChunks = [];
        return audioBlob;
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      return true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      return false;
    }
  }

  // Stop recording
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;

      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      return this.mediaRecorder.onstop();
    }
    return null;
  }

  // Get audio data from blob
  async getAudioDataFromBlob(audioBlob) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = this.audioCommon.initAudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer.getChannelData(0);
    } catch (error) {
      console.error("Error processing audio data:", error);
      return null;
    }
  }
}
