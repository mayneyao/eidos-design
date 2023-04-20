/* eslint-disable @next/next/no-img-element */
import { GetFileResult } from "figma-api/lib/api-types";
import { Node, TEXT } from "figma-api/lib/ast-types";
import React from "react";
import { findNode } from "../figma";
import { getTextStyle } from "./css/text";
import { figmaNode2css } from "./css";

type TextNode = TEXT & {
  componentPropertyReferences?: {
    characters: string;
  };
};
/**
 * map figma component set to react component type
 * @param component
 */
export const DynamicReactComponent = ({
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
      const { children } = frame;
      const css = figmaNode2css(frame, isPageFrame);
      return React.createElement(
        "div",
        {
          ...css,
        },
        children.map((child) =>
          DynamicReactComponent({
            node: child,
            data,
            isPageFrame: false,
          })
        )
      );
    case "TEXT":
      let textNode = node as TextNode;
      // console.log(textNode);
      const refProperty = textNode.componentPropertyReferences?.characters;
      const propertyName = refProperty?.split("#")[0] || "";
      const value = data[propertyName];
      console.log(data, propertyName, value);
      // console.log(textNode);
      const text = textNode.characters || value;
      if (textNode.style.hyperlink) {
        return React.createElement(
          "a",
          {
            href: textNode.style.hyperlink.url,
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

export const createComponentMap = (file: GetFileResult) => {
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
        DynamicReactComponent({
          node,
          data,
          isPageFrame: false,
        });
      componentMap[node.id] = component;
    }
  });
  return componentMap;
};
