import asyncio
import json
import os
import uuid
from pathlib import Path

from openai import AsyncOpenAI, OpenAI

from ingest_pdf.data_loader import embed_texts
from vector_db import QdrantStorage


def retrieve_rag_context(question: str, top_k: int = 5) -> dict:
    query_vec = embed_texts([question])[0]
    store = QdrantStorage()
    return store.search(query_vec, top_k)


def build_rag_user_content(question: str, contexts: list[str]) -> str:
    context_block = "\n\n".join(f"- {context}" for context in contexts)
    return (
        "Use the following context to answer the question.\n\n"
        f"Context:\n{context_block}\n\n"
        f"Question: {question}\n"
        "Answer concisely using the context above."
    )


def sse_event(payload: dict) -> str:
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def run_rag_query(question: str, top_k: int = 5) -> dict:
    """Embed question, search Qdrant, answer with OpenAI. Used by HTTP and Inngest."""
    found = retrieve_rag_context(question, top_k)
    contexts = found["contexts"]
    sources = found["sources"]

    user_content = build_rag_user_content(question, contexts)

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1024,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "You answer questions using only the provided context.",
            },
            {"role": "user", "content": user_content},
        ],
    )
    answer = (res.choices[0].message.content or "").strip()

    return {"answer": answer, "sources": sources, "num_contexts": len(contexts)}


async def stream_rag_query(question: str, top_k: int = 5):
    message_id = f"msg_{uuid.uuid4().hex}"
    text_id = f"text_{uuid.uuid4().hex}"

    try:
        yield sse_event({"type": "start", "messageId": message_id})

        found = await asyncio.to_thread(retrieve_rag_context, question, top_k)
        contexts = found["contexts"]
        sources = found["sources"]

        for source in sources:
            yield sse_event(
                {
                    "type": "source-document",
                    "sourceId": source,
                    "mediaType": "application/pdf",
                    "title": Path(source).name or source,
                }
            )

        yield sse_event({"type": "text-start", "id": text_id})

        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=1024,
            temperature=0.2,
            stream=True,
            messages=[
                {
                    "role": "system",
                    "content": "You answer questions using only the provided context.",
                },
                {"role": "user", "content": build_rag_user_content(question, contexts)},
            ],
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield sse_event({"type": "text-delta", "id": text_id, "delta": delta})

        yield sse_event({"type": "text-end", "id": text_id})
        yield sse_event({"type": "finish"})
    except Exception as error:
        yield sse_event({"type": "error", "errorText": str(error)})
    finally:
        yield "data: [DONE]\n\n"
