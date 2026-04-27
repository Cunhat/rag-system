import { FileText } from "lucide-react";

type Props = {
  files: string[];
};

export const FilesList = ({ files }: Props) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-12 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="font-mono text-sm text-muted-foreground">No files yet</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {files.map((file) => (
        <li key={file}>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 transition-colors hover:bg-accent/30">
            <FileText
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <span className="truncate font-mono text-sm text-foreground" title={file}>
              {file}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};
