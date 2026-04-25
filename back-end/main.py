import os
import uuid
from pathlib import Path

import inngest
import inngest.fast_api
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from inngest_app import inngest_client
from ingest_pdf.ingestion import rag_ingest_pdf
from rag_query import run_rag_query

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


inngest.fast_api.serve(app, inngest_client, [rag_ingest_pdf, rag_query_pdf_ai])