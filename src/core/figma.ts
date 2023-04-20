import * as Figma from "figma-api";
import { IDataSource } from "./data/interface";
import { GetFileResult } from "figma-api/lib/api-types";
import { NodeTypes } from "figma-api";

const PLUGIN_ID = process.env.FIGMA_PLUGIN_ID;

if (!PLUGIN_ID) {
  throw new Error("FIGMA_PLUGIN_ID is not defined");
}

export function findNode<T extends keyof NodeTypes = keyof NodeTypes>(
  node: Figma.Node,
  id: string
): Figma.Node<T> | undefined {
  if (node.id === id) {
    return node as any;
  }
  if ("children" in node) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) {
        return found as any;
      }
    }
  }
}
export async function getFigmaFile(fileKey: string) {
  if (!process.env.FIGMA_TOKEN) {
    throw new Error("FIGMA_TOKEN is not defined");
  }
  const api = new Figma.Api({
    personalAccessToken: process.env.FIGMA_TOKEN,
  });
  const file = await api.getFile(fileKey, {
    plugin_data: PLUGIN_ID,
  });
  return file;
}

export async function getFigmaPageFrame(eidos: string[], files: GetFileResult) {
  const frames = files.document.children
    .map((page) => (page as Figma.CANVAS).children)
    .flat();
  // posts/9a4b81e0a0054644b72bdf48fa57b9b2 match path/[id] => {id: "9a4b81e0a0054644b72bdf48fa57b9b2"}
  const frame = frames
    .filter((frame) => frame.name.startsWith("/"))
    .find((frame) => {
      const paths = frame.name.split("/").slice(1);
      if (paths.length === eidos.length) {
        return paths.every((path, index) => {
          if (path.startsWith("[") && path.endsWith("]")) {
            return true;
          }
          return path === eidos[index];
        });
      }
    });
  return frame;
}

export const getNodePluginData = (node: Figma.Node) => {
  const infoStr = node.pluginData?.[PLUGIN_ID]?.["sourceDataInfo"];
  if (infoStr) {
    const info = JSON.parse(infoStr);
    return info;
  }
  return null;
};

export const isNodeHasPluginData = (node: Figma.Node) => {
  const infoStr = node.pluginData?.[PLUGIN_ID]?.["sourceDataInfo"];
  if (infoStr) {
    return true;
  }
  return false;
};

export async function getDataSourceNodes(node: Figma.Node) {
  const dataSource: IDataSource[] = [];

  const getNodeSourceInfo = (node: Figma.Node) => {
    if ("children" in node) {
      for (const child of node.children) {
        const info = getNodePluginData(child);
        if (info) {
          dataSource.push(info);
        }
        getNodeSourceInfo(child);
      }
    }
  };
  getNodeSourceInfo(node);
  return dataSource;
}
