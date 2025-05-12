"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Video, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import MockRecorder from "./components/mock-recorder"

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [reportMessage, setReportMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isCompatible, setIsCompatible] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check browser compatibility on mount
  useEffect(() => {
    const checkCompatibility = () => {
      const hasMediaDevices = !!navigator.mediaDevices
      const hasGetDisplayMedia = !!(navigator.mediaDevices && "getDisplayMedia" in navigator.mediaDevices)
      const hasMediaRecorder = !!window.MediaRecorder

      setIsCompatible(hasMediaDevices && hasGetDisplayMedia && hasMediaRecorder)
    }

    checkCompatibility()
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      recordedChunksRef.current = []

      // Check if the browser supports screen capture
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen capture is not supported in your browser or environment")
      }

      // Try to request screen capture with proper error handling
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: false,
        })

        streamRef.current = stream

        // Display the stream in the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Find supported MIME type
        const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"]

        let mediaRecorder
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            mediaRecorder = new MediaRecorder(stream, { mimeType })
            break
          }
        }

        if (!mediaRecorder) {
          mediaRecorder = new MediaRecorder(stream)
        }

        mediaRecorderRef.current = mediaRecorder

        // Event handler for when data becomes available
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
            // Send chunk to server
            sendChunkToServer(event.data)
          }
        }

        // Start recording
        mediaRecorder.start(1000) // Collect data every second
        setIsRecording(true)

        // Set up processing interval
        processingIntervalRef.current = setInterval(() => {
          checkProcessingStatus()
        }, 5000) // Check every 5 seconds
      } catch (displayMediaError) {
        console.error("Display media error:", displayMediaError)

        if (displayMediaError.name === "NotAllowedError") {
          throw new Error("Permission to capture screen was denied. Please allow screen sharing when prompted.")
        } else if (displayMediaError.message && displayMediaError.message.includes("permissions policy")) {
          throw new Error(
            "Screen capture is restricted in this environment. Try opening the app in a new browser window.",
          )
        } else {
          throw displayMediaError
        }
      }
    } catch (err) {
      console.error("Error starting screen recording:", err)
      setError(
        err.message || "Failed to start screen recording. Please try again in a different browser or environment.",
      )
      setIsCompatible(false) // Switch to mock recorder if we encounter errors
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()

      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      setIsRecording(false)
      setIsProcessing(true)
    }

    // Clear the processing interval
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current)
    }
  }

  const sendChunkToServer = async (chunk: Blob) => {
    try {
      const formData = new FormData()
      formData.append("chunk", chunk, "screen-recording-chunk.webm")

      const response = await fetch("/api/upload-chunk", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
    } catch (err) {
      console.error("Error sending chunk to server:", err)
      setError("Failed to send recording chunk to server. Please try again.")
    }
  }

  const checkProcessingStatus = async () => {
    try {
      const response = await fetch("/api/processing-status")
      const data = await response.json()

      if (data.status === "completed") {
        setIsProcessing(false)
        setReportReady(true)
        setReportMessage(data.message || "Processing completed successfully!")

        // Clear the interval once processing is complete
        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current)
        }
      }
    } catch (err) {
      console.error("Error checking processing status:", err)
    }
  }

  const handleReportIssue = async () => {
    try {
      setIsProcessing(true)

      const response = await fetch("/api/report-issue", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      setReportMessage(data.message || "Issue reported successfully!")
      setIsProcessing(false)
    } catch (err) {
      console.error("Error reporting issue:", err)
      setError("Failed to report issue. Please try again.")
      setIsProcessing(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-gray-950 border-gray-800">
        <h1 className="text-2xl font-bold text-center">Screen Recorder</h1>

        {isCompatible ? (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            </div>

            <div className="flex justify-center">
              {!isRecording && !isProcessing && !reportReady ? (
                <Button onClick={startRecording} className="w-full">
                  <Video className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : isRecording ? (
                <Button onClick={stopRecording} variant="destructive" className="w-full">
                  Stop Recording
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
                      setIsRecording(false)
                      setIsProcessing(false)
                      setReportReady(false)
                      setReportMessage("")
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Record Again
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <MockRecorder />
        )}
      </Card>
    </div>
  )
}
