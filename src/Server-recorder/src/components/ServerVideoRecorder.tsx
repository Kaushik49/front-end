"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Loader2, Video, AlertCircle, Check, Play, Square } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { mockReportIssue } from "../lib/api-mock"
import ServerVideoFeed from "./server-video-feed"

export interface ServerVideoRecorderProps {
  /** Title displayed at the top of the component */
  title?: string
  /** Custom server URL for video streaming */
  serverUrl?: string
  /** Custom CSS class for the container */
  className?: string
  /** Custom CSS class for the card */
  cardClassName?: string
  /** Callback when recording is complete */
  onRecordingComplete?: (chunks: Blob[]) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
  /** Callback when a report is submitted */
  onReportSubmit?: (message: string) => void
}

export default function ServerVideoRecorder({
  title = "Server Video Recorder",
  serverUrl,
  className = "flex min-h-screen flex-col items-center justify-center bg-black p-4",
  cardClassName = "w-full max-w-md p-6 space-y-6 bg-gray-950 border-gray-800",
  onRecordingComplete,
  onError,
  onReportSubmit,
}: ServerVideoRecorderProps) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [reportMessage, setReportMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
  const processingTimeoutRef = useRef<number | null>(null)

  // Start receiving the stream from the server
  const startStreaming = async () => {
    try {
      setError(null)
      setIsStreaming(true)
      setRecordedChunks([])
    } catch (err: any) {
      const errorMessage = err.message || "Failed to start streaming. Please try again."
      console.error("Error starting stream:", err)
      setError(errorMessage)
      setIsStreaming(false)

      if (onError) {
        onError(errorMessage)
      }
    }
  }

  // Stop receiving the stream
  const stopStreaming = () => {
    setIsStreaming(false)
    setIsProcessing(true)

    // Simulate processing time
    processingTimeoutRef.current = window.setTimeout(() => {
      setIsProcessing(false)
      setReportReady(true)
      setReportMessage("Server video processing completed successfully!")

      if (onRecordingComplete) {
        onRecordingComplete(recordedChunks)
      }
    }, 3000)
  }

  // Handle receiving a chunk from the server
  const handleChunkReceived = (chunk: Blob) => {
    setRecordedChunks((prev) => [...prev, chunk])
    console.log(`Received chunk of size: ${chunk.size} bytes from server`)
  }

  const handleReportIssue = async () => {
    try {
      setIsProcessing(true)
      const data = await mockReportIssue()
      setReportMessage(data.message || "Issue reported successfully!")
      setIsProcessing(false)

      if (onReportSubmit) {
        onReportSubmit(data.message)
      }
    } catch (err: any) {
      const errorMessage = "Failed to report issue. Please try again."
      console.error("Error reporting issue:", err)
      setError(errorMessage)
      setIsProcessing(false)

      if (onError) {
        onError(errorMessage)
      }
    }
  }

  // Handle internal errors
  const handleError = (errorMsg: string) => {
    setError(errorMsg)
    if (onError) {
      onError(errorMsg)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={className}>
      <Card className={cardClassName}>
        <h1 className="text-2xl font-bold text-center">{title}</h1>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="aspect-video bg-gray-900 rounded-md overflow-hidden relative">
          <ServerVideoFeed
            isActive={isStreaming}
            serverUrl={serverUrl}
            onChunkReceived={handleChunkReceived}
            onError={handleError}
          />

          {!isStreaming && !isProcessing && !reportReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white flex flex-col items-center">
                <Video className="h-12 w-12 mb-2" />
                <p>Server Video Feed</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white flex flex-col items-center">
                <Loader2 className="h-12 w-12 mb-2 animate-spin" />
                <p>Processing video...</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          {!isStreaming && !isProcessing && !reportReady ? (
            <Button onClick={startStreaming} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Streaming
            </Button>
          ) : isStreaming ? (
            <Button onClick={stopStreaming} variant="destructive" className="w-full">
              <Square className="mr-2 h-4 w-4" />
              Stop Streaming
            </Button>
          ) : isProcessing ? (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : (
            <div className="space-y-4 w-full">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{reportMessage}</AlertDescription>
              </Alert>

              <div className="text-sm text-gray-400 mb-4">
                <p>Received {recordedChunks.length} chunks from server</p>
                <p>Total data: {(recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0) / 1024).toFixed(2)} KB</p>
              </div>

              <Button onClick={handleReportIssue} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reporting...
                  </>
                ) : (
                  "Report Issue"
                )}
              </Button>

              <Button
                onClick={() => {
                  setIsStreaming(false)
                  setIsProcessing(false)
                  setReportReady(false)
                  setReportMessage("")
                  setRecordedChunks([])
                }}
                variant="outline"
                className="w-full"
              >
                Stream Again
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
