interface IDataQuery {
  filter?: unknown[];
  sort?: unknown[];
}

export interface IDataSource {
  id: string;
  source: "notion";
  type: "list" | "detail";
  componentId: string;
  query?: IDataQuery;
}

export abstract class DataSource {
  abstract getDataFromDataSource(
    dataSource: IDataSource
  ): Promise<Record<string, any>[]>;

  abstract getPageFromDataSource(
    dataSource: IDataSource,
    query?: {
      key: string;
      value: string;
    }
  ): Promise<Record<string, any>[]>;
}
