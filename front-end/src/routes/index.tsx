import { FolderSystemView } from "#/features/collections/views/folder-system-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FolderSystemView />;
}
