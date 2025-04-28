"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Clock, FileText, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion } from "framer-motion"

interface RecentTranscriptionsProps {
  onSelectTranscript?: (transcript: any) => void
}

export function RecentTranscriptions({ onSelectTranscript }: RecentTranscriptionsProps) {
  const [recentTranscripts, setRecentTranscripts] = useState<any[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const recents = JSON.parse(localStorage.getItem("recentTranscripts") || "[]")
      setRecentTranscripts(recents)
    } catch {
      setRecentTranscripts([])
    }
  }, [])

  const removeTranscript = (id: string|number) => {
    const removed = recentTranscripts.find((t) => t.id === id)
    const updated = recentTranscripts.filter((t) => t.id !== id)
    setRecentTranscripts(updated)
    localStorage.setItem("recentTranscripts", JSON.stringify(updated))

    // show undo toast
    if (removed) {
      toast({
        title: "Transcript deleted",
        description: `${removed.name} removed`,
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => {
              const restored = [removed, ...updated]
              setRecentTranscripts(restored)
              localStorage.setItem("recentTranscripts", JSON.stringify(restored))
            }}
          >
            Undo
          </ToastAction>
        ),
      })
    }
  }

  return (
    <Card className="overflow-hidden border-primary/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Recent Transcriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTranscripts.length > 0 ? (
          <div className="space-y-3">
            {recentTranscripts.map((transcript) => (
              <motion.div
                key={transcript.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-primary/10 transition"
                onClick={() => onSelectTranscript?.(transcript.transcript)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{transcript.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {transcript.date}
                      </span>
                      <span>•</span>
                      <span>{transcript.duration}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTranscript(transcript.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent transcriptions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
