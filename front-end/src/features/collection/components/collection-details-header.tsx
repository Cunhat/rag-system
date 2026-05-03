import { UploadPdfDialog } from "./upload-pdf-dialog";

export function CollectionDetailsHeader({
	collection,
	files,
}: {
	collection: string;
	files: string[];
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex flex-col gap-1">
				<h1 className="font-mono text-xl font-semibold text-foreground">
					{collection}
				</h1>
				<p className="font-mono text-xs text-muted-foreground">
					{files.length} {files.length === 1 ? "file" : "files"}
				</p>
			</div>
			<UploadPdfDialog collection={collection} />
		</div>
	);
}
