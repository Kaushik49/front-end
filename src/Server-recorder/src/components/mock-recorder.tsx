"use client"

import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Loader2, Video, AlertCircle, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export default function MockRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [reportMessage, setReportMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const startMockRecording = () => {
    setError(null)
    setIsRecording(true)

    // Simulate recording for 5 seconds
    timerRef.current = window.setTimeout(() => {
      setIsRecording(false)
      setIsProcessing(true)

      // Simulate processing for 3 seconds
      setTimeout(() => {
        setIsProcessing(false)
        setReportReady(true)
        setReportMessage("Mock recording processed successfully!")
      }, 3000)
    }, 5000)
  }

  const stopMockRecording = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setIsRecording(false)
    setIsProcessing(true)

    // Simulate processing for 2 seconds
    setTimeout(() => {
      setIsProcessing(false)
      setReportReady(true)
      setReportMessage("Mock recording processed successfully!")
    }, 2000)
  }

  const handleReportIssue = () => {
    setIsProcessing(true)

    // Simulate reporting for 1.5 seconds
    setTimeout(() => {
      setIsProcessing(false)
      setReportMessage("Issue reported successfully. Our team will review it shortly.")
    }, 1500)
  }

  return (
    <div className="space-y-6 w-full">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fallback Mode</AlertTitle>
        <AlertDescription>
          Screen recording is not available in this environment. This is a simulated version for demonstration purposes.
        </AlertDescription>
      </Alert>

      <div className="aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center border border-gray-800">
        {isRecording ? (
          <div className="text-white flex flex-col items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mb-2"></div>
            <p>Recording in progress...</p>
          </div>
        ) : (
          <div className="text-gray-300 flex flex-col items-center">
            <Video className="h-12 w-12 mb-2" />
            <p>Mock Screen Recording</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {!isRecording && !isProcessing && !reportReady ? (
          <Button onClick={startMockRecording} className="w-full">
            <Video className="mr-2 h-4 w-4" />
            Start Mock Recording
          </Button>
        ) : isRecording ? (
          <Button onClick={stopMockRecording} variant="destructive" className="w-full">
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
    </div>
  )
}
