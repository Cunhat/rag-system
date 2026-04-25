import { Link } from "@tanstack/react-router";
import { ChevronRight, FileText, Folder } from "lucide-react";
import type { Collection } from "@/lib/mock-data";

type Props = {
  collections: Collection[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CollectionsList({ collections }: Props) {
  return (
    <ul className="space-y-1.5">
      {collections.map((col) => (
        <li key={col.id}>
          <Link
            to="/collections/$collection"
            params={{ collection: col.id }}
            className="group flex items-center gap-4 rounded-lg border border-border/60 bg-card px-4 py-3.5 transition-all duration-150 hover:border-primary/30 hover:bg-accent/30"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 transition-colors duration-150 group-hover:border-primary/40 group-hover:bg-primary/20">
              <Folder
                className="h-4 w-4 text-primary"
                strokeWidth={1.5}
                fill="currentColor"
                fillOpacity={0.15}
              />
            </div>

            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <span className="font-mono text-sm font-medium text-foreground truncate">
                {col.name}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Updated {formatDate(col.updatedAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <FileText className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.75} />
              <span className="font-mono text-xs text-muted-foreground">
                {col.fileCount} {col.fileCount === 1 ? "file" : "files"}
              </span>
            </div>

            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
              strokeWidth={1.75}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
