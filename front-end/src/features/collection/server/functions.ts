import { mutationOptions, queryOptions } from "@tanstack/react-query";

type IngestPdfInput = {
	collection: string;
	files: File[];
};

type IngestPdfResponse = {
	event_id: string;
	source_id: string;
	pdf_path: string;
	collection: string;
};

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

const ingestPdf = async (file: File, collection: string) => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("source_id", file.name);
	formData.append("collection", collection);

	const response = await fetch("http://127.0.0.1:8000/ingest/pdf", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(
			error.message ?? error.detail ?? `Failed to upload ${file.name}`,
		);
	}

	return (await response.json()) as IngestPdfResponse;
};

export const ingestPdfsMutation = mutationOptions({
	mutationFn: async ({ collection, files }: IngestPdfInput) => {
		return Promise.all(files.map((file) => ingestPdf(file, collection)));
	},
	onSuccess: (
		_data: IngestPdfResponse[],
		variables: IngestPdfInput,
		_result,
		context,
	) => {
		context?.client?.invalidateQueries({
			queryKey: ["collections", variables.collection],
		});
	},
});
