# Voice Recorder and Playback

A web application that allows you to test your microphone by recording audio and playing it back. Features include:

- Live audio visualization
- Volume meter
- Record and playback functionality
- Modern, clean interface

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
npm start
```

2. Open your web browser and navigate to:

```
http://localhost:3000
```

## Development

To run the application in development mode with auto-reload:

```bash
npm run dev
```

## Features

- **Record Audio**: Click "Start Recording" to begin capturing audio from your microphone
- **Visualize Audio**: See real-time waveform visualization of your audio input
- **Volume Meter**: Monitor your input volume level
- **Playback**: Listen to your recording after stopping

## Browser Support

This application uses modern Web APIs and is supported in:

- Chrome (recommended)
- Firefox
- Edge
- Safari

Make sure to grant microphone permissions when prompted by your browser.

## Security Note

This application runs entirely in your browser. Your audio recordings are not sent to any server - they remain local to your browser session.
