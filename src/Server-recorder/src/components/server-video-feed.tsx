"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { mockServerVideoStream } from "../lib/api-mock"

interface ServerVideoFeedProps {
  isActive: boolean
  serverUrl?: string
  onChunkReceived: (chunk: Blob) => void
  onError: (error: string) => void
}

export default function ServerVideoFeed({ isActive, serverUrl, onChunkReceived, onError }: ServerVideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const streamIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    let mediaSource: MediaSource | null = null
    let sourceBuffer: SourceBuffer | null = null
    let videoUrl: string | null = null

    const setupVideoStream = async () => {
      if (!isActive) return

      try {
        setIsLoading(true)

        // Create a MediaSource instance
        mediaSource = new MediaSource()
        videoUrl = URL.createObjectURL(mediaSource)

        if (videoRef.current) {
          videoRef.current.src = videoUrl
        }

        // Wait for the MediaSource to open
        await new Promise<void>((resolve) => {
          mediaSource!.addEventListener("sourceopen", () => resolve())
        })

        // Create a SourceBuffer
        const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
        sourceBuffer = mediaSource.addSourceBuffer(mimeType)

        // Start receiving chunks from the server
        streamIntervalRef.current = window.setInterval(async () => {
          try {
            // If serverUrl is provided, we would fetch from there
            // For now, we're using the mock function
            const chunk = await mockServerVideoStream()

            // Add the chunk to the SourceBuffer
            if (sourceBuffer && !sourceBuffer.updating) {
              sourceBuffer.appendBuffer(await chunk.arrayBuffer())
            }

            // Notify parent component
            onChunkReceived(chunk)
          } catch (err: any) {
            console.error("Error receiving video chunk:", err)
            onError("Error receiving video from server. Please try again.")
            clearInterval(streamIntervalRef.current!)
          }
        }, 1000) // Get a new chunk every second

        setIsLoading(false)
      } catch (err: any) {
        console.error("Error setting up video stream:", err)
        onError("Failed to set up video stream. Your browser may not support the required features.")
        setIsLoading(false)
      }
    }

    const cleanupVideoStream = () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
        streamIntervalRef.current = null
      }

      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }

      if (mediaSource && mediaSource.readyState === "open") {
        try {
          mediaSource.endOfStream()
        } catch (e) {
          console.error("Error ending media stream:", e)
        }
      }

      if (videoRef.current) {
        videoRef.current.src = ""
      }
    }

    if (isActive) {
      setupVideoStream()
    } else {
      cleanupVideoStream()
    }

    return () => {
      cleanupVideoStream()
    }
  }, [isActive, onChunkReceived, onError, serverUrl])

  // Fallback to simpler video display if MediaSource is not supported
  useEffect(() => {
    const setupFallbackVideo = async () => {
      if (!isActive) return

      try {
        // Check if MediaSource is supported
        if (!window.MediaSource) {
          console.log("MediaSource not supported, using fallback video")

          // Use a pre-recorded video as fallback
          if (videoRef.current) {
            videoRef.current.src = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            videoRef.current.load()

            // Simulate chunks being received
            streamIntervalRef.current = window.setInterval(async () => {
              const chunk = await mockServerVideoStream()
              onChunkReceived(chunk)
            }, 1000)
          }

          setIsLoading(false)
        }
      } catch (err) {
        console.error("Error setting up fallback video:", err)
      }
    }

    setupFallbackVideo()

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current)
      }
    }
  }, [isActive, onChunkReceived])

  return (
    <>
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />

      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white flex flex-col items-center">
            <Loader2 className="h-12 w-12 mb-2 animate-spin" />
            <p>Connecting to server feed...</p>
          </div>
        </div>
      )}
    </>
  )
}
