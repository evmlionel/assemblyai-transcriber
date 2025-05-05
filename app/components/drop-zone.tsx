"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileAudio, FileVideo, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DropZoneProps {
  onFileSelected: (file: File) => void
  selectedFile: File | null
  isUploading: boolean
}

export function DropZone({ onFileSelected, selectedFile, isUploading }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (acceptedFiles.length > 0) {
        setError(null)
        onFileSelected(acceptedFiles[0])
      }

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        if (rejection.errors[0].code === "file-too-large") {
          setError("File is too large. Maximum size is 100MB.")
        } else if (rejection.errors[0].code === "file-invalid-type") {
          setError("Invalid file type. Please upload an audio or video file.")
        } else {
          setError(rejection.errors[0].message)
        }
      }
    },
    [onFileSelected],
  )

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [],
      "video/*": [],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: isUploading,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const supportedFormats = [
    { name: "MP3", icon: FileAudio },
    { name: "WAV", icon: FileAudio },
    { name: "MP4", icon: FileVideo },
    { name: "M4A", icon: FileAudio },
    { name: "AAC", icon: FileAudio },
    { name: "FLAC", icon: FileAudio },
  ]

  return (
    <div className="space-y-4">
      <motion.div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
          isDragReject && "border-destructive bg-destructive/5",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div {...getRootProps()} className="outline-none">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
              className="bg-primary/10 rounded-full p-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: isDragActive ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Upload className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <p className="font-medium text-lg">
                {selectedFile ? "Replace file" : "Drag & drop your session recording (max 100MB)"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">or click to select a file</p>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {supportedFormats.map((format) => (
          <div key={format.name} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
            <format.icon className="h-3 w-3" />
            <span>{format.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
