# AssemblyAI Transcriber

This is a web application designed to easily create transcripts of audio files using AssemblyAI.

## Features

* Simple interface for uploading audio files.
* Automatic transcription generation powered by AssemblyAI.
* (Add more features as they are developed)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following:

* **Git:** For cloning the repository.
* **Bun:** (Recommended) For package management and running scripts. Installation instructions can be found at [bun.sh](https://bun.sh).
  * Alternatively, **Node.js** (which includes npm) or **pnpm** can be used.
* An **AssemblyAI Account and API Key:** You'll need this to use the transcription service. You can sign up at [AssemblyAI](https://www.assemblyai.com/).

### Installation

1. **Clone the repository (or download the code):**

   ```bash
   git clone <repository_url> # Replace with the actual URL if using Git
   cd assemblyai-transcriber
   ```

2. **Install dependencies:**
   It's recommended to use Bun:

   ```bash
   bun install
   ```

   Alternatively, you can use npm or pnpm if preferred:

   ```bash
   # npm install
   # pnpm install
   ```

3. **Set up Environment Variables:**
   * Copy the example environment file:

     ```bash
     cp .env.example .env.local
     ```

     *(Note: This command copies the template. You'll need to edit `.env.local` next.)*
   * Open the newly created `.env.local` file.
   * Replace the placeholder value for `ASSEMBLYAI_API_KEY` with your actual AssemblyAI API key:

     ```dotenv
     ASSEMBLYAI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
     ```

### Running the Application

```bash
bun run dev
```

This will start the development server. Open your browser and navigate to the URL provided (usually `http://localhost:3000` or similar).
