import uuid
import inngest
from custom_types import RAGChunkAndSrc, RAGUpsertResult
from ingest_pdf.data_loader import embed_texts, load_and_chunk_pdf
from inngest_app import inngest_client
from vector_db import QdrantStorage



def load_pdf(ctx: inngest.Context) -> RAGChunkAndSrc:
    pdf_path = ctx.event.data["pdf_path"]
    source_id = ctx.event.data.get("source_id", pdf_path)
    chunks = load_and_chunk_pdf(pdf_path)
    
    return RAGChunkAndSrc(chunks=chunks, source_id=source_id)


def upsert_pdf(chunks_and_src: RAGChunkAndSrc) -> RAGUpsertResult:
    chunks = chunks_and_src.chunks
    source_id = chunks_and_src.source_id
    vecs = embed_texts(chunks)

    ids = [str(uuid.uuid5(uuid.NAMESPACE_URL, f"{source_id}:{i}")) for i in range(len(chunks))]
        
    payloads = [{"source": source_id, "text": chunks[i]} for i in range(len(chunks))]
    QdrantStorage().upsert(ids, vecs, payloads)
        
    return RAGUpsertResult(ingested=len(chunks))


@inngest_client.create_function(
    fn_id="RAG: Ingest PDF",
    trigger=inngest.TriggerEvent(event="rag/ingest_pdf"),
)
async def rag_ingest_pdf(ctx: inngest.Context):
    chunks_and_src = await ctx.step.run("load-and-chunk", lambda: load_pdf(ctx), output_type=RAGChunkAndSrc)
    ingested = await ctx.step.run("embed-and-upsert", lambda: upsert_pdf(chunks_and_src), output_type=RAGUpsertResult)
    return ingested.model_dump()
