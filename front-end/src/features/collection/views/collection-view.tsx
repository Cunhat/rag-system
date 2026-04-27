import { PageContainer } from "#/components/page-container";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getCollection } from "../server/functions";
import { FilesList } from "../sections/files-list";

type Props = {
  collection: string;
};

export const CollectionView = ({ collection }: Props) => {
  const { data } = useSuspenseQuery(getCollection(collection));

  return (
    <PageContainer>
      <div>
        <h1 className="font-mono text-xl font-semibold text-foreground">
          {collection}
        </h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {data.files.length} {data.files.length === 1 ? "file" : "files"}
        </p>
      </div>

      <div className="grid grid-cols-[1fr_3fr] gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-sm font-medium text-foreground">
            Files
          </h2>
          <FilesList files={data.files} />
        </div>

        <div />
      </div>
    </PageContainer>
  );
};
