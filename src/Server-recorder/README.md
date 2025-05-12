# Server Video Recorder Component

A reusable React component for displaying and interacting with video feeds from a server.

## Features

- Stream video from a server
- Process video chunks
- Report issues
- Customizable UI
- Callback functions for integration

## Installation

\`\`\`bash
npm install server-video-recorder
\`\`\`

## Usage

### Basic Usage

\`\`\`jsx
import { ServerVideoRecorder } from 'server-video-recorder';
import 'server-video-recorder/dist/style.css'; // Import styles

function MyApp() {
  return (
    <div className="my-app">
      <h1>My Application</h1>
      <ServerVideoRecorder />
    </div>
  );
}
\`\`\`

### With Custom Configuration

\`\`\`jsx
import { ServerVideoRecorder } from 'server-video-recorder';

function MyApp() {
  const handleRecordingComplete = (chunks) => {
    console.log(`Recording complete! Received ${chunks.length} chunks.`);
    // Process the chunks as needed
  };

  const handleError = (error) => {
    console.error(`Error in video recorder: ${error}`);
    // Handle the error
  };

  return (
    <div className="my-app">
      <ServerVideoRecorder
        title="Security Camera Feed"
        serverUrl="https://my-video-server.com/stream"
        className="my-custom-container"
        cardClassName="my-custom-card"
        onRecordingComplete={handleRecordingComplete}
        onError={handleError}
        onReportSubmit={(message) => console.log(`Report submitted: ${message}`)}
      />
    </div>
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Server Video Recorder" | Title displayed at the top of the component |
| `serverUrl` | string | undefined | Custom server URL for video streaming |
| `className` | string | "flex min-h-screen..." | Custom CSS class for the container |
| `cardClassName` | string | "w-full max-w-md..." | Custom CSS class for the card |
| `onRecordingComplete` | function | undefined | Callback when recording is complete |
| `onError` | function | undefined | Callback when an error occurs |
| `onReportSubmit` | function | undefined | Callback when a report is submitted |

## Browser Support

This component uses the MediaSource API, which is supported in most modern browsers. A fallback is provided for browsers that don't support this API.

## License

MIT


To connect to a real video server, provide the serverUrl prop. You would need to modify the server-video-feed.tsx component to handle your specific server's API and video format.

The component is designed to be flexible and can be adapted to work with different video streaming protocols and formats.

import { ServerVideoRecorder } from './path-to-component';


import { ServerVideoRecorder } from './path-to-component';
<!-- function MyApp() {
  return (
    <div className="my-page">
      <h1>My Video Monitoring System</h1>
      <ServerVideoRecorder />
    </div>
  );
} -->