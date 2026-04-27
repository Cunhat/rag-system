import { CollectionView } from "#/features/collection/views/collection-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/collection/$collection")({
  component: CollectionDetail,
});

function CollectionDetail() {
  return <CollectionView />;
}
