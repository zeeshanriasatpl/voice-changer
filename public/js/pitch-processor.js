class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
    this.lastSample = 0;
  }

  static get parameterDescriptors() {
    return [
      {
        name: "detune",
        defaultValue: 0,
        minValue: -1200,
        maxValue: 1200,
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const detune = parameters.detune[0];

    if (!input || !input[0] || !output || !output[0]) return true;

    const pitchShift = Math.pow(2, detune / 1200); // Convert cents to multiplier

    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      for (let i = 0; i < inputChannel.length; i++) {
        // Simple resampling for pitch shifting
        this.phase += pitchShift;
        while (this.phase >= 1) {
          this.lastSample = inputChannel[i];
          this.phase -= 1;
        }
        outputChannel[i] = this.lastSample;
      }
    }

    return true;
  }
}

registerProcessor("pitch-processor", PitchProcessor);
