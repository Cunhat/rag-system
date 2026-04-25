import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, FileText, ArrowLeft, Upload, Hash, HardDrive } from "lucide-react";
import { COLLECTIONS, FILES_BY_COLLECTION } from "../../lib/mock-data";

export const Route = createFileRoute("/collections/$collection")({
  component: CollectionDetail,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CollectionDetail() {
  const { collection: collectionId } = Route.useParams();
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  const files = FILES_BY_COLLECTION[collectionId] ?? [];

  if (!collection) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="font-mono text-sm text-muted-foreground">Collection not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Collections
        </Link>
        <ChevronRight className="h-3 w-3" strokeWidth={2} />
        <span className="text-foreground">{collection.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-accent hover:text-foreground"
            aria-label="Back to collections"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
          <div>
            <h1 className="font-mono text-xl font-semibold text-foreground">
              {collection.name}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={2} />
          Upload PDF
        </button>
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-16 text-center">
          <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="font-mono text-sm text-muted-foreground">No files yet</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground/60">Upload a PDF to get started</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {files.map((file) => (
            <li key={file.id}>
              <div className="group flex items-center gap-4 rounded-lg border border-border/60 bg-card px-4 py-3 transition-colors duration-150 hover:border-border hover:bg-accent/20">
                {/* Icon */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border/60 bg-muted/40">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                </div>

                {/* Filename */}
                <span className="flex-1 truncate font-mono text-sm text-foreground min-w-0">
                  {file.name}
                </span>

                {/* Meta */}
                <div className="hidden shrink-0 items-center gap-4 sm:flex">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/70">
                    <Hash className="h-3 w-3" strokeWidth={1.75} />
                    {file.pages}p
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/70">
                    <HardDrive className="h-3 w-3" strokeWidth={1.75} />
                    {file.size}
                  </span>
                  <span className="w-20 text-right font-mono text-[11px] text-muted-foreground/60">
                    {formatDate(file.uploadedAt)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
