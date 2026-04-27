import { PageContainer } from "#/components/page-container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { getCollection } from "../server/functions";
import { FilesList } from "../sections/files-list";
import { Route } from "#/routes/collection/$collection";
import { CollectionDetailsHeader } from "../components/collection-details-header";

export const CollectionView = () => {
  const { collection } = Route.useParams();

  const { data } = useSuspenseQuery(getCollection(collection));

  if (data.files.length === 0) {
    return (
      <PageContainer>
        <CollectionDetailsHeader collection={collection} files={data.files} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <FolderOpen
              className="h-8 w-8 text-muted-foreground/60"
              strokeWidth={1.5}
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-sm font-medium text-foreground">
              This collection is empty
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Upload a file to get started
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CollectionDetailsHeader collection={collection} files={data.files} />
      <div className="grid grid-cols-[1fr_3fr] gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-sm font-medium text-foreground">
            Files
          </h2>
          <FilesList files={data.files} />
        </div>
        <div />
      </div>
    </PageContainer>
  );
};
