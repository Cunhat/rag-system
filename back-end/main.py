import os
import uuid
from pathlib import Path

from fastapi.responses import JSONResponse
import inngest
import inngest.fast_api
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from inngest_app import inngest_client
from ingest_pdf.ingestion import rag_ingest_pdf
from rag_query import run_rag_query

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


class QueryBody(BaseModel):
    question: str
    top_k: int = 5


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


@app.get("/collections")
async def get_collections():
    qdrant_client = QdrantClient(url="http://localhost:6333")
    collections = qdrant_client.get_collections().collections

    return [collection.name for collection in collections]

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
                "message": "Failed to create collection",
                "error": error_message,
            },
        )
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={
                "message": "Failed to create collection",
                "error": str(error),
            },
        )

inngest.fast_api.serve(app, inngest_client, [rag_ingest_pdf, rag_query_pdf_ai])