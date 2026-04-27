import { getCollection } from "#/features/collection/server/functions";
import { CollectionView } from "#/features/collection/views/collection-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/collection/$collection")({
  component: CollectionDetail,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCollection(params.collection));
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CollectionDetail() {
  return <CollectionView />;
}
