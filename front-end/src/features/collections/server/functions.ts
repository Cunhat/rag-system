import { queryOptions } from "@tanstack/react-query";

export const getCollections = queryOptions({
  queryKey: ["collections"],
  queryFn: async () => {
    const response = await fetch("http://127.0.0.1:8000/collections", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  },
});
