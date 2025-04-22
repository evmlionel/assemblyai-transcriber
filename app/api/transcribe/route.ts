import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 })
    }

    // Start transcription on AssemblyAI
    const apiKey = process.env.ASSEMBLYAI_API_KEY!
    const initRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        audio_url: fileUrl,
        language_code: "de",
        speaker_labels: true,
        speakers_expected: 2
      }),
    })
    if (!initRes.ok) {
      const err = await initRes.json()
      return NextResponse.json({ error: err.error || "Failed to start transcription" }, { status: initRes.status })
    }
    const { id } = await initRes.json()

    // Poll for completion
    let transcriptRes, transcriptData
    do {
      await new Promise((r) => setTimeout(r, 2000))
      transcriptRes = await fetch(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        { headers: { authorization: apiKey } }
      )
      transcriptData = await transcriptRes.json()
    } while (transcriptData.status !== "completed")

    return NextResponse.json(transcriptData)
  } catch (error) {
    console.error("Error transcribing file:", error)
    return NextResponse.json({ error: "Failed to transcribe file" }, { status: 500 })
  }
}
