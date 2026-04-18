import os

from openai import OpenAI

from data_loader import embed_texts
from vector_db import QdrantStorage


def run_rag_query(question: str, top_k: int = 5) -> dict:
    """Embed question, search Qdrant, answer with OpenAI. Used by HTTP and Inngest."""
    query_vec = embed_texts([question])[0]
    store = QdrantStorage()
    found = store.search(query_vec, top_k)
    contexts = found["contexts"]
    sources = found["sources"]

    context_block = "\n\n".join(f"- {c}" for c in contexts)
    user_content = (
        "Use the following context to answer the question.\n\n"
        f"Context:\n{context_block}\n\n"
        f"Question: {question}\n"
        "Answer concisely using the context above."
    )

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
