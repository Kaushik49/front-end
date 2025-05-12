import ServerVideoRecorder from "./components/ServerVideoRecorder"

function App() {
  const handleRecordingComplete = (chunks: Blob[]) => {
    console.log(`Recording complete! Received ${chunks.length} chunks.`)
  }

  const handleError = (error: string) => {
    console.error(`Error in video recorder: ${error}`)
  }

  return <ServerVideoRecorder onRecordingComplete={handleRecordingComplete} onError={handleError} />
}

export default App
