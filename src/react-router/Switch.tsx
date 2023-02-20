import React from 'react';
import pathMatch from './pathMatch';
import { RouterContext } from './RouterContext';

interface SwitchProps {
  children?: React.ReactNode;
  location?: Partial<Location> | string;
}

export default function Switch({ children }: SwitchProps) {
  return (
    <RouterContext.Consumer>
      {({ location }) => {
        let resultChildren = [];
        // 如果子组件只有一个,就将其放进数组里面
        if (children instanceof Array) resultChildren = children;
        else if (children instanceof Object) resultChildren = [children];
        // 遍历子组件数组,匹配到即返回
        for (const item of resultChildren) {
          const { path = "", exact = false, sensitive = false, strict = false, element } = item.props;
          // 我们知道location.pathname是正儿八经的浏览器地址, 而我们书写在Route组件上的是path规则
          // 所以我们要匹配只能使用我们之前封装好的pathMatch函数
          const match = pathMatch(path, location.pathname, { exact, sensitive, strict })

          // 只要不等于null就是匹配到了
          if (match != null) {
            return React.cloneElement(element, { location, computedMatch: match })
          }
        }
        // 如果循环了一轮都没有匹配到
        return null;
      }}
    </RouterContext.Consumer>
  )
}
