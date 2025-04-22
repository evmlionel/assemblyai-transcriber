"use client"

import { motion } from "framer-motion"
import { AudioWaveformIcon as Waveform, FileAudio, Headphones } from "lucide-react"

export function TranscriptionHero() {
  return (
    <div className="py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-6"
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-primary/60 opacity-75 blur-lg" />
          <div className="relative bg-background rounded-full p-4">
            <Waveform className="h-12 w-12 text-primary" />
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold mb-3"
      >
        AssemblyAI Transcriber
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl text-muted-foreground max-w-2xl mx-auto"
      >
        Transform your audio and video into accurate transcripts with speaker detection and timestamps
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center gap-8 mt-8"
      >
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 rounded-full p-3 mb-2">
            <FileAudio className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">Upload any audio/video</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-primary/10 rounded-full p-3 mb-2">
            <Waveform className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">AI-powered transcription</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-primary/10 rounded-full p-3 mb-2">
            <Headphones className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium">Speaker identification</p>
        </div>
      </motion.div>
    </div>
  )
}
