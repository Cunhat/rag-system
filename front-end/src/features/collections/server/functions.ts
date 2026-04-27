import { mutationOptions, queryOptions } from "@tanstack/react-query";

export const getCollections = queryOptions({
  queryKey: ["collections"],
  queryFn: async () => {
    const response = await fetch("http://127.0.0.1:8000/collections", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (await response.json()) as string[];
  },
});

export const createCollection = async (name: string) => {
  const response = await fetch("http://127.0.0.1:8000/collection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to create collection");
  }

  return response.json();
};

export const createCollectionMutation = mutationOptions({
  mutationFn: createCollection,
  onSuccess: (_data, _variables, _result, context) => {
    context?.client?.invalidateQueries({ queryKey: ["collections"] });
  },
});
