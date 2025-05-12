"use client"

import { useRef, useEffect } from "react"

interface VideoPlayerProps {
  src: string
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  className?: string
}

export default function VideoPlayer({
  src,
  autoPlay = true,
  muted = true,
  controls = false,
  className = "w-full h-full object-cover",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current

    if (videoElement && src) {
      videoElement.src = src

      if (autoPlay) {
        videoElement.play().catch((err) => {
          console.error("Error playing video:", err)
        })
      }
    }

    return () => {
      if (videoElement) {
        videoElement.pause()
        videoElement.src = ""
        videoElement.load()
      }
    }
  }, [src, autoPlay])

  return <video ref={videoRef} className={className} muted={muted} controls={controls} playsInline />
}
