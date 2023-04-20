/* eslint-disable @next/next/no-img-element */
import { GetFileResult } from "figma-api/lib/api-types";
import { Node, TEXT } from "figma-api/lib/ast-types";
import React from "react";
import { IDataSource } from "../data/interface";
import { findNode, getNodePluginData, isNodeHasPluginData } from "../figma";
import { figmaNode2css } from "./css";
import { getTextStyle, renderLink } from "./css/text";
import { DynamicListComponent } from "./dynamicListComponent";

type TextNode = TEXT & {
  componentPropertyReferences?: {
    characters: string;
  };
};
/**
 * map figma component set to react component type
 * @param component
 */
export const DynamicReactComponentType = ({
  node,
  data,
  isPageFrame = false,
}: {
  node: Node;
  data: any;
  isPageFrame: boolean;
}): any => {
  switch (node.type) {
    case "COMPONENT":
    case "INSTANCE":
    case "FRAME":
      let frame = node as Node<"FRAME">;
      const { children, paddingBottom, paddingLeft, paddingRight, paddingTop } =
        frame;
      const css = figmaNode2css(frame, isPageFrame);
      return React.createElement(
        "div",
        {
          ...css,
        },
        children.map((child) =>
          DynamicReactComponentType({
            node: child,
            data,
            isPageFrame: false,
          })
        )
      );
    case "TEXT":
      let textNode = node as TextNode;
      const refProperty = textNode.componentPropertyReferences?.characters;
      const propertyName = refProperty?.split("#")[0] || "";
      const value = data[propertyName];
      const text = value || textNode.characters;
      if (textNode.style.hyperlink) {
        return React.createElement(
          "a",
          {
            href: renderLink(textNode.style.hyperlink.url, data),
            className: figmaNode2css(textNode as any).className,
            style: {
              ...figmaNode2css(textNode as any).style,
              ...getTextStyle(textNode as any),
              height: "auto",
            },
          },
          text
        );
      }

      return React.createElement(
        "div",
        {
          className: figmaNode2css(textNode as any).className,
          style: {
            ...figmaNode2css(textNode as any).style,
            width: "auto",
            height: "auto",
          },
        },
        text
      );

    case "RECTANGLE":
      // TODO: support image
      const isImg = (node as Node<"RECTANGLE">).fills.find(
        (fill) => fill.type === "IMAGE"
      );
      if (!isImg) {
        console.log("not supported figma component type: ", node.type);
        return React.createElement("div", {}, "not supported");
      }
      const images = data[node.name];
      return (
        <img
          src={images[0]}
          alt=""
          {...{
            className: figmaNode2css(node as any).className,
            style: {
              ...figmaNode2css(node as any).style,
            },
          }}
        />
      );
    default:
      console.log("not supported figma component type: ", node.type);
      return React.createElement("div", {}, "not supported");
  }
};

/**
 * map figma node to react element
 * @param component
 */
export const generateReactElement = (
  node: Node,
  isPageFrame: boolean = false,
  dataMap?: {
    notion: Record<string, any>;
  },
  componentMap?: {
    [nodeId: string]: React.ComponentType<{ data: any }>;
  }
): any => {
  switch (node.type) {
    case "INSTANCE":
      let instance = node as Node<"INSTANCE">;
      const ComponentType = componentMap?.[instance.componentId];
      if (ComponentType) {
        return <ComponentType data={{}} />;
      }
    case "COMPONENT":
    case "FRAME":
      let frame = node as Node<"FRAME">;
      const { children } = frame;
      const classNames = figmaNode2css(frame, isPageFrame);
      const useDynamicData = isNodeHasPluginData(frame);
      if (useDynamicData && dataMap && componentMap) {
        const dataSource = getNodePluginData(frame) as IDataSource;
        const componentType = componentMap?.[dataSource.componentId];
        if (componentType) {
          return (
            <DynamicListComponent
              {...{
                node,
                dataMap,
                componentMap,
                className: classNames.className,
                style: classNames.style,
              }}
            />
          );
        }
      }

      return React.createElement(
        "div",
        {
          className: classNames.className,
          style: classNames.style,
        },
        children.map((child) =>
          generateReactElement(child, false, dataMap, componentMap)
        )
      );
    case "TEXT":
      let textNode = node as TEXT;
      // console.log(textNode);
      if (textNode.style.hyperlink) {
        return React.createElement(
          "a",
          {
            href: textNode.style.hyperlink.url,
            className: figmaNode2css(textNode as any).className,
            style: {
              ...figmaNode2css(textNode as any).style,
              ...getTextStyle(textNode as any),
            },
          },
          textNode.characters
        );
      }
      return React.createElement(
        "div",
        {
          className: figmaNode2css(textNode as any).className,
          style: {
            ...figmaNode2css(textNode as any).style,
          },
        },
        textNode.characters
      );
    default:
      return React.createElement("div", {}, "not supported");
  }
};

export const createComponentTypeMap = (file: GetFileResult) => {
  const components = file.components;
  const componentNodes = Object.keys(components).map((nodeId) => {
    const node = findNode<"COMPONENT">(file.document, nodeId);
    return {
      node,
    };
  });
  const componentMap: {
    [nodeId: string]: React.ComponentType<{ data: any }>;
  } = {};

  componentNodes.forEach((component) => {
    const { node } = component;
    if (node) {
      const component = ({ data }: any) =>
        DynamicReactComponentType({
          node,
          data,
          isPageFrame: false,
        });
      componentMap[node.id] = component;
    }
  });
  return componentMap;
};
