import { IDataSource } from "@/core/data/interface";
import { getNodePluginData } from "@/core/figma";

export const DynamicListComponent = ({
  node,
  componentMap,
  dataMap,
  ...restProps
}: any) => {
  let frame = node;
  const dataSource = getNodePluginData(frame) as IDataSource;
  const data = dataMap?.notion[dataSource.id];
  const ComponentType = componentMap?.[
    dataSource.componentId
  ] as React.ComponentType<any>;

  return (
    <div {...restProps}>
      {data?.map((item: any, index: number) => {
        return <ComponentType key={index} data={item} node={node} />;
      })}
    </div>
  );
};
