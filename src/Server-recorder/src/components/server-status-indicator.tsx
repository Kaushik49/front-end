"use client"

import { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import { Loader2 } from "lucide-react"

interface ServerStatusIndicatorProps {
  isConnected: boolean
}

export default function ServerStatusIndicator({ isConnected }: ServerStatusIndicatorProps) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">(
    isConnected ? "connected" : "connecting",
  )

  useEffect(() => {
    if (isConnected) {
      setStatus("connected")
    } else {
      setStatus("connecting")

      // If still not connected after 5 seconds, show as disconnected
      const timeout = setTimeout(() => {
        if (!isConnected) {
          setStatus("disconnected")
        }
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [isConnected])

  return (
    <div className="flex items-center">
      {status === "connecting" && (
        <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-800 flex items-center">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Connecting to server
        </Badge>
      )}

      {status === "connected" && (
        <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800 flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
          Server connected
        </Badge>
      )}

      {status === "disconnected" && (
        <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800 flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
          Server disconnected
        </Badge>
      )}
    </div>
  )
}
