import { Client } from "@notionhq/client";
import {
  PageObjectResponse,
  PartialUserObjectResponse,
  UserObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { IDataSource } from "./interface";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  baseUrl: "https://notion-api-proxy.pla.tools",
});

export class NotionDataSource {
  static notionPage2kv = (page: PageObjectResponse) => {
    const getUsername = (
      item: PartialUserObjectResponse | UserObjectResponse
    ) => {
      if ("type" in item) {
        return item.name ?? "";
      }
      return item.id;
    };
    const kv: {
      [key: string]: string | number | boolean | string[] | null | undefined;
    } = {};
    for (const key in page.properties) {
      if (page.properties.hasOwnProperty(key)) {
        const element = page.properties[key];
        switch (element.type) {
          case "title":
            kv[key] = element.title[0]?.plain_text;
            break;
          case "rich_text":
            kv[key] = element.rich_text[0]?.plain_text;
            break;
          case "number":
            kv[key] = element.number;
            break;
          case "select":
            kv[key] = element.select?.name;
            break;
          case "multi_select":
            kv[key] = element.multi_select.map((item) => item.name);
            break;
          case "files":
            kv[key] = element.files.map((item) => {
              if (item.type === "external") {
                return item.external.url;
              }
              if (item.type === "file") {
                return item.file.url;
              }
              return "";
            });
            break;
          case "date":
            kv[key] = element.date?.start;
            break;
          case "people":
            kv[key] = element.people.map(getUsername);
            break;
          case "checkbox":
            kv[key] = element.checkbox;
            break;
          case "url":
            kv[key] = element.url;
            break;
          case "email":
            kv[key] = element.email;
            break;
          case "phone_number":
            kv[key] = element.phone_number;
            break;
          case "formula":
            // FIXME: 未处理 formula
            switch (element.formula.type) {
              case "string":
                kv[key] = element.formula.string;
                break;
              case "number":
                kv[key] = element.formula.number;
                break;
              case "boolean":
                kv[key] = element.formula.boolean;
                break;
              case "date":
                kv[key] = element.formula.date?.start;
                break;
              default:
                kv[key] = "Not supported";
            }
            break;
          case "relation":
            kv[key] = element.relation.map((item) => item.id);
            break;
          case "rollup":
            // FIXME: 未处理 rollup
            console.warn(
              "rollup not supported for now, you will get empty string for this field"
            );
            kv[key] = "";
            break;
          case "created_time":
            kv[key] = element.created_time;
            break;
          case "created_by":
            kv[key] = getUsername(element.created_by);
            break;
          case "last_edited_time":
            kv[key] = element.last_edited_time;
            break;
          case "last_edited_by":
            kv[key] = getUsername(element.last_edited_by);
            break;
          default:
            break;
        }
      }
    }
    return kv;
  };

  getDataFromDataSource = async (dataSource: IDataSource) => {
    const databaseId = dataSource.id;
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    return response.results.map((page) => {
      return NotionDataSource.notionPage2kv(page as PageObjectResponse);
    });
  };

  // fow now just query by one text key
  getPageFromDataSource = async (
    dataSource: IDataSource,
    query?: {
      key: string;
      value: string;
    }
  ) => {
    const databaseId = dataSource.id;
    const filter = query
      ? {
          filter: {
            or: [
              {
                property: query.key,
                rich_text: {
                  equals: query.value,
                },
              },
            ],
          },
        }
      : {};
    const response = await notion.databases.query({
      database_id: databaseId,
      ...filter,
    });
    if (!response.results?.[0]) {
      return null;
    }
    return NotionDataSource.notionPage2kv(
      response.results?.[0] as PageObjectResponse
    );
  };
}
