import { FileText } from "lucide-react";

type Props = {
  files: string[];
};

export const FilesList = ({ files }: Props) => {
  return (
    <ul className="flex flex-col gap-1">
      {files.map((file) => (
        <li key={file}>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 transition-colors hover:bg-accent/30">
            <FileText
              className="h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <span
              className="truncate font-mono text-sm text-foreground"
              title={file}
            >
              {file}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};
