import { useMutation } from "@tanstack/react-query";
import { FileTextIcon, UploadIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { cn } from "#/lib/utils";
import { ingestPdfsMutation } from "../server/functions";

type UploadPdfDialogProps = {
  collection: string;
};

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadPdfDialog({ collection }: UploadPdfDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const mutation = useMutation(ingestPdfsMutation);

  const reset = () => {
    setFiles([]);
    setError(null);
    setStatus(null);
    mutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutation.isPending) return;
    if (!nextOpen) reset();
    setOpen(nextOpen);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    disabled: mutation.isPending,
    multiple: true,
    onDrop: (acceptedFiles, rejectedFiles) => {
      setStatus(null);

      if (rejectedFiles.length > 0) {
        setError("Only PDF files can be uploaded.");
      } else {
        setError(null);
      }

      setFiles((currentFiles) => {
        const nextFiles = acceptedFiles.filter(
          (file) =>
            !currentFiles.some(
              (currentFile) =>
                currentFile.name === file.name &&
                currentFile.size === file.size &&
                currentFile.lastModified === file.lastModified,
            ),
        );

        return [...currentFiles, ...nextFiles];
      });
    },
  });

  const removeFile = (index: number) => {
    setFiles((currentFiles) =>
      currentFiles.filter((_file, fileIndex) => fileIndex !== index),
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    mutation.mutate(
      { collection, files },
      {
        onSuccess: (responses) => {
          setFiles([]);
          const target = responses[0]?.collection ?? collection;
          setStatus(
            `${responses.length} ${responses.length === 1 ? "PDF was" : "PDFs were"} queued for ingestion into collection "${target}".`,
          );
        },
        onError: (uploadError) => {
          setError(uploadError.message);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="sm">
          <UploadIcon data-icon="inline-start" />
          Upload PDF
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload PDF files</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-left">
              <p>
                PDFs are added to the Qdrant collection below and chunked for
                RAG.
              </p>
              <p className="rounded-2xl border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground">
                <span className="text-muted-foreground">Collection</span>{" "}
                <span className="font-medium">{collection}</span>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={cn(
              "flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center transition-colors",
              isDragActive && "border-primary bg-primary/5",
              mutation.isPending && "cursor-not-allowed opacity-70",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex size-12 items-center justify-center rounded-2xl bg-background ring-1 ring-border">
              <UploadIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm font-medium text-foreground">
                {isDragActive ? "Drop PDFs here" : "Drag PDFs here"}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                or click to choose files from your machine
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <ul className="flex  flex-col gap-2">
              {files.map((file, index) => (
                <li
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
                  key={`${file.name}-${file.lastModified}`}
                >
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    aria-label={`Remove ${file.name}`}
                    disabled={mutation.isPending}
                    onClick={() => removeFile(index)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <XIcon />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="font-mono text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          {status && (
            <p className="font-mono text-xs text-muted-foreground">{status}</p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending} type="button">
              Close
            </AlertDialogCancel>
            <Button
              disabled={files.length === 0 || mutation.isPending}
              type="submit"
            >
              {mutation.isPending && <Spinner data-icon="inline-start" />}
              {mutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
