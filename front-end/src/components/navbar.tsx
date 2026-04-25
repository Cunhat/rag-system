import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Brand */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="secondbrain home"
        >
          <div className="brand-icon relative flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10 transition-all duration-200 group-hover:border-primary/50 group-hover:bg-primary/20">
            <Brain
              className="h-4 w-4 text-primary transition-all duration-200 group-hover:scale-110"
              strokeWidth={1.75}
            />
            <span className="brand-glow pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <span className="font-mono text-[13px] font-semibold tracking-tight text-foreground">
            Second Brain
          </span>
        </Link>

        {/* Separator */}
        <div className="h-4 w-px bg-border/60 shrink-0" />

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-0.5">
          <Link
            to="/"
            className="nav-link flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[12.5px] text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
            activeProps={{
              className: "nav-link-active bg-accent text-foreground",
            }}
          >
            Collections
          </Link>
        </nav>
      </div>
    </header>
  );
}
