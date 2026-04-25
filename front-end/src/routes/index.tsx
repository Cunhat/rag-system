import { getCollections } from "#/features/collections/server/functions";
import { FolderSystemView } from "#/features/collections/views/folder-system-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getCollections);
  },
});

function Home() {
  return <FolderSystemView />;
}
