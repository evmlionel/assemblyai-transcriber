"use client"

import { useState } from "react"
import { Download, FileText, FileDown, Loader2, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

interface DownloadOptionsProps {
  transcript: {
    text: string
    utterances?: any[]
    words?: any[]
    segments?: any[]
  }
  fileName: string
}

export function DownloadOptions({ transcript, fileName }: DownloadOptionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<string | null>(null)
  const { toast } = useToast()

  const baseFileName = fileName.split(".")[0] || "transcript"

  const downloadFile = async (format: string, content: string, mimeType: string, extension: string) => {
    setIsDownloading(true)
    setDownloadFormat(format)

    try {
      // Simulate network delay for better UX feedback
      await new Promise((resolve) => setTimeout(resolve, 800))

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${baseFileName}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download complete",
        description: `Transcript downloaded as ${format}`,
        variant: "success",
      })
    } catch (error) {
      console.error(`Error downloading ${format}:`, error)
      toast({
        variant: "destructive",
        title: "Download failed",
        description: `Failed to download transcript as ${format}`,
      })
    } finally {
      setIsDownloading(false)
      setDownloadFormat(null)
    }
  }

  const downloadAsText = () => {
    downloadFile("TXT", transcript.text, "text/plain", "txt")
  }

  const downloadAsMarkdown = () => {
    // Create a simple markdown version
    const segments = transcript.utterances || transcript.segments || []
    let markdownContent = `# Transcript: ${baseFileName}\n\n`

    if (segments.length > 0) {
      segments.forEach((segment) => {
        const timeCode = formatTimeForMarkdown(segment.start)
        const speaker = segment.speaker ? `**Speaker ${segment.speaker}**: ` : ""
        markdownContent += `## [${timeCode}]\n${speaker}${segment.text}\n\n`
      })
    } else {
      markdownContent += transcript.text
    }

    downloadFile("Markdown", markdownContent, "text/markdown", "md")
  }

  const downloadAsSRT = () => {
    const segments = transcript.utterances || transcript.segments || []
    let srtContent = ""

    if (segments.length > 0) {
      segments.forEach((segment, index) => {
        const startTime = formatTimeForSRT(segment.start)
        const endTime = formatTimeForSRT(segment.end)
        const speaker = segment.speaker ? `Speaker ${segment.speaker}: ` : ""

        srtContent += `${index + 1}\n`
        srtContent += `${startTime} --> ${endTime}\n`
        srtContent += `${speaker}${segment.text}\n\n`
      })
    } else {
      // If no segments, create a single subtitle with the full text
      srtContent = `1\n00:00:00,000 --> 00:05:00,000\n${transcript.text}\n`
    }

    downloadFile("SRT", srtContent, "text/plain", "srt")
  }

  const downloadAsJSON = () => {
    const jsonContent = JSON.stringify(transcript, null, 2)
    downloadFile("JSON", jsonContent, "application/json", "json")
  }

  const formatTimeForSRT = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const milliseconds = Math.floor((timeInSeconds % 1) * 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`
  }

  const formatTimeForMarkdown = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading {downloadFormat}...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <DropdownMenuItem onClick={downloadAsText} disabled={isDownloading}>
            <FileText className="mr-2 h-4 w-4" />
            Download as TXT
          </DropdownMenuItem>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <DropdownMenuItem onClick={downloadAsMarkdown} disabled={isDownloading}>
            <FileDown className="mr-2 h-4 w-4" />
            Download as Markdown
          </DropdownMenuItem>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <DropdownMenuItem onClick={downloadAsSRT} disabled={isDownloading}>
            <FileDown className="mr-2 h-4 w-4" />
            Download as SRT
          </DropdownMenuItem>
        </motion.div>
        <DropdownMenuSeparator />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <DropdownMenuItem onClick={downloadAsJSON} disabled={isDownloading}>
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
