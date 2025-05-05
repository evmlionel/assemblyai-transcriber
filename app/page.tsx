"use client"

import { useState } from "react"
import { FileText, Loader2, AlertCircle, Search, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DropZone } from "./components/drop-zone"
import { TranscriptViewer } from "./components/transcript-viewer"
import { DownloadOptions } from "./components/download-options"
import { TranscriptionStepper } from "./components/transcription-stepper"
import { TranscriptionHero } from "./components/transcription-hero"
import { RecentTranscriptions } from "./components/recent-transcriptions"
import { ThemeToggle } from "./components/theme-toggle"
import { AnimatePresence, motion } from "framer-motion"

export default function TranscriptionPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcriptionProgress, setTranscriptionProgress] = useState(0)
  const [transcript, setTranscript] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const { toast } = useToast()

  const handleFileSelected = (selectedFile: File) => {
    // Reset states
    setFile(selectedFile)
    setError(null)
    setTranscript(null)
    setUploadProgress(0)
    setTranscriptionProgress(0)
    setCurrentStep(1)

    toast({
      title: "File selected",
      description: `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`,
    })
  }

  const handleUploadAndTranscribe = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit")
      return
    }

    try {
      // Upload file
      setIsUploading(true)
      setError(null)
      setCurrentStep(2)

      const formData = new FormData()
      formData.append("file", file)

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadInterval)
            return prev
          }
          return prev + 5
        })
      }, 200)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(uploadInterval)
      setUploadProgress(100)

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const { fileUrl } = await uploadResponse.json()
      setIsUploading(false)

      // Start transcription
      setIsTranscribing(true)
      setCurrentStep(3)

      // Simulate transcription progress
      const transcribeInterval = setInterval(() => {
        setTranscriptionProgress((prev) => {
          if (prev >= 95) {
            clearInterval(transcribeInterval)
            return prev
          }
          return prev + 1
        })
      }, 300)

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
      })

      clearInterval(transcribeInterval)
      setTranscriptionProgress(100)

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json()
        throw new Error(errorData.error || "Failed to transcribe file")
      }

      const transcriptData = await transcribeResponse.json()
      setTranscript(transcriptData)
      setCurrentStep(4)

      // Save recent transcription metadata and full data separately
      try {
        const transcriptId = transcriptData.id || Date.now().toString();
        const recentsMetadata = JSON.parse(localStorage.getItem("recentTranscripts") || "[]");
        const newMetadataEntry = {
          id: transcriptId,
          name: file?.name || "Audio",
          date: new Date().toISOString(),
          duration: transcriptData.audio_duration
            ? `${Math.floor(transcriptData.audio_duration / 60)}:${(Math.floor(transcriptData.audio_duration % 60)).toString().padStart(2, "0")}`
            : "--:--",
        };

        // Store full transcript data separately
        localStorage.setItem(`transcript_${transcriptId}`, JSON.stringify(transcriptData));

        // Store metadata list (remove old entry if ID exists)
        localStorage.setItem(
          "recentTranscripts",
          JSON.stringify([newMetadataEntry, ...recentsMetadata.filter((t:any)=>t.id!==newMetadataEntry.id)].slice(0, 10)) // Limit to 10 recents
        );
      } catch (error) {
        console.error("Failed to save transcript to localStorage:", error);
      }

      toast({
        title: "Transcription complete",
        description: "Your file has been successfully transcribed!",
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred",
      })
    } finally {
      setIsUploading(false)
      setIsTranscribing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setTranscript(null)
    setError(null)
    setUploadProgress(0)
    setTranscriptionProgress(0)
    setCurrentStep(0)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto py-8 px-4">
        <TranscriptionHero />

        <div className="max-w-5xl mx-auto mt-8">
          <TranscriptionStepper currentStep={currentStep} />

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="upload-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
              >
                <Card className="md:col-span-2 overflow-hidden border-primary/10 shadow-lg">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Upload Your File</h2>
                    <DropZone
                      onFileSelected={handleFileSelected}
                      selectedFile={file}
                      isUploading={isUploading || isTranscribing}
                    />
                  </CardContent>
                </Card>

                <RecentTranscriptions onSelectTranscript={(t) => {
                  setTranscript(t)
                  setCurrentStep(4)
                }} />
              </motion.div>
            )}

            {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
              <motion.div
                key="processing-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <Card className="overflow-hidden border-primary/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Processing File</h2>
                      <Button variant="ghost" size="sm" onClick={resetForm} disabled={isUploading || isTranscribing}>
                        Cancel
                      </Button>
                    </div>

                    {file && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <Button
                            onClick={handleUploadAndTranscribe}
                            disabled={!file || isUploading || isTranscribing || currentStep > 1}
                            size="sm"
                          >
                            {isUploading || isTranscribing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Start Processing</>
                            )}
                          </Button>
                        </div>

                        {(isUploading || uploadProgress > 0) && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Uploading file</span>
                              <span className="text-muted-foreground">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        )}

                        {(isTranscribing || transcriptionProgress > 0) && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Transcribing audio</span>
                              <span className="text-muted-foreground">{transcriptionProgress}%</span>
                            </div>
                            <Progress value={transcriptionProgress} className="h-2" />
                          </div>
                        )}

                        {error && (
                          <div className="bg-destructive/10 text-destructive rounded-md p-4 text-sm flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Error occurred</p>
                              <p>{error}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 4 && transcript && (
              <motion.div
                key="transcript-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <Card className="overflow-hidden border-primary/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Transcript</h2>
                        <p className="text-muted-foreground">
                          {file?.name} • {transcript.utterances?.length || 0} segments
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search transcript..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <DownloadOptions transcript={transcript} fileName={file?.name || "transcript"} />
                        <Button variant="outline" size="icon" onClick={resetForm} title="New Transcription">
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="formatted" className="w-full">
                      <TabsList className="mb-4 w-full justify-start">
                        <TabsTrigger value="formatted">Formatted</TabsTrigger>
                        <TabsTrigger value="raw">Raw Text</TabsTrigger>
                      </TabsList>
                      <TabsContent value="formatted">
                        <TranscriptViewer transcript={transcript} searchQuery={searchQuery} />
                      </TabsContent>
                      <TabsContent value="raw">
                        <Textarea
                          readOnly
                          className="min-h-[400px] font-mono text-sm"
                          value={transcript.text || "No transcript available"}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
