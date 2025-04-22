import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Parse incoming file
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()

    // Upload to AssemblyAI
    const apiKey = process.env.ASSEMBLYAI_API_KEY!
    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: apiKey },
      body: arrayBuffer,
    })
    if (!uploadRes.ok) {
      const err = await uploadRes.json()
      return NextResponse.json({ error: err.error || "Upload failed" }, { status: uploadRes.status })
    }
    const { upload_url } = await uploadRes.json()
    return NextResponse.json({ fileUrl: upload_url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
