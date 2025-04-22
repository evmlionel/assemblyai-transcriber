"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Copy, CheckCheck, Bookmark, BookmarkCheck } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

interface TranscriptSegment {
  id: string
  text: string
  start: number
  end: number
  speaker?: string
  confidence?: number
}

interface TranscriptViewerProps {
  transcript: {
    text: string
    utterances?: TranscriptSegment[]
    words?: TranscriptSegment[]
    segments?: TranscriptSegment[]
  }
  searchQuery?: string
}

export function TranscriptViewer({ transcript, searchQuery = "" }: TranscriptViewerProps) {
  const [detailed, setDetailed] = useState(false)
  const [activeSegment, setActiveSegment] = useState<string | null>(null)
  const [bookmarkedSegments, setBookmarkedSegments] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [filteredSegments, setFilteredSegments] = useState<TranscriptSegment[]>([])
  const activeSegmentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // --- Robust speaker grouping ---
  // 1. Try to auto-detect the speaker property key
  let speakerKey: string | null = null;
  if (filteredSegments.length > 0) {
    const keys = Object.keys(filteredSegments[0]);
    speakerKey = keys.find(k => k.toLowerCase().includes('speaker')) || null;
    // Debug: log available keys and selected key
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[TranscriptViewer] Segment keys:', keys, 'Using speaker key:', speakerKey);
      console.log('[TranscriptViewer] Sample segment:', filteredSegments[0]);
    }
  }

  // 2. Group by detected speaker key, or fallback to one segment per block
  type SpeakerBlock = { speaker: string | undefined, start: number, end: number, text: string };
  let speakerBlocks: SpeakerBlock[] = [];
  if (speakerKey) {
    let lastSpeaker: string | undefined = undefined;
    let currentBlock: SpeakerBlock | null = null;
    filteredSegments.forEach(seg => {
      const speaker = (seg as any)[speakerKey];
      if (!currentBlock || speaker !== lastSpeaker) {
        if (currentBlock) speakerBlocks.push(currentBlock);
        currentBlock = {
          speaker,
          start: seg.start,
          end: seg.end,
          text: seg.text
        };
        lastSpeaker = speaker;
      } else {
        currentBlock.end = seg.end;
        currentBlock.text += ' ' + seg.text;
      }
    });
    if (currentBlock) speakerBlocks.push(currentBlock);
  } else {
    // No speaker info, treat each segment as its own block
    speakerBlocks = filteredSegments.map(seg => ({
      speaker: undefined,
      start: seg.start,
      end: seg.end,
      text: seg.text
    }));
  }
  const speakerColors = [
    'text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600', 'text-yellow-700', 'text-cyan-600', 'text-red-600'
  ];
  const getSpeakerColor = (speaker: string | undefined) => {
    if (!speaker) return 'text-gray-600';
    const idx = parseInt((speaker||'').replace(/[^0-9]/g, '')) || 0;
    return speakerColors[idx % speakerColors.length];
  };

  // Use utterances if available, otherwise fall back to segments (which AssemblyAI uses) or words
  // AssemblyAI returns data in the 'words' array for word-level data and 'utterances' for speaker segments
  const segments = transcript.utterances || transcript.words || []

  // Toggle for detailed/simple view
  const showSimple = !detailed

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSegments(segments)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredSegments(segments.filter((segment) => segment.text.toLowerCase().includes(query)))
    }
  }, [searchQuery, segments])

  useEffect(() => {
    if (activeSegment && activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [activeSegment])

  if (!transcript || (!transcript.text && segments.length === 0)) {
    return <div className="p-4 text-center text-muted-foreground">No transcript available</div>
  }

  const formatTime = (timeInMillis: number) => {
    if (isNaN(timeInMillis) || timeInMillis < 0) {
      return "00:00:00"; // Handle invalid input gracefully
    }
    const totalSeconds = Math.floor(timeInMillis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const copySegmentText = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleBookmark = (segmentId: string) => {
    setBookmarkedSegments((prev) => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(segmentId)) {
        newBookmarks.delete(segmentId)
        toast({
          title: "Bookmark removed",
          description: "Segment has been removed from bookmarks",
        })
      } else {
        newBookmarks.add(segmentId)
        toast({
          title: "Bookmark added",
          description: "Segment has been bookmarked for reference",
        })
      }
      return newBookmarks
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded ${!detailed ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setDetailed(false)}
        >Simple</button>
        <button
          className={`px-3 py-1 rounded ${detailed ? "bg-primary text-white" : "bg-muted"}`}
          onClick={() => setDetailed(true)}
        >Detailed</button>
      </div>

      {showSimple ? (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded shadow text-base leading-relaxed whitespace-pre-line border">
          {transcript.text || "No transcript available."}
        </div>
      ) : (
        filteredSegments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No results found for "{searchQuery}"</div>
        ) : (
          <ScrollArea className="h-[500px] rounded-md border">
            <div className="p-4 space-y-3">
              {speakerBlocks.map((block, i) => (
                <div key={i} className="mb-6">
                  <div className={`mb-1 text-sm font-semibold ${getSpeakerColor(block.speaker)}`}>
                    {block.speaker ? `Speaker ${block.speaker}` : 'Unknown Speaker'}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="font-mono bg-muted px-2 py-1 rounded">
                      {formatTime(block.start)}–{formatTime(block.end)}
                    </span>
                  </div>
                  <div className="text-base leading-relaxed whitespace-pre-line">
                    {block.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )
      )}
      {bookmarkedSegments.size > 0 && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4 text-primary" />
            Bookmarked segments ({bookmarkedSegments.size})
          </h3>
          <div className="space-y-2">
            {segments
              .filter((segment) => bookmarkedSegments.has(segment.id))
              .map((segment) => (
                <div
                  key={`bookmark-${segment.id}`}
                  className="text-sm p-2 bg-background rounded border cursor-pointer hover:bg-muted"
                  onClick={() => setActiveSegment(segment.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">{formatTime(segment.start)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(segment.id)
                      }}
                    >
                      <BookmarkCheck className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="truncate">{segment.text}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
