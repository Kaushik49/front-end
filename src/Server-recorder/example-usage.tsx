import { ServerVideoRecorder } from "./src" // In a real project, this would be 'server-video-recorder'

// Example 1: Basic usage
export function BasicExample() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Video Monitoring System</h1>
      <ServerVideoRecorder />
    </div>
  )
}

// Example 2: Advanced usage with custom props and callbacks
export function AdvancedExample() {
  const handleRecordingComplete = (chunks: Blob[]) => {
    console.log(`Recording complete! Received ${chunks.length} chunks.`)

    // Example: Create a download link for the recording
    const blob = new Blob(chunks, { type: "video/mp4" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "recording.mp4"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleError = (error: string) => {
    console.error(`Error in video recorder: ${error}`)
    // Example: Show a notification to the user
    alert(`An error occurred: ${error}`)
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-white">Security Camera System</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-white">Camera 1 - Front Door</h2>
          <ServerVideoRecorder
            title="Front Door Camera"
            serverUrl="https://example.com/api/cameras/front-door"
            className="w-full"
            cardClassName="bg-black border border-gray-700 rounded-lg p-4"
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 text-white">Camera 2 - Back Yard</h2>
          <ServerVideoRecorder
            title="Back Yard Camera"
            serverUrl="https://example.com/api/cameras/back-yard"
            className="w-full"
            cardClassName="bg-black border border-gray-700 rounded-lg p-4"
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  )
}
