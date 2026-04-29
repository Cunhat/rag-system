import os
import uuid
from pathlib import Path

from fastapi.responses import JSONResponse, StreamingResponse
import inngest
import inngest.fast_api
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from inngest_app import inngest_client
from ingest_pdf.ingestion import rag_ingest_pdf
from rag_query import run_rag_query, stream_rag_query

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse

load_dotenv()

UPLOAD_DIR = Path(os.getenv("PDF_UPLOAD_DIR", "uploads/pdfs"))


@inngest_client.create_function(
    fn_id="RAG: Query PDF",
    trigger=inngest.TriggerEvent(event="rag/query_pdf_ai")
)
async def rag_query_pdf_ai(ctx: inngest.Context):
    question = ctx.event.data["question"]
    top_k = int(ctx.event.data.get("top_k", 5))
    return await ctx.step.run("rag-query", lambda: run_rag_query(question, top_k))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-vercel-ai-ui-message-stream"],
)


class QueryBody(BaseModel):
    question: str
    top_k: int = 5


class ChatMessage(BaseModel):
    role: str | None = None
    content: str | None = None
    parts: list[dict] | None = None


class QueryStreamBody(BaseModel):
    question: str | None = None
    messages: list[ChatMessage] | None = None
    top_k: int = 5


def get_stream_question(body: QueryStreamBody) -> str:
    if body.question:
        return body.question

    if not body.messages:
        raise HTTPException(status_code=400, detail="Question or messages are required")

    for message in reversed(body.messages):
        if message.parts:
            for part in message.parts:
                if part.get("type") == "text" and part.get("text"):
                    return part["text"]

        if message.content:
            return message.content

    raise HTTPException(status_code=400, detail="No text question found")


@app.post("/ingest/pdf")
async def ingest_pdf(file: UploadFile = File(...), source_id: str | None = Form(None)):
    filename = file.filename or "uploaded.pdf"
    if file.content_type != "application/pdf" and not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = (UPLOAD_DIR / f"{uuid.uuid4()}.pdf").resolve()

    try:
        with pdf_path.open("wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                buffer.write(chunk)
    finally:
        await file.close()

    ids = await inngest_client.send(
        inngest.Event(
            name="rag/ingest_pdf",
            data={
                "pdf_path": str(pdf_path),
                "source_id": source_id or filename,
            },
        )
    )

    return {
        "event_id": ids[0],
        "source_id": source_id or filename,
        "pdf_path": str(pdf_path),
    }


@app.post("/query")
async def query(body: QueryBody):
    ids = await inngest_client.send(
        inngest.Event(
            name="rag/query_pdf_ai",
            data={"question": body.question, "top_k": body.top_k},
        )
    )
    return {"event_id": ids[0]}


@app.post("/query/stream")
async def query_stream(body: QueryStreamBody):
    question = get_stream_question(body)

    return StreamingResponse(
        stream_rag_query(question, body.top_k),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "x-vercel-ai-ui-message-stream": "v1",
        },
    )


@app.get("/collections")
async def get_collections():
    try:
        qdrant_client = QdrantClient(url="http://localhost:6333")
        collections = qdrant_client.get_collections().collections

        return [collection.name for collection in collections]
    except UnexpectedResponse as error:
        structured_error = error.structured()
        error_message = structured_error.get("status", {}).get("error", str(error))

        return JSONResponse(
            status_code=error.status_code or 500,
            content={
                "message": error_message or "Failed to get collections",
            },
        )
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "message": str(error)
            },
        )

class CreateCollectionBody(BaseModel):
    name: str

@app.post("/collection")
async def create_collection(body: CreateCollectionBody):
    try:
        qdrant_client = QdrantClient(url="http://localhost:6333")
        qdrant_client.create_collection(collection_name=body.name)

        return {"message": "Collection created successfully with name: " + body.name}
    except UnexpectedResponse as error:
        structured_error = error.structured()
        error_message = structured_error.get("status", {}).get("error", str(error))

        return JSONResponse(
            status_code=error.status_code or 500,
            content={
                "message": error_message or "Failed to create collection"
            },
        )
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "message": str(error)
            },
        )

@app.get("/collection/{name}")
async def get_collection(name: str):
    try:
        qdrant_client = QdrantClient(url="http://localhost:6333")
        points = qdrant_client.query_points(collection_name=name)

        files = set[str] ()
        for point in points.points:
            file_name = point.payload.get("source", "").split("/")[-1]
            files.add(file_name)

        return {"files": list(files)}
    except UnexpectedResponse as error:
        structured_error = error.structured()
        error_message = structured_error.get("status", {}).get("error", str(error))

        return JSONResponse(
            status_code=error.status_code or 500,
            content={
                "message": error_message or "Failed to get collection"
            },
        )
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "message": str(error)
            },
        )

inngest.fast_api.serve(app, inngest_client, [rag_ingest_pdf, rag_query_pdf_ai])