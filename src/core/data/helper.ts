import { IDataSource } from "./interface";
import { NotionDataSource } from "./notion";

const dataSourceMap = {
  notion: new NotionDataSource(),
  // other data source here
};

export const getDataMapFromDataSources = async (dataSources: IDataSource[]) => {
  const data = await Promise.all(
    dataSources.map((dataSource) => {
      const sourceType = dataSource.source;
      const dataSourceManager = dataSourceMap[sourceType];
      return dataSourceManager.getDataFromDataSource(dataSource);
    })
  );

  const dataMap: {
    notion: Record<string, any>;
  } = {
    notion: {},
  };
  const dataZip = data.map((data, index) => {
    return {
      source: dataSources[index].source,
      id: dataSources[index].id,
      data,
    };
  });
  dataZip.forEach((data) => {
    dataMap.notion[data.id] = data.data;
  });
  return dataMap;
};
