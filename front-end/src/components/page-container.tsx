import { cn } from "#/lib/utils";
import React from "react";

export const PageContainer: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ className, ...props }) => {
  return (
    <div
      className={cn("flex h-full flex-col gap-6 px-6 py-6", className)}
      {...props}
    />
  );
};
