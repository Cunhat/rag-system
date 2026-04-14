import logging
from fastapi import FastAPI
import inngest
import inngest.fast_api



# Create an Inngest client
inngest_client = inngest.Inngest(
    app_id="rag-system",
    logger=logging.getLogger("uvicorn"),
    is_production=False,
    serializer=inngest.PydanticSerializer()
)

# Create an Inngest function
@inngest_client.create_function(
    fn_id="my_function",
    # Event that triggers this function
    trigger=inngest.TriggerEvent(event="app/my_function"),
)
async def my_function(ctx: inngest.Context) -> str:
    ctx.logger.info(ctx.event)
    return "done"

app = FastAPI()

inngest.fast_api.serve(app, inngest_client, [])