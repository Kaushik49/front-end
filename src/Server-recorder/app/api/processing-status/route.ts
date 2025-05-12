import { type NextRequest, NextResponse } from "next/server"

// In a real application, you would track processing status in a database or state store
// This is a simplified example that simulates processing completion after a delay
let processingStartTime: number | null = null

export async function GET(request: NextRequest) {
  // Initialize processing start time if not set
  if (!processingStartTime) {
    processingStartTime = Date.now()
  }

  // Simulate processing time (15 seconds)
  const elapsedTime = Date.now() - processingStartTime
  const processingComplete = elapsedTime > 15000

  if (processingComplete) {
    // Reset for next recording
    processingStartTime = null

    return NextResponse.json({
      status: "completed",
      message: "Screen recording processed successfully!",
    })
  } else {
    return NextResponse.json({
      status: "processing",
      progress: Math.min(Math.floor((elapsedTime / 15000) * 100), 99),
    })
  }
}
