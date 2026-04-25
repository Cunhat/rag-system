import { Link } from "@tanstack/react-router";
import { Folder } from "lucide-react";

type Props = {
  collections: string[];
};

export function CollectionsGrid({ collections }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {collections.map((col) => (
        <li key={col}>
          <Link
            to="/collections/$collection"
            params={{ collection: col }}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-6 text-center transition-all duration-150 hover:border-primary/30 hover:bg-accent/30"
          >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary/20 group-hover:scale-105">
              <Folder
                className="h-7 w-7 text-primary"
                strokeWidth={1.5}
                fill="currentColor"
                fillOpacity={0.15}
              />
            </div>

            <span className="w-full truncate font-mono text-sm font-medium text-foreground">
              {col}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
