import { PageContainer } from "@/components/page-container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useState } from "react";
import { getCollections } from "../server/functions";
import type { FolderView } from "../types";
import { CollectionsGrid } from "./sections/collections-grid";
import { CollectionsList } from "./sections/collections-list";

export const FolderSystemView = () => {
  const [view, setView] = useState<FolderView>("grid");

  const collections = useSuspenseQuery(getCollections);

  const totalFiles = collections.data.length;

  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-semibold text-foreground">
            Collections
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {totalFiles} collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-md border border-border/60 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded transition-all duration-150 ${
                view === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`flex h-7 w-7 items-center justify-center rounded transition-all duration-150 ${
                view === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            New collection
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <CollectionsGrid collections={collections.data} />
      ) : (
        <CollectionsList collections={collections.data} />
      )}
    </PageContainer>
  );
};
