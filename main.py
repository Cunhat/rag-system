import logging
import os
import urllib.parse

import httpx
import inngest
import inngest.fast_api
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from inngest_app import inngest_client
from ingest_pdf.ingestion import rag_ingest_pdf
from rag_query import run_rag_query

load_dotenv()

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