import { getDataMapFromDataSources } from "@/core/data/helper";
import {
  getDataSourceNodes,
  getFigmaFile,
  getFigmaPageFrame,
} from "@/core/figma";
import Components from "./component";

export const dynamicParams = true; // true | false,

export default async function App({ params }: { params: { eidos: string[] } }) {
  const file = await getFigmaFile(process.env.FIGMA_FILE_KEY as string);
  const page = await getFigmaPageFrame(params.eidos, file);
  // find data source container node, then get data
  const dataSources = await getDataSourceNodes(page as any);
  const dataMap = await getDataMapFromDataSources(dataSources);
  // ...
  return (
    <>
      <Components dataMap={dataMap} file={file} page={page} />
    </>
  );
}
