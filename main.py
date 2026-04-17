import logging
from fastapi import FastAPI
import inngest
import inngest.fast_api

# Create an Inngest client
inngest_client = inngest.Inngest(
    app_id="rag_system",
    logger=logging.getLogger("uvicorn"),
    is_production=False,
    serializer=inngest.PydanticSerializer()
)

# Create an Inngest function
@inngest_client.create_function(
    fn_id="rag_ingest",
    # Event that triggers this function
    trigger=inngest.TriggerEvent(event="rag/ingest"),
)

async def rag_ingest(ctx: inngest.Context) -> str:
    ctx.logger.info(ctx.event)
    return "done"

app = FastAPI()

inngest.fast_api.serve(app, inngest_client, [rag_ingest])