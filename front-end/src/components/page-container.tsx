import React from "react";

export const PageContainer: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
> = ({ ...props }) => {
  return <div className="px-6 py-6 flex flex-col gap-6" {...props} />;
};
