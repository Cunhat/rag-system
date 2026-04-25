# RAG system

FastAPI app that ingests PDFs into Qdrant and answers questions with OpenAI embeddings and chat, orchestrated with [Inngest](https://www.inngest.com/).

## Prerequisites

- **Python** 3.14+ (see `pyproject.toml`)
- **[uv](https://docs.astral.sh/uv/)** for installing and running Python dependencies
- **Node.js** (for `npx` and the Inngest dev server)
- **Docker** (for running Qdrant locally)

## Environment

Create a `.env` file in the project root with your OpenAI API key (used for embeddings and the LLM):

```env
OPENAI_API_KEY=sk-...
```

## Install Python dependencies

From the project root:

```bash
uv sync
```

## Run the stack

Use **three terminals**. Order matters: start Qdrant first, then the API, then Inngest (so the dev server can reach `/api/inngest`).

### 1. Qdrant (Docker)

Starts Qdrant on port **6333** and persists data under `./qdrant_storage`:

```bash
docker run -d --name qdrandRagDb -p 6333:6333 -v "./qdrant_storage:/qdrant/storage" qdrant/qdrant
```

The app expects Qdrant at `http://localhost:6333` (see `vector_db.py`).

### 2. FastAPI (Uvicorn)

```bash
uv run uvicorn main:app
```

By default the API listens on **http://127.0.0.1:8000**.

### 3. Inngest dev server

Points the Inngest CLI at your local serve endpoint and disables app auto-discovery:

```bash
npx --ignore-scripts=false inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest --no-discovery
```

Use the Inngest dev UI (CLI output shows the URL) to send events and inspect function runs.

## Stopping / cleanup

- Stop Uvicorn and the Inngest process with `Ctrl+C` in each terminal.
- Stop and remove the Qdrant container if you used the name above:

  ```bash
  docker stop qdrandRagDb && docker rm qdrandRagDb
  ```
