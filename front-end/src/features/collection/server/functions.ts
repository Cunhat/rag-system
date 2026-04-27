import { queryOptions } from "@tanstack/react-query";

export const getCollection = (name: string) =>
  queryOptions({
    queryKey: ["collections", name],
    queryFn: async () => {
      const response = await fetch(`http://127.0.0.1:8000/collection/${name}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Failed to get collection");
      }

      return (await response.json()) as { files: string[] };
    },
  });
