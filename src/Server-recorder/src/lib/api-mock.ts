export async function mockReportIssue(): Promise<{ success: boolean; message: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    success: true,
    message: "Issue reported successfully. Our team will review it shortly.",
  }
}

// Mock video data for server streaming
const generateRandomVideoChunk = (): Blob => {
  // Create a random array of bytes to simulate video data
  const chunkSize = Math.floor(Math.random() * 50000) + 10000 // 10KB to 60KB
  const array = new Uint8Array(chunkSize)

  for (let i = 0; i < chunkSize; i++) {
    array[i] = Math.floor(Math.random() * 256)
  }

  return new Blob([array], { type: "video/mp4" })
}

// Simulates receiving a video chunk from the server
export async function mockServerVideoStream(): Promise<Blob> {
  // Simulate network delay (100-300ms)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))

  // Generate a random video chunk
  return generateRandomVideoChunk()
}
