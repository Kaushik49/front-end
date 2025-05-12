import * as React from 'react';
import ServerVideoRecorder from "../Server-recorder/src/components/ServerVideoRecorder"

export default function HomePage() {
    const handleRecordingComplete = (chunks: Blob[]) => {
        console.log(`Recording complete! Received ${chunks.length} chunks.`)
    }

    const handleError = (error: string) => {
        console.error(`Error in video recorder: ${error}`)
    }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>

        <ServerVideoRecorder onRecordingComplete={handleRecordingComplete} onError={handleError} />

    </div>
  );
}
