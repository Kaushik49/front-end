import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeConfig } from "@/app/theme-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Screen Recorder App",
  description: "Record your screen and send it for processing",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta httpEquiv="Content-Security-Policy" content="display-capture *; camera *; microphone *" />
      </head>
      <body className={inter.className}>
        <ThemeConfig>{children}</ThemeConfig>
      </body>
    </html>
  )
}
